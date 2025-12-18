import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    description: 'Access Token (JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token', example: 'refresh_token_here' })
  refreshToken: string;

  @ApiProperty({ description: 'Access Token 만료 시간 (초)', example: 3600 })
  expiresIn: number;
}
