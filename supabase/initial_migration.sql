-- ========================================
-- 마법사관학교 앱 마이그레이션
-- 기존 profile_bot DB → 통합 DB
-- Supabase SQL Editor에서 실행
-- ========================================

-- ========================================
-- 1. 기존 테이블 컬럼 추가
-- ========================================

-- users 테이블에 앱용 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dormitory TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS joined_at DATE;

COMMENT ON COLUMN users.profile_image IS '프로필 이미지 URL';
COMMENT ON COLUMN users.dormitory IS '기숙사';
COMMENT ON COLUMN users.joined_at IS '가입일';

-- voice_sessions 테이블에 source 컬럼 추가
ALTER TABLE voice_sessions ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'discord';

COMMENT ON COLUMN voice_sessions.source IS '출처 (discord/app_timer/app_pomodoro)';

-- ========================================
-- 1-1. 기존 사용자 데이터 마이그레이션
-- ========================================

-- 기존 사용자의 joined_at을 student_no에서 추출 (KST 기준)
-- student_no 형식: YYYYMMDD + NN (예: 2025050101)
-- 앞 8자리를 DATE로 변환
UPDATE users
SET joined_at = TO_DATE(LEFT(student_no, 8), 'YYYYMMDD')
WHERE joined_at IS NULL
  AND student_no IS NOT NULL
  AND LENGTH(student_no) >= 8;

-- ========================================
-- 2. 신규 테이블 생성 (앱 전용)
-- ========================================

-- 뽀모도로 설정 테이블
CREATE TABLE IF NOT EXISTS pomodoro_settings (
    user_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    focus_time INTEGER DEFAULT 25,
    break_time INTEGER DEFAULT 5,
    repeat_count INTEGER DEFAULT 4,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, guild_id),
    FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON DELETE CASCADE
);

COMMENT ON TABLE pomodoro_settings IS '사용자별 뽀모도로 설정';
COMMENT ON COLUMN pomodoro_settings.user_id IS '유저 ID';
COMMENT ON COLUMN pomodoro_settings.guild_id IS '서버 ID';
COMMENT ON COLUMN pomodoro_settings.focus_time IS '집중 시간(분)';
COMMENT ON COLUMN pomodoro_settings.break_time IS '쉬는 시간(분)';
COMMENT ON COLUMN pomodoro_settings.repeat_count IS '반복 횟수';
COMMENT ON COLUMN pomodoro_settings.updated_at IS '수정일';

-- 반복 투두 테이블
CREATE TABLE IF NOT EXISTS recurring_todos (
    recurring_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON DELETE CASCADE
);

COMMENT ON TABLE recurring_todos IS '반복 투두 템플릿';
COMMENT ON COLUMN recurring_todos.recurring_id IS '반복 투두 ID';
COMMENT ON COLUMN recurring_todos.user_id IS '유저 ID';
COMMENT ON COLUMN recurring_todos.guild_id IS '서버 ID';
COMMENT ON COLUMN recurring_todos.content IS '내용 (max 22자)';
COMMENT ON COLUMN recurring_todos.is_active IS '활성화 여부';
COMMENT ON COLUMN recurring_todos.created_at IS '생성일';
COMMENT ON COLUMN recurring_todos.updated_at IS '수정일';

-- 투두 테이블
CREATE TABLE IF NOT EXISTS todos (
    todo_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    todo_date DATE NOT NULL,
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    recurring_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON DELETE CASCADE,
    FOREIGN KEY (recurring_id) REFERENCES recurring_todos(recurring_id) ON DELETE SET NULL
);

COMMENT ON TABLE todos IS '투두 리스트 항목';
COMMENT ON COLUMN todos.todo_id IS '투두 ID';
COMMENT ON COLUMN todos.user_id IS '유저 ID';
COMMENT ON COLUMN todos.guild_id IS '서버 ID';
COMMENT ON COLUMN todos.todo_date IS '날짜';
COMMENT ON COLUMN todos.content IS '내용 (max 22자)';
COMMENT ON COLUMN todos.is_completed IS '완료 여부';
COMMENT ON COLUMN todos.sort_order IS '정렬 순서';
COMMENT ON COLUMN todos.recurring_id IS '반복 투두 ID (nullable)';
COMMENT ON COLUMN todos.created_at IS '생성일';
COMMENT ON COLUMN todos.updated_at IS '수정일';

-- 일기 테이블
CREATE TABLE IF NOT EXISTS diaries (
    diary_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    diary_date DATE NOT NULL,
    content TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON DELETE CASCADE,
    UNIQUE (user_id, guild_id, diary_date)
);

COMMENT ON TABLE diaries IS '일기';
COMMENT ON COLUMN diaries.diary_id IS '일기 ID';
COMMENT ON COLUMN diaries.user_id IS '유저 ID';
COMMENT ON COLUMN diaries.guild_id IS '서버 ID';
COMMENT ON COLUMN diaries.diary_date IS '일기 날짜';
COMMENT ON COLUMN diaries.content IS '일기 내용';
COMMENT ON COLUMN diaries.is_locked IS '수정 잠금 여부';
COMMENT ON COLUMN diaries.created_at IS '생성일';
COMMENT ON COLUMN diaries.updated_at IS '수정일';

-- 일기 답장 테이블
CREATE TABLE IF NOT EXISTS diary_replies (
    reply_id BIGSERIAL PRIMARY KEY,
    diary_id BIGINT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diary_id) REFERENCES diaries(diary_id) ON DELETE CASCADE
);

COMMENT ON TABLE diary_replies IS 'LLM 일기 답장';
COMMENT ON COLUMN diary_replies.reply_id IS '답장 ID';
COMMENT ON COLUMN diary_replies.diary_id IS '일기 ID (1:1)';
COMMENT ON COLUMN diary_replies.content IS 'LLM 답장 내용';
COMMENT ON COLUMN diary_replies.created_at IS '생성일';

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON DELETE CASCADE
);

COMMENT ON TABLE notifications IS '알림';
COMMENT ON COLUMN notifications.notification_id IS '알림 ID';
COMMENT ON COLUMN notifications.user_id IS '유저 ID';
COMMENT ON COLUMN notifications.guild_id IS '서버 ID';
COMMENT ON COLUMN notifications.type IS '타입 (DIARY_REPLY/NOTICE)';
COMMENT ON COLUMN notifications.title IS '제목';
COMMENT ON COLUMN notifications.body IS '내용';
COMMENT ON COLUMN notifications.is_read IS '읽음 여부';
COMMENT ON COLUMN notifications.created_at IS '생성일';

-- 디바이스 토큰 테이블
CREATE TABLE IF NOT EXISTS device_tokens (
    device_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    fcm_token TEXT NOT NULL UNIQUE,
    platform VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON DELETE CASCADE
);

COMMENT ON TABLE device_tokens IS '푸시 알림용 FCM 토큰';
COMMENT ON COLUMN device_tokens.device_id IS '디바이스 ID';
COMMENT ON COLUMN device_tokens.user_id IS '유저 ID';
COMMENT ON COLUMN device_tokens.guild_id IS '서버 ID';
COMMENT ON COLUMN device_tokens.fcm_token IS 'FCM 토큰';
COMMENT ON COLUMN device_tokens.platform IS '플랫폼 (android/ios)';
COMMENT ON COLUMN device_tokens.created_at IS '등록일';
COMMENT ON COLUMN device_tokens.updated_at IS '갱신일';

-- 알림 설정 테이블
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    push_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, guild_id),
    FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON DELETE CASCADE
);

COMMENT ON TABLE notification_settings IS '알림 설정';
COMMENT ON COLUMN notification_settings.user_id IS '유저 ID';
COMMENT ON COLUMN notification_settings.guild_id IS '서버 ID';
COMMENT ON COLUMN notification_settings.push_enabled IS '전체 알림 ON/OFF';
COMMENT ON COLUMN notification_settings.updated_at IS '수정일';

-- ========================================
-- 3. 인덱스 생성
-- ========================================

-- 공부 세션 조회 최적화
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_date ON voice_sessions(user_id, guild_id, started_at);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_source ON voice_sessions(source);

-- 투두 조회 최적화
CREATE INDEX IF NOT EXISTS idx_todos_user_date ON todos(user_id, guild_id, todo_date);

-- 일기 조회 최적화
CREATE INDEX IF NOT EXISTS idx_diaries_user_date ON diaries(user_id, guild_id, diary_date);

-- 알림 조회 최적화
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, guild_id, is_read);

-- 디바이스 토큰 조회 최적화
CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON device_tokens(user_id, guild_id);

-- 반복 투두 조회 최적화
CREATE INDEX IF NOT EXISTS idx_recurring_todos_user ON recurring_todos(user_id, guild_id);
CREATE INDEX IF NOT EXISTS idx_recurring_todos_active ON recurring_todos(is_active);
CREATE INDEX IF NOT EXISTS idx_todos_recurring ON todos(recurring_id);

-- ========================================
-- 마이그레이션 완료
-- ========================================
