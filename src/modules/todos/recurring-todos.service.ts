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
import { getTodayInTimezone, DEFAULT_TIMEZONE } from '../../common/utils';

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

    // 오늘 날짜에 즉시 투두 생성
    await this.insertTodayTodo(userId, guildId, content, data.recurring_id);

    return {
      id: data.recurring_id,
      content: data.content,
      createdAt: new Date(data.created_at).toISOString(),
    };
  }

  /**
   * 반복 투두 생성 시 오늘 날짜의 todos에도 즉시 INSERT
   */
  private async insertTodayTodo(
    userId: string,
    guildId: string,
    content: string,
    recurringId: number,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // 사용자 타임존 조회
    const { data: user } = await supabase
      .from('users')
      .select('timezone')
      .eq('user_id', userId)
      .single();

    const timezone = user?.timezone || DEFAULT_TIMEZONE;
    const today = getTodayInTimezone(timezone);

    // 중복 체크
    const { data: existing } = await supabase
      .from('todos')
      .select('todo_id')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('todo_date', today)
      .eq('recurring_id', recurringId)
      .maybeSingle();

    if (existing) {
      return;
    }

    // sort_order 계산
    const { data: lastTodo } = await supabase
      .from('todos')
      .select('sort_order')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('todo_date', today)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = lastTodo ? lastTodo.sort_order + 1 : 1;

    const { error: insertError } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        guild_id: guildId,
        todo_date: today,
        content,
        is_completed: false,
        sort_order: nextSortOrder,
        recurring_id: recurringId,
      });

    if (insertError) {
      this.logger.error(
        `Failed to insert today's todo for recurring ${recurringId}: ${insertError.message}`,
      );
    }
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
