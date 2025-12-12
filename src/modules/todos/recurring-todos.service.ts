import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase';
import {
  GetRecurringTodosResponseDto,
  RecurringTodoItemDto,
  CreateRecurringTodoResponseDto,
  UpdateRecurringTodoResponseDto,
  DeleteRecurringTodoResponseDto,
} from './dto';

@Injectable()
export class RecurringTodosService {
  private readonly logger = new Logger(RecurringTodosService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getRecurringTodos(
    userId: string,
    guildId: string,
  ): Promise<GetRecurringTodosResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('recurring_todos')
      .select('recurring_id, content, created_at')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch recurring todos: ${error.message}`);
      throw new InternalServerErrorException(
        '반복 투두 목록을 불러오는데 실패했습니다.',
      );
    }

    const recurringTodos: RecurringTodoItemDto[] = (data || []).map(
      (todo) => ({
        id: todo.recurring_id,
        content: todo.content,
        createdAt: new Date(todo.created_at).toISOString(),
      }),
    );

    return {
      recurringTodos,
    };
  }

  async createRecurringTodo(
    userId: string,
    guildId: string,
    content: string,
  ): Promise<CreateRecurringTodoResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('recurring_todos')
      .insert({
        user_id: userId,
        guild_id: guildId,
        content,
        is_active: true,
      })
      .select('recurring_id, content, created_at')
      .single();

    if (error) {
      this.logger.error(`Failed to create recurring todo: ${error.message}`);
      throw new InternalServerErrorException(
        '반복 투두 생성에 실패했습니다.',
      );
    }

    return {
      id: data.recurring_id,
      content: data.content,
      createdAt: new Date(data.created_at).toISOString(),
    };
  }

  async updateRecurringTodo(
    userId: string,
    guildId: string,
    recurringId: string,
    content: string,
  ): Promise<UpdateRecurringTodoResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('recurring_todos')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('recurring_id', recurringId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .select('recurring_id, content, updated_at')
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to update recurring todo: ${error.message}`);
      throw new InternalServerErrorException(
        '반복 투두 수정에 실패했습니다.',
      );
    }

    if (!data) {
      throw new NotFoundException('반복 투두를 찾을 수 없습니다.');
    }

    return {
      id: data.recurring_id,
      content: data.content,
      updatedAt: new Date(data.updated_at).toISOString(),
    };
  }

  async deleteRecurringTodo(
    userId: string,
    guildId: string,
    recurringId: string,
  ): Promise<DeleteRecurringTodoResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('recurring_todos')
      .delete()
      .eq('recurring_id', recurringId)
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .select('recurring_id')
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to delete recurring todo: ${error.message}`);
      throw new InternalServerErrorException(
        '반복 투두 삭제에 실패했습니다.',
      );
    }

    if (!data) {
      throw new NotFoundException('반복 투두를 찾을 수 없습니다.');
    }

    return {
      id: data.recurring_id,
      deletedAt: new Date().toISOString(),
    };
  }
}
