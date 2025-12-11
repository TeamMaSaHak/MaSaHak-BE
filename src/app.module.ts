import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from './database/supabase';
import { JwtAuthGuard } from './common/guards';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TimerModule } from './modules/timer/timer.module';
import { PomodoroModule } from './modules/pomodoro/pomodoro.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { TodosModule } from './modules/todos/todos.module';
import { DiaryModule } from './modules/diary/diary.module';

@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 스케줄러 모듈
    ScheduleModule.forRoot(),
    // Supabase 모듈
    SupabaseModule,
    // 기능 모듈
    HealthModule,
    AuthModule,
    TimerModule,
    PomodoroModule,
    CalendarModule,
    TodosModule,
    DiaryModule,
  ],
  providers: [
    // 전역 JWT Guard (Public 데코레이터로 예외 처리)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
