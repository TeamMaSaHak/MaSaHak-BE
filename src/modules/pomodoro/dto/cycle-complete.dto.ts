import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsDateString } from 'class-validator';

export class CycleCompleteRequestDto {
  @ApiProperty({
    description: '세션 ID',
    example: 1,
  })
  @IsNumber()
  sessionId: number;

  @ApiProperty({
    description: '완료된 사이클 번호 (1부터 시작)',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  cycleNumber: number;

  @ApiProperty({
    description: '해당 사이클의 집중 시간 (초)',
    example: 1500,
  })
  @IsNumber()
  @Min(0)
  focusDurationSeconds: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: '사이클 완료 시간 (생략 시 서버 시간)',
    example: '2025-12-09T10:25:00.000Z',
    required: false,
  })
  completedAt?: string;
}

export class CycleCompleteResponseDto {
  @ApiProperty({ description: '세션 ID', example: 1 })
  sessionId: number;

  @ApiProperty({ description: '완료된 사이클 번호', example: 1 })
  cycleNumber: number;

  @ApiProperty({
    description: '사이클 완료 시간',
    example: '2025-12-09T10:25:00.000Z',
  })
  completedAt: string;

  @ApiProperty({ description: '다음 사이클 여부', example: true })
  hasNextCycle: boolean;
}
