import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class StartTimerRequestDto {
  @ApiPropertyOptional({
    description: '타이머 시작 시간 (생략 시 서버 시간)',
    example: '2025-12-09T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;
}

export class StartTimerResponseDto {
  @ApiPropertyOptional({ description: '세션 ID' })
  sessionId: number;

  @ApiPropertyOptional({ description: '시작 시간' })
  startedAt: string;
}
