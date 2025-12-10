import { Module } from '@nestjs/common';
import { TimerController } from './timer.controller';
import { TimerService } from './timer.service';
import { SupabaseModule } from '../../database/supabase';

@Module({
  imports: [SupabaseModule],
  controllers: [TimerController],
  providers: [TimerService],
  exports: [TimerService],
})
export class TimerModule {}
