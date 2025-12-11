import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class TodoItemDto {
  @ApiProperty({
    description: '투두 ID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: '투두 내용',
    example: '알고리즘 문제 풀기',
  })
  content: string;

  @ApiProperty({
    description: '완료 여부',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: '생성일시',
    example: '2025-01-15T08:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
  })
  order: number;
}

export class GetTodosDto {
  @ApiProperty({
    description: '조회할 날짜 (YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @IsDateString()
  date: string;
}

export class GetTodosResponseDto {
  @ApiProperty({
    description: '조회 날짜',
    example: '2025-01-15',
  })
  date: string;

  @ApiProperty({
    description: '투두 목록',
    type: [TodoItemDto],
  })
  todos: TodoItemDto[];
}
