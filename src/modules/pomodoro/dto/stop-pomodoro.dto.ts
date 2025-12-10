import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class StopPomodoroRequestDto {
  @ApiProperty({
    description: '세션 ID',
    example: 1,
  })
  @IsNumber()
  sessionId: number;

  @ApiProperty({
    description: '총 집중 시간 (초)',
    example: 1500,
  })
  @IsNumber()
  @Min(0)
  durationSeconds: number;

  @ApiProperty({
    description: '완료한 사이클 수',
    example: 2,
  })
  @IsNumber()
  @Min(0)
  completedCycles: number;

  @ApiPropertyOptional({
    description: '종료 시간 (생략 시 서버 시간)',
    example: '2025-12-09T11:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}

export class StopPomodoroResponseDto {
  @ApiProperty({ description: '세션 ID', example: 1 })
  sessionId: number;

  @ApiProperty({ description: '총 집중 시간 (초)', example: 1500 })
  durationSeconds: number;

  @ApiProperty({ description: '완료한 사이클 수', example: 2 })
  completedCycles: number;

  @ApiProperty({
    description: '시작 시간',
    example: '2025-12-09T10:00:00.000Z',
  })
  startedAt: string;

  @ApiProperty({
    description: '종료 시간',
    example: '2025-12-09T11:00:00.000Z',
  })
  endedAt: string;
}
