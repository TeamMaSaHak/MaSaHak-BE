import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthTokensDto } from './auth-tokens.dto';

export class UserProfileDto {
  @ApiProperty({
    description: '유저 ID (Discord ID)',
    example: '123456789012345678',
  })
  userId: string;

  @ApiProperty({
    description: '서버 ID (Guild ID)',
    example: '987654321098765432',
  })
  guildId: string;

  @ApiProperty({ description: '닉네임', example: '마법사' })
  nickname: string;

  @ApiPropertyOptional({ description: '학번', example: '2025010101' })
  studentNo?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL' })
  profileImage?: string;

  @ApiPropertyOptional({ description: '기숙사' })
  dormitory?: string;

  @ApiProperty({ description: '레벨', example: 1 })
  level: number;

  @ApiProperty({ description: '레벨명', example: '마법학도' })
  levelName: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: '인증 토큰 정보', type: AuthTokensDto })
  tokens: AuthTokensDto;

  @ApiProperty({ description: '사용자 프로필', type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ description: '서버 멤버 여부', example: true })
  isMember: boolean;
}

export class RefreshTokenRequestDto {
  @ApiProperty({ description: 'Refresh Token', example: 'refresh_token_here' })
  @IsString({ message: 'refreshToken은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'refreshToken은 필수입니다.' })
  refreshToken: string;
}

export class VerifyMemberResponseDto {
  @ApiProperty({ description: '서버 멤버 여부', example: true })
  isMember: boolean;

  @ApiPropertyOptional({
    description: '사용자 프로필 (멤버인 경우)',
    type: UserProfileDto,
  })
  user?: UserProfileDto;
}
