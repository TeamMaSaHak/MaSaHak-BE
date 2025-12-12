import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateRecurringTodoRequestDto {
  @ApiProperty({
    description: '반복 투두 내용 (최대 22자)',
    example: '매일 운동하기',
    maxLength: 22,
  })
  @IsString()
  @MaxLength(22)
  content: string;
}

export class CreateRecurringTodoResponseDto {
  @ApiProperty({
    description: '반복 투두 ID',
    example: 'recurring_3',
  })
  id: number;

  @ApiProperty({
    description: '반복 투두 내용',
    example: '매일 운동하기',
  })
  content: string;

  @ApiProperty({
    description: '생성일시',
    example: '2025-01-15T10:00:00Z',
  })
  createdAt: string;
}
