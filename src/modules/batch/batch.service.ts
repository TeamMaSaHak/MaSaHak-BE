import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseService } from '../../database/supabase';
import { FirebaseService } from '../../database/firebase';
import { LlmService } from '../llm/llm.service';
import {
  getTodayInTimezone,
  getYesterdayInTimezone,
  isTargetHourInTimezone,
  DEFAULT_TIMEZONE,
} from '../../common/utils';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly firebaseService: FirebaseService,
    private readonly llmService: LlmService,
  ) {}

  /**
   * 매 시간 정각에 실행
   * - 해당 시간이 00:00인 타임존 사용자: 반복 투두 생성
   * - 해당 시간이 06:00인 타임존 사용자: 일기 잠금
   * - 해당 시간이 09:00인 타임존 사용자: 답장 알림 발송
   */
  @Cron('0 0 * * * *')
  async hourlyBatchRunner(): Promise<void> {
    this.logger.log('Starting hourly batch runner...');

    const timezones = await this.getDistinctTimezones();

    for (const timezone of timezones) {
      // 00:00인 타임존 처리: 반복 투두 생성
      if (isTargetHourInTimezone(timezone, 0, 0)) {
        await this.generateRecurringTodosForTimezone(timezone);
      }

      // 06:00인 타임존 처리: 일기 잠금
      if (isTargetHourInTimezone(timezone, 6, 0)) {
        await this.lockDiariesForTimezone(timezone);
      }

      // 09:00인 타임존 처리: 답장 알림 발송
      if (isTargetHourInTimezone(timezone, 9, 0)) {
        await this.sendDiaryReplyNotificationsForTimezone(timezone);
      }
    }

    this.logger.log('Hourly batch runner completed.');
  }

  /**
   * 매 시간 5분에 실행 (LLM 답장 생성)
   * - 해당 시간이 06:05인 타임존 사용자: LLM 답장 생성
   */
  @Cron('0 5 * * * *')
  async hourlyLlmReplyRunner(): Promise<void> {
    this.logger.log('Starting hourly LLM reply runner...');

    const timezones = await this.getDistinctTimezones();

    for (const timezone of timezones) {
      // 06:05인 타임존 처리: LLM 답장 생성
      if (isTargetHourInTimezone(timezone, 6, 5)) {
        await this.generateDiaryRepliesForTimezone(timezone);
      }
    }

    this.logger.log('Hourly LLM reply runner completed.');
  }

  /**
   * DB에서 고유 타임존 목록 조회
   */
  private async getDistinctTimezones(): Promise<string[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('timezone')
      .eq('status', 'active');

    if (error) {
      this.logger.error(`Failed to fetch timezones: ${error.message}`);
      return [DEFAULT_TIMEZONE];
    }

    const timezones = new Set<string>();
    for (const user of data || []) {
      timezones.add(user.timezone || DEFAULT_TIMEZONE);
    }

    return Array.from(timezones);
  }

  /**
   * 특정 타임존 사용자들의 반복 투두 생성
   */
  private async generateRecurringTodosForTimezone(
    timezone: string,
  ): Promise<void> {
    this.logger.log(`Generating recurring todos for timezone: ${timezone}`);

    const supabase = this.supabaseService.getClient();
    const today = getTodayInTimezone(timezone);

    // 해당 타임존 사용자 조회
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, guild_id')
      .eq('timezone', timezone)
      .eq('status', 'active');

    if (usersError || !users || users.length === 0) {
      this.logger.log(`No active users for timezone: ${timezone}`);
      return;
    }

    const userIds = users.map((u) => u.user_id);

    // 해당 사용자들의 활성화된 반복 투두 조회
    const { data: recurringTodos, error: fetchError } = await supabase
      .from('recurring_todos')
      .select('recurring_id, user_id, guild_id, content')
      .eq('is_active', true)
      .in('user_id', userIds);

    if (fetchError) {
      this.logger.error(
        `Failed to fetch recurring todos for ${timezone}: ${fetchError.message}`,
      );
      return;
    }

    if (!recurringTodos || recurringTodos.length === 0) {
      this.logger.log(`No recurring todos for timezone: ${timezone}`);
      return;
    }

    // 이미 오늘 생성된 반복 투두가 있는지 확인하고 중복 제거
    const { data: existingTodos } = await supabase
      .from('todos')
      .select('recurring_id')
      .eq('todo_date', today)
      .in(
        'recurring_id',
        recurringTodos.map((rt) => rt.recurring_id),
      );

    const existingRecurringIds = new Set(
      (existingTodos || []).map((t) => t.recurring_id),
    );
    const todosToInsert = recurringTodos
      .filter((rt) => !existingRecurringIds.has(rt.recurring_id))
      .map((rt) => ({
        user_id: rt.user_id,
        guild_id: rt.guild_id,
        todo_date: today,
        content: rt.content,
        is_completed: false,
        recurring_id: rt.recurring_id,
      }));

    if (todosToInsert.length === 0) {
      this.logger.log(
        `All recurring todos already created for ${timezone} (${today})`,
      );
      return;
    }

    const { error: insertError } = await supabase
      .from('todos')
      .insert(todosToInsert);

    if (insertError) {
      this.logger.error(
        `Failed to insert todos for ${timezone}: ${insertError.message}`,
      );
      return;
    }

    this.logger.log(
      `Created ${todosToInsert.length} recurring todos for ${timezone} (${today})`,
    );
  }

  /**
   * 특정 타임존 사용자들의 일기 잠금
   */
  private async lockDiariesForTimezone(timezone: string): Promise<void> {
    this.logger.log(`Locking diaries for timezone: ${timezone}`);

    const supabase = this.supabaseService.getClient();
    const yesterday = getYesterdayInTimezone(timezone);

    // 해당 타임존 사용자 조회
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, guild_id')
      .eq('timezone', timezone)
      .eq('status', 'active');

    if (usersError || !users || users.length === 0) {
      return;
    }

    const userIds = users.map((u) => u.user_id);

    // 해당 사용자들의 어제 일기 잠금
    const { data, error } = await supabase
      .from('diaries')
      .update({ is_locked: true })
      .eq('diary_date', yesterday)
      .eq('is_locked', false)
      .in('user_id', userIds)
      .select('diary_id');

    if (error) {
      this.logger.error(
        `Failed to lock diaries for ${timezone}: ${error.message}`,
      );
      return;
    }

    const lockedCount = data?.length || 0;
    this.logger.log(
      `Locked ${lockedCount} diaries for timezone: ${timezone} (${yesterday})`,
    );
  }

  /**
   * 특정 타임존 사용자들의 LLM 답장 생성
   */
  private async generateDiaryRepliesForTimezone(
    timezone: string,
  ): Promise<void> {
    this.logger.log(`Generating diary replies for timezone: ${timezone}`);

    const supabase = this.supabaseService.getClient();
    const yesterday = getYesterdayInTimezone(timezone);

    // 해당 타임존 사용자 조회
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, guild_id')
      .eq('timezone', timezone)
      .eq('status', 'active');

    if (usersError || !users || users.length === 0) {
      return;
    }

    const userIds = users.map((u) => u.user_id);

    // 해당 사용자들의 어제 일기 조회 (답장 없는 것)
    const { data: diaries, error: fetchError } = await supabase
      .from('diaries')
      .select('diary_id, user_id, guild_id, content')
      .eq('diary_date', yesterday)
      .in('user_id', userIds)
      .not('content', 'is', null);

    if (fetchError) {
      this.logger.error(
        `Failed to fetch diaries for ${timezone}: ${fetchError.message}`,
      );
      return;
    }

    if (!diaries || diaries.length === 0) {
      this.logger.log(`No diaries to process for timezone: ${timezone}`);
      return;
    }

    // 이미 답장이 있는 일기 제외
    const diaryIds = diaries.map((d) => d.diary_id);
    const { data: existingReplies } = await supabase
      .from('diary_replies')
      .select('diary_id')
      .in('diary_id', diaryIds);

    const existingDiaryIds = new Set(
      (existingReplies || []).map((r) => r.diary_id),
    );
    const diariesToProcess = diaries.filter(
      (d) => !existingDiaryIds.has(d.diary_id),
    );

    if (diariesToProcess.length === 0) {
      this.logger.log(
        `All diaries already have replies for timezone: ${timezone}`,
      );
      return;
    }

    let successCount = 0;
    for (const diary of diariesToProcess) {
      const reply = await this.llmService.generateDiaryReply(diary.content);

      if (reply) {
        const { error: insertError } = await supabase
          .from('diary_replies')
          .insert({ diary_id: diary.diary_id, content: reply });

        if (!insertError) {
          successCount++;
        } else {
          this.logger.error(
            `Failed to insert reply for diary ${diary.diary_id}: ${insertError.message}`,
          );
        }
      }
    }

    this.logger.log(
      `Generated ${successCount}/${diariesToProcess.length} replies for ${timezone}`,
    );
  }

  /**
   * 특정 타임존 사용자들에게 답장 알림 발송
   */
  private async sendDiaryReplyNotificationsForTimezone(
    timezone: string,
  ): Promise<void> {
    this.logger.log(`Sending notifications for timezone: ${timezone}`);

    const supabase = this.supabaseService.getClient();
    const yesterday = getYesterdayInTimezone(timezone);

    // 해당 타임존 사용자 조회
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, guild_id')
      .eq('timezone', timezone)
      .eq('status', 'active');

    if (usersError || !users || users.length === 0) {
      return;
    }

    const userIds = users.map((u) => u.user_id);

    // 어제 일기에 답장이 있는 사용자 조회
    const { data: diariesWithReplies, error: fetchError } = await supabase
      .from('diaries')
      .select(
        `
        diary_id,
        user_id,
        guild_id,
        diary_replies (reply_id)
      `,
      )
      .eq('diary_date', yesterday)
      .in('user_id', userIds);

    if (fetchError) {
      this.logger.error(
        `Failed to fetch diaries for notifications: ${fetchError.message}`,
      );
      return;
    }

    // 답장이 있는 일기만 필터링
    const diariesWithActualReplies = (diariesWithReplies || []).filter(
      (d) =>
        d.diary_replies &&
        Array.isArray(d.diary_replies) &&
        d.diary_replies.length > 0,
    );

    if (diariesWithActualReplies.length === 0) {
      this.logger.log(`No notifications to send for timezone: ${timezone}`);
      return;
    }

    let notificationCount = 0;
    let pushCount = 0;

    for (const diary of diariesWithActualReplies) {
      // 알림 설정 확인
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('push_enabled')
        .eq('user_id', diary.user_id)
        .eq('guild_id', diary.guild_id)
        .maybeSingle();

      const pushEnabled = settings?.push_enabled ?? true;

      // 알림 레코드 생성
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert({
          user_id: diary.user_id,
          guild_id: diary.guild_id,
          type: 'DIARY_REPLY',
          title: '일기 답장이 도착했어요!',
          body: '어제 작성한 일기에 답장이 도착했습니다. 확인해보세요.',
          is_read: false,
        });

      if (!notifyError) {
        notificationCount++;
      }

      // 푸시 알림 발송
      if (pushEnabled) {
        const { data: tokens } = await supabase
          .from('device_tokens')
          .select('fcm_token')
          .eq('user_id', diary.user_id)
          .eq('guild_id', diary.guild_id);

        if (tokens && tokens.length > 0) {
          try {
            await this.firebaseService.sendMulticastPushNotification(
              tokens.map((t) => t.fcm_token),
              '일기 답장이 도착했어요!',
              '어제 작성한 일기에 답장이 도착했습니다.',
              { type: 'DIARY_REPLY', diaryDate: yesterday },
            );
            pushCount++;
          } catch (error) {
            this.logger.error(
              `Push failed for user ${diary.user_id}: ${error}`,
            );
          }
        }
      }
    }

    this.logger.log(
      `Notifications: ${notificationCount}, Push: ${pushCount} for ${timezone}`,
    );
  }
}
