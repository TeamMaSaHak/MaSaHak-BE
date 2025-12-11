import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { SupabaseModule } from '../../database/supabase';

@Module({
  imports: [SupabaseModule],
  providers: [DiaryService],
  controllers: [DiaryController],
  exports: [DiaryService],
})
export class DiaryModule {}
