import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { SupabaseService } from '../../database/supabase';

describe('CalendarService', () => {
  let service: CalendarService;
  let mockSupabaseService: { getClient: jest.Mock };

  beforeEach(async () => {
    mockSupabaseService = {
      getClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  // Promise.all로 두 쿼리를 동시에 실행하는 경우의 mock
  const setupMockForMonthlyCalendar = (
    sessionsResult: { data: any; error: any },
    diariesResult: { data: any; error: any },
  ) => {
    const sessionsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockResolvedValue(sessionsResult),
    };

    const diariesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue(diariesResult),
    };

    let fromCallCount = 0;
    const mockClient = {
      from: jest.fn().mockImplementation((table: string) => {
        fromCallCount++;
        if (table === 'voice_sessions') {
          return sessionsQuery;
        }
        return diariesQuery;
      }),
    };

    mockSupabaseService.getClient.mockReturnValue(mockClient);
  };

  const setupMockForDailyStats = (
    todayResult: { data: any; error: any },
    yesterdayResult: { data: any; error: any },
  ) => {
    let fromCallCount = 0;

    const todayQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue(todayResult),
    };

    const yesterdayQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockResolvedValue(yesterdayResult),
    };

    const mockClient = {
      from: jest.fn().mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount === 1) {
          return todayQuery;
        }
        return yesterdayQuery;
      }),
    };

    mockSupabaseService.getClient.mockReturnValue(mockClient);
  };

  describe('getMonthlyCalendar', () => {
    const userId = '123456789';
    const guildId = '987654321';
    const year = 2025;
    const month = 8;

    it('should return monthly calendar data with study times and diary info', async () => {
      const mockSessions = [
        { started_at: '2025-08-01T09:00:00', duration_seconds: 3600 },
        { started_at: '2025-08-01T14:00:00', duration_seconds: 1800 },
        { started_at: '2025-08-05T10:00:00', duration_seconds: 7200 },
      ];
      const mockDiaries = [
        { diary_date: '2025-08-01' },
        { diary_date: '2025-08-03' },
      ];

      setupMockForMonthlyCalendar(
        { data: mockSessions, error: null },
        { data: mockDiaries, error: null },
      );

      const result = await service.getMonthlyCalendar(userId, guildId, year, month);

      expect(result.year).toBe(year);
      expect(result.month).toBe(month);
      expect(result.days).toHaveLength(3);
      expect(result.days[0]).toEqual({
        date: '2025-08-01',
        totalMinutes: 90,
        hasDiary: true,
      });
      expect(result.days[1]).toEqual({
        date: '2025-08-03',
        totalMinutes: 0,
        hasDiary: true,
      });
      expect(result.days[2]).toEqual({
        date: '2025-08-05',
        totalMinutes: 120,
        hasDiary: false,
      });
    });

    it('should return empty days when no activity', async () => {
      setupMockForMonthlyCalendar(
        { data: [], error: null },
        { data: [], error: null },
      );

      const result = await service.getMonthlyCalendar(userId, guildId, year, month);

      expect(result.days).toHaveLength(0);
    });

    it('should throw InternalServerErrorException when sessions query fails', async () => {
      setupMockForMonthlyCalendar(
        { data: null, error: { message: 'DB error' } },
        { data: [], error: null },
      );

      await expect(
        service.getMonthlyCalendar(userId, guildId, year, month),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when diaries query fails', async () => {
      setupMockForMonthlyCalendar(
        { data: [], error: null },
        { data: null, error: { message: 'DB error' } },
      );

      await expect(
        service.getMonthlyCalendar(userId, guildId, year, month),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getDailyStats', () => {
    const userId = '123456789';
    const guildId = '987654321';
    const date = '2025-08-12';

    it('should return daily stats with all fields', async () => {
      const mockTodaySessions = [
        { started_at: '2025-08-12T09:30:00', duration_seconds: 3600 },
        { started_at: '2025-08-12T14:00:00', duration_seconds: 5400 },
      ];
      const mockYesterdaySessions = [{ duration_seconds: 3000 }];

      setupMockForDailyStats(
        { data: mockTodaySessions, error: null },
        { data: mockYesterdaySessions, error: null },
      );

      const result = await service.getDailyStats(userId, guildId, date);

      expect(result.date).toBe(date);
      expect(result.totalMinutes).toBe(150);
      expect(result.diffFromYesterday).toBe(100);
      expect(result.firstStartTime).toBe('09:30');
      expect(result.longestSessionMinutes).toBe(90);
    });

    it('should return zero values when no sessions', async () => {
      setupMockForDailyStats(
        { data: [], error: null },
        { data: [], error: null },
      );

      const result = await service.getDailyStats(userId, guildId, date);

      expect(result.totalMinutes).toBe(0);
      expect(result.diffFromYesterday).toBe(0);
      expect(result.firstStartTime).toBeNull();
      expect(result.longestSessionMinutes).toBe(0);
    });

    it('should return negative diff when yesterday was more productive', async () => {
      const mockTodaySessions = [
        { started_at: '2025-08-12T10:00:00', duration_seconds: 1800 },
      ];
      const mockYesterdaySessions = [{ duration_seconds: 7200 }];

      setupMockForDailyStats(
        { data: mockTodaySessions, error: null },
        { data: mockYesterdaySessions, error: null },
      );

      const result = await service.getDailyStats(userId, guildId, date);

      expect(result.diffFromYesterday).toBe(-90);
    });

    it('should throw InternalServerErrorException when today query fails', async () => {
      setupMockForDailyStats(
        { data: null, error: { message: 'DB error' } },
        { data: [], error: null },
      );

      await expect(
        service.getDailyStats(userId, guildId, date),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when yesterday query fails', async () => {
      setupMockForDailyStats(
        { data: [], error: null },
        { data: null, error: { message: 'DB error' } },
      );

      await expect(
        service.getDailyStats(userId, guildId, date),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getMonthlyStats', () => {
    const userId = '123456789';
    const guildId = '987654321';
    const year = 2025;
    const month = 8;

    const setupMockForMonthlyStats = (
      sessionsResult: { data: any; error: any },
      todosResult: { data: any; error: any },
    ) => {
      const sessionsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue(sessionsResult),
      };

      // todos 쿼리: eq(user_id).eq(guild_id).gte(todo_date).lte(todo_date).eq(is_completed)
      let todosEqCallCount = 0;
      const todosQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation(() => {
          todosEqCallCount++;
          if (todosEqCallCount === 3) {
            // is_completed eq가 마지막
            return Promise.resolve(todosResult);
          }
          return todosQuery;
        }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
      };

      const mockClient = {
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'voice_sessions') {
            return sessionsQuery;
          }
          return todosQuery;
        }),
      };

      mockSupabaseService.getClient.mockReturnValue(mockClient);
    };

    it('should return monthly stats with all fields', async () => {
      const mockSessions = [
        { started_at: '2025-08-01T09:00:00', duration_seconds: 3600 },
        { started_at: '2025-08-01T14:00:00', duration_seconds: 1800 },
        { started_at: '2025-08-05T10:00:00', duration_seconds: 7200 },
        { started_at: '2025-08-10T09:00:00', duration_seconds: 3600 },
      ];
      const mockTodos = [
        { todo_id: 1 },
        { todo_id: 2 },
        { todo_id: 3 },
      ];

      setupMockForMonthlyStats(
        { data: mockSessions, error: null },
        { data: mockTodos, error: null },
      );

      const result = await service.getMonthlyStats(userId, guildId, year, month);

      expect(result.year).toBe(year);
      expect(result.month).toBe(month);
      expect(result.attendanceDays).toBe(3); // 8/1, 8/5, 8/10
      expect(result.totalDaysInMonth).toBe(31);
      expect(result.totalMinutes).toBe(270); // (3600+1800+7200+3600)/60
      expect(result.averageMinutesPerDay).toBe(90); // 270/3
      expect(result.completedTodos).toBe(3);
    });

    it('should return zero values when no activity', async () => {
      setupMockForMonthlyStats(
        { data: [], error: null },
        { data: [], error: null },
      );

      const result = await service.getMonthlyStats(userId, guildId, year, month);

      expect(result.attendanceDays).toBe(0);
      expect(result.totalMinutes).toBe(0);
      expect(result.averageMinutesPerDay).toBe(0);
      expect(result.completedTodos).toBe(0);
    });

    it('should throw InternalServerErrorException when sessions query fails', async () => {
      setupMockForMonthlyStats(
        { data: null, error: { message: 'DB error' } },
        { data: [], error: null },
      );

      await expect(
        service.getMonthlyStats(userId, guildId, year, month),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when todos query fails', async () => {
      setupMockForMonthlyStats(
        { data: [], error: null },
        { data: null, error: { message: 'DB error' } },
      );

      await expect(
        service.getMonthlyStats(userId, guildId, year, month),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
