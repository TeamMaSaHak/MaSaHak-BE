import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { SupabaseModule } from '../../database/supabase';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [SupabaseModule, LlmModule],
  providers: [DiaryService],
  controllers: [DiaryController],
  exports: [DiaryService],
})
export class DiaryModule {}
