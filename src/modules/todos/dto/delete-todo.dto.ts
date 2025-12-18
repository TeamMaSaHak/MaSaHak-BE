import { ApiProperty } from '@nestjs/swagger';

export class DeleteTodoResponseDto {
  @ApiProperty({
    description: '삭제된 투두 ID',
    example: 'todo_1',
  })
  id: number;

  @ApiProperty({
    description: '삭제일시',
    example: '2025-01-15T12:00:00Z',
  })
  deletedAt: string;
}
