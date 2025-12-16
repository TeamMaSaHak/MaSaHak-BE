import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import { ProfileResponseDto } from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Members')
@ApiBearerAuth('access-token')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('profile')
  @ApiOperation({
    summary: '프로필(학생증) 조회',
    description: '현재 로그인한 사용자의 프로필(학생증) 정보를 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '프로필 조회 성공',
    type: ApiResponseDto<ProfileResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '사용자를 찾을 수 없음',
  })
  async getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const result = await this.membersService.getProfile(user.sub, user.guildId);
    return {
      success: true,
      data: result,
    };
  }
}
