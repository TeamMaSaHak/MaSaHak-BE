import { ApiProperty } from '@nestjs/swagger';

export class ToggleTodoResponseDto {
  @ApiProperty({
    description: '투두 ID',
    example: 'todo_1',
  })
  id: number;

  @ApiProperty({
    description: '완료 여부',
    example: true,
  })
  isCompleted: boolean;
}
