import { format, parseISO, addDays, isBefore, isAfter } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'Asia/Seoul';

// 시간 상수
const DIARY_EDIT_START_HOUR = 6; // 일기 작성 시작 시간 (06:00)
const DIARY_EDIT_END_HOUR = 6; // 일기 작성 종료 시간 (다음날 06:00)
const REPLY_SHOW_HOUR = 9; // 답장 노출 시작 시간 (09:00)

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
  const now = new Date(); // UTC 기준 현재 시간
  const targetDate = parseISO(diaryDate);
  const nextDay = addDays(targetDate, 1);

  // 사용자 타임존의 시간을 UTC로 변환하여 비교
  const editStartTimeStr = `${diaryDate}T${String(DIARY_EDIT_START_HOUR).padStart(2, '0')}:00:00`;
  const editStartTime = fromZonedTime(editStartTimeStr, timezone);

  const nextDayStr = format(nextDay, 'yyyy-MM-dd');
  const editEndTimeStr = `${nextDayStr}T${String(DIARY_EDIT_END_HOUR).padStart(2, '0')}:00:00`;
  const editEndTime = fromZonedTime(editEndTimeStr, timezone);

  return !isBefore(now, editStartTime) && isBefore(now, editEndTime);
}

/**
 * 답장 노출 가능 여부 확인
 * - 해당 날짜 다음날 09:00 이후부터 노출
 */
export function canShowReply(diaryDate: string, timezone: string): boolean {
  const now = new Date(); // UTC 기준 현재 시간
  const targetDate = parseISO(diaryDate);
  const nextDay = addDays(targetDate, 1);

  // 사용자 타임존의 시간을 UTC로 변환하여 비교
  const nextDayStr = format(nextDay, 'yyyy-MM-dd');
  const replyShowTimeStr = `${nextDayStr}T${String(REPLY_SHOW_HOUR).padStart(2, '0')}:00:00`;
  const replyShowTime = fromZonedTime(replyShowTimeStr, timezone);

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
