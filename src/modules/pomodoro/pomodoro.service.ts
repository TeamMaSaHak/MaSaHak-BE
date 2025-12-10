import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  StartPomodoroRequestDto,
  StartPomodoroResponseDto,
  StopPomodoroRequestDto,
  StopPomodoroResponseDto,
  CycleCompleteRequestDto,
  CycleCompleteResponseDto,
} from './dto';
import { ERROR_CODES } from '../../common/constants';

const POMODORO_SOURCE = 'app_pomodoro';

const DEFAULT_SETTINGS = {
  focusTime: 25,
  breakTime: 5,
  repeatCount: 4,
};

interface PomodoroSettings {
  focus_time: number;
  break_time: number;
  repeat_count: number;
}

@Injectable()
export class PomodoroService {
  private readonly logger = new Logger(PomodoroService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async startPomodoro(
    userId: string,
    guildId: string,
    dto: StartPomodoroRequestDto,
  ): Promise<StartPomodoroResponseDto> {
    const supabase = this.supabaseService.getClient();
    const startedAt = dto.startedAt || new Date().toISOString();

    // 사용자 설정값 조회
    const settings = await this.getUserSettings(userId, guildId);

    // 요청 값 또는 설정값 또는 기본값 사용
    const focusTime = dto.focusTime ?? settings.focus_time ?? DEFAULT_SETTINGS.focusTime;
    const breakTime = dto.breakTime ?? settings.break_time ?? DEFAULT_SETTINGS.breakTime;
    const repeatCount = dto.repeatCount ?? settings.repeat_count ?? DEFAULT_SETTINGS.repeatCount;

    const { data, error } = await supabase
      .from('voice_sessions')
      .insert({
        user_id: userId,
        guild_id: guildId,
        started_at: startedAt,
        source: POMODORO_SOURCE,
      })
      .select('session_id, started_at')
      .single();

    if (error) {
      this.logger.error(`Failed to start pomodoro: ${error.message}`);
      throw new BadRequestException('뽀모도로 시작에 실패했습니다.');
    }

    return {
      sessionId: data.session_id,
      startedAt: data.started_at,
      focusTime,
      breakTime,
      repeatCount,
    };
  }

  async stopPomodoro(
    userId: string,
    guildId: string,
    dto: StopPomodoroRequestDto,
  ): Promise<StopPomodoroResponseDto> {
    const supabase = this.supabaseService.getClient();
    const endedAt = dto.endedAt || new Date().toISOString();

    // 세션 존재 및 소유권 확인
    const { data: session, error: findError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('session_id', dto.sessionId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('source', POMODORO_SOURCE)
      .single();

    if (findError) {
      this.logger.error(`Failed to find pomodoro session: ${findError.message}`);
      throw new InternalServerErrorException('세션 조회 중 오류가 발생했습니다.');
    }

    if (!session) {
      throw new NotFoundException(ERROR_CODES.POMODORO_SESSION_NOT_FOUND);
    }

    if (session.ended_at) {
      throw new BadRequestException(ERROR_CODES.POMODORO_SESSION_ALREADY_ENDED);
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
      this.logger.error(`Failed to stop pomodoro: ${error.message}`);
      throw new BadRequestException('뽀모도로 종료에 실패했습니다.');
    }

    // 사용자 총 공부시간 업데이트
    await this.updateUserTotalSeconds(userId, guildId, dto.durationSeconds);

    return {
      sessionId: data.session_id,
      durationSeconds: data.duration_seconds,
      completedCycles: dto.completedCycles,
      startedAt: data.started_at,
      endedAt: data.ended_at,
    };
  }

  async cycleComplete(
    userId: string,
    guildId: string,
    dto: CycleCompleteRequestDto,
  ): Promise<CycleCompleteResponseDto> {
    const completedAt = dto.completedAt || new Date().toISOString();

    // 세션 유효성 확인
    const session = await this.validateSession(userId, guildId, dto.sessionId);

    // 사용자 설정값 조회하여 다음 사이클 여부 확인
    const settings = await this.getUserSettings(userId, guildId);
    const repeatCount = settings.repeat_count ?? DEFAULT_SETTINGS.repeatCount;
    const hasNextCycle = dto.cycleNumber < repeatCount;

    return {
      sessionId: dto.sessionId,
      cycleNumber: dto.cycleNumber,
      completedAt,
      hasNextCycle,
    };
  }

  private async getUserSettings(
    userId: string,
    guildId: string,
  ): Promise<PomodoroSettings> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('pomodoro_settings')
      .select('focus_time, break_time, repeat_count')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    // PGRST116: 결과가 없을 때 발생하는 에러 코드 (설정이 없는 경우)
    if (error && error.code !== 'PGRST116') {
      this.logger.error(`Failed to get user settings: ${error.message}`);
    }

    if (!data) {
      // 설정이 없으면 기본값 반환
      return {
        focus_time: DEFAULT_SETTINGS.focusTime,
        break_time: DEFAULT_SETTINGS.breakTime,
        repeat_count: DEFAULT_SETTINGS.repeatCount,
      };
    }

    return data;
  }

  private async validateSession(
    userId: string,
    guildId: string,
    sessionId: number,
  ): Promise<{ session_id: number; ended_at: string | null }> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('voice_sessions')
      .select('session_id, ended_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('source', POMODORO_SOURCE)
      .single();

    if (error) {
      this.logger.error(`Failed to validate session: ${error.message}`);
      throw new InternalServerErrorException('세션 검증 중 오류가 발생했습니다.');
    }

    if (!data) {
      throw new NotFoundException(ERROR_CODES.POMODORO_SESSION_NOT_FOUND);
    }

    if (data.ended_at) {
      throw new BadRequestException(ERROR_CODES.POMODORO_SESSION_ALREADY_ENDED);
    }

    return data;
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
