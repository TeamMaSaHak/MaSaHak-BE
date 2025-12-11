import { ApiProperty } from '@nestjs/swagger';

export class DeleteRecurringTodoResponseDto {
  @ApiProperty({
    description: '삭제된 반복 투두 ID',
    example: 'recurring_1',
  })
  id: string;

  @ApiProperty({
    description: '삭제일시',
    example: '2025-01-15T12:00:00Z',
  })
  deletedAt: string;
}
