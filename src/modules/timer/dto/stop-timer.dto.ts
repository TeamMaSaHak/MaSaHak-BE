import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class StopTimerRequestDto {
  @ApiProperty({
    description: '세션 ID',
    example: 1,
  })
  @IsNumber()
  sessionId: number;

  @ApiProperty({
    description: '총 공부 시간 (초)',
    example: 3600,
  })
  @IsNumber()
  @Min(0)
  durationSeconds: number;

  @ApiPropertyOptional({
    description: '종료 시간 (생략 시 서버 시간)',
    example: '2025-12-09T11:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}

export class StopTimerResponseDto {
  @ApiPropertyOptional({ description: '세션 ID' })
  sessionId: number;

  @ApiPropertyOptional({ description: '총 공부 시간 (초)' })
  durationSeconds: number;

  @ApiPropertyOptional({ description: '시작 시간' })
  startedAt: string;

  @ApiPropertyOptional({ description: '종료 시간' })
  endedAt: string;
}
