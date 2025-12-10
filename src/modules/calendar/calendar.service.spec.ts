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
});
