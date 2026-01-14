# 백엔드 API 명세서

> 최종 수정일: 2026-01-14

---

## API 목록

### 인증 (Auth)

| 엔드포인트                   | 메서드 | 인증 | 설명                                           |
| ---------------------------- | :----: | :--: | ---------------------------------------------- |
| `/api/auth/discord`          |  GET   | 공개 | Discord OAuth 로그인 시작 (리다이렉트)         |
| `/api/auth/discord/callback` |  GET   | 공개 | OAuth 콜백 + JWT 발급 (query: code, timezone?) |
| `/api/auth/verify-member`    |  GET   | 필수 | 서버 멤버 검증                                 |
| `/api/auth/refresh`          |  POST  | 공개 | Access Token 갱신                              |
| `/api/auth/logout`           |  POST  | 필수 | 로그아웃                                       |

### 타이머 (Timer)

| 엔드포인트          | 메서드 | 인증 | 설명        |
| ------------------- | :----: | :--: | ----------- |
| `/api/timer/start`  |  POST  | 필수 | 타이머 시작 |
| `/api/timer/stop`   |  POST  | 필수 | 타이머 종료 |
| `/api/timer/pause`  |  POST  | 필수 | 일시정지    |
| `/api/timer/resume` |  POST  | 필수 | 재개        |

### 뽀모도로 (Pomodoro)

| 엔드포인트                     | 메서드 | 인증 | 설명             |
| ------------------------------ | :----: | :--: | ---------------- |
| `/api/pomodoro/start`          |  POST  | 필수 | 뽀모도로 시작    |
| `/api/pomodoro/stop`           |  POST  | 필수 | 뽀모도로 종료    |
| `/api/pomodoro/cycle-complete` |  POST  | 필수 | 사이클 완료 기록 |
| `/api/pomodoro/settings`       |  GET   | 필수 | 설정 조회        |
| `/api/pomodoro/settings`       |  PUT   | 필수 | 설정 저장        |

### 캘린더 (Calendar)

| 엔드포인트                     | 메서드 | 인증 | 설명                           |
| ------------------------------ | :----: | :--: | ------------------------------ |
| `/api/calendar/stats/monthly`  |  GET   | 필수 | 월별 통계 (query: year, month) |
| `/api/calendar/stats/daily`    |  GET   | 필수 | 일별 통계 (query: date)        |
| `/api/calendar/{year}/{month}` |  GET   | 필수 | 월별 캘린더 데이터             |

### 투두 (Todos)

| 엔드포인트                   | 메서드 | 인증 | 설명                              |
| ---------------------------- | :----: | :--: | --------------------------------- |
| `/api/todos`                 |  GET   | 필수 | 특정 날짜 투두 목록 (query: date) |
| `/api/todos`                 |  POST  | 필수 | 투두 생성                         |
| `/api/todos/{todoId}`        | PATCH  | 필수 | 투두 수정                         |
| `/api/todos/{todoId}`        | DELETE | 필수 | 투두 삭제                         |
| `/api/todos/{todoId}/toggle` | PATCH  | 필수 | 완료/미완료 토글                  |

### 반복 투두 (Recurring Todos)

| 엔드포인트                           | 메서드 | 인증 | 설명           |
| ------------------------------------ | :----: | :--: | -------------- |
| `/api/todos/recurring`               |  GET   | 필수 | 반복 투두 목록 |
| `/api/todos/recurring`               |  POST  | 필수 | 반복 투두 생성 |
| `/api/todos/recurring/{recurringId}` |  PUT   | 필수 | 반복 투두 수정 |
| `/api/todos/recurring/{recurringId}` | DELETE | 필수 | 반복 투두 삭제 |

### 일기 (Diary)

| 엔드포인트            | 메서드 | 인증 | 설명                                      |
| --------------------- | :----: | :--: | ----------------------------------------- |
| `/api/diary/{date}`   |  GET   | 필수 | 일기 조회 (답장은 다음날 09:00 이후 노출) |
| `/api/diary/{date}`   |  PUT   | 필수 | 일기 작성/수정 (당일 06:00 ~ 익일 05:59)  |
| `/api/diary/test-llm` |  POST  | 공개 | [DEV] LLM 답장 테스트 (개발환경만)        |

### 알림 (Notifications)

| 엔드포인트                                 | 메서드 | 인증 | 설명                     |
| ------------------------------------------ | :----: | :--: | ------------------------ |
| `/api/notifications`                       |  GET   | 필수 | 알림 목록 (페이지네이션) |
| `/api/notifications/unread-count`          |  GET   | 필수 | 안읽은 알림 수           |
| `/api/notifications/{notificationId}/read` | PATCH  | 필수 | 읽음 처리                |
| `/api/notifications/read-all`              | PATCH  | 필수 | 전체 읽음 처리           |

### 회원 (Members)

| 엔드포인트             | 메서드 | 인증 | 설명                |
| ---------------------- | :----: | :--: | ------------------- |
| `/api/members/profile` |  GET   | 필수 | 프로필(학생증) 조회 |

### 디바이스 (Devices)

| 엔드포인트           | 메서드 | 인증 | 설명          |
| -------------------- | :----: | :--: | ------------- |
| `/api/devices/token` |  POST  | 필수 | FCM 토큰 등록 |

### 설정 (Settings)

| 엔드포인트                    | 메서드 | 인증 | 설명             |
| ----------------------------- | :----: | :--: | ---------------- |
| `/api/settings/notifications` |  GET   | 필수 | 알림 설정 조회   |
| `/api/settings/notifications` |  PUT   | 필수 | 알림 설정 변경   |
| `/api/settings/timezone`      |  GET   | 필수 | 타임존 설정 조회 |
| `/api/settings/timezone`      | PATCH  | 필수 | 타임존 변경      |

### 약관 (Terms)

| 엔드포인트          | 메서드 | 인증 | 설명                             |
| ------------------- | :----: | :--: | -------------------------------- |
| `/api/terms/{type}` |  GET   | 공개 | 약관 조회 (type: terms, privacy) |

### 서버 상태 (Health)

| 엔드포인트       | 메서드 | 인증 | 설명              |
| ---------------- | :----: | :--: | ----------------- |
| `/api/health`    |  GET   | 공개 | 서버 상태 확인    |
| `/api/health/db` |  GET   | 공개 | DB 연결 상태 확인 |

---

## Swagger 문서

```
{서버주소}/api-docs
```

상세한 Request/Response 스키마는 Swagger에서 확인해주세요.

---

## 인증 방식

### 인증이 필요한 API

```
Authorization: Bearer {accessToken}
```

### 토큰 갱신

Access Token 만료 시 `/api/auth/refresh`로 갱신:

```json
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

---

## 공통 응답 형식

### 성공

```json
{
  "success": true,
  "data": { ... }
}
```

### 실패

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

### 주요 에러 코드

| 코드                    | HTTP 상태 | 설명                  |
| ----------------------- | :-------: | --------------------- |
| `UNAUTHORIZED`          |    401    | 인증 토큰 없음/만료   |
| `AUTH_INVALID_TOKEN`    |    401    | 유효하지 않은 토큰    |
| `BAD_REQUEST`           |    400    | 요청 데이터 검증 실패 |
| `NOT_FOUND`             |    404    | 리소스 없음           |
| `INTERNAL_SERVER_ERROR` |    500    | 서버 오류             |

---

## 배치 작업 (자동 실행)

| 시간 (KST) | 작업                              |
| :--------: | --------------------------------- |
|   00:00    | 반복 투두 → 오늘 투두로 자동 생성 |
|   06:00    | 전날 일기 잠금 (수정 불가)        |
|   06:05    | 일기 AI 답장 생성                 |
|   09:00    | 일기 답장 푸시 알림 발송          |
