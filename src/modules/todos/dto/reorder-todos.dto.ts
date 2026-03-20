import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderTodoItemDto {
  @ApiProperty({ description: '투두 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '변경할 정렬 순서', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}

export class ReorderTodosRequestDto {
  @ApiProperty({
    description: '투두 순서 목록',
    type: [ReorderTodoItemDto],
    example: [
      { id: 3, order: 1 },
      { id: 1, order: 2 },
      { id: 5, order: 3 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTodoItemDto)
  @IsNotEmpty()
  items: ReorderTodoItemDto[];
}

export class ReorderTodosResponseDto {
  @ApiProperty({ description: '순서 변경된 투두 수', example: 3 })
  updatedCount: number;
}
