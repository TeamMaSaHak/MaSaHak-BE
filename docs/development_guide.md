# 백엔드 개발 가이드

> NestJS + Supabase 기반 백엔드 개발 규칙

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | NestJS |
| Database | Supabase (PostgreSQL) |
| Auth | Discord OAuth + JWT |
| Push | Firebase Cloud Messaging (FCM) |
| Scheduler | @nestjs/schedule |
| Validation | class-validator, class-transformer |
| Documentation | Swagger (@nestjs/swagger) |

---

## 패키지 매니저

**pnpm 사용**

| 작업 | 명령어 |
|------|--------|
| 의존성 설치 | `pnpm install` |
| 패키지 추가 | `pnpm add {package}` |
| dev 의존성 추가 | `pnpm add -D {package}` |
| 패키지 삭제 | `pnpm remove {package}` |
| 스크립트 실행 | `pnpm dev` (run 생략 가능) |

---

## NestJS 규칙

### 프로젝트 구조

```
src/
├── modules/           # 기능별 모듈
│   └── {feature}/
│       ├── {feature}.module.ts
│       ├── {feature}.controller.ts
│       ├── {feature}.service.ts
│       └── dto/
│           ├── create-{feature}.dto.ts
│           └── update-{feature}.dto.ts
├── common/            # 공통 기능
│   ├── guards/        # JWT Guard 등
│   ├── filters/       # Exception Filter
│   └── dto/           # 공통 Response DTO
└── database/
    └── supabase/      # Supabase 연동
```

### CLI 사용

모듈/서비스 생성 시 NestJS CLI 사용:

```bash
nest g module modules/{name}
nest g service modules/{name}
nest g controller modules/{name}
```

### Module/Controller/Service 패턴

```typescript
// {feature}.module.ts
@Module({
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}

// {feature}.controller.ts
@Controller('api/feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}
}

// {feature}.service.ts
@Injectable()
export class FeatureService {
  constructor(private readonly supabaseService: SupabaseService) {}
}
```

---

## DTO & Validation

### 필수 사항
- 모든 요청 DTO는 `class-validator` 데코레이터 필수
- DTO 파일은 `dto/` 폴더에 분리

### 예시

```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ description: '투두 내용', maxLength: 22 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(22)
  content: string;
}
```

---

## API Response 형식

모든 API는 아래 형식을 따름:

```typescript
// 성공
{
  success: true,
  data: T
}

// 실패
{
  success: false,
  error: {
    code: string,
    message: string
  }
}
```

---

## Exception 처리

### 필수 사항
- `HttpException` 또는 커스텀 Exception 사용
- 직접 `throw new Error()` 금지

### 예시

```typescript
// ✅ 올바른 방법
throw new NotFoundException('Todo not found');
throw new BadRequestException('Invalid input');

// ❌ 잘못된 방법
throw new Error('Something went wrong');
```

---

## Swagger 문서화

### 필수 데코레이터

| 위치 | 데코레이터 |
|------|-----------|
| Controller | `@ApiTags()` |
| Endpoint | `@ApiOperation()`, `@ApiResponse()` |
| DTO | `@ApiProperty()` |

### 예시

```typescript
@ApiTags('Todos')
@Controller('api/todos')
export class TodosController {

  @Get()
  @ApiOperation({ summary: '투두 목록 조회' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  findAll() {
    // ...
  }
}
```

---

## Supabase 연동

### 필수 사항
- `SupabaseService`를 통해서만 DB 접근
- 직접 Supabase 클라이언트 생성 금지

### 예시

```typescript
@Injectable()
export class TodosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(userId: string, date: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
```

---

## 테스트 체크리스트

API 개발 완료 후 아래 케이스 테스트:

- [ ] 정상 케이스 (200/201)
- [ ] 인증 실패 (401)
- [ ] 권한 없음 (403)
- [ ] 리소스 없음 (404)
- [ ] 유효성 검증 실패 (400)

---

## Supabase Migration 규칙

### 파일 위치
`/supabase/migrations/`

### 네이밍
`{번호}_{설명}.sql` (예: `0001_create_todos_table.sql`)

### 필수 사항
- `CREATE TABLE IF NOT EXISTS` 사용
- `updated_at` 컬럼 추가 + 트리거 설정
- snake_case 사용
- RLS 비활성화

### 예시

```sql
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  content VARCHAR(22) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS 비활성화
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
```

---

## 참고 문서

| 문서 | 경로 |
|------|------|
| 역할 배분 | `docs/role_assignment.md` |
| ERD | `docs/erd_final.md` |
| 기능 명세서 | `docs/feature_specification.md` |
| 프로젝트 배경 | `docs/background.md` |
