import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../database/supabase';
import {
  JwtPayload,
  DiscordTokenResponse,
  DiscordUser,
  DiscordGuildMember,
} from './interfaces';
import {
  AuthTokensDto,
  LoginResponseDto,
  UserProfileDto,
  VerifyMemberResponseDto,
} from './dto';
import { ERROR_CODES } from '../../common/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly discordApiBase = 'https://discord.com/api/v10';

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
  ) {}

  getDiscordOAuthUrl(): string {
    const clientId = this.configService.getOrThrow<string>('DISCORD_CLIENT_ID');
    const redirectUri = this.configService.getOrThrow<string>(
      'DISCORD_REDIRECT_URI',
    );
    const scope = encodeURIComponent('identify email guilds.members.read');

    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
  }

  async exchangeCodeForTokens(code: string): Promise<DiscordTokenResponse> {
    const clientId = this.configService.getOrThrow<string>('DISCORD_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>(
      'DISCORD_CLIENT_SECRET',
    );
    const redirectUri = this.configService.getOrThrow<string>(
      'DISCORD_REDIRECT_URI',
    );

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(`${this.discordApiBase}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Discord token exchange failed: ${error}`);
      throw new UnauthorizedException('Discord 인증에 실패했습니다.');
    }

    return response.json();
  }

  async getDiscordUser(accessToken: string): Promise<DiscordUser> {
    const response = await fetch(`${this.discordApiBase}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException(
        'Discord 사용자 정보를 가져올 수 없습니다.',
      );
    }

    return response.json();
  }

  async getGuildMember(
    accessToken: string,
    guildId: string,
  ): Promise<DiscordGuildMember | null> {
    const response = await fetch(
      `${this.discordApiBase}/users/@me/guilds/${guildId}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      this.logger.warn(`Failed to get guild member: ${response.status}`);
      return null;
    }

    return response.json();
  }

  async handleDiscordCallback(code: string): Promise<LoginResponseDto> {
    const guildId = this.configService.getOrThrow<string>('DISCORD_GUILD_ID');

    const discordTokens = await this.exchangeCodeForTokens(code);
    const discordUser = await this.getDiscordUser(discordTokens.access_token);
    const guildMember = await this.getGuildMember(
      discordTokens.access_token,
      guildId,
    );

    const isMember = guildMember !== null;

    const user = await this.upsertUser(discordUser, guildMember, guildId);

    const tokens = await this.generateTokens({
      sub: discordUser.id,
      guildId,
      nickname: user.nickname,
    });

    return {
      tokens,
      user,
      isMember,
    };
  }

  async verifyMember(userId: string): Promise<VerifyMemberResponseDto> {
    const guildId = this.configService.getOrThrow<string>('DISCORD_GUILD_ID');
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (error || !user) {
      return { isMember: false };
    }

    return {
      isMember: user.status === 'active',
      user: this.mapUserToProfile(user),
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokensDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return this.generateTokens({
        sub: payload.sub,
        guildId: payload.guildId,
        nickname: payload.nickname,
      });
    } catch {
      throw new UnauthorizedException(ERROR_CODES.AUTH_INVALID_TOKEN);
    }
  }

  private async generateTokens(payload: JwtPayload): Promise<AuthTokensDto> {
    const accessExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '1h',
    );
    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const accessExpiresInSeconds = this.parseExpiresIn(accessExpiresIn);
    const refreshExpiresInSeconds = this.parseExpiresIn(refreshExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: accessExpiresInSeconds }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshExpiresInSeconds,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresInSeconds,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 1);
  }

  private async upsertUser(
    discordUser: DiscordUser,
    guildMember: DiscordGuildMember | null,
    guildId: string,
  ): Promise<UserProfileDto> {
    const supabase = this.supabaseService.getClient();

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', discordUser.id)
      .eq('guild_id', guildId)
      .single();

    const nickname =
      guildMember?.nick || discordUser.global_name || discordUser.username;
    const profileImage = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    if (existingUser) {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          nickname,
          profile_image: profileImage,
          status: guildMember ? 'active' : 'left',
          last_seen_at: new Date().toISOString(),
        })
        .eq('user_id', discordUser.id)
        .eq('guild_id', guildId)
        .select()
        .single();

      if (error) {
        this.logger.error(`Failed to update user: ${error.message}`);
        return this.mapUserToProfile(existingUser);
      }

      return this.mapUserToProfile(updatedUser);
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        user_id: discordUser.id,
        guild_id: guildId,
        nickname,
        profile_image: profileImage,
        status: guildMember ? 'active' : 'left',
        joined_at: guildMember?.joined_at
          ? new Date(guildMember.joined_at).toISOString().split('T')[0]
          : null,
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new UnauthorizedException('사용자 정보 저장에 실패했습니다.');
    }

    return this.mapUserToProfile(newUser);
  }

  private mapUserToProfile(user: Record<string, unknown>): UserProfileDto {
    return {
      userId: String(user.user_id),
      guildId: String(user.guild_id),
      nickname: String(user.nickname || ''),
      studentNo: user.student_no as string | undefined,
      profileImage: user.profile_image as string | undefined,
      dormitory: user.dormitory as string | undefined,
      level: (user.level as number) || 1,
      levelName: (user.level_name as string) || '마법학도',
    };
  }
}
