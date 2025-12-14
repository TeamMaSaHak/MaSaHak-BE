# 백엔드 개발 역할 배분

> NestJS + Supabase 기반 백엔드 개발

---

## 개발 인원

| 역할 | 특징 |
|------|------|
| **성호** | AI 협업 가능, 복잡한 기능 담당 |
| **감귤** | 현업 백엔드 개발자, NestJS만 처음 |

---

## 👨‍💻 감귤

### 담당 기능

| 기능 | API | 난이도 | 설명 |
|------|-----|:------:|------|
| **투두 리스트** | `/api/todos` | ⭐ | 기본 CRUD |
| **반복 투두** | `/api/todos/recurring` | ⭐ | 기본 CRUD |
| **뽀모도로 설정** | `/api/pomodoro/settings` | ⭐ | 조회/저장 |
| **알림 목록** | `/api/notifications` | ⭐⭐ | 조회/읽음 처리 |

### 상세 API 목록

#### 투두 리스트
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/todos` | 특정 날짜 투두 목록 조회 |
| POST | `/api/todos` | 투두 생성 |
| PATCH | `/api/todos/{todoId}` | 투두 수정 |
| DELETE | `/api/todos/{todoId}` | 투두 삭제 |
| PATCH | `/api/todos/{todoId}/toggle` | 완료/미완료 토글 |

#### 반복 투두
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/todos/recurring` | 반복 투두 목록 조회 |
| POST | `/api/todos/recurring` | 반복 투두 생성 |
| PUT | `/api/todos/recurring/{recurringId}` | 반복 투두 수정 |
| DELETE | `/api/todos/recurring/{recurringId}` | 반복 투두 삭제 |

#### 뽀모도로 설정
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/pomodoro/settings` | 설정 조회 |
| PUT | `/api/pomodoro/settings` | 설정 저장 |

#### 알림
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/notifications` | 알림 목록 조회 |
| PATCH | `/api/notifications/{notificationId}/read` | 읽음 처리 |
| PATCH | `/api/notifications/read-all` | 전체 읽음 처리 |
| GET | `/api/notifications/unread-count` | 안읽은 알림 수 |


---

## 👨‍💻 성호

### 담당 기능

| 기능 | API | 난이도 | 설명 |
|------|-----|:------:|------|
| **인증** | `/api/auth/*` | ⭐⭐⭐ | Discord OAuth, JWT |
| **타이머 세션** | `/api/timer/*` | ⭐⭐ | 세션 시작/종료 |
| **뽀모도로 세션** | `/api/pomodoro/*` (설정 제외) | ⭐⭐ | 세션 관리 |
| **캘린더 통계** | `/api/calendar/*` | ⭐⭐⭐ | 복잡한 쿼리, 집계 |
| **일기** | `/api/diary/*` | ⭐⭐⭐ | LLM 연동, 시간 검증 |
| **푸시 알림** | FCM 연동 | ⭐⭐⭐ | Firebase 연동 |
| **배치 작업** | 스케줄러 | ⭐⭐⭐ | 반복투두 생성, 일기 잠금 |
| **디바이스 토큰** | `/api/devices/*` | ⭐⭐ | FCM 토큰 관리 |
| **알림 설정** | `/api/settings/*` | ⭐⭐ | 설정 관리 |
| **약관** | `/api/terms/*` | ⭐ | 정적 파일 제공 |

### 상세 API 목록

#### 인증
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/auth/discord` | 디스코드 로그인 요청 |
| GET | `/api/auth/discord/callback` | 디스코드 로그인 콜백 |
| GET | `/api/auth/verify-member` | 서버 멤버 검증 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |

#### 타이머
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/timer/start` | 타이머 세션 시작 |
| POST | `/api/timer/stop` | 타이머 세션 종료 |
| POST | `/api/timer/pause` | 타이머 일시정지 |
| POST | `/api/timer/resume` | 타이머 재개 |

#### 뽀모도로 세션
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/pomodoro/start` | 뽀모도로 세션 시작 |
| POST | `/api/pomodoro/stop` | 뽀모도로 세션 종료 |
| POST | `/api/pomodoro/cycle-complete` | 사이클 완료 기록 |

#### 캘린더
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/calendar/{year}/{month}` | 월별 캘린더 데이터 |
| GET | `/api/calendar/stats/daily` | 일별 통계 |
| GET | `/api/calendar/stats/monthly` | 월별 통계 |

#### 일기
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/diary/{date}` | 일기 조회 |
| PUT | `/api/diary/{date}` | 일기 작성/수정 |

#### 마이페이지
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/members/profile` | 프로필(학생증) 조회 |
| GET | `/api/settings/notifications` | 알림 설정 조회 |
| PUT | `/api/settings/notifications` | 알림 설정 변경 |

#### 디바이스
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/devices/token` | FCM 토큰 등록 |

#### 약관
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/terms/{type}` | 약관/정책 조회 |

#### 배치 (스케줄러)
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/batch/recurring-todos` | 반복 투두 자동 생성 (00:00) |
| POST | `/api/batch/diary-replies` | LLM 답장 생성 (06:05) |
| POST | `/api/batch/diary-notifications` | 답장 알림 발송 (09:00) |

---


## 작업 비율

| 담당 | 비율 | API 수 | 특징 |
|------|:----:|:------:|------|
| 감귤 | 30% | ~15개 | 단순 CRUD, 학습용 |
| 성호 | 70% | ~25개 | 복잡한 로직, 외부 연동 |

---

## 성호-감귤 인터페이스 협의 지점

> 두 사람의 작업이 연동되는 부분에 대한 규약 정의

### 1. 반복 투두 ↔ 배치 작업

```
[감귤] recurring_todos CRUD
           ↓
[성호] 배치: 00:00에 recurring_todos 읽어서 todos에 자동 생성
```

**협의 사항**:
| 항목 | 규약 |
|------|------|
| `is_active` 처리 | `true`인 항목만 배치에서 생성 |
| `content` 검증 | 22자 초과 시 잘라서 저장 (감귤 API에서 검증) |
| 삭제 시 처리 | soft delete 없이 실제 삭제, 이미 생성된 todos는 유지 |
| 수정 시 처리 | 다음날 생성분부터 반영, 기존 todos는 영향 없음 |

### 2. 알림 테이블 컨텍스트

```
[성호] notifications INSERT (배치/푸시)
           ↓
[감귤] notifications SELECT/UPDATE (조회/읽음 처리)
```

**알림 타입 (type enum)**:
| type | 생성 주체 | 설명 |
|------|----------|------|
| `DIARY_REPLY` | 성호 배치 (09:00) | 일기 답장 알림 |
| `NOTICE` | 성호 (수동/배치) | 공지사항 |

**감귤 참고 사항**:
- 감귤은 `notifications` 테이블 **READ/UPDATE만** 담당
- INSERT는 성호의 배치/푸시 로직에서만 수행
- `is_read` 플래그만 업데이트 가능

### 3. 뽀모도로 설정 ↔ 세션

```
[감귤] pomodoro_settings CRUD (설정값)
           ↓
[성호] 뽀모도로 세션 시작 시 settings 조회해서 사용
```

**협의 사항**:
- 기본값: `focus_time=25`, `break_time=5`, `repeat_count=4`
- 설정이 없으면 성호 API에서 기본값 사용 (감귤 API에서 UPSERT 권장)

---

## 감귤 시작 패키지

> 성호가 감귤에게 제공해야 할 자료 목록

### 1. 프로젝트 구조 가이드

```
src/
├── modules/
│   ├── todos/              # 감귤 담당
│   │   ├── todos.module.ts
│   │   ├── todos.controller.ts
│   │   ├── todos.service.ts
│   │   └── dto/
│   │       ├── create-todo.dto.ts
│   │       └── update-todo.dto.ts
│   ├── pomodoro/           # settings만 감귤 담당
│   └── notifications/      # 감귤 담당
├── common/
│   ├── guards/             # 성호가 제공
│   ├── filters/            # 성호가 제공
│   └── dto/                # 공통 Response DTO
└── database/
    └── supabase/           # 성호가 제공
```

### 2. 첫 번째 미션: Todos GET API

**목표**: `/api/todos?date=2025-12-05` 구현

**단계**:
1. `todos.module.ts` 생성 및 AppModule에 등록
2. `todos.controller.ts`에 GET 엔드포인트 정의
3. `todos.service.ts`에 Supabase 쿼리 로직 작성
4. Swagger 데코레이터 추가
5. Postman으로 테스트

**참고 코드 위치**: `src/modules/health/` (성호가 제공하는 예시 모듈)

---

## 성호가 먼저 해야 할 작업 (감귤 작업 전 필수)

### 1. 프로젝트 초기 설정
- [x] NestJS 프로젝트 생성
- [x] 폴더 구조 세팅
- [x] ESLint, Prettier 설정
- [x] .env 환경변수 설정
- [x] Git 저장소 생성

### 2. Supabase 연동 설정
- [x] `@supabase/supabase-js` 패키지 설치
- [x] Supabase 모듈 생성 (`supabase.module.ts`)
- [x] Supabase 서비스 생성 (`supabase.service.ts`)
- [x] 환경변수에 Supabase URL, API Key 설정
- [x] **예시 CRUD 모듈 작성** (`health` 또는 `example` 모듈)

### 3. 공통 모듈/유틸 작성
- [x] JWT 인증 Guard (`auth.guard.ts`)
- [x] 공통 Response DTO (`api-response.dto.ts`)
- [x] 공통 에러 핸들러 (Exception Filter)
- [x] Swagger 설정 (API 문서화)
- [x] **공통 에러 코드 정의** (`error-codes.ts`)

### 4. 감귤에게 전달할 것
- [x] 프로젝트 Git 저장소 접근 권한
- [x] .env.example 파일 (환경변수 템플릿 + 주석)
- [ ] 예시 코드 설명 문서 (본 문서의 "감귤 시작 패키지" 참조)
- [x] Supabase 테이블 구조 공유 (`erd_final.md`)
- [ ] Slack/Discord 채널 개설 (실시간 질의응답용)

---

## 감귤 작업 시작 조건

| 조건 | 상세 | 상태 |
|------|------|:----:|
| NestJS 프로젝트 세팅 완료 | 폴더 구조, ESLint, Prettier | ✅ |
| Supabase 연동 완료 | SupabaseService 동작 확인 | ✅ |
| 예시 모듈 제공 | health 또는 example CRUD 모듈 | ✅ |
| 공통 DTO/필터 완성 | Response DTO, Exception Filter | ✅ |
| .env.example 제공 | 환경변수 템플릿 + 실제 값 형식 주석 | ✅ |
| Git 접근 권한 부여 | 저장소 Collaborator 추가 | ✅ |

**✅ 감귤 작업 시작 가능**

---

## 브랜치 전략

```
main (배포용)
  └── dev (개발 통합)
        ├── feat/auth-discord (성호)
        ├── feat/todos-crud (감귤)
        ├── feat/recurring-todos (감귤)
        ├── feat/calendar-stats (성호)
        └── ...
```

### 브랜치 네이밍 규칙
- `feat/{기능명}` : 새 기능 개발
- `fix/{이슈명}` : 버그 수정
- `refactor/{대상}` : 리팩토링

### 머지 규칙
1. `feat/*` → `dev` : PR 생성 후 코드 리뷰 필수
2. `dev` → `main` : 배포 전 통합 테스트 후 머지

---

## 코드 리뷰 프로세스

### PR 생성 규칙

```markdown
## 작업 내용
- 투두 CRUD API 구현

## 변경 파일
- src/modules/todos/*

## 테스트 결과
- [ ] Swagger에서 API 테스트 완료
- [ ] 에러 케이스 확인

## 질문/논의 사항
- (있으면 작성)
```

### 리뷰 체크리스트

| 항목 | 설명 |
|------|------|
| NestJS 패턴 준수 | Module/Controller/Service 구조 |
| DTO 검증 | class-validator 데코레이터 사용 |
| 에러 처리 | 공통 Exception 사용 |
| Swagger 문서화 | 엔드포인트별 데코레이터 |
| 코드 스타일 | ESLint/Prettier 통과 |

### 리뷰 주기
- **감귤 → 성호**: PR 생성 후 24시간 내 리뷰
- **성호 → 감귤**: 복잡한 로직은 주석 + 설명 추가

---

## 마일스톤

### Phase 1: 인프라 구축 (성호 단독)
- [ ] NestJS 프로젝트 초기 설정
- [ ] Supabase 연동
- [ ] 공통 모듈 작성 (Guard, Filter, DTO)
- [ ] 예시 모듈 작성
- [ ] 감귤 온보딩 자료 준비

### Phase 2: 기본 기능 개발 (병렬)
| 성호 | 감귤 |
|------|------|
| Discord OAuth 인증 | Todos CRUD |
| JWT 발급/갱신 | Recurring Todos CRUD |
| 타이머 세션 API | 뽀모도로 설정 API |

### Phase 3: 핵심 기능 개발 (병렬)
| 성호 | 감귤 |
|------|------|
| 뽀모도로 세션 API | 알림 목록 API |
| 캘린더 통계 API | (성호 코드 리뷰 대응) |
| 일기 API + LLM 연동 | |

### Phase 4: 푸시/배치 (성호 단독)
- [ ] FCM 연동
- [ ] 배치 스케줄러 (반복투두, 일기잠금, 답장생성)
- [ ] 푸시 알림 발송

### Phase 5: 통합 및 QA
- [ ] API 통합 테스트
- [ ] 클라이언트 연동 테스트
- [ ] 버그 수정

---

## 테스트 가이드라인

### 필수 테스트 범위

| 구분 | 담당 | 내용 |
|------|------|------|
| Swagger 테스트 | 감귤, 성호 | 모든 API 수동 테스트 |
| E2E 테스트 | 성호 | 주요 플로우 자동화 테스트 |
| 단위 테스트 | 선택 | 복잡한 비즈니스 로직만 |

### 테스트 체크리스트 (API별)

```
[ ] 정상 케이스 (200/201)
[ ] 인증 실패 (401)
[ ] 권한 없음 (403)
[ ] 리소스 없음 (404)
[ ] 유효성 검증 실패 (400)
```

### 감귤 테스트 가이드
1. Swagger UI (`/api-docs`)에서 API 테스트
2. 성공/실패 케이스 스크린샷 첨부하여 PR에 포함
3. 에러 발생 시 성호에게 질의

---

## 작업 순서 (상세)

```
1. [성호] 프로젝트 초기 설정 + Supabase 연동
      ↓
2. [성호] 공통 모듈 작성 + 예시 모듈 제작
      ↓
3. [성호] 감귤 온보딩 (시작 패키지 전달, 30분 화상 미팅)
      ↓
4. [감귤] Todos CRUD 개발 시작
   [성호] Auth 모듈 개발 시작 (병렬)
      ↓
5. [감귤] 첫 PR → [성호] 코드 리뷰 (피드백 루프)
      ↓
6. [감귤] 나머지 CRUD 개발
   [성호] 복잡한 기능 개발 (병렬)
      ↓
7. [성호] 배치/푸시 개발
      ↓
8. [성호, 감귤] 통합 테스트 + 버그 수정
```

---

## 커뮤니케이션

| 채널 | 용도 |
|------|------|
| Slack/Discord | 실시간 질의응답, 일일 진행상황 공유 |
| GitHub PR | 코드 리뷰, 기술 논의 |
| 화상 미팅 | 온보딩, 주간 싱크업 (필요시) |

### 일일 체크인 (선택)
- 오전: 오늘 할 일 공유
- 오후: 막힌 부분 공유 → 즉시 해결

---

## 참고 문서

| 문서 | 설명 |
|------|------|
| `background.md` | 프로젝트 배경 및 시스템 개요 |
| `feature_specification.md` | 기능 명세서 |
| `erd_final.md` | 통합 ERD (테이블 구조) |
| `erd_profilebot.md` | 기존 봇 DB 스키마 |


===============================================


<!-- Source: .ruler/AGENTS.md -->

# Senior Developer Guidelines

## Must

- always use client component for all components. (use `use client` directive)
- always use promise for page.tsx params props.
- use valid picsum.photos stock image for placeholder image
- route feature hooks' HTTP requests through `@/lib/remote/api-client`.
- Hono 라우트 경로는 반드시 `/api` prefix를 포함해야 함 (Next.js API 라우트가 `/api/[[...hono]]`에 위치하므로). 예: `app.post('/api/auth/signup', ...)`
- `AppLogger`는 `info`, `error`, `warn`, `debug` 메서드만 제공함. `logger.log()` 대신 `logger.info()` 사용할 것.
- API 응답 스키마에서 `redirectTo` 등 경로 필드는 `z.string().url()` 대신 `z.string()` 사용 (상대 경로 허용).

## Library

use following libraries for specific functionalities:

1. `date-fns`: For efficient date and time handling.
2. `ts-pattern`: For clean and type-safe branching logic.
3. `@tanstack/react-query`: For server state management.
4. `zustand`: For lightweight global state management.
5. `react-use`: For commonly needed React hooks.
6. `es-toolkit`: For robust utility functions.
7. `lucide-react`: For customizable icons.
8. `zod`: For schema validation and data integrity.
9. `shadcn-ui`: For pre-built accessible UI components.
10. `tailwindcss`: For utility-first CSS styling.
11. `supabase`: For a backend-as-a-service solution.
12. `react-hook-form`: For form validation and state management.

## Directory Structure

- src
- src/app: Next.js App Routers
- src/app/api/[[...hono]]: Hono entrypoint delegated to Next.js Route Handler (`handle(createHonoApp())`)
- src/backend/hono: Hono 앱 본체 (`app.ts`, `context.ts`)
- src/backend/middleware: 공통 미들웨어 (에러, 컨텍스트, Supabase 등)
- src/backend/http: 응답 포맷, 핸들러 결과 유틸 등 공통 HTTP 레이어
- src/backend/supabase: Supabase 클라이언트 및 설정 래퍼
- src/backend/config: 환경 변수 파싱 및 캐싱
- src/components/ui: shadcn-ui components
- src/constants: Common constants
- src/hooks: Common hooks
- src/lib: utility functions
- src/remote: http client
- src/features/[featureName]/components/\*: Components for specific feature
- src/features/[featureName]/constants/\*
- src/features/[featureName]/hooks/\*
- src/features/[featureName]/backend/route.ts: Hono 라우터 정의
- src/features/[featureName]/backend/service.ts: Supabase/비즈니스 로직
- src/features/[featureName]/backend/error.ts: 상황별 error code 정의
- src/features/[featureName]/backend/schema.ts: 요청/응답 zod 스키마 정의
- src/features/[featureName]/lib/\*: 클라이언트 측 DTO 재노출 등
- supabase/migrations: Supabase SQL migration 파일 (예시 테이블 포함)

## Backend Layer (Hono + Next.js)

- Next.js `app` 라우터에서 `src/app/api/[[...hono]]/route.ts` 를 통해 Hono 앱을 위임한다. 모든 HTTP 메서드는 `handle(createHonoApp())` 로 노출하며 `runtime = 'nodejs'` 로 Supabase service-role 키를 사용한다.
- `src/backend/hono/app.ts` 의 `createHonoApp` 은 싱글턴으로 관리하되, **development 환경에서는 매번 재생성**하여 HMR 시 라우터 변경사항이 반영되도록 한다. (Singleton pattern with HMR compatibility: only cache in production to ensure route changes are reflected during hot reload)
- `src/backend/hono/app.ts` 의 `createHonoApp` 은 싱글턴으로 관리하며 다음 빌딩블록을 순서대로 연결한다.
  1. `errorBoundary()` – 공통 에러 로깅 및 5xx 응답 정규화.
  2. `withAppContext()` – `zod` 기반 환경 변수 파싱, 콘솔 기반 logger, 설정을 `c.set` 으로 주입.
  3. `withSupabase()` – service-role 키로 생성한 Supabase 서버 클라이언트를 per-request로 주입.
  4. `registerExampleRoutes(app)` 등 기능별 라우터 등록 (모든 라우터는 `src/features/[feature]/backend/route.ts` 에서 정의).
- `src/backend/hono/context.ts` 의 `AppEnv` 는 `c.get`/`c.var` 로 접근 가능한 `supabase`, `logger`, `config` 키를 제공한다. 절대 `c.env` 를 직접 수정하지 않는다.
- 공통 HTTP 응답 헬퍼는 `src/backend/http/response.ts`에서 제공하며, 모든 라우터/서비스는 `success`/`failure`/`respond` 패턴을 사용한다.
- 기능별 백엔드 로직은 `src/features/[feature]/backend/service.ts`(Supabase 접근), `schema.ts`(요청/응답 zod 정의), `route.ts`(Hono 라우터)로 분리한다.
- 프런트엔드가 동일 스키마를 사용할 경우 `src/features/[feature]/lib/dto.ts`에서 backend/schema를 재노출해 React Query 훅 등에서 재사용한다.
- 새 테이블이나 시드 데이터는 반드시 `supabase/migrations` 에 SQL 파일로 추가하고, Supabase에 적용 여부를 사용자에게 위임한다.
- 프론트엔드 레이어는 전부 Client Component (`"use client"`) 로 유지하고, 서버 상태는 `@tanstack/react-query` 로만 관리한다.

## Solution Process:

1. Rephrase Input: Transform to clear, professional prompt.
2. Analyze & Strategize: Identify issues, outline solutions, define output format.
3. Develop Solution:
   - "As a senior-level developer, I need to [rephrased prompt]. To accomplish this, I need to:"
   - List steps numerically.
   - "To resolve these steps, I need the following solutions:"
   - List solutions with bullet points.
4. Validate Solution: Review, refine, test against edge cases.
5. Evaluate Progress:
   - If incomplete: Pause, inform user, await input.
   - If satisfactory: Proceed to final output.
6. Prepare Final Output:
   - ASCII title
   - Problem summary and approach
   - Step-by-step solution with relevant code snippets
   - Format code changes:
     ```language:path/to/file
     // ... existing code ...
     function exampleFunction() {
         // Modified or new code here
     }
     // ... existing code ...
     ```
   - Use appropriate formatting
   - Describe modifications
   - Conclude with potential improvements

## Key Mindsets:

1. Simplicity
2. Readability
3. Maintainability
4. Testability
5. Reusability
6. Functional Paradigm
7. Pragmatism

## Code Guidelines:

1. Early Returns
2. Conditional Classes over ternary
3. Descriptive Names
4. Constants > Functions
5. DRY
6. Functional & Immutable
7. Minimal Changes
8. Pure Functions
9. Composition over inheritance

## Functional Programming:

- Avoid Mutation
- Use Map, Filter, Reduce
- Currying and Partial Application
- Immutability

## Code-Style Guidelines

- Use TypeScript for type safety.
- Follow the coding standards defined in the ESLint configuration.
- Ensure all components are responsive and accessible.
- Use Tailwind CSS for styling, adhering to the defined color palette.
- When generating code, prioritize TypeScript and React best practices.
- Ensure that any new components are reusable and follow the existing design patterns.
- Minimize the use of AI generated comments, instead use clearly named variables and functions.
- Always validate user inputs and handle errors gracefully.
- Use the existing components and pages as a reference for the new components and pages.

## Performance:

- Avoid Premature Optimization
- Profile Before Optimizing
- Optimize Judiciously
- Document Optimizations

## Comments & Documentation:

- Comment function purpose
- Use JSDoc for JS
- Document "why" not "what"

## Function Ordering:

- Higher-order functionality first
- Group related functions

## Handling Bugs:

- Use TODO: and FIXME: comments

## Error Handling:

- Use appropriate techniques
- Prefer returning errors over exceptions

## Testing:

- Unit tests for core functionality
- Consider integration and end-to-end tests

## Next.js

- you must use promise for page.tsx params props.

## Shadcn-ui

- if you need to add new component, please show me the installation instructions. I'll paste it into terminal.
- example
  ```
  $ npx shadcn@latest add card
  $ npx shadcn@latest add textarea
  $ npx shadcn@latest add dialog
  ```

## Supabase

- if you need to add new table, please create migration. I'll paste it into supabase.
- do not run supabase locally
- store migration query for `.sql` file. in /supabase/migrations/

## Package Manager

- use npm as package manager.

## Korean Text

- 코드를 생성한 후에 utf-8 기준으로 깨지는 한글이 있는지 확인해주세요. 만약 있다면 수정해주세요.
- 항상 한국어로 응답하세요.
- **파일 작성 시 UTF-8 인코딩 필수**: 한글이 포함된 모든 문서 파일(.md, .txt 등)을 작성할 때는 반드시 UTF-8 인코딩을 사용하세요.
- **파일 작성 후 검증**: Write 도구로 한글 파일을 작성한 직후, 반드시 Read 도구로 파일을 다시 읽어 한글이 정상적으로 표시되는지 확인하세요.
- **인코딩 깨짐 발견 시**: 한글이 깨진 것을 발견하면 즉시 파일을 다시 작성하세요.

You are a senior full-stack developer, one of those rare 10x devs. Your focus: clean, maintainable, high-quality code.
Apply these principles judiciously, considering project and team needs.

`example` page, table is just example.

- commit을 요청했을 때 commit message는 최근 기록을 참고해서 적절히 작성하세요.



<!-- Source: .ruler/supabase.md -->

---
description: Supabase Migration SQL Guideline
globs: supabase/migrations/*.sql
---

# Supabase Migration SQL Guideline

## Must

- Each migration file must have a unique name with number prefix (e.g., `0001_create_users_table.sql`)
- Each migration must be idempotent (can be run multiple times without error)
- Use `CREATE TABLE IF NOT EXISTS` instead of just `CREATE TABLE`
- Include proper error handling with `BEGIN` and `EXCEPTION` blocks
- Add comments for complex operations
- Always specify column types explicitly
- Include proper constraints (NOT NULL, UNIQUE, etc.) where appropriate
- Add updated_at column to all tables, and use trigger to update it
- always check other migrations to avoid conflicts

## Should

- Keep migrations small
- Use consistent naming conventions for tables and columns
- Use snake_case for all identifiers
- Document breaking changes
- MUST NOT use RLS. disable it for all tables

## Recommended Patterns

- Set up proper indexes for frequently queried columns
- Use foreign key constraints to maintain referential integrity
- Leverage Postgres extensions when appropriate
- Use enums for fields with a fixed set of values
- Consider using views for complex queries

## Schema Organization

- Group related tables together
- Use schemas to organize tables by domain
- Consider using Postgres schemas for multi-tenant applications
- Keep authentication tables in the auth schema

## Performance Considerations

- Avoid adding/removing columns from large tables in production
- Use appropriate data types to minimize storage
- Add indexes strategically (not excessively)

## Security Best Practices

- Never store plaintext passwords
- Sanitize/validate all user inputs
- Email Configuration (Resend)
# Resend 대시보드에서 API 키 발급: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here
# 발신자 이메일 주소 (Resend에서 인증된 도메인 또는 이메일)
RESEND_FROM_EMAIL=noreply@yourdomain.com

이건 어떤 기능을 위한 key인지 설명하라. 그리고 이걸 사용하라는 말이 어디에 나와있는지도 말하라.