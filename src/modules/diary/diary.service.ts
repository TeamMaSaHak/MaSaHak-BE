import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  GetDiaryResponseDto,
  DiaryReplyDto,
  UpsertDiaryResponseDto,
} from './dto';
import { ERROR_CODES } from '../../common/constants/error-codes';
import {
  canEditDiary as canEditDiaryUtil,
  canShowReply as canShowReplyUtil,
} from '../../common/utils';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class DiaryService {
  private readonly logger = new Logger(DiaryService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * 일기 조회
   * - 해당 날짜의 일기와 답장을 조회
   * - 답장은 09:00 이후에만 노출 (사용자 타임존 기준)
   */
  async getDiary(
    userId: string,
    guildId: string,
    date: string,
  ): Promise<GetDiaryResponseDto> {
    const supabase = this.supabaseService.getClient();

    // 사용자 타임존 조회
    const timezone = await this.settingsService.getUserTimezone(
      userId,
      guildId,
    );

    const { data: diary, error: diaryError } = await supabase
      .from('diaries')
      .select(
        `
        diary_id,
        diary_date,
        content,
        is_locked,
        created_at,
        updated_at,
        diary_replies (
          reply_id,
          content,
          created_at
        )
      `,
      )
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('diary_date', date)
      .maybeSingle();

    if (diaryError) {
      this.logger.error(`Failed to fetch diary: ${diaryError.message}`);
      throw new InternalServerErrorException(
        '일기를 불러오는데 실패했습니다.',
      );
    }

    // 사용자 타임존 기준으로 수정 가능 여부 및 답장 노출 여부 확인
    const canEdit = canEditDiaryUtil(date, timezone);
    const canShowReply = canShowReplyUtil(date, timezone);

    // 일기가 없는 경우
    if (!diary) {
      return {
        diaryId: null,
        date,
        content: null,
        isLocked: !canEdit,
        canEdit,
        reply: null,
        createdAt: null,
        updatedAt: null,
      };
    }

    // 답장 처리 (09:00 이후에만 노출)
    let reply: DiaryReplyDto | null = null;
    const diaryReplies = diary.diary_replies as unknown[];
    if (canShowReply && diaryReplies && diaryReplies.length > 0) {
      const replyData = diaryReplies[0] as {
        reply_id: number;
        content: string;
        created_at: string;
      };
      reply = {
        replyId: replyData.reply_id,
        content: replyData.content,
        createdAt: replyData.created_at,
      };
    }

    return {
      diaryId: diary.diary_id as number,
      date: diary.diary_date as string,
      content: diary.content as string,
      isLocked: diary.is_locked as boolean,
      canEdit: canEdit && !(diary.is_locked as boolean),
      reply,
      createdAt: diary.created_at as string,
      updatedAt: diary.updated_at as string,
    };
  }

  /**
   * 일기 작성/수정
   * - 당일 06:00 ~ 다음날 05:59까지만 가능
   * - 사용자 타임존 기준으로 검증
   */
  async upsertDiary(
    userId: string,
    guildId: string,
    date: string,
    content: string,
  ): Promise<UpsertDiaryResponseDto> {
    const supabase = this.supabaseService.getClient();

    // 사용자 타임존 조회
    const timezone = await this.settingsService.getUserTimezone(
      userId,
      guildId,
    );

    // 수정 가능 시간 검증 (사용자 타임존 기준)
    if (!canEditDiaryUtil(date, timezone)) {
      throw new ForbiddenException({
        message: '작성 시간이 지났습니다. 입력 시간은 다음날 05:59분까지 입니다.',
        errorCode: ERROR_CODES.DIARY_LOCKED,
      });
    }

    // 기존 일기 확인
    const { data: existingDiary, error: findError } = await supabase
      .from('diaries')
      .select('diary_id, is_locked')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('diary_date', date)
      .maybeSingle();

    if (findError) {
      this.logger.error(`Failed to find diary: ${findError.message}`);
      throw new InternalServerErrorException(
        '일기를 저장하는데 실패했습니다.',
      );
    }

    // 이미 잠긴 일기인 경우
    if (existingDiary?.is_locked) {
      throw new ForbiddenException({
        message: '이미 잠긴 일기는 수정할 수 없습니다.',
        errorCode: ERROR_CODES.DIARY_LOCKED,
      });
    }

    const now = new Date();

    // 기존 일기가 있으면 수정, 없으면 생성
    if (existingDiary) {
      const { data: updatedDiary, error: updateError } = await supabase
        .from('diaries')
        .update({
          content,
          updated_at: now.toISOString(),
        })
        .eq('diary_id', existingDiary.diary_id)
        .select('diary_id, diary_date, content, updated_at')
        .single();

      if (updateError) {
        this.logger.error(`Failed to update diary: ${updateError.message}`);
        throw new InternalServerErrorException(
          '일기를 수정하는데 실패했습니다.',
        );
      }

      return {
        diaryId: updatedDiary.diary_id as number,
        date: updatedDiary.diary_date as string,
        content: updatedDiary.content as string,
        isCreated: false,
        savedAt: updatedDiary.updated_at as string,
      };
    }

    // 새 일기 생성
    const { data: newDiary, error: insertError } = await supabase
      .from('diaries')
      .insert({
        user_id: userId,
        guild_id: guildId,
        diary_date: date,
        content,
        is_locked: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select('diary_id, diary_date, content, created_at')
      .single();

    if (insertError) {
      this.logger.error(`Failed to create diary: ${insertError.message}`);
      throw new InternalServerErrorException(
        '일기를 생성하는데 실패했습니다.',
      );
    }

    return {
      diaryId: newDiary.diary_id as number,
      date: newDiary.diary_date as string,
      content: newDiary.content as string,
      isCreated: true,
      savedAt: newDiary.created_at as string,
    };
  }
}
