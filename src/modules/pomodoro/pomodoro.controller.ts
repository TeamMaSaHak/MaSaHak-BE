import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PomodoroService } from './pomodoro.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  StartPomodoroRequestDto,
  StartPomodoroResponseDto,
  StopPomodoroRequestDto,
  StopPomodoroResponseDto,
  CycleCompleteRequestDto,
  CycleCompleteResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Pomodoro')
@ApiBearerAuth('access-token')
@Controller('pomodoro')
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post('start')
  @ApiOperation({
    summary: '뽀모도로 시작',
    description:
      '새로운 뽀모도로 세션을 시작합니다. 설정값을 전달하지 않으면 사용자 설정 또는 기본값(25분/5분/4회)을 사용합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '뽀모도로 시작 성공',
    type: ApiResponseDto<StartPomodoroResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async startPomodoro(
    @CurrentUser() user: JwtPayload,
    @Body() dto: StartPomodoroRequestDto,
  ): Promise<ApiResponseDto<StartPomodoroResponseDto>> {
    const result = await this.pomodoroService.startPomodoro(
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
    summary: '뽀모도로 종료',
    description: '뽀모도로 세션을 종료하고 공부 시간을 기록합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '뽀모도로 종료 성공',
    type: ApiResponseDto<StopPomodoroResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '세션을 찾을 수 없음',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '이미 종료된 세션',
  })
  async stopPomodoro(
    @CurrentUser() user: JwtPayload,
    @Body() dto: StopPomodoroRequestDto,
  ): Promise<ApiResponseDto<StopPomodoroResponseDto>> {
    const result = await this.pomodoroService.stopPomodoro(
      user.sub,
      user.guildId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('cycle-complete')
  @ApiOperation({
    summary: '사이클 완료',
    description:
      '뽀모도로 집중 시간 1사이클 완료를 기록합니다. 다음 사이클 여부를 응답합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사이클 완료 기록 성공',
    type: ApiResponseDto<CycleCompleteResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '세션을 찾을 수 없음',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '이미 종료된 세션',
  })
  async cycleComplete(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CycleCompleteRequestDto,
  ): Promise<ApiResponseDto<CycleCompleteResponseDto>> {
    const result = await this.pomodoroService.cycleComplete(
      user.sub,
      user.guildId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }
}
