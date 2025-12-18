import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class NotificationSettingsResponseDto {
  @ApiProperty({
    description: '푸시 알림 활성화 여부',
    example: true,
  })
  pushEnabled: boolean;

  @ApiProperty({
    description: '마지막 수정일',
    example: '2025-12-19T00:00:00.000Z',
    nullable: true,
  })
  updatedAt: string | null;
}

export class UpdateNotificationSettingsRequestDto {
  @ApiProperty({
    description: '푸시 알림 활성화 여부',
    example: true,
  })
  @IsBoolean({ message: 'pushEnabled는 boolean 타입이어야 합니다.' })
  pushEnabled: boolean;
}

export class UpdateNotificationSettingsResponseDto {
  @ApiProperty({
    description: '푸시 알림 활성화 여부',
    example: true,
  })
  pushEnabled: boolean;

  @ApiProperty({
    description: '수정일',
    example: '2025-12-19T00:00:00.000Z',
  })
  updatedAt: string;
}
