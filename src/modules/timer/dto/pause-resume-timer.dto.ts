import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PauseTimerRequestDto {
  @ApiProperty({
    description: '세션 ID',
    example: 1,
  })
  @IsNumber()
  sessionId: number;
}

export class ResumeTimerRequestDto {
  @ApiProperty({
    description: '세션 ID',
    example: 1,
  })
  @IsNumber()
  sessionId: number;
}
