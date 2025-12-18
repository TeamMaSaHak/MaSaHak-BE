import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TermsService } from './terms.service';
import { Public } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import { GetTermsParamsDto, GetTermsResponseDto, TermsType } from './dto';

@ApiTags('Terms')
@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Get(':type')
  @Public()
  @ApiOperation({
    summary: '약관/정책 조회',
    description:
      '이용약관 또는 개인정보 처리방침을 조회합니다. 인증 없이 접근 가능합니다.',
  })
  @ApiParam({
    name: 'type',
    description: '약관 종류 (terms: 이용약관, privacy: 개인정보 처리방침)',
    enum: TermsType,
    example: 'terms',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '약관 조회 성공',
    type: ApiResponseDto<GetTermsResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '약관을 찾을 수 없음',
  })
  getTerms(
    @Param() params: GetTermsParamsDto,
  ): ApiResponseDto<GetTermsResponseDto> {
    const result = this.termsService.getTerms(params.type);
    return {
      success: true,
      data: result,
    };
  }
}
