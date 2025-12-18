import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  GetNotificationsRequestDto,
  GetNotificationsResponseDto,
  NotificationDto,
  NotificationType,
  ReadNotificationResponseDto,
  ReadAllNotificationsResponseDto,
  UnreadCountResponseDto,
} from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getNotifications(
    userId: string,
    guildId: string,
    dto: GetNotificationsRequestDto,
  ): Promise<GetNotificationsResponseDto> {
    const supabase = this.supabaseService.getClient();
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Failed to get notifications: ${error.message}`);
      throw new InternalServerErrorException(
        '알림 목록 조회 중 오류가 발생했습니다.',
      );
    }

    const total = count || 0;
    const notifications: NotificationDto[] = (data || []).map((item) => ({
      id: item.notification_id,
      type: item.type as NotificationType,
      title: item.title,
      body: item.body,
      isRead: item.is_read,
      createdAt: item.created_at,
    }));

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        hasNext: page * limit < total,
      },
    };
  }

  async getUnreadCount(
    userId: string,
    guildId: string,
  ): Promise<UnreadCountResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('is_read', false);

    if (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      throw new InternalServerErrorException(
        '안읽은 알림 개수 조회 중 오류가 발생했습니다.',
      );
    }

    return {
      count: count || 0,
    };
  }

  async readNotification(
    userId: string,
    guildId: string,
    notificationId: string,
  ): Promise<ReadNotificationResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data: notification, error: findError } = await supabase
      .from('notifications')
      .select('*')
      .eq('notification_id', notificationId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (findError) {
      throw new InternalServerErrorException(
        '읽음 처리 중 오류가 발생했습니다.',
      );
    }

    if (!notification) {
      this.logger.error(`Notification not found: ${notificationId}`);
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    if (notification.is_read) {
      return {
        id: notification.notification_id,
        isRead: true,
      };
    }

    // 읽음 처리
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('notification_id', notificationId)
      .select('notification_id, is_read')
      .single();

    if (error) {
      this.logger.error(`Failed to read notification: ${error.message}`);
      throw new InternalServerErrorException(
        '알림 읽음 처리 중 오류가 발생했습니다.',
      );
    }

    return {
      id: data.notification_id,
      isRead: data.is_read,
    };
  }

  async readAllNotifications(
    userId: string,
    guildId: string,
  ): Promise<ReadAllNotificationsResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('is_read', false)
      .select('notification_id');

    if (error) {
      this.logger.error(`Failed to read all notifications: ${error.message}`);
      throw new InternalServerErrorException(
        '전체 읽음 처리 중 오류가 발생했습니다.',
      );
    }

    return {
      updatedCount: data?.length || 0,
    };

  }

}