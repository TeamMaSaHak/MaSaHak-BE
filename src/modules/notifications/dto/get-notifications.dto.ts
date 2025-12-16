import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationType {
  DIARY_REPLY = 'DIARY_REPLY',
  NOTICE = 'NOTICE',
}

export class GetNotificationsRequestDto {
  @ApiPropertyOptional({
    description: '페이지 번호',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class NotificationDto {
  @ApiProperty({ description: '알림 ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '알림 타입',
    enum: NotificationType,
    example: NotificationType.DIARY_REPLY,
  })
  type: NotificationType;

  @ApiProperty({ description: '알림 제목', example: '일기 답장이 도착했어요!' })
  title: string;

  @ApiProperty({
    description: '알림 내용',
    example: '오늘의 일기에 답장이 왔습니다.',
  })
  body: string;

  @ApiProperty({ description: '읽음 여부', example: false })
  isRead: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2025-01-16T09:00:00Z',
  })
  createdAt: string;
}

export class PaginationDto {
  @ApiProperty({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiProperty({ description: '페이지당 항목 수', example: 20 })
  limit: number;

  @ApiProperty({ description: '전체 항목 수', example: 45 })
  total: number;

  @ApiProperty({ description: '다음 페이지 존재 여부', example: true })
  hasNext: boolean;
}

export class GetNotificationsResponseDto {
  @ApiProperty({
    description: '알림 목록',
    type: [NotificationDto],
  })
  notifications: NotificationDto[];

  @ApiProperty({
    description: '페이지네이션 정보',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
