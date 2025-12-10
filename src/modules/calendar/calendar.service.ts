import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  GetMonthlyCalendarResponseDto,
  CalendarDayDto,
  GetDailyStatsResponseDto,
} from './dto';
import {
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  subDays,
} from 'date-fns';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getMonthlyCalendar(
    userId: string,
    guildId: string,
    year: number,
    month: number,
  ): Promise<GetMonthlyCalendarResponseDto> {
    const supabase = this.supabaseService.getClient();

    // 해당 월의 시작일과 종료일 계산
    const targetDate = new Date(year, month - 1, 1);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    const startDateStr = format(monthStart, 'yyyy-MM-dd');
    const endDateStr = format(monthEnd, 'yyyy-MM-dd');

    // 1. voice_sessions와 diaries를 병렬로 조회
    const [sessionsResult, diariesResult] = await Promise.all([
      supabase
        .from('voice_sessions')
        .select('started_at, duration_seconds')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .gte('started_at', `${startDateStr}T00:00:00`)
        .lte('started_at', `${endDateStr}T23:59:59`)
        .not('duration_seconds', 'is', null),
      supabase
        .from('diaries')
        .select('diary_date')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .gte('diary_date', startDateStr)
        .lte('diary_date', endDateStr),
    ]);

    const { data: sessions, error: sessionsError } = sessionsResult;
    const { data: diaries, error: diariesError } = diariesResult;

    if (sessionsError) {
      this.logger.error(`Failed to fetch sessions: ${sessionsError.message}`);
      throw new InternalServerErrorException(
        '캘린더 데이터를 불러오는데 실패했습니다.',
      );
    }

    if (diariesError) {
      this.logger.error(`Failed to fetch diaries: ${diariesError.message}`);
      throw new InternalServerErrorException(
        '캘린더 데이터를 불러오는데 실패했습니다.',
      );
    }

    // 날짜별 공부 시간 집계
    const studyTimeByDate = new Map<string, number>();

    if (sessions) {
      for (const session of sessions) {
        const startedAt = session.started_at as string;
        const date = format(parseISO(startedAt), 'yyyy-MM-dd');
        const currentMinutes = studyTimeByDate.get(date) || 0;
        const durationSeconds = (session.duration_seconds as number) || 0;
        const sessionMinutes = Math.floor(durationSeconds / 60);
        studyTimeByDate.set(date, currentMinutes + sessionMinutes);
      }
    }

    // 일기 작성된 날짜 Set
    const diaryDates = new Set<string>();
    if (diaries) {
      for (const diary of diaries) {
        const diaryDate = diary.diary_date as string;
        diaryDates.add(diaryDate);
      }
    }

    // 활동이 있는 날짜만 반환 (공부 시간 > 0 또는 일기 작성)
    const days: CalendarDayDto[] = [];
    const allDates = new Set([...studyTimeByDate.keys(), ...diaryDates]);

    for (const date of allDates) {
      days.push({
        date,
        totalMinutes: studyTimeByDate.get(date) || 0,
        hasDiary: diaryDates.has(date),
      });
    }

    // 날짜순 정렬
    days.sort((a, b) => a.date.localeCompare(b.date));

    return {
      year,
      month,
      days,
    };
  }

  async getDailyStats(
    userId: string,
    guildId: string,
    date: string,
  ): Promise<GetDailyStatsResponseDto> {
    const supabase = this.supabaseService.getClient();

    const targetDate = parseISO(date);
    const yesterdayDate = format(subDays(targetDate, 1), 'yyyy-MM-dd');

    // 오늘과 어제 세션을 병렬로 조회
    const [todayResult, yesterdayResult] = await Promise.all([
      supabase
        .from('voice_sessions')
        .select('started_at, duration_seconds')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .gte('started_at', `${date}T00:00:00`)
        .lte('started_at', `${date}T23:59:59`)
        .not('duration_seconds', 'is', null)
        .order('started_at', { ascending: true }),
      supabase
        .from('voice_sessions')
        .select('duration_seconds')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .gte('started_at', `${yesterdayDate}T00:00:00`)
        .lte('started_at', `${yesterdayDate}T23:59:59`)
        .not('duration_seconds', 'is', null),
    ]);

    const { data: todaySessions, error: todayError } = todayResult;
    const { data: yesterdaySessions, error: yesterdayError } = yesterdayResult;

    if (todayError) {
      this.logger.error(`Failed to fetch today sessions: ${todayError.message}`);
      throw new InternalServerErrorException(
        '일별 통계를 불러오는데 실패했습니다.',
      );
    }

    if (yesterdayError) {
      this.logger.error(
        `Failed to fetch yesterday sessions: ${yesterdayError.message}`,
      );
      throw new InternalServerErrorException(
        '일별 통계를 불러오는데 실패했습니다.',
      );
    }

    // 오늘 총 공부 시간 (분)
    let totalMinutes = 0;
    let longestSessionMinutes = 0;
    let firstStartTime: string | null = null;

    if (todaySessions && todaySessions.length > 0) {
      for (const session of todaySessions) {
        const durationSeconds = (session.duration_seconds as number) || 0;
        const sessionMinutes = Math.floor(durationSeconds / 60);
        totalMinutes += sessionMinutes;

        if (sessionMinutes > longestSessionMinutes) {
          longestSessionMinutes = sessionMinutes;
        }
      }

      // 첫 공부 시작 시간
      const firstSession = todaySessions[0];
      if (firstSession.started_at) {
        firstStartTime = format(parseISO(firstSession.started_at as string), 'HH:mm');
      }
    }

    // 어제 총 공부 시간 (분)
    let yesterdayTotalMinutes = 0;
    if (yesterdaySessions) {
      for (const session of yesterdaySessions) {
        const durationSeconds = (session.duration_seconds as number) || 0;
        yesterdayTotalMinutes += Math.floor(durationSeconds / 60);
      }
    }

    const diffFromYesterday = totalMinutes - yesterdayTotalMinutes;

    return {
      date,
      totalMinutes,
      diffFromYesterday,
      firstStartTime,
      longestSessionMinutes,
    };
  }
}
