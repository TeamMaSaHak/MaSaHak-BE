import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMonthlyStatsQueryDto {
  @ApiProperty({
    description: '조회할 연도',
    example: 2025,
    minimum: 2020,
    maximum: 2100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @ApiProperty({
    description: '조회할 월',
    example: 8,
    minimum: 1,
    maximum: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}

export class GetMonthlyStatsResponseDto {
  @ApiProperty({
    description: '조회 연도',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: '조회 월',
    example: 8,
  })
  month: number;

  @ApiProperty({
    description: '이번달 출석 일수',
    example: 15,
  })
  attendanceDays: number;

  @ApiProperty({
    description: '이번달 총 일수',
    example: 31,
  })
  totalDaysInMonth: number;

  @ApiProperty({
    description: '이번달 총 집중 시간 (분)',
    example: 1500,
  })
  totalMinutes: number;

  @ApiProperty({
    description: '일 평균 집중 시간 (분, 출석한 날 기준)',
    example: 100,
  })
  averageMinutesPerDay: number;

  @ApiProperty({
    description: '완료한 투두 개수',
    example: 25,
  })
  completedTodos: number;
}
