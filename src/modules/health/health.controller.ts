import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import { HealthService } from './health.service';
import { HealthCheckResponseDto } from './dto/health-check.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '서버 상태 확인' })
  @ApiResponse({
    status: 200,
    description: '서버가 정상 동작 중입니다.',
    type: HealthCheckResponseDto,
  })
  check(): ApiResponseDto<HealthCheckResponseDto> {
    const data = this.healthService.check();
    return ApiResponseDto.success(data);
  }

  @Get('db')
  @Public()
  @ApiOperation({ summary: 'DB 연결 상태 확인' })
  @ApiResponse({
    status: 200,
    description: 'DB 연결이 정상입니다.',
  })
  @ApiResponse({
    status: 500,
    description: 'DB 연결에 실패했습니다.',
  })
  async checkDb(): Promise<ApiResponseDto<HealthCheckResponseDto>> {
    const data = await this.healthService.checkDb();
    return ApiResponseDto.success(data);
  }
}
