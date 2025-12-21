import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DiaryService } from './diary.service';
import { LlmService } from '../llm/llm.service';
import { CurrentUser, Public } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  GetDiaryParamsDto,
  GetDiaryResponseDto,
  UpsertDiaryParamsDto,
  UpsertDiaryBodyDto,
  UpsertDiaryResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Diary')
@ApiBearerAuth('access-token')
@Controller('diary')
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly llmService: LlmService,
  ) {}

  @Get(':date')
  @ApiOperation({
    summary: '일기 조회',
    description:
      '특정 날짜의 일기를 조회합니다. 답장은 다음날 09:00 이후에만 노출됩니다.',
  })
  @ApiParam({
    name: 'date',
    description: '조회할 일기 날짜 (YYYY-MM-DD)',
    example: '2025-12-11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '일기 조회 성공',
    type: ApiResponseDto<GetDiaryResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async getDiary(
    @CurrentUser() user: JwtPayload,
    @Param() params: GetDiaryParamsDto,
  ): Promise<ApiResponseDto<GetDiaryResponseDto>> {
    const result = await this.diaryService.getDiary(
      user.sub,
      user.guildId,
      params.date,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put(':date')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '일기 작성/수정',
    description:
      '일기를 작성하거나 수정합니다. 해당 날짜 06:00 ~ 다음날 05:59까지만 가능합니다.',
  })
  @ApiParam({
    name: 'date',
    description: '일기 날짜 (YYYY-MM-DD)',
    example: '2025-12-11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '일기 작성/수정 성공',
    type: ApiResponseDto<UpsertDiaryResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '작성 시간이 지났거나 잠긴 일기',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '유효성 검증 실패',
  })
  async upsertDiary(
    @CurrentUser() user: JwtPayload,
    @Param() params: UpsertDiaryParamsDto,
    @Body() body: UpsertDiaryBodyDto,
  ): Promise<ApiResponseDto<UpsertDiaryResponseDto>> {
    const result = await this.diaryService.upsertDiary(
      user.sub,
      user.guildId,
      params.date,
      body.content,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Post('test-llm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[DEV] LLM 답장 테스트',
    description: '개발용: LLM 답장 생성을 테스트합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: '오늘은 NestJS를 공부했다. 처음엔 어려웠지만 점점 재미있어지고 있다.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'LLM 답장 생성 성공',
  })
  async testLlm(
    @Body() body: { content: string },
  ): Promise<ApiResponseDto<{ reply: string | null }>> {
    const reply = await this.llmService.generateDiaryReply(body.content);
    return {
      success: true,
      data: { reply },
    };
  }
}
