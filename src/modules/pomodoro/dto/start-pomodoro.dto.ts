import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class StartPomodoroRequestDto {
  @ApiPropertyOptional({
    description: '세션 시작 시간 (생략 시 서버 시간)',
    example: '2025-12-09T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({
    description: '집중 시간 (분), 생략 시 사용자 설정값 또는 기본값 25분',
    example: 25,
    minimum: 5,
    maximum: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  focusTime?: number;

  @ApiPropertyOptional({
    description: '쉬는 시간 (분), 생략 시 사용자 설정값 또는 기본값 5분',
    example: 5,
    minimum: 1,
    maximum: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  breakTime?: number;

  @ApiPropertyOptional({
    description: '반복 횟수, 생략 시 사용자 설정값 또는 기본값 4회',
    example: 4,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  repeatCount?: number;
}

export class StartPomodoroResponseDto {
  @ApiProperty({ description: '세션 ID', example: 1 })
  sessionId: number;

  @ApiProperty({
    description: '시작 시간',
    example: '2025-12-09T10:00:00.000Z',
  })
  startedAt: string;

  @ApiProperty({ description: '집중 시간 (분)', example: 25 })
  focusTime: number;

  @ApiProperty({ description: '쉬는 시간 (분)', example: 5 })
  breakTime: number;

  @ApiProperty({ description: '반복 횟수', example: 4 })
  repeatCount: number;
}
