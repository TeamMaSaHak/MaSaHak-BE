import { Controller, Get, Put, Patch, Body, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  NotificationSettingsResponseDto,
  UpdateNotificationSettingsRequestDto,
  UpdateNotificationSettingsResponseDto,
  TimezoneSettingsResponseDto,
  UpdateTimezoneRequestDto,
  UpdateTimezoneResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Settings')
@ApiBearerAuth('access-token')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('notifications')
  @ApiOperation({
    summary: '알림 설정 조회',
    description: '사용자의 알림 설정을 조회합니다. 설정이 없으면 기본값(활성화)을 반환합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '알림 설정 조회 성공',
    type: ApiResponseDto<NotificationSettingsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async getNotificationSettings(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponseDto<NotificationSettingsResponseDto>> {
    const result = await this.settingsService.getNotificationSettings(
      user.sub,
      user.guildId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put('notifications')
  @ApiOperation({
    summary: '알림 설정 변경',
    description: '사용자의 알림 설정을 변경합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '알림 설정 변경 성공',
    type: ApiResponseDto<UpdateNotificationSettingsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 (유효성 검증 실패)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async updateNotificationSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationSettingsRequestDto,
  ): Promise<ApiResponseDto<UpdateNotificationSettingsResponseDto>> {
    const result = await this.settingsService.updateNotificationSettings(
      user.sub,
      user.guildId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('timezone')
  @ApiOperation({
    summary: '타임존 설정 조회',
    description: '사용자의 타임존 설정을 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '타임존 설정 조회 성공',
    type: ApiResponseDto<TimezoneSettingsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async getTimezone(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponseDto<TimezoneSettingsResponseDto>> {
    const result = await this.settingsService.getTimezone(
      user.sub,
      user.guildId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Patch('timezone')
  @ApiOperation({
    summary: '타임존 변경',
    description: '사용자의 타임존을 변경합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '타임존 변경 성공',
    type: ApiResponseDto<UpdateTimezoneResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 (유효하지 않은 타임존)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async updateTimezone(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTimezoneRequestDto,
  ): Promise<ApiResponseDto<UpdateTimezoneResponseDto>> {
    const result = await this.settingsService.updateTimezone(
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
