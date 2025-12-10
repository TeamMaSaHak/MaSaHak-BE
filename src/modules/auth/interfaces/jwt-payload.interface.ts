export interface JwtPayload {
  sub: string; // user_id
  guildId: string; // guild_id
  nickname: string;
  iat?: number;
  exp?: number;
}

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  email?: string;
}

export interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string;
  roles: string[];
  joined_at: string;
  avatar?: string;
}
