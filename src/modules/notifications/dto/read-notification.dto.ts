import { ApiProperty } from '@nestjs/swagger';

export class ReadNotificationResponseDto {
  @ApiProperty({ description: '알림 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '읽음 여부', example: true })
  isRead: boolean;
}
