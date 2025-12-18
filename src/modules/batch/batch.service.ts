import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../database/supabase';
import { FirebaseService } from '../../database/firebase';
import { format, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  private readonly TIMEZONE = 'Asia/Seoul';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * 반복 투두 자동 생성 (매일 00:00 KST)
   * - 활성화된 반복 투두를 조회하여 오늘 날짜의 투두로 생성
   */
  @Cron('0 0 0 * * *', { timeZone: 'Asia/Seoul' })
  async generateRecurringTodos(): Promise<void> {
    this.logger.log('Starting recurring todos generation batch...');

    const supabase = this.supabaseService.getClient();
    const today = this.getTodayKST();

    // 활성화된 반복 투두 조회
    const { data: recurringTodos, error: fetchError } = await supabase
      .from('recurring_todos')
      .select('recurring_id, user_id, guild_id, content')
      .eq('is_active', true);

    if (fetchError) {
      this.logger.error(
        `Failed to fetch recurring todos: ${fetchError.message}`,
      );
      return;
    }

    if (!recurringTodos || recurringTodos.length === 0) {
      this.logger.log('No active recurring todos found.');
      return;
    }

    // 각 반복 투두에 대해 오늘 날짜의 투두 생성
    const todosToInsert = recurringTodos.map((rt) => ({
      user_id: rt.user_id,
      guild_id: rt.guild_id,
      todo_date: today,
      content: rt.content,
      is_completed: false,
      recurring_id: rt.recurring_id,
    }));

    const { error: insertError } = await supabase
      .from('todos')
      .insert(todosToInsert);

    if (insertError) {
      this.logger.error(`Failed to insert todos: ${insertError.message}`);
      return;
    }

    this.logger.log(
      `Successfully created ${todosToInsert.length} recurring todos for ${today}`,
    );
  }

  /**
   * 일기 잠금 처리 (매일 06:00 KST)
   * - 전날 일기의 is_locked를 true로 변경
   */
  @Cron('0 0 6 * * *', { timeZone: 'Asia/Seoul' })
  async lockDiaries(): Promise<void> {
    this.logger.log('Starting diary lock batch...');

    const supabase = this.supabaseService.getClient();
    const yesterday = this.getYesterdayKST();

    const { data, error } = await supabase
      .from('diaries')
      .update({ is_locked: true })
      .eq('diary_date', yesterday)
      .eq('is_locked', false)
      .select('diary_id');

    if (error) {
      this.logger.error(`Failed to lock diaries: ${error.message}`);
      return;
    }

    const lockedCount = data?.length || 0;
    this.logger.log(
      `Successfully locked ${lockedCount} diaries for ${yesterday}`,
    );
  }

  /**
   * LLM 일기 답장 생성 (매일 06:05 KST)
   * - 전날 작성된 일기에 대해 LLM 답장 생성
   */
  @Cron('0 5 6 * * *', { timeZone: 'Asia/Seoul' })
  async generateDiaryReplies(): Promise<void> {
    this.logger.log('Starting diary replies generation batch...');

    const supabase = this.supabaseService.getClient();
    const yesterday = this.getYesterdayKST();

    // 어제 작성된 일기 중 답장이 없는 것 조회
    const { data: diaries, error: fetchError } = await supabase
      .from('diaries')
      .select('diary_id, user_id, guild_id, content')
      .eq('diary_date', yesterday)
      .not('content', 'is', null);

    if (fetchError) {
      this.logger.error(`Failed to fetch diaries: ${fetchError.message}`);
      return;
    }

    if (!diaries || diaries.length === 0) {
      this.logger.log('No diaries to generate replies for.');
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
      this.logger.log('All diaries already have replies.');
      return;
    }

    // LLM 답장 생성 (TODO: 실제 LLM API 연동)
    let successCount = 0;
    for (const diary of diariesToProcess) {
      const reply = await this.generateLLMReply(diary.content);

      if (reply) {
        const { error: insertError } = await supabase
          .from('diary_replies')
          .insert({
            diary_id: diary.diary_id,
            content: reply,
          });

        if (insertError) {
          this.logger.error(
            `Failed to insert reply for diary ${diary.diary_id}: ${insertError.message}`,
          );
        } else {
          successCount++;
        }
      }
    }

    this.logger.log(
      `Successfully generated ${successCount}/${diariesToProcess.length} diary replies`,
    );
  }

  /**
   * 일기 답장 알림 발송 (매일 09:00 KST)
   * - 전날 일기에 답장이 있는 사용자에게 푸시 알림 발송
   */
  @Cron('0 0 9 * * *', { timeZone: 'Asia/Seoul' })
  async sendDiaryReplyNotifications(): Promise<void> {
    this.logger.log('Starting diary reply notifications batch...');

    const supabase = this.supabaseService.getClient();
    const yesterday = this.getYesterdayKST();

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
      .not('diary_replies', 'is', null);

    if (fetchError) {
      this.logger.error(
        `Failed to fetch diaries with replies: ${fetchError.message}`,
      );
      return;
    }

    if (!diariesWithReplies || diariesWithReplies.length === 0) {
      this.logger.log('No diary replies to notify.');
      return;
    }

    let notificationCount = 0;
    let pushCount = 0;

    for (const diary of diariesWithReplies) {
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

      if (notifyError) {
        this.logger.error(
          `Failed to create notification for user ${diary.user_id}: ${notifyError.message}`,
        );
        continue;
      }
      notificationCount++;

      // 푸시 알림 발송 (설정이 켜져있는 경우)
      if (pushEnabled) {
        const { data: tokens } = await supabase
          .from('device_tokens')
          .select('fcm_token')
          .eq('user_id', diary.user_id)
          .eq('guild_id', diary.guild_id);

        if (tokens && tokens.length > 0) {
          const fcmTokens = tokens.map((t) => t.fcm_token);
          try {
            await this.firebaseService.sendMulticastPushNotification(
              fcmTokens,
              '일기 답장이 도착했어요!',
              '어제 작성한 일기에 답장이 도착했습니다. 확인해보세요.',
              { type: 'DIARY_REPLY', diaryDate: yesterday },
            );
            pushCount++;
          } catch (error) {
            this.logger.error(
              `Failed to send push notification to user ${diary.user_id}: ${error}`,
            );
          }
        }
      }
    }

    this.logger.log(
      `Notifications created: ${notificationCount}, Push sent: ${pushCount}`,
    );
  }

  /**
   * LLM 답장 생성 (placeholder)
   * TODO: 실제 LLM API (OpenAI, Anthropic 등) 연동
   */
  private async generateLLMReply(diaryContent: string): Promise<string | null> {
    if (!diaryContent || diaryContent.trim().length === 0) {
      return null;
    }

    // TODO: 실제 LLM API 연동
    // 현재는 placeholder 메시지 반환
    const replies = [
      '오늘 하루도 수고했어요! 내일은 더 좋은 하루가 될 거예요.',
      '열심히 공부한 하루였네요. 충분히 쉬고 내일도 파이팅!',
      '오늘의 노력이 내일의 성장이 됩니다. 잘하고 있어요!',
      '힘든 하루였을 수도 있지만, 그래도 일기를 쓰는 당신은 대단해요.',
      '오늘 하루를 돌아보는 시간, 정말 소중하죠. 내일도 응원할게요!',
    ];

    const randomIndex = Math.floor(Math.random() * replies.length);
    return replies[randomIndex];
  }

  /**
   * 오늘 날짜 (KST) 반환
   */
  private getTodayKST(): string {
    const now = new Date();
    const kstDate = toZonedTime(now, this.TIMEZONE);
    return format(kstDate, 'yyyy-MM-dd');
  }

  /**
   * 어제 날짜 (KST) 반환
   */
  private getYesterdayKST(): string {
    const now = new Date();
    const kstDate = toZonedTime(now, this.TIMEZONE);
    const yesterday = subDays(kstDate, 1);
    return format(yesterday, 'yyyy-MM-dd');
  }
}
