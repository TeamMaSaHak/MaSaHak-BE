import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class PomodoroSettingsDto {
  @ApiProperty({
    description: '집중 시간 (분)',
    example: 25,
    minimum: 5,
    maximum: 120,
  })
  @IsInt()
  @Min(5)
  @Max(120)
  focusTime: number;

  @ApiProperty({
    description: '쉬는 시간 (분)',
    example: 5,
    minimum: 5,
    maximum: 30,
  })
  @IsInt()
  @Min(5)
  @Max(30)
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
