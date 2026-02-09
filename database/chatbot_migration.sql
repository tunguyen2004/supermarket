-- ============================================================================
--                    MODULE 19: CHATBOT - CHAT HISTORY TABLE
-- ============================================================================
-- Bảng lưu lịch sử chat giữa user và chatbot AI
-- Chạy script này trên database minimart_db
-- ============================================================================

CREATE TABLE IF NOT EXISTS fact_chat_history (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES dim_users(id) ON DELETE CASCADE,
    session_id      VARCHAR(100) NOT NULL,
    user_message    TEXT NOT NULL,
    bot_reply       TEXT NOT NULL,
    intent          VARCHAR(50),
    response_type   VARCHAR(50),
    processing_time_ms INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho query performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON fact_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON fact_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON fact_chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_intent ON fact_chat_history(intent);

-- Comment
COMMENT ON TABLE fact_chat_history IS 'Lịch sử chat giữa user và chatbot AI';
COMMENT ON COLUMN fact_chat_history.session_id IS 'ID phiên chat, nhóm các tin nhắn liên tiếp';
COMMENT ON COLUMN fact_chat_history.intent IS 'Intent được AI phân loại (product_search, revenue_today, ...)';
COMMENT ON COLUMN fact_chat_history.response_type IS 'Loại response (product_list, revenue, stats, faq, ...)';
COMMENT ON COLUMN fact_chat_history.processing_time_ms IS 'Thời gian xử lý tin nhắn (milliseconds)';
