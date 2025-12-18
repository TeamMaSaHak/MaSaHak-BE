import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  GetMonthlyCalendarParamsDto,
  GetMonthlyCalendarResponseDto,
  GetDailyStatsQueryDto,
  GetDailyStatsResponseDto,
  GetMonthlyStatsQueryDto,
  GetMonthlyStatsResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Calendar')
@ApiBearerAuth('access-token')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('stats/monthly')
  @ApiOperation({
    summary: '월별 통계 조회',
    description:
      '특정 월의 통계를 조회합니다. 출석 일수, 총 집중 시간, 일 평균 집중 시간, 완료한 투두 개수를 반환합니다.',
  })
  @ApiQuery({
    name: 'year',
    description: '조회할 연도',
    example: 2025,
  })
  @ApiQuery({
    name: 'month',
    description: '조회할 월',
    example: 8,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '월별 통계 조회 성공',
    type: ApiResponseDto<GetMonthlyStatsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 파라미터',
  })
  async getMonthlyStats(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetMonthlyStatsQueryDto,
  ): Promise<ApiResponseDto<GetMonthlyStatsResponseDto>> {
    const result = await this.calendarService.getMonthlyStats(
      user.sub,
      user.guildId,
      query.year,
      query.month,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('stats/daily')
  @ApiOperation({
    summary: '일별 통계 조회',
    description:
      '특정 날짜의 공부 통계를 조회합니다. 총 공부 시간, 전날 대비 증감, 첫 시작 시간, 가장 긴 집중 시간을 반환합니다.',
  })
  @ApiQuery({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD)',
    example: '2025-08-12',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '일별 통계 조회 성공',
    type: ApiResponseDto<GetDailyStatsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 파라미터',
  })
  async getDailyStats(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetDailyStatsQueryDto,
  ): Promise<ApiResponseDto<GetDailyStatsResponseDto>> {
    const result = await this.calendarService.getDailyStats(
      user.sub,
      user.guildId,
      query.date,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':year/:month')
  @ApiOperation({
    summary: '월별 캘린더 데이터 조회',
    description:
      '해당 월의 날짜별 공부 시간과 일기 작성 여부를 조회합니다. 활동이 있는 날짜만 반환됩니다.',
  })
  @ApiParam({
    name: 'year',
    description: '조회할 연도',
    example: 2025,
  })
  @ApiParam({
    name: 'month',
    description: '조회할 월',
    example: 8,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '월별 캘린더 데이터 조회 성공',
    type: ApiResponseDto<GetMonthlyCalendarResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 파라미터',
  })
  async getMonthlyCalendar(
    @CurrentUser() user: JwtPayload,
    @Param() params: GetMonthlyCalendarParamsDto,
  ): Promise<ApiResponseDto<GetMonthlyCalendarResponseDto>> {
    const result = await this.calendarService.getMonthlyCalendar(
      user.sub,
      user.guildId,
      params.year,
      params.month,
    );
    return {
      success: true,
      data: result,
    };
  }
}
