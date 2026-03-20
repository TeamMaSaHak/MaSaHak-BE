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
import { TodosService } from './todos.service';
import { CurrentUser } from '../../common/decorators';
import { ApiResponseDto } from '../../common/dto';
import {
  GetTodosDto,
  GetTodosResponseDto,
  CreateTodoRequestDto,
  CreateTodoResponseDto,
  UpdateTodoRequestDto,
  UpdateTodoResponseDto,
  DeleteTodoResponseDto,
  ToggleTodoResponseDto,
  ReorderTodosRequestDto,
  ReorderTodosResponseDto,
} from './dto';
import type { JwtPayload } from '../auth/interfaces';

@ApiTags('Todos')
@ApiBearerAuth('access-token')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @ApiOperation({
    summary: '투두 목록 조회',
    description: '특정 날짜의 투두 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '투두 목록 조회 성공',
    type: ApiResponseDto<GetTodosResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 파라미터',
  })
  async getTodos(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetTodosDto,
  ): Promise<ApiResponseDto<GetTodosResponseDto>> {
    const result = await this.todosService.getTodos(
      user.sub,
      user.guildId,
      query.date,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post()
  @ApiOperation({
    summary: '투두 생성',
    description: '새로운 투두 항목을 생성합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '투두 생성 성공',
    type: ApiResponseDto<CreateTodoResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터',
  })
  async createTodo(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateTodoRequestDto,
  ): Promise<ApiResponseDto<CreateTodoResponseDto>> {
    const result = await this.todosService.createTodo(
      user.sub,
      user.guildId,
      body.content,
      body.date,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Patch('reorder')
  @ApiOperation({
    summary: '투두 순서 변경',
    description: '투두 항목들의 정렬 순서를 변경합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '투두 순서 변경 성공',
    type: ApiResponseDto<ReorderTodosResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터',
  })
  async reorderTodos(
    @CurrentUser() user: JwtPayload,
    @Body() body: ReorderTodosRequestDto,
  ): Promise<ApiResponseDto<ReorderTodosResponseDto>> {
    const result = await this.todosService.reorderTodos(
      user.sub,
      user.guildId,
      body.items,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Patch(':todoId')
  @ApiOperation({
    summary: '투두 수정',
    description: '투두 내용을 수정합니다.',
  })
  @ApiParam({
    name: 'todoId',
    description: '투두 ID',
    example: 'todo_1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '투두 수정 성공',
    type: ApiResponseDto<UpdateTodoResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '투두를 찾을 수 없음',
  })
  async updateTodo(
    @CurrentUser() user: JwtPayload,
    @Param('todoId') todoId: string,
    @Body() body: UpdateTodoRequestDto,
  ): Promise<ApiResponseDto<UpdateTodoResponseDto>> {
    const result = await this.todosService.updateTodo(
      user.sub,
      user.guildId,
      todoId,
      body.content,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Delete(':todoId')
  @ApiOperation({
    summary: '투두 삭제',
    description: '투두를 삭제합니다.',
  })
  @ApiParam({
    name: 'todoId',
    description: '투두 ID',
    example: 'todo_1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '투두 삭제 성공',
    type: ApiResponseDto<DeleteTodoResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '투두를 찾을 수 없음',
  })
  async deleteTodo(
    @CurrentUser() user: JwtPayload,
    @Param('todoId') todoId: string,
  ): Promise<ApiResponseDto<DeleteTodoResponseDto>> {
    const result = await this.todosService.deleteTodo(
      user.sub,
      user.guildId,
      todoId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Patch(':todoId/toggle')
  @ApiOperation({
    summary: '투두 완료 토글',
    description: '투두의 완료/미완료 상태를 전환합니다.',
  })
  @ApiParam({
    name: 'todoId',
    description: '투두 ID',
    example: 'todo_1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '투두 완료 토글 성공',
    type: ApiResponseDto<ToggleTodoResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '투두를 찾을 수 없음',
  })
  async toggleTodo(
    @CurrentUser() user: JwtPayload,
    @Param('todoId') todoId: string,
  ): Promise<ApiResponseDto<ToggleTodoResponseDto>> {
    const result = await this.todosService.toggleTodo(
      user.sub,
      user.guildId,
      todoId,
    );
    return {
      success: true,
      data: result,
    };
  }
}
