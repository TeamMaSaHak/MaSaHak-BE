import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
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
  LoginResponseDto,
  RefreshTokenRequestDto,
  AuthTokensDto,
  VerifyMemberResponseDto,
} from './dto';
import type { JwtPayload } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      'Discord OAuth 콜백을 처리하고 JWT 토큰을 발급합니다. 프론트엔드에서 code를 전달받아 처리합니다.',
  })
  @ApiQuery({ name: 'code', description: 'Discord OAuth 인증 코드' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '로그인 성공',
    type: ApiResponseDto<LoginResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Discord 인증 실패',
  })
  async discordCallback(
    @Query('code') code: string,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const result = await this.authService.handleDiscordCallback(code);
    return {
      success: true,
      data: result,
    };
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
