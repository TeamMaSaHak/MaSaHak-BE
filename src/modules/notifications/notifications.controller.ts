import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  GetNotificationsRequestDto,
  GetNotificationsResponseDto,
  ReadNotificationResponseDto,
  ReadAllNotificationsResponseDto,
  UnreadCountResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: '알림 목록 조회',
    description: '사용자의 알림 목록을 페이지네이션하여 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '알림 목록 조회 성공',
    type: ApiResponseDto<GetNotificationsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async getNotifications(
    @CurrentUser() user: JwtPayload,
    @Query() dto: GetNotificationsRequestDto,
  ): Promise<ApiResponseDto<GetNotificationsResponseDto>> {
    const result = await this.notificationsService.getNotifications(
      user.sub,
      user.guildId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('unread-count')
  @ApiOperation({
    summary: '안읽은 알림 수',
    description: '안읽은 알림 개수를 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '안읽은 알림 개수 조회 성공',
    type: ApiResponseDto<UnreadCountResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async getUnreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponseDto<UnreadCountResponseDto>> {
    const result = await this.notificationsService.getUnreadCount(
      user.sub,
      user.guildId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Patch(':notificationId/read')
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '개별 알림을 읽음 처리합니다.',
  })
  @ApiParam({
    name: 'notificationId',
    description: '알림 ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '알림 읽음 처리 성공',
    type: ApiResponseDto<ReadNotificationResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '알림을 찾을 수 없음',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async readNotification(
    @CurrentUser() user: JwtPayload,
    @Param('notificationId') notificationId: string,
  ): Promise<ApiResponseDto<ReadNotificationResponseDto>> {
    const result = await this.notificationsService.readNotification(
      user.sub,
      user.guildId,
      notificationId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Patch('read-all')
  @ApiOperation({
    summary: '전체 읽음 처리',
    description: '모든 알림을 읽음 처리합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '전체 읽음 처리 성공',
    type: ApiResponseDto<ReadAllNotificationsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async readAllNotifications(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponseDto<ReadAllNotificationsResponseDto>> {
    const result = await this.notificationsService.readAllNotifications(
      user.sub,
      user.guildId,
    );
    return {
      success: true,
      data: result,
    };
  }
}
