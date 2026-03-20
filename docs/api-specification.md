# 마법사관학교 API 명세서

> 최종 수정일: 2026-03-21

---

## 서버 정보

| 환경 | Base URL | Swagger |
|------|----------|---------|
| 개발 | `http://localhost:3000` | `http://localhost:3000/api-docs` |
| 운영 | `https://backend-production-83ee.up.railway.app` | `https://backend-production-83ee.up.railway.app/api-docs` |

### Discord OAuth

| 항목 | 값 |
|------|-----|
| Client ID | `1419219230812799076` |
| Redirect URI (운영) | `https://backend-production-83ee.up.railway.app/api/auth/discord/callback` |

---

## 공통 사항

### 인증 방식
```
Authorization: Bearer {accessToken}
```

### 응답 형식

**성공**
```json
{
  "success": true,
  "data": { ... }
}
```

**실패**
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

| 코드 | HTTP | 설명 |
|------|:----:|------|
| `UNAUTHORIZED` | 401 | 인증 토큰 없음/만료 |
| `AUTH_INVALID_TOKEN` | 401 | 유효하지 않은 토큰 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `BAD_REQUEST` | 400 | 요청 데이터 검증 실패 |
| `NOT_FOUND` | 404 | 리소스 없음 |

---

# 1. 사용자 인증 (Auth)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 인증 | 디스코드 로그인 요청 | GET | `/api/auth/discord` | Discord OAuth 페이지로 리다이렉트 |
| 인증 | 디스코드 로그인 콜백 | GET | `/api/auth/discord/callback` | OAuth 인증 후 토큰 발급 |
| 인증 | 서버 멤버 검증 | GET | `/api/auth/verify-member` | 마사학 디스코드 서버 멤버 여부 확인 |
| 인증 | 토큰 갱신 | POST | `/api/auth/refresh` | Access Token 갱신 |
| 인증 | 로그아웃 | POST | `/api/auth/logout` | 세션 종료 |

---

## 1.1 디스코드 로그인 요청

```
GET /api/auth/discord
```

### Response

```json
{
  "redirectUrl": "https://discord.com/oauth2/authorize?..."
}
```

---

## 1.2 디스코드 로그인 콜백

```
GET /api/auth/discord/callback?code={authorization_code}&timezone={timezone}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| code | string | O | Discord OAuth 인증 코드 |
| timezone | string | X | 사용자 타임존 (기본값: Asia/Seoul) |

### Response (성공 - 마사학 멤버)

```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "refresh_token_here",
      "expiresIn": 3600
    },
    "user": {
      "userId": "123456789012345678",
      "guildId": "987654321098765432",
      "nickname": "마법사",
      "studentNo": "2025050101",
      "profileImage": "https://cdn.discordapp.com/...",
      "dormitory": "그리핀도르",
      "level": 1,
      "levelName": "마법학도",
      "timezone": "Asia/Seoul"
    },
    "isMember": true
  }
}
```

### Response (실패 - 비멤버)

```json
{
  "success": false,
  "error": {
    "code": "NOT_MEMBER",
    "message": "마법사관학교 학생이 아니네요. 입학하시겠습니까?"
  },
  "discordInviteUrl": "https://discord.gg/magicschool"
}
```

---

## 1.3 서버 멤버 검증

```
GET /api/auth/verify-member
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "isMember": true,
    "user": {
      "userId": "123456789012345678",
      "guildId": "987654321098765432",
      "nickname": "마법사",
      "studentNo": "2025050101",
      "profileImage": "https://cdn.discordapp.com/...",
      "dormitory": "그리핀도르",
      "level": 1,
      "levelName": "마법학도",
      "timezone": "Asia/Seoul"
    }
  }
}
```

---

## 1.4 토큰 갱신

```
POST /api/auth/refresh
```

### Request Body

```json
{
  "refreshToken": "your_refresh_token"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

---

## 1.5 로그아웃

```
POST /api/auth/logout
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다."
  }
}
```

---

# 2. 타이머 (Timer)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 타이머 | 타이머 시작 | POST | `/api/timer/start` | 새로운 타이머 세션 시작 |
| 타이머 | 타이머 종료 | POST | `/api/timer/stop` | 타이머 세션 종료 |
| 타이머 | 타이머 일시정지 | POST | `/api/timer/pause` | 타이머 일시정지 |
| 타이머 | 타이머 재개 | POST | `/api/timer/resume` | 타이머 재개 |

---

## 2.1 타이머 시작

```
POST /api/timer/start
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "startedAt": "2025-12-09T10:00:00.000Z"  // 선택, 생략시 서버 시간
}
```

### Response

```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "startedAt": "2025-12-09T10:00:00.000Z"
  }
}
```

---

## 2.2 타이머 종료

```
POST /api/timer/stop
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "sessionId": 1,
  "durationSeconds": 3600,
  "endedAt": "2025-12-09T11:00:00.000Z"  // 선택
}
```

### Response

```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "durationSeconds": 3600,
    "startedAt": "2025-12-09T10:00:00.000Z",
    "endedAt": "2025-12-09T11:00:00.000Z"
  }
}
```

---

## 2.3 타이머 일시정지

```
POST /api/timer/pause
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "sessionId": 1
}
```

### Response

```json
{
  "success": true,
  "data": {
    "message": "타이머가 일시정지되었습니다."
  }
}
```

---

## 2.4 타이머 재개

```
POST /api/timer/resume
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "sessionId": 1
}
```

### Response

```json
{
  "success": true,
  "data": {
    "message": "타이머가 재개되었습니다."
  }
}
```

---

# 3. 뽀모도로 (Pomodoro)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 뽀모도로 | 뽀모도로 시작 | POST | `/api/pomodoro/start` | 뽀모도로 세션 시작 |
| 뽀모도로 | 뽀모도로 종료 | POST | `/api/pomodoro/stop` | 뽀모도로 세션 종료 |
| 뽀모도로 | 사이클 완료 | POST | `/api/pomodoro/cycle-complete` | 1사이클 완료 기록 |
| 뽀모도로 | 설정 조회 | GET | `/api/pomodoro/settings` | 뽀모도로 설정 조회 |
| 뽀모도로 | 설정 저장 | PUT | `/api/pomodoro/settings` | 뽀모도로 설정 저장 |

---

## 3.1 뽀모도로 시작

```
POST /api/pomodoro/start
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "startedAt": "2025-12-09T10:00:00.000Z",  // 선택
  "focusTime": 25,    // 선택, 집중 시간(분), 5-120, 기본값 25
  "breakTime": 5,     // 선택, 쉬는 시간(분), 5-30, 기본값 5
  "repeatCount": 4    // 선택, 반복 횟수, 1-10, 기본값 4
}
```

### Response

```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "startedAt": "2025-12-09T10:00:00.000Z",
    "focusTime": 25,
    "breakTime": 5,
    "repeatCount": 4
  }
}
```

---

## 3.2 뽀모도로 종료

```
POST /api/pomodoro/stop
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "sessionId": 1,
  "durationSeconds": 1500,
  "completedCycles": 2,
  "endedAt": "2025-12-09T11:00:00.000Z"  // 선택
}
```

### Response

```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "durationSeconds": 1500,
    "completedCycles": 2,
    "startedAt": "2025-12-09T10:00:00.000Z",
    "endedAt": "2025-12-09T11:00:00.000Z"
  }
}
```

---

## 3.3 사이클 완료

```
POST /api/pomodoro/cycle-complete
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "sessionId": 1,
  "cycleNumber": 1,
  "focusDurationSeconds": 1500
}
```

### Response

```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "cycleNumber": 1,
    "isLastCycle": false,
    "nextPhase": "break"
  }
}
```

---

## 3.4 설정 조회

```
GET /api/pomodoro/settings
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "focusTime": 25,
    "breakTime": 5,
    "repeatCount": 4
  }
}
```

---

## 3.5 설정 저장

```
PUT /api/pomodoro/settings
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "focusTime": 30,
  "breakTime": 10,
  "repeatCount": 3
}
```

### Response

```json
{
  "success": true,
  "data": {
    "focusTime": 30,
    "breakTime": 10,
    "repeatCount": 3
  }
}
```

---

# 4. 캘린더 (Calendar)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 캘린더 | 월별 통계 | GET | `/api/calendar/stats/monthly` | 월별 통계 조회 |
| 캘린더 | 일별 통계 | GET | `/api/calendar/stats/daily` | 일별 통계 조회 |
| 캘린더 | 월별 데이터 | GET | `/api/calendar/{year}/{month}` | 월별 캘린더 데이터 |

---

## 4.1 월별 통계 조회

```
GET /api/calendar/stats/monthly?year=2025&month=8
```

**인증 필수**: Bearer Token

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| year | number | O | 연도 (2020-2100) |
| month | number | O | 월 (1-12) |

### Response

```json
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 8,
    "attendanceDays": 15,
    "totalDaysInMonth": 31,
    "totalMinutes": 1500,
    "averageMinutesPerDay": 100,
    "completedTodos": 25
  }
}
```

---

## 4.2 일별 통계 조회

```
GET /api/calendar/stats/daily?date=2025-08-12
```

**인증 필수**: Bearer Token

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| date | string | O | 날짜 (YYYY-MM-DD) |

### Response

```json
{
  "success": true,
  "data": {
    "date": "2025-08-12",
    "totalMinutes": 180,
    "diffFromYesterday": 30,
    "firstStartTime": "09:30",
    "longestSessionMinutes": 75
  }
}
```

---

## 4.3 월별 캘린더 데이터

```
GET /api/calendar/2025/8
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 8,
    "days": [
      {
        "date": "2025-08-01",
        "totalMinutes": 120,
        "hasDiary": true
      },
      {
        "date": "2025-08-02",
        "totalMinutes": 90,
        "hasDiary": false
      }
    ]
  }
}
```

---

# 5. 투두 (Todos)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 투두 | 투두 목록 | GET | `/api/todos` | 특정 날짜 투두 목록 |
| 투두 | 투두 생성 | POST | `/api/todos` | 투두 생성 |
| 투두 | 투두 순서 변경 | PATCH | `/api/todos/reorder` | 투두 정렬 순서 변경 |
| 투두 | 투두 수정 | PATCH | `/api/todos/{todoId}` | 투두 내용 수정 |
| 투두 | 투두 삭제 | DELETE | `/api/todos/{todoId}` | 투두 삭제 |
| 투두 | 완료 토글 | PATCH | `/api/todos/{todoId}/toggle` | 완료/미완료 토글 |

---

## 5.1 투두 목록 조회

```
GET /api/todos?date=2025-01-15
```

**인증 필수**: Bearer Token

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| date | string | O | 날짜 (YYYY-MM-DD) |

### Response

```json
{
  "success": true,
  "data": {
    "date": "2025-01-15",
    "todos": [
      {
        "id": 1,
        "content": "알고리즘 문제 풀기",
        "isCompleted": false,
        "createdAt": "2025-01-15T08:00:00Z",
        "order": 1
      },
      {
        "id": 2,
        "content": "NestJS 공부",
        "isCompleted": true,
        "createdAt": "2025-01-15T09:00:00Z",
        "order": 2
      }
    ]
  }
}
```

---

## 5.2 투두 생성

```
POST /api/todos
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "content": "새로운 할일",
  "date": "2025-01-15"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| content | string | O | 투두 내용 (최대 22자) |
| date | string | O | 날짜 (YYYY-MM-DD) |

### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "content": "새로운 할일",
    "isCompleted": false,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

## 5.3 투두 순서 변경

```
PATCH /api/todos/reorder
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "items": [
    { "id": 3, "order": 1 },
    { "id": 1, "order": 2 },
    { "id": 5, "order": 3 }
  ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| items | array | O | 투두 ID와 변경할 순서 목록 |
| items[].id | number | O | 투두 ID |
| items[].order | number | O | 변경할 정렬 순서 |

### Response

```json
{
  "success": true,
  "data": {
    "updatedCount": 3
  }
}
```

---

## 5.4 투두 수정

```
PATCH /api/todos/{todoId}
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "content": "수정된 할일"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "수정된 할일",
    "isCompleted": false,
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

---

## 5.5 투두 삭제

```
DELETE /api/todos/{todoId}
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "deleted": true
  }
}
```

---

## 5.6 완료 토글

```
PATCH /api/todos/{todoId}/toggle
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "isCompleted": true,
    "toggledAt": "2025-01-15T12:00:00Z"
  }
}
```

---

# 6. 반복 투두 (Recurring Todos)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 반복 투두 | 목록 조회 | GET | `/api/todos/recurring` | 반복 투두 목록 |
| 반복 투두 | 생성 | POST | `/api/todos/recurring` | 반복 투두 생성 |
| 반복 투두 | 수정 | PUT | `/api/todos/recurring/{recurringId}` | 반복 투두 수정 |
| 반복 투두 | 삭제 | DELETE | `/api/todos/recurring/{recurringId}` | 반복 투두 삭제 |

---

## 6.1 반복 투두 목록 조회

```
GET /api/todos/recurring
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "recurringTodos": [
      {
        "id": 1,
        "content": "물 2L 마시기",
        "createdAt": "2025-01-10T08:00:00Z"
      },
      {
        "id": 2,
        "content": "스트레칭 하기",
        "createdAt": "2025-01-10T08:00:00Z"
      }
    ]
  }
}
```

---

## 6.2 반복 투두 생성

```
POST /api/todos/recurring
```

**인증 필수**: Bearer Token

> 생성 시 오늘 날짜의 투두 목록에 즉시 반영됩니다. 다음날부터는 매일 00:00 배치로 자동 생성됩니다.

### Request Body

```json
{
  "content": "매일 운동하기"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| content | string | O | 반복 투두 내용 (최대 22자) |

### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "content": "매일 운동하기",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

## 6.3 반복 투두 수정

```
PUT /api/todos/recurring/{recurringId}
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "content": "수정된 반복 할일"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "수정된 반복 할일",
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

---

## 6.4 반복 투두 삭제

```
DELETE /api/todos/recurring/{recurringId}
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "deleted": true
  }
}
```

---

# 7. 일기 (Diary)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 일기 | 일기 조회 | GET | `/api/diary/{date}` | 특정 날짜 일기 조회 |
| 일기 | 일기 작성/수정 | PUT | `/api/diary/{date}` | 일기 작성 또는 수정 |

---

## 7.1 일기 조회

```
GET /api/diary/2025-12-11
```

**인증 필수**: Bearer Token

### Response (일기 있음)

```json
{
  "success": true,
  "data": {
    "diaryId": 1,
    "date": "2025-12-11",
    "content": "오늘은 NestJS를 공부했다.",
    "isLocked": false,
    "canEdit": true,
    "reply": {
      "replyId": 1,
      "content": "오늘도 열심히 공부했네요! 내일도 화이팅!",
      "createdAt": "2025-12-12T06:05:00.000Z"
    },
    "createdAt": "2025-12-11T10:00:00.000Z",
    "updatedAt": "2025-12-11T15:30:00.000Z"
  }
}
```

### Response (일기 없음)

```json
{
  "success": true,
  "data": {
    "diaryId": null,
    "date": "2025-12-11",
    "content": null,
    "isLocked": false,
    "canEdit": true,
    "reply": null,
    "createdAt": null,
    "updatedAt": null
  }
}
```

---

## 7.2 일기 작성/수정

```
PUT /api/diary/2025-12-11
```

**인증 필수**: Bearer Token

> **작성 가능 시간**: 해당 날짜 06:00 ~ 다음날 05:59 (사용자 타임존 기준)

### Request Body

```json
{
  "content": "오늘은 NestJS를 공부했다. 생각보다 재미있었다!"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| content | string | O | 일기 내용 (최대 5000자) |

### Response

```json
{
  "success": true,
  "data": {
    "diaryId": 1,
    "date": "2025-12-11",
    "content": "오늘은 NestJS를 공부했다. 생각보다 재미있었다!",
    "isCreated": true,
    "savedAt": "2025-12-11T15:30:00.000Z"
  }
}
```

### Response (수정 불가)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "일기 작성 시간이 지났습니다."
  }
}
```

---

# 8. 알림 (Notifications)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 알림 | 알림 목록 | GET | `/api/notifications` | 알림 목록 (페이지네이션) |
| 알림 | 안읽은 수 | GET | `/api/notifications/unread-count` | 안읽은 알림 수 |
| 알림 | 읽음 처리 | PATCH | `/api/notifications/{notificationId}/read` | 개별 읽음 처리 |
| 알림 | 전체 읽음 | PATCH | `/api/notifications/read-all` | 전체 읽음 처리 |

---

## 8.1 알림 목록 조회

```
GET /api/notifications?page=1&limit=20
```

**인증 필수**: Bearer Token

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| page | number | X | 페이지 번호 (기본값: 1) |
| limit | number | X | 페이지당 항목 수 (기본값: 20) |

### Response

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "DIARY_REPLY",
        "title": "일기 답장이 도착했어요!",
        "body": "오늘의 일기에 답장이 왔습니다.",
        "isRead": false,
        "createdAt": "2025-01-16T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "hasNext": true
    }
  }
}
```

---

## 8.2 안읽은 알림 수

```
GET /api/notifications/unread-count
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

## 8.3 읽음 처리

```
PATCH /api/notifications/{notificationId}/read
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "isRead": true,
    "readAt": "2025-01-16T10:00:00Z"
  }
}
```

---

## 8.4 전체 읽음 처리

```
PATCH /api/notifications/read-all
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  }
}
```

---

# 9. 회원 (Members)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 회원 | 프로필 조회 | GET | `/api/members/profile` | 프로필(학생증) 조회 |

---

## 9.1 프로필(학생증) 조회

```
GET /api/members/profile
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "profileImage": "https://cdn.discordapp.com/avatars/123456789/abcdef.png",
    "nickname": "마법사학생",
    "studentNo": "2025050101",
    "grade": 1,
    "gradeName": "1학년",
    "dormitory": "그리핀도르",
    "totalSeconds": 36000,
    "level": 5,
    "levelName": "견습 마법사",
    "joinedAt": "2025-05-01"
  }
}
```

---

# 10. 디바이스 (Devices)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 디바이스 | FCM 토큰 등록 | POST | `/api/devices/token` | FCM 토큰 등록 |

---

## 10.1 FCM 토큰 등록

```
POST /api/devices/token
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "fcmToken": "dGVzdC10b2tlbi1mb3ItZmNt...",
  "platform": "android"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| fcmToken | string | O | FCM 디바이스 토큰 |
| platform | string | O | 플랫폼 (`android`, `ios`) |

### Response

```json
{
  "success": true,
  "data": {
    "deviceId": 1,
    "isNew": true
  }
}
```

---

# 11. 설정 (Settings)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 설정 | 알림 설정 조회 | GET | `/api/settings/notifications` | 알림 설정 조회 |
| 설정 | 알림 설정 변경 | PUT | `/api/settings/notifications` | 알림 설정 변경 |
| 설정 | 타임존 조회 | GET | `/api/settings/timezone` | 타임존 설정 조회 |
| 설정 | 타임존 변경 | PATCH | `/api/settings/timezone` | 타임존 변경 |

---

## 11.1 알림 설정 조회

```
GET /api/settings/notifications
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "pushEnabled": true,
    "updatedAt": "2025-12-19T00:00:00.000Z"
  }
}
```

---

## 11.2 알림 설정 변경

```
PUT /api/settings/notifications
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "pushEnabled": false
}
```

### Response

```json
{
  "success": true,
  "data": {
    "pushEnabled": false,
    "updatedAt": "2025-12-19T10:00:00.000Z"
  }
}
```

---

## 11.3 타임존 조회

```
GET /api/settings/timezone
```

**인증 필수**: Bearer Token

### Response

```json
{
  "success": true,
  "data": {
    "timezone": "Asia/Seoul",
    "updatedAt": "2025-01-06T00:00:00.000Z"
  }
}
```

---

## 11.4 타임존 변경

```
PATCH /api/settings/timezone
```

**인증 필수**: Bearer Token

### Request Body

```json
{
  "timezone": "America/New_York"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "timezone": "America/New_York",
    "updatedAt": "2025-01-06T10:00:00.000Z"
  }
}
```

---

# 12. 약관 (Terms)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 약관 | 약관 조회 | GET | `/api/terms/{type}` | 이용약관/개인정보처리방침 조회 |

---

## 12.1 약관 조회

```
GET /api/terms/terms
GET /api/terms/privacy
```

**인증 불필요**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| type | string | O | `terms` (이용약관) 또는 `privacy` (개인정보처리방침) |

### Response

```json
{
  "success": true,
  "data": {
    "type": "terms",
    "title": "이용약관",
    "content": "마법사관학교 앱 이용약관...",
    "version": "1.0.0",
    "effectiveDate": "2025-01-01"
  }
}
```

---

# 13. 서버 상태 (Health)

| 컬렉션 | 이름 | Method | URL | 설명 |
|--------|------|:------:|-----|------|
| 헬스 | 서버 상태 | GET | `/api/health` | 서버 상태 확인 |
| 헬스 | DB 상태 | GET | `/api/health/db` | DB 연결 상태 확인 |

---

## 13.1 서버 상태 확인

```
GET /api/health
```

**인증 불필요**

### Response

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-14T10:00:00.000Z"
  }
}
```

---

## 13.2 DB 연결 상태 확인

```
GET /api/health/db
```

**인증 불필요**

### Response

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-14T10:00:00.000Z"
  }
}
```

---

# 부록

## 날짜/시간 형식

| 항목 | 형식 | 예시 |
|------|------|------|
| 날짜 | `YYYY-MM-DD` | `2026-01-14` |
| 시간 | ISO 8601 | `2026-01-14T09:00:00.000Z` |
| 타임존 | IANA | `Asia/Seoul` |

## 배치 작업 (자동 실행)

| 시간 (KST) | 작업 |
|:----------:|------|
| 00:00 | 반복 투두 → 오늘 투두로 자동 생성 |
| 06:00 | 전날 일기 잠금 (수정 불가) |
| 06:05 | 일기 AI 답장 생성 |
| 09:00 | 일기 답장 푸시 알림 발송 |
