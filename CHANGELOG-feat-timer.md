# feat/timer 브랜치 작업 내역

> 작업일: 2025-12-09
> 담당자: 성호

---

## 개요

타이머 기능 API 모듈 구현. 앱에서 공부 시간을 측정하고 기록하는 기능.

---

## 브랜치 관리

1. `feat/auth-discord` → `dev` 머지 (Timer에서 JWT Guard 필요)
2. `dev`에서 `feat/timer` 브랜치 생성

---

## 생성된 파일

```
src/modules/timer/
├── timer.module.ts        # 모듈 정의
├── timer.controller.ts    # API 엔드포인트
├── timer.service.ts       # 비즈니스 로직
└── dto/
    ├── index.ts
    ├── start-timer.dto.ts # 시작 요청/응답 DTO
    └── stop-timer.dto.ts  # 종료 요청/응답 DTO
```

---

## 구현된 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/timer/start` | 타이머 시작, 세션 ID 반환 |
| POST | `/api/timer/stop` | 타이머 종료, duration 기록 |
| POST | `/api/timer/pause/:sessionId` | 일시정지 |
| POST | `/api/timer/resume/:sessionId` | 재개 |

### 상세

**POST /api/timer/start**
- 요청: `{ startedAt?: string }`
- 응답: `{ sessionId, startedAt }`
- DB: voice_sessions에 새 레코드 생성 (source='app_timer')

**POST /api/timer/stop**
- 요청: `{ sessionId, durationSeconds, endedAt?: string }`
- 응답: `{ sessionId, durationSeconds, startedAt, endedAt }`
- DB: voice_sessions 업데이트, users.total_seconds 증가

**POST /api/timer/pause/:sessionId**
- 응답: `{ message }`
- 세션 유효성 검증만 수행 (상태 관리는 클라이언트)

**POST /api/timer/resume/:sessionId**
- 응답: `{ message }`
- 세션 유효성 검증만 수행 (상태 관리는 클라이언트)

---

## 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app.module.ts` | TimerModule import 추가 |
| `src/common/constants/error-codes.ts` | TIMER_SESSION_NOT_FOUND, TIMER_SESSION_ALREADY_ENDED 추가 |

---

## 설계 결정

### 1. 일시정지/재개 처리
- **결정**: 클라이언트에서 시간 관리, 서버는 세션 유효성만 검증
- **이유**: voice_sessions 테이블에 일시정지 관련 컬럼 없음, 앱 특성상 클라이언트 관리가 적합

### 2. 공부 시간 기록
- **결정**: stop 시 클라이언트가 계산한 durationSeconds 전송
- **이유**: 일시정지 시간을 클라이언트에서 제외하고 순수 공부 시간만 전송

### 3. 출처 구분
- **결정**: `voice_sessions.source = 'app_timer'`
- **이유**: 디스코드 음성채널(`discord`), 뽀모도로(`app_pomodoro`)와 구분

---

## 사용 테이블

### voice_sessions (기존 테이블 재사용)
```sql
- session_id: bigint PK
- user_id: bigint FK
- guild_id: bigint FK
- started_at: timestamp
- ended_at: timestamp
- duration_seconds: integer
- source: varchar ('discord' | 'app_timer' | 'app_pomodoro')
```

---

## 인증

- 모든 API는 JWT 인증 필수 (전역 JwtAuthGuard 적용)
- 게스트는 서버 API 호출 안 함 (로컬에서 관리)

---

## 빌드

```bash
pnpm build  # 성공
```
