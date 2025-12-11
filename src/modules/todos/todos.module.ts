import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { RecurringTodosController } from './recurring-todos.controller';
import { TodosService } from './todos.service';
import { RecurringTodosService } from './recurring-todos.service';
import { SupabaseModule } from '../../database/supabase';

@Module({
  imports: [SupabaseModule],
  controllers: [TodosController, RecurringTodosController],
  providers: [TodosService, RecurringTodosService],
  exports: [TodosService],
})
export class TodosModule {}
