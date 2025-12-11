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

## 참고
- PR #5: https://github.com/TeamMaSaHak/MaSaHak-BE/pull/5
