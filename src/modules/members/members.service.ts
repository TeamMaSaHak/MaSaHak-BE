import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import { parseDisplayName } from '../../common/utils';
import { ProfileResponseDto } from './dto';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * 프로필(학생증) 조회
   * - users 테이블에서 사용자 정보 조회
   * - 학년은 가입일 기준으로 계산
   */
  async getProfile(
    userId: string,
    guildId: string,
  ): Promise<ProfileResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('users')
      .select(
        `
        user_id,
        guild_id,
        nickname,
        student_no,
        profile_image,
        dormitory,
        total_seconds,
        level,
        level_name,
        joined_at
      `,
      )
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch profile: ${error.message}`);
      throw new InternalServerErrorException(
        '프로필을 불러오는데 실패했습니다.',
      );
    }

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const grade = this.calculateGrade(user.joined_at as string);
    const nickname = (user.nickname as string) || '마법사';

    return {
      profileImage: user.profile_image as string | null,
      nickname,
      displayName: parseDisplayName(nickname),
      studentNo: (user.student_no as string) || '00000000',
      grade,
      gradeName: `${grade}학년`,
      dormitory: user.dormitory as string | null,
      totalSeconds: (user.total_seconds as number) || 0,
      level: (user.level as number) || 1,
      levelName: user.level_name as string | null,
      joinedAt: user.joined_at as string,
    };
  }

  /**
   * 학년 계산
   * - 가입일 기준 1년 미만 = 1학년
   * - 1년 이상 2년 미만 = 2학년
   * - ...
   */
  private calculateGrade(joinedAt: string): number {
    if (!joinedAt) {
      return 1;
    }

    const now = new Date();
    const joinedDate = new Date(joinedAt);
    const diffMs = now.getTime() - joinedDate.getTime();
    const diffYears = diffMs / (365 * 24 * 60 * 60 * 1000);

    return Math.floor(diffYears) + 1;
  }
}
