import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [BatchService],
})
export class BatchModule {}
