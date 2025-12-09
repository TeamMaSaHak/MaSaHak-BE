import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  StartTimerRequestDto,
  StartTimerResponseDto,
  StopTimerRequestDto,
  StopTimerResponseDto,
} from './dto';
import { ERROR_CODES } from '../../common/constants';

const TIMER_SOURCE = 'app_timer';

@Injectable()
export class TimerService {
  private readonly logger = new Logger(TimerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async startTimer(
    userId: string,
    guildId: string,
    dto: StartTimerRequestDto,
  ): Promise<StartTimerResponseDto> {
    const supabase = this.supabaseService.getClient();
    const startedAt = dto.startedAt || new Date().toISOString();

    const { data, error } = await supabase
      .from('voice_sessions')
      .insert({
        user_id: userId,
        guild_id: guildId,
        started_at: startedAt,
        source: TIMER_SOURCE,
      })
      .select('session_id, started_at')
      .single();

    if (error) {
      this.logger.error(`Failed to start timer: ${error.message}`);
      throw new BadRequestException('타이머 시작에 실패했습니다.');
    }

    return {
      sessionId: data.session_id,
      startedAt: data.started_at,
    };
  }

  async stopTimer(
    userId: string,
    guildId: string,
    dto: StopTimerRequestDto,
  ): Promise<StopTimerResponseDto> {
    const supabase = this.supabaseService.getClient();
    const endedAt = dto.endedAt || new Date().toISOString();

    // 세션 존재 및 소유권 확인
    const { data: session, error: findError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('session_id', dto.sessionId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('source', TIMER_SOURCE)
      .single();

    if (findError || !session) {
      throw new NotFoundException(ERROR_CODES.TIMER_SESSION_NOT_FOUND);
    }

    if (session.ended_at) {
      throw new BadRequestException(ERROR_CODES.TIMER_SESSION_ALREADY_ENDED);
    }

    // 세션 종료 업데이트
    const { data, error } = await supabase
      .from('voice_sessions')
      .update({
        ended_at: endedAt,
        duration_seconds: dto.durationSeconds,
      })
      .eq('session_id', dto.sessionId)
      .select('session_id, started_at, ended_at, duration_seconds')
      .single();

    if (error) {
      this.logger.error(`Failed to stop timer: ${error.message}`);
      throw new BadRequestException('타이머 종료에 실패했습니다.');
    }

    // 사용자 총 공부시간 업데이트
    await this.updateUserTotalSeconds(userId, guildId, dto.durationSeconds);

    return {
      sessionId: data.session_id,
      durationSeconds: data.duration_seconds,
      startedAt: data.started_at,
      endedAt: data.ended_at,
    };
  }

  async pauseTimer(
    userId: string,
    guildId: string,
    sessionId: number,
  ): Promise<{ message: string }> {
    // 일시정지는 클라이언트에서 관리
    // 서버에서는 세션 유효성만 확인
    await this.validateSession(userId, guildId, sessionId);
    return { message: '타이머가 일시정지되었습니다.' };
  }

  async resumeTimer(
    userId: string,
    guildId: string,
    sessionId: number,
  ): Promise<{ message: string }> {
    // 재개도 클라이언트에서 관리
    // 서버에서는 세션 유효성만 확인
    await this.validateSession(userId, guildId, sessionId);
    return { message: '타이머가 재개되었습니다.' };
  }

  private async validateSession(
    userId: string,
    guildId: string,
    sessionId: number,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('voice_sessions')
      .select('session_id, ended_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('source', TIMER_SOURCE)
      .single();

    if (error || !data) {
      throw new NotFoundException(ERROR_CODES.TIMER_SESSION_NOT_FOUND);
    }

    if (data.ended_at) {
      throw new BadRequestException(ERROR_CODES.TIMER_SESSION_ALREADY_ENDED);
    }
  }

  private async updateUserTotalSeconds(
    userId: string,
    guildId: string,
    durationSeconds: number,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.rpc('increment_total_seconds', {
      p_user_id: userId,
      p_guild_id: guildId,
      p_seconds: durationSeconds,
    });

    if (error) {
      // RPC가 없을 수 있으므로 직접 업데이트 시도
      this.logger.warn(`RPC failed, trying direct update: ${error.message}`);

      const { data: user } = await supabase
        .from('users')
        .select('total_seconds')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            total_seconds: (user.total_seconds || 0) + durationSeconds,
          })
          .eq('user_id', userId)
          .eq('guild_id', guildId);
      }
    }
  }
}
