import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpsertDiaryParamsDto {
  @ApiProperty({
    description: '일기 날짜 (YYYY-MM-DD)',
    example: '2025-12-11',
  })
  @IsDateString()
  date: string;
}

export class UpsertDiaryBodyDto {
  @ApiProperty({
    description: '일기 내용',
    example: '오늘은 NestJS를 공부했다. 생각보다 재미있었다!',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: '일기 내용을 입력해주세요.' })
  @MaxLength(5000, { message: '일기 내용은 5000자 이하로 입력해주세요.' })
  content: string;
}

export class UpsertDiaryResponseDto {
  @ApiProperty({
    description: '일기 ID',
    example: 1,
  })
  diaryId: number;

  @ApiProperty({
    description: '일기 날짜',
    example: '2025-12-11',
  })
  date: string;

  @ApiProperty({
    description: '일기 내용',
    example: '오늘은 NestJS를 공부했다. 생각보다 재미있었다!',
  })
  content: string;

  @ApiProperty({
    description: '생성/수정 여부 (true: 생성, false: 수정)',
    example: true,
  })
  isCreated: boolean;

  @ApiProperty({
    description: '저장 시간',
    example: '2025-12-11T15:30:00.000Z',
  })
  savedAt: string;
}
