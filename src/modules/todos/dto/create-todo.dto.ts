import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MaxLength } from 'class-validator';

export class CreateTodoRequestDto {
  @ApiProperty({
    description: '투두 내용 (최대 22자)',
    example: '새로운 할일',
    maxLength: 22,
  })
  @IsString()
  @MaxLength(22)
  content: string;

  @ApiProperty({
    description: '투두 날짜 (YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @IsDateString()
  date: string;
}

export class CreateTodoResponseDto {
  @ApiProperty({
    description: '투두 ID',
    example: 'todo_3',
  })
  id: number;

  @ApiProperty({
    description: '투두 내용',
    example: '새로운 할일',
  })
  content: string;

  @ApiProperty({
    description: '완료 여부',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: '생성일시',
    example: '2025-01-15T10:00:00Z',
  })
  createdAt: string;
}
