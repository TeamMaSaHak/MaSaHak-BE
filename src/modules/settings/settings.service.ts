import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  NotificationSettingsResponseDto,
  UpdateNotificationSettingsRequestDto,
  UpdateNotificationSettingsResponseDto,
} from './dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * 알림 설정 조회
   * - 설정이 없으면 기본값 반환 (pushEnabled: true)
   */
  async getNotificationSettings(
    userId: string,
    guildId: string,
  ): Promise<NotificationSettingsResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('notification_settings')
      .select('push_enabled, updated_at')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .maybeSingle();

    if (error) {
      this.logger.error(
        `Failed to get notification settings: ${error.message}`,
      );
      throw new InternalServerErrorException(
        '알림 설정 조회 중 오류가 발생했습니다.',
      );
    }

    // 설정이 없으면 기본값 반환
    if (!data) {
      return {
        pushEnabled: true,
        updatedAt: null,
      };
    }

    return {
      pushEnabled: data.push_enabled,
      updatedAt: data.updated_at,
    };
  }

  /**
   * 알림 설정 변경
   * - 설정이 없으면 새로 생성 (upsert)
   */
  async updateNotificationSettings(
    userId: string,
    guildId: string,
    dto: UpdateNotificationSettingsRequestDto,
  ): Promise<UpdateNotificationSettingsResponseDto> {
    const supabase = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('notification_settings')
      .upsert(
        {
          user_id: userId,
          guild_id: guildId,
          push_enabled: dto.pushEnabled,
          updated_at: now,
        },
        {
          onConflict: 'user_id,guild_id',
        },
      )
      .select('push_enabled, updated_at')
      .single();

    if (error) {
      this.logger.error(
        `Failed to update notification settings: ${error.message}`,
      );
      throw new InternalServerErrorException(
        '알림 설정 변경 중 오류가 발생했습니다.',
      );
    }

    this.logger.log(
      `Notification settings updated for user ${userId}: pushEnabled=${dto.pushEnabled}`,
    );

    return {
      pushEnabled: data.push_enabled,
      updatedAt: data.updated_at,
    };
  }

  /**
   * 사용자의 푸시 알림 활성화 여부 확인
   * - 배치/푸시 발송 시 사용
   */
  async isPushEnabled(userId: string, guildId: string): Promise<boolean> {
    const settings = await this.getNotificationSettings(userId, guildId);
    return settings.pushEnabled;
  }
}
