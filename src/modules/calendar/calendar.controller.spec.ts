import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { JwtPayload } from '../auth/interfaces';

describe('CalendarController', () => {
  let controller: CalendarController;
  let calendarService: CalendarService;

  const mockCalendarService = {
    getMonthlyCalendar: jest.fn(),
    getDailyStats: jest.fn(),
  };

  const mockUser: JwtPayload = {
    sub: '123456789',
    guildId: '987654321',
    nickname: 'testuser',
    iat: 0,
    exp: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService,
        },
      ],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
    calendarService = module.get<CalendarService>(CalendarService);

    jest.clearAllMocks();
  });

  describe('getMonthlyCalendar', () => {
    it('should return monthly calendar data (200)', async () => {
      const mockResult = {
        year: 2025,
        month: 8,
        days: [
          { date: '2025-08-01', totalMinutes: 90, hasDiary: true },
        ],
      };

      mockCalendarService.getMonthlyCalendar.mockResolvedValue(mockResult);

      const result = await controller.getMonthlyCalendar(mockUser, {
        year: 2025,
        month: 8,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockCalendarService.getMonthlyCalendar).toHaveBeenCalledWith(
        mockUser.sub,
        mockUser.guildId,
        2025,
        8,
      );
    });
  });

  describe('getDailyStats', () => {
    it('should return daily stats (200)', async () => {
      const mockResult = {
        date: '2025-08-12',
        totalMinutes: 150,
        diffFromYesterday: 30,
        firstStartTime: '09:30',
        longestSessionMinutes: 90,
      };

      mockCalendarService.getDailyStats.mockResolvedValue(mockResult);

      const result = await controller.getDailyStats(mockUser, {
        date: '2025-08-12',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockCalendarService.getDailyStats).toHaveBeenCalledWith(
        mockUser.sub,
        mockUser.guildId,
        '2025-08-12',
      );
    });
  });
});
