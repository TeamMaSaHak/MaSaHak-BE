import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiPropertyOptional({
    description: '프로필 이미지 URL (디스코드)',
    example: 'https://cdn.discordapp.com/avatars/123456789/abcdef.png',
  })
  profileImage: string | null;

  @ApiProperty({
    description: '닉네임 (디스코드 사용자명)',
    example: '마법사학생',
  })
  nickname: string;

  @ApiProperty({
    description: '학번 (YYYYMMDD + NN)',
    example: '2025050101',
  })
  studentNo: string;

  @ApiProperty({
    description: '학년 (숫자)',
    example: 1,
  })
  grade: number;

  @ApiProperty({
    description: '학년명',
    example: '1학년',
  })
  gradeName: string;

  @ApiPropertyOptional({
    description: '기숙사',
    example: '그리핀도르',
  })
  dormitory: string | null;

  @ApiProperty({
    description: '총 공부 시간 (초)',
    example: 36000,
  })
  totalSeconds: number;

  @ApiProperty({
    description: '레벨',
    example: 5,
  })
  level: number;

  @ApiPropertyOptional({
    description: '레벨명',
    example: '견습 마법사',
  })
  levelName: string | null;

  @ApiProperty({
    description: '가입일',
    example: '2025-05-01',
  })
  joinedAt: string;
}
