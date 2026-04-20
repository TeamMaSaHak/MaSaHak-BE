import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Public, CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  RefreshTokenRequestDto,
  AuthTokensDto,
  VerifyMemberResponseDto,
} from './dto';
import type { JwtPayload } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('discord')
  @ApiOperation({
    summary: 'Discord OAuth 로그인',
    description: 'Discord OAuth 인증 페이지로 리다이렉트합니다.',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Discord OAuth 페이지로 리다이렉트',
  })
  discordLogin(@Res() res: Response) {
    const url = this.authService.getDiscordOAuthUrl();
    return res.redirect(url);
  }

  @Public()
  @Get('discord/callback')
  @ApiOperation({
    summary: 'Discord OAuth 콜백',
    description:
      'Discord OAuth 콜백을 처리하고 JWT 토큰을 발급한 뒤, 모바일 앱 딥링크(masahak://login)로 302 리다이렉트합니다.',
  })
  @ApiQuery({ name: 'code', description: 'Discord OAuth 인증 코드' })
  @ApiQuery({
    name: 'timezone',
    description: '사용자 타임존 (IANA 타임존)',
    required: false,
    example: 'Asia/Seoul',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: '앱 딥링크로 리다이렉트 (토큰을 쿼리스트링으로 전달)',
  })
  async discordCallback(
    @Res() res: Response,
    @Query('code') code: string,
    @Query('timezone') timezone?: string,
  ): Promise<void> {
    const deepLinkBase = this.configService.getOrThrow<string>(
      'APP_DEEP_LINK_URL',
    );

    if (!code) {
      return res.redirect(
        HttpStatus.FOUND,
        `${deepLinkBase}?error=missing_code`,
      );
    }

    try {
      const result = await this.authService.handleDiscordCallback(
        code,
        timezone,
      );

      const params = new URLSearchParams({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: String(result.tokens.expiresIn),
        isMember: String(result.isMember),
        userId: result.user.userId,
      });

      return res.redirect(
        HttpStatus.FOUND,
        `${deepLinkBase}?${params.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Discord callback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return res.redirect(
        HttpStatus.FOUND,
        `${deepLinkBase}?error=auth_failed`,
      );
    }
  }

  @Get('verify-member')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '서버 멤버 검증',
    description: '현재 사용자가 마법사관학교 서버 멤버인지 확인합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '멤버 검증 결과',
    type: ApiResponseDto<VerifyMemberResponseDto>,
  })
  async verifyMember(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponseDto<VerifyMemberResponseDto>> {
    const result = await this.authService.verifyMember(user.sub);
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: '토큰 갱신',
    description: 'Refresh Token을 사용하여 새로운 Access Token을 발급합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '토큰 갱신 성공',
    type: ApiResponseDto<AuthTokensDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '유효하지 않은 Refresh Token',
  })
  async refresh(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<ApiResponseDto<AuthTokensDto>> {
    const tokens = await this.authService.refreshTokens(body.refreshToken);
    return {
      success: true,
      data: tokens,
    };
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃 처리합니다. (클라이언트에서 토큰 삭제 필요)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '로그아웃 성공',
  })
  async logout(): Promise<ApiResponseDto<{ message: string }>> {
    return {
      success: true,
      data: { message: '로그아웃되었습니다.' },
    };
  }
}
