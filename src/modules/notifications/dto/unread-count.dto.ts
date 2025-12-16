import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({ description: '안읽은 알림 개수', example: 3 })
  count: number;
}
