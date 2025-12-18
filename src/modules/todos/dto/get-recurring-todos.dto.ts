import { ApiProperty } from '@nestjs/swagger';

export class RecurringTodoItemDto {
  @ApiProperty({
    description: '반복 투두 ID',
    example: 'recurring_1',
  })
  id: number;

  @ApiProperty({
    description: '반복 투두 내용',
    example: '물 2L 마시기',
  })
  content: string;

  @ApiProperty({
    description: '생성일시',
    example: '2025-01-10T08:00:00Z',
  })
  createdAt: string;
}

export class GetRecurringTodosResponseDto {
  @ApiProperty({
    description: '반복 투두 목록',
    type: [RecurringTodoItemDto],
  })
  recurringTodos: RecurringTodoItemDto[];
}
