import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class PomodoroSettingsDto {
  @ApiProperty({
    description: '집중 시간 (분)',
    example: 25,
    minimum: 1,
    maximum: 120,
  })
  @IsInt()
  @Min(1)
  @Max(120)
  focusTime: number;

  @ApiProperty({
    description: '쉬는 시간 (분)',
    example: 5,
    minimum: 1,
    maximum: 60,
  })
  @IsInt()
  @Min(1)
  @Max(60)
  breakTime: number;

  @ApiProperty({
    description: '반복 횟수',
    example: 4,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  repeatCount: number;
}
