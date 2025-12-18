import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateTodoRequestDto {
  @ApiProperty({
    description: '수정할 투두 내용 (최대 22자)',
    example: '수정된 할일',
    maxLength: 22,
  })
  @IsString()
  @MaxLength(22)
  content: string;
}

export class UpdateTodoResponseDto {
  @ApiProperty({
    description: '투두 ID',
    example: 'todo_1',
  })
  id: number;

  @ApiProperty({
    description: '투두 내용',
    example: '수정된 할일',
  })
  content: string;

  @ApiProperty({
    description: '수정일시',
    example: '2025-01-15T11:00:00Z',
  })
  updatedAt: string;
}
