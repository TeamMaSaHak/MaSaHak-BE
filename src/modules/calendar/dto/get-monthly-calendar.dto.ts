import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMonthlyCalendarParamsDto {
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

export class CalendarDayDto {
  @ApiProperty({
    description: '날짜 (YYYY-MM-DD)',
    example: '2025-08-12',
  })
  date: string;

  @ApiProperty({
    description: '총 공부 시간 (분)',
    example: 750,
  })
  totalMinutes: number;

  @ApiProperty({
    description: '일기 작성 여부',
    example: true,
  })
  hasDiary: boolean;
}

export class GetMonthlyCalendarResponseDto {
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
    description: '해당 월의 날짜별 데이터',
    type: [CalendarDayDto],
  })
  days: CalendarDayDto[];
}
