import {
  Controller,
  Post,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TimerService } from './timer.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  StartTimerRequestDto,
  StartTimerResponseDto,
  StopTimerRequestDto,
  StopTimerResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Timer')
@ApiBearerAuth('access-token')
@Controller('timer')
export class TimerController {
  constructor(private readonly timerService: TimerService) {}

  @Post('start')
  @ApiOperation({
    summary: '타이머 시작',
    description: '새로운 타이머 세션을 시작합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '타이머 시작 성공',
    type: ApiResponseDto<StartTimerResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async startTimer(
    @CurrentUser() user: JwtPayload,
    @Body() dto: StartTimerRequestDto,
  ): Promise<ApiResponseDto<StartTimerResponseDto>> {
    const result = await this.timerService.startTimer(
      user.sub,
      user.guildId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('stop')
  @ApiOperation({
    summary: '타이머 종료',
    description: '타이머 세션을 종료하고 공부 시간을 기록합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '타이머 종료 성공',
    type: ApiResponseDto<StopTimerResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '세션을 찾을 수 없음',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '이미 종료된 세션',
  })
  async stopTimer(
    @CurrentUser() user: JwtPayload,
    @Body() dto: StopTimerRequestDto,
  ): Promise<ApiResponseDto<StopTimerResponseDto>> {
    const result = await this.timerService.stopTimer(
      user.sub,
      user.guildId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('pause/:sessionId')
  @ApiOperation({
    summary: '타이머 일시정지',
    description: '타이머를 일시정지합니다. (상태 관리는 클라이언트에서 수행)',
  })
  @ApiParam({ name: 'sessionId', description: '세션 ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '일시정지 성공',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '세션을 찾을 수 없음',
  })
  async pauseTimer(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ): Promise<ApiResponseDto<{ message: string }>> {
    const result = await this.timerService.pauseTimer(
      user.sub,
      user.guildId,
      sessionId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('resume/:sessionId')
  @ApiOperation({
    summary: '타이머 재개',
    description: '일시정지된 타이머를 재개합니다. (상태 관리는 클라이언트에서 수행)',
  })
  @ApiParam({ name: 'sessionId', description: '세션 ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '재개 성공',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '세션을 찾을 수 없음',
  })
  async resumeTimer(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ): Promise<ApiResponseDto<{ message: string }>> {
    const result = await this.timerService.resumeTimer(
      user.sub,
      user.guildId,
      sessionId,
    );
    return {
      success: true,
      data: result,
    };
  }
}
