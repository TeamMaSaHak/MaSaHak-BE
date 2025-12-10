import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  GetMonthlyCalendarParamsDto,
  GetMonthlyCalendarResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Calendar')
@ApiBearerAuth('access-token')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

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
