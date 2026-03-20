import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 API prefix 설정
  app.setGlobalPrefix('api');

  // CORS 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 전역 Exception Filter 설정
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('마법사관학교 API')
    .setDescription('마법사관학교 앱 백엔드 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰을 입력하세요',
      },
      'access-token',
    )
    .addTag('Health', '서버 상태 확인')
    .addTag('Auth', '인증')
    .addTag('Todos', '투두 리스트')
    .addTag('Timer', '타이머')
    .addTag('Pomodoro', '뽀모도로')
    .addTag('Calendar', '캘린더')
    .addTag('Diary', '일기')
    .addTag('Notifications', '알림')
    .addTag('Members', '회원/학생증')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
