import { Module } from '@nestjs/common';
import { PomodoroService } from './pomodoro.service';
import { PomodoroController } from './pomodoro.controller';
import { SupabaseModule } from '../../database/supabase';

@Module({
  imports: [SupabaseModule],
  providers: [PomodoroService],
  controllers: [PomodoroController],
})
export class PomodoroModule {}
