/**
 * 닉네임 원본에서 표시용 이름만 추출.
 * "[카테고리] 이름" 형식이면 이름만, 아니면 원본 그대로.
 */
export function parseDisplayName(nickname: string | null | undefined): string {
  if (!nickname) return '';
  const match = nickname.match(/^\[.+?\]\s*(.+)$/);
  return match ? match[1].trim() : nickname;
}
