import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ description: '서버 상태', example: 'ok' })
  status: string;

  @ApiProperty({
    description: '타임스탬프',
    example: '2025-12-06T12:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({ description: '서비스명', example: 'masahak-api' })
  service: string;

  @ApiProperty({
    description: 'DB 연결 상태',
    example: 'connected',
    required: false,
  })
  database?: string;
}
