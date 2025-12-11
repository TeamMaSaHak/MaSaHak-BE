import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateRecurringTodoRequestDto {
  @ApiProperty({
    description: '수정할 반복 투두 내용 (최대 22자)',
    example: '수정된 반복 할일',
    maxLength: 22,
  })
  @IsString()
  @MaxLength(22)
  content: string;
}

export class UpdateRecurringTodoResponseDto {
  @ApiProperty({
    description: '반복 투두 ID',
    example: 'recurring_1',
  })
  id: string;

  @ApiProperty({
    description: '반복 투두 내용',
    example: '수정된 반복 할일',
  })
  content: string;

  @ApiProperty({
    description: '수정일시',
    example: '2025-01-15T11:00:00Z',
  })
  updatedAt: string;
}
