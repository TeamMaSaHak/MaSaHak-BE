import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetDiaryParamsDto {
  @ApiProperty({
    description: '조회할 일기 날짜 (YYYY-MM-DD)',
    example: '2025-12-11',
  })
  @IsDateString()
  date: string;
}

export class DiaryReplyDto {
  @ApiProperty({
    description: '답장 ID',
    example: 1,
  })
  replyId: number;

  @ApiProperty({
    description: 'LLM 답장 내용',
    example: '오늘도 열심히 공부했네요! 내일도 화이팅!',
  })
  content: string;

  @ApiProperty({
    description: '답장 생성 시간',
    example: '2025-12-12T06:05:00.000Z',
  })
  createdAt: string;
}

export class GetDiaryResponseDto {
  @ApiProperty({
    description: '일기 ID (일기가 없으면 null)',
    example: 1,
    nullable: true,
  })
  diaryId: number | null;

  @ApiProperty({
    description: '일기 날짜',
    example: '2025-12-11',
  })
  date: string;

  @ApiPropertyOptional({
    description: '일기 내용 (일기가 없으면 null)',
    example: '오늘은 NestJS를 공부했다.',
    nullable: true,
  })
  content: string | null;

  @ApiProperty({
    description: '수정 잠금 여부 (true면 수정 불가)',
    example: false,
  })
  isLocked: boolean;

  @ApiProperty({
    description: '현재 수정 가능 여부 (시간 기반 판단)',
    example: true,
  })
  canEdit: boolean;

  @ApiPropertyOptional({
    description: 'LLM 답장 (09:00 이후에만 노출, 없으면 null)',
    type: DiaryReplyDto,
    nullable: true,
  })
  reply: DiaryReplyDto | null;

  @ApiProperty({
    description: '일기 생성 시간',
    example: '2025-12-11T10:00:00.000Z',
    nullable: true,
  })
  createdAt: string | null;

  @ApiProperty({
    description: '일기 수정 시간',
    example: '2025-12-11T15:30:00.000Z',
    nullable: true,
  })
  updatedAt: string | null;
}
