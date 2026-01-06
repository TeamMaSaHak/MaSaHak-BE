import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { SupabaseModule } from '../../database/supabase';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SupabaseModule, SettingsModule],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
