import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscordUserDto {
  @ApiProperty({ description: 'Discord 유저 ID', example: '123456789012345678' })
  id: string;

  @ApiProperty({ description: 'Discord 사용자명', example: 'username' })
  username: string;

  @ApiPropertyOptional({ description: 'Discord 글로벌 이름', example: 'Display Name' })
  globalName?: string;

  @ApiPropertyOptional({ description: 'Discord 아바타 해시', example: 'a_1234567890abcdef' })
  avatar?: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  email: string;
}

export class DiscordGuildMemberDto {
  @ApiProperty({ description: '닉네임', example: '마법사' })
  nick?: string;

  @ApiProperty({ description: '역할 ID 배열', example: ['123456789012345678'] })
  roles: string[];

  @ApiProperty({ description: '서버 가입일', example: '2024-01-01T00:00:00.000Z' })
  joinedAt: string;
}
