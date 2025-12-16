import { ApiProperty } from '@nestjs/swagger';

export class ReadAllNotificationsResponseDto {
  @ApiProperty({ description: '읽음 처리된 알림 개수', example: 5 })
  updatedCount: number;
}
