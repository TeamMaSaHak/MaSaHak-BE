import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  NotificationSettingsResponseDto,
  UpdateNotificationSettingsRequestDto,
  UpdateNotificationSettingsResponseDto,
  TimezoneSettingsResponseDto,
  UpdateTimezoneRequestDto,
  UpdateTimezoneResponseDto,
} from './dto';
import { isValidTimezone, DEFAULT_TIMEZONE } from '../../common/utils';

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

  /**
   * 타임존 조회
   */
  async getTimezone(
    userId: string,
    guildId: string,
  ): Promise<TimezoneSettingsResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('timezone, last_seen_at')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (error) {
      this.logger.error(`Failed to get timezone: ${error.message}`);
      throw new InternalServerErrorException(
        '타임존 조회 중 오류가 발생했습니다.',
      );
    }

    return {
      timezone: data?.timezone || DEFAULT_TIMEZONE,
      updatedAt: data?.last_seen_at || null,
    };
  }

  /**
   * 타임존 변경
   */
  async updateTimezone(
    userId: string,
    guildId: string,
    dto: UpdateTimezoneRequestDto,
  ): Promise<UpdateTimezoneResponseDto> {
    // 유효성 검증
    if (!isValidTimezone(dto.timezone)) {
      throw new BadRequestException('유효하지 않은 타임존입니다.');
    }

    const supabase = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update({
        timezone: dto.timezone,
        last_seen_at: now,
      })
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .select('timezone, last_seen_at')
      .single();

    if (error) {
      this.logger.error(`Failed to update timezone: ${error.message}`);
      throw new InternalServerErrorException(
        '타임존 변경 중 오류가 발생했습니다.',
      );
    }

    this.logger.log(
      `Timezone updated for user ${userId}: timezone=${dto.timezone}`,
    );

    return {
      timezone: data.timezone,
      updatedAt: data.last_seen_at,
    };
  }

  /**
   * 사용자 타임존 조회 (다른 모듈에서 호출용)
   */
  async getUserTimezone(userId: string, guildId: string): Promise<string> {
    const settings = await this.getTimezone(userId, guildId);
    return settings.timezone;
  }
}
