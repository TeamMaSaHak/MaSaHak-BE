import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  GetTodosResponseDto,
  TodoItemDto,
  CreateTodoResponseDto,
  UpdateTodoResponseDto,
  DeleteTodoResponseDto,
  ToggleTodoResponseDto,
} from './dto';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getTodos(
    userId: string,
    guildId: string,
    date: string,
  ): Promise<GetTodosResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('todos')
      .select('todo_id, content, is_completed, sort_order, created_at')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('todo_date', date)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch todos: ${error.message}`);
      throw new InternalServerErrorException(
        '투두 목록을 불러오는데 실패했습니다.',
      );
    }

    const todos: TodoItemDto[] = (data || []).map((todo) => ({
      id: todo.todo_id,
      content: todo.content,
      isCompleted: todo.is_completed,
      createdAt: new Date(todo.created_at).toISOString(),
      order: todo.sort_order,
    }));

    return {
      date,
      todos,
    };
  }

  async createTodo(
    userId: string,
    guildId: string,
    content: string,
    date: string,
  ): Promise<CreateTodoResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data: lastTodo } = await supabase
      .from('todos')
      .select('sort_order')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('todo_date', date)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = lastTodo ? lastTodo.sort_order + 1 : 1;

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        guild_id: guildId,
        todo_date: date,
        content,
        is_completed: false,
        sort_order: nextSortOrder,
      })
      .select('todo_id, content, is_completed, created_at')
      .single();

    if (error) {
      this.logger.error(`Failed to create todo: ${error.message}`);
      throw new InternalServerErrorException('투두 생성에 실패했습니다.');
    }

    return {
      id: data.todo_id,
      content: data.content,
      isCompleted: data.is_completed,
      createdAt: new Date(data.created_at).toISOString(),
    };
  }

  async updateTodo(
    userId: string,
    guildId: string,
    todoId: string,
    content: string,
  ): Promise<UpdateTodoResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('todos')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .select('todo_id, content, updated_at')
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to update todo: ${error.message}`);
      throw new InternalServerErrorException('투두 수정에 실패했습니다.');
    }

    if (!data) {
      throw new NotFoundException('투두를 찾을 수 없습니다.');
    }

    return {
      id: data.todo_id,
      content: data.content,
      updatedAt: new Date(data.updated_at).toISOString(),
    };
  }

  async deleteTodo(
    userId: string,
    guildId: string,
    todoId: string,
  ): Promise<DeleteTodoResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .select('todo_id')
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to delete todo: ${error.message}`);
      throw new InternalServerErrorException('투두 삭제에 실패했습니다.');
    }

    if (!data) {
      throw new NotFoundException('투두를 찾을 수 없습니다.');
    }

    return {
      id: data.todo_id,
      deletedAt: new Date().toISOString(),
    };
  }

  async toggleTodo(
    userId: string,
    guildId: string,
    todoId: string,
  ): Promise<ToggleTodoResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data: currentTodo, error: fetchError } = await supabase
      .from('todos')
      .select('is_completed')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .maybeSingle();

    if (fetchError) {
      this.logger.error(`Failed to fetch todo: ${fetchError.message}`);
      throw new InternalServerErrorException(
        '투두 조회에 실패했습니다.',
      );
    }

    if (!currentTodo) {
      throw new NotFoundException('투두를 찾을 수 없습니다.');
    }

    // 토글
    const { data, error } = await supabase
      .from('todos')
      .update({
        is_completed: !currentTodo.is_completed,
        updated_at: new Date().toISOString(),
      })
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .select('todo_id, is_completed')
      .single();

    if (error) {
      this.logger.error(`Failed to toggle todo: ${error.message}`);
      throw new InternalServerErrorException(
        '투두 완료 상태 변경에 실패했습니다.',
      );
    }

    return {
      id: data.todo_id,
      isCompleted: data.is_completed,
    };
  }

}
