import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import { RegisterTokenRequestDto, RegisterTokenResponseDto } from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Devices')
@ApiBearerAuth('access-token')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('token')
  @ApiOperation({
    summary: 'FCM 토큰 등록',
    description:
      '푸시 알림을 위한 FCM 디바이스 토큰을 등록합니다. 이미 등록된 토큰은 갱신됩니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'FCM 토큰 등록/갱신 성공',
    type: ApiResponseDto<RegisterTokenResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 (유효성 검증 실패)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async registerToken(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterTokenRequestDto,
  ): Promise<ApiResponseDto<RegisterTokenResponseDto>> {
    const result = await this.devicesService.registerToken(
      user.sub,
      user.guildId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }
}
