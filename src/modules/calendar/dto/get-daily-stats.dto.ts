import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetDailyStatsQueryDto {
  @ApiProperty({
    description: '조회할 날짜 (YYYY-MM-DD)',
    example: '2025-08-12',
  })
  @IsDateString()
  date: string;
}

export class GetDailyStatsResponseDto {
  @ApiProperty({
    description: '조회 날짜',
    example: '2025-08-12',
  })
  date: string;

  @ApiProperty({
    description: '해당 날짜 총 공부 시간 (분)',
    example: 180,
  })
  totalMinutes: number;

  @ApiProperty({
    description: '전날 대비 공부 시간 증감 (분)',
    example: 30,
  })
  diffFromYesterday: number;

  @ApiPropertyOptional({
    description: '첫 공부 시작 시간 (HH:mm)',
    example: '09:30',
  })
  firstStartTime: string | null;

  @ApiProperty({
    description: '가장 긴 집중 시간 (분)',
    example: 75,
  })
  longestSessionMinutes: number;
}
