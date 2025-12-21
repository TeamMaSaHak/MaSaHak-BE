# 리팩토링 목록

> PR 리뷰에서 나온 개선 사항들을 정리합니다.

---

## Calendar 모듈 (PR #5)

### 1. 전체 날짜 반환 여부 검토
- **현재**: 활동 있는 날짜만 반환 (공부 시간 > 0 또는 일기 작성)
- **제안**: 전체 날짜를 `{ date, totalMinutes: 0, hasDiary: false }` 형태로 반환
- **액션**: 프론트엔드와 협의 후 결정
- **파일**: `src/modules/calendar/calendar.service.ts` - `getMonthlyCalendar()`

### 2. 타임존 명시적 처리
- **현재**: `new Date(year, month - 1, 1)` (로컬 타임존 의존)
- **제안**: `new Date(Date.UTC(year, month - 1, 1))` 사용으로 UTC 명시
- **이유**: 서버 환경 변경 시 안전성 확보
- **파일**: `src/modules/calendar/calendar.service.ts` - 226번 라인 외 다수

### 3. 공부 시간 계산 로직 분리
- **현재**: `Math.floor(durationSeconds / 60)` 로직이 여러 메서드에서 반복
- **제안**: private 헬퍼 메서드로 추출
- **예시**:
  ```typescript
  private calculateMinutesFromSeconds(seconds: number): number {
    return Math.floor(seconds / 60);
  }
  ```
- **파일**: `src/modules/calendar/calendar.service.ts` - 89번 라인 외 다수

---

## Todos 모듈 (PR #7)

### 1. ID 타입 통일 검토 (number vs string)
- **현재**: `todoId`, `recurringId`가 string으로 처리
- **코멘트**: 순차 증가 ID이므로 number로 통일해야 하지 않을까?
- **고려사항**:
  - DB가 int8(bigint)인 경우 JavaScript number의 정밀도 한계(2^53-1)로 인해 string이 안전
  - 현재 ID 값이 작아서 당장은 문제없지만, 규모가 커지면 이슈 발생 가능
- **액션**: 팀 협의 후 결정 (현재는 string 유지가 안전할 수 있음)
- **파일**: `src/modules/todos/dto/`, `src/modules/todos/todos.controller.ts`

---

## Pomodoro Settings 모듈 (PR #8)

### 1. DTO 필드명 일관성
- **현재**: `repeat_count` → `repeat`
- **제안**: `repeat_count` → `repeatCount`로 변경 (다른 필드와 일관성 유지)
- **이유**: 다른 필드들은 DB 컬럼명을 camelCase로 변환하는 규칙을 따름
  - `focus_time` → `focusTime` ✅
  - `break_time` → `breakTime` ✅
  - `repeat_count` → `repeat` ❌ (repeatCount여야 일관성 있음)
- **수정 필요한 곳**:
  - `src/modules/pomodoro/dto/pomodoro-settings.dto.ts:36` - `repeat` → `repeatCount`
  - `src/modules/pomodoro/pomodoro.service.ts:178` - `repeat` → `repeatCount`
  - `src/modules/pomodoro/pomodoro.service.ts:196` - `settings.repeat` → `settings.repeatCount`
  - `src/modules/pomodoro/pomodoro.service.ts:213` - `repeat` → `repeatCount`

---

## 참고
- PR #5: https://github.com/TeamMaSaHak/MaSaHak-BE/pull/5
- PR #7: https://github.com/TeamMaSaHak/MaSaHak-BE/pull/7
- PR #8: https://github.com/TeamMaSaHak/MaSaHak-BE/pull/8
