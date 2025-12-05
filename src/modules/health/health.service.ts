import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import { HealthCheckResponseDto } from './dto/health-check.dto';

@Injectable()
export class HealthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  check(): HealthCheckResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'masahak-api',
    };
  }

  async checkDb(): Promise<HealthCheckResponseDto> {
    try {
      const client = this.supabaseService.getClient();

      // 간단한 쿼리로 DB 연결 확인
      const { error } = await client.from('users').select('user_id').limit(1);

      if (error) {
        throw new InternalServerErrorException(
          `DB 연결 오류: ${error.message}`,
        );
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'masahak-api',
        database: 'connected',
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      throw new InternalServerErrorException('DB 연결에 실패했습니다.');
    }
  }
}
