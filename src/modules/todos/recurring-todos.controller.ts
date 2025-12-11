import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RecurringTodosService } from './recurring-todos.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  GetRecurringTodosResponseDto,
  CreateRecurringTodoRequestDto,
  CreateRecurringTodoResponseDto,
  UpdateRecurringTodoRequestDto,
  UpdateRecurringTodoResponseDto,
  DeleteRecurringTodoResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Recurring Todos')
@ApiBearerAuth('access-token')
@Controller('todos/recurring')
export class RecurringTodosController {
  constructor(private readonly recurringTodosService: RecurringTodosService) {}

  @Get()
  @ApiOperation({
    summary: '반복 투두 목록 조회',
    description: '등록된 반복 투두 목록을 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '반복 투두 목록 조회 성공',
    type: ApiResponseDto<GetRecurringTodosResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  async getRecurringTodos(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponseDto<GetRecurringTodosResponseDto>> {
    const result = await this.recurringTodosService.getRecurringTodos(
      user.sub,
      user.guildId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post()
  @ApiOperation({
    summary: '반복 투두 생성',
    description: '새로운 반복 투두를 등록합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '반복 투두 생성 성공',
    type: ApiResponseDto<CreateRecurringTodoResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터',
  })
  async createRecurringTodo(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateRecurringTodoRequestDto,
  ): Promise<ApiResponseDto<CreateRecurringTodoResponseDto>> {
    const result = await this.recurringTodosService.createRecurringTodo(
      user.sub,
      user.guildId,
      body.content,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put(':recurringId')
  @ApiOperation({
    summary: '반복 투두 수정',
    description: '반복 투두 내용을 수정합니다.',
  })
  @ApiParam({
    name: 'recurringId',
    description: '반복 투두 ID',
    example: 'recurring_1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '반복 투두 수정 성공',
    type: ApiResponseDto<UpdateRecurringTodoResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '반복 투두를 찾을 수 없음',
  })
  async updateRecurringTodo(
    @CurrentUser() user: JwtPayload,
    @Param('recurringId') recurringId: string,
    @Body() body: UpdateRecurringTodoRequestDto,
  ): Promise<ApiResponseDto<UpdateRecurringTodoResponseDto>> {
    const result = await this.recurringTodosService.updateRecurringTodo(
      user.sub,
      user.guildId,
      recurringId,
      body.content,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Delete(':recurringId')
  @ApiOperation({
    summary: '반복 투두 삭제',
    description: '반복 투두를 삭제합니다.',
  })
  @ApiParam({
    name: 'recurringId',
    description: '반복 투두 ID',
    example: 'recurring_1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '반복 투두 삭제 성공',
    type: ApiResponseDto<DeleteRecurringTodoResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '반복 투두를 찾을 수 없음',
  })
  async deleteRecurringTodo(
    @CurrentUser() user: JwtPayload,
    @Param('recurringId') recurringId: string,
  ): Promise<ApiResponseDto<DeleteRecurringTodoResponseDto>> {
    const result = await this.recurringTodosService.deleteRecurringTodo(
      user.sub,
      user.guildId,
      recurringId,
    );
    return {
      success: true,
      data: result,
    };
  }
}
