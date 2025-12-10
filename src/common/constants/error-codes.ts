/**
 * 공통 에러 코드 정의
 *
 * 규칙:
 * - 모듈 개발 시 필요할 때마다 추가
 * - 네이밍: {MODULE}_{ERROR_NAME} 형식
 * - 주석으로 담당자 표시 권장
 */
export const ERROR_CODES = {
  // Auth (성호)

  // Todos (감귤)

  // Diary (성호)

  // Notifications (감귤)

  // Timer (성호)

  // Pomodoro (성호/감귤)
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
