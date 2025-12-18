import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import { RegisterTokenRequestDto, RegisterTokenResponseDto } from './dto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * FCM 토큰 등록 또는 갱신
   * - 같은 fcmToken이 이미 존재하면 updated_at만 갱신
   * - 새로운 토큰이면 신규 등록
   */
  async registerToken(
    userId: string,
    guildId: string,
    dto: RegisterTokenRequestDto,
  ): Promise<RegisterTokenResponseDto> {
    const supabase = this.supabaseService.getClient();

    // 동일한 FCM 토큰이 이미 존재하는지 확인
    const { data: existing, error: findError } = await supabase
      .from('device_tokens')
      .select('device_id, user_id, guild_id')
      .eq('fcm_token', dto.fcmToken)
      .maybeSingle();

    if (findError) {
      this.logger.error(`Failed to find device token: ${findError.message}`);
      throw new InternalServerErrorException(
        '디바이스 토큰 조회 중 오류가 발생했습니다.',
      );
    }

    // 이미 같은 토큰이 존재하는 경우
    if (existing) {
      // 같은 사용자의 토큰인 경우 updated_at만 갱신
      if (existing.user_id === userId && existing.guild_id === guildId) {
        const { error: updateError } = await supabase
          .from('device_tokens')
          .update({
            platform: dto.platform,
            updated_at: new Date().toISOString(),
          })
          .eq('device_id', existing.device_id);

        if (updateError) {
          this.logger.error(
            `Failed to update device token: ${updateError.message}`,
          );
          throw new InternalServerErrorException(
            '디바이스 토큰 갱신 중 오류가 발생했습니다.',
          );
        }

        this.logger.log(`Device token updated: ${existing.device_id}`);
        return {
          deviceId: existing.device_id,
          isNew: false,
        };
      }

      // 다른 사용자의 토큰인 경우 기존 토큰 삭제 후 새로 등록
      const { error: deleteError } = await supabase
        .from('device_tokens')
        .delete()
        .eq('device_id', existing.device_id);

      if (deleteError) {
        this.logger.error(
          `Failed to delete old device token: ${deleteError.message}`,
        );
        throw new InternalServerErrorException(
          '기존 토큰 삭제 중 오류가 발생했습니다.',
        );
      }
    }

    // 신규 토큰 등록
    const { data: newDevice, error: insertError } = await supabase
      .from('device_tokens')
      .insert({
        user_id: userId,
        guild_id: guildId,
        fcm_token: dto.fcmToken,
        platform: dto.platform,
      })
      .select('device_id')
      .single();

    if (insertError) {
      this.logger.error(
        `Failed to register device token: ${insertError.message}`,
      );
      throw new InternalServerErrorException(
        '디바이스 토큰 등록 중 오류가 발생했습니다.',
      );
    }

    this.logger.log(`New device token registered: ${newDevice.device_id}`);
    return {
      deviceId: newDevice.device_id,
      isNew: true,
    };
  }

  /**
   * 사용자의 모든 FCM 토큰 조회
   */
  async getUserTokens(userId: string, guildId: string): Promise<string[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('device_tokens')
      .select('fcm_token')
      .eq('user_id', userId)
      .eq('guild_id', guildId);

    if (error) {
      this.logger.error(`Failed to get user tokens: ${error.message}`);
      throw new InternalServerErrorException(
        '디바이스 토큰 조회 중 오류가 발생했습니다.',
      );
    }

    return (data || []).map((item) => item.fcm_token);
  }

  /**
   * 유효하지 않은 FCM 토큰 삭제
   */
  async removeInvalidToken(fcmToken: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('fcm_token', fcmToken);

    if (error) {
      this.logger.error(`Failed to remove invalid token: ${error.message}`);
    } else {
      this.logger.log(`Invalid token removed: ${fcmToken.substring(0, 20)}...`);
    }
  }
}
