import { format, parseISO, addDays, isBefore, isAfter } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'Asia/Seoul';

/**
 * 사용자 타임존 기준 오늘 날짜 (yyyy-MM-dd)
 */
export function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  return format(zonedDate, 'yyyy-MM-dd');
}

/**
 * 사용자 타임존 기준 어제 날짜 (yyyy-MM-dd)
 */
export function getYesterdayInTimezone(timezone: string): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  const yesterday = addDays(zonedDate, -1);
  return format(yesterday, 'yyyy-MM-dd');
}

/**
 * 사용자 타임존 기준 현재 시간
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

/**
 * 일기 수정 가능 여부 확인
 * - 해당 날짜 06:00 ~ 다음날 05:59까지 수정 가능
 */
export function canEditDiary(diaryDate: string, timezone: string): boolean {
  const now = getCurrentTimeInTimezone(timezone);
  const targetDate = parseISO(diaryDate);

  // 일기 작성 시작 시간: 해당 날짜 06:00 (사용자 타임존)
  const editStartTime = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    6,
    0,
    0,
  );

  // 일기 작성 종료 시간: 다음날 06:00 (사용자 타임존)
  const nextDay = addDays(targetDate, 1);
  const editEndTime = new Date(
    nextDay.getFullYear(),
    nextDay.getMonth(),
    nextDay.getDate(),
    6,
    0,
    0,
  );

  return !isBefore(now, editStartTime) && isBefore(now, editEndTime);
}

/**
 * 답장 노출 가능 여부 확인
 * - 해당 날짜 다음날 09:00 이후부터 노출
 */
export function canShowReply(diaryDate: string, timezone: string): boolean {
  const now = getCurrentTimeInTimezone(timezone);
  const targetDate = parseISO(diaryDate);

  // 답장 노출 시작 시간: 다음날 09:00 (사용자 타임존)
  const nextDay = addDays(targetDate, 1);
  const replyShowTime = new Date(
    nextDay.getFullYear(),
    nextDay.getMonth(),
    nextDay.getDate(),
    9,
    0,
    0,
  );

  return isAfter(now, replyShowTime);
}

/**
 * 현재 UTC 시간이 특정 타임존의 특정 시간인지 확인
 * (배치용: 매 시간 실행 시 해당 타임존의 목표 시간인지 확인)
 */
export function isTargetHourInTimezone(
  timezone: string,
  targetHour: number,
  targetMinute: number = 0,
): boolean {
  const zonedTime = getCurrentTimeInTimezone(timezone);
  const currentHour = zonedTime.getHours();
  const currentMinute = zonedTime.getMinutes();

  return currentHour === targetHour && currentMinute === targetMinute;
}

/**
 * 타임존 유효성 검증
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
