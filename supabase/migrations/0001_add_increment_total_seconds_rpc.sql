-- ========================================
-- increment_total_seconds RPC 함수
-- 동시성 이슈 방지를 위한 원자적 업데이트
-- ========================================

-- 기존 함수가 있다면 삭제
DROP FUNCTION IF EXISTS increment_total_seconds(BIGINT, BIGINT, INTEGER);

-- 원자적으로 total_seconds를 증가시키는 함수
CREATE OR REPLACE FUNCTION increment_total_seconds(
    p_user_id BIGINT,
    p_guild_id BIGINT,
    p_seconds INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET total_seconds = COALESCE(total_seconds, 0) + p_seconds
    WHERE user_id = p_user_id
      AND guild_id = p_guild_id;

    -- 사용자가 없으면 아무것도 하지 않음 (에러 발생 X)
    -- 필요시 EXCEPTION 처리 추가 가능
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_total_seconds IS '사용자의 총 공부 시간을 원자적으로 증가시킵니다';

-- ========================================
-- 마이그레이션 완료
-- ========================================
