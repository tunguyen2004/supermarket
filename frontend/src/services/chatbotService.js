// src/services/chatbotService.js
import apiClient from "./apiClient";

const BASE = "/api/chatbot";

export default {
  /**
   * Gửi tin nhắn đến chatbot
   * @param {string} message - Nội dung tin nhắn
   * @param {string} sessionId - ID phiên chat
   */
  sendMessage(message, sessionId) {
    return apiClient.post(`${BASE}/message`, {
      message,
      session_id: sessionId,
    });
  },

  /** Lấy danh sách gợi ý câu hỏi */
  getSuggestions() {
    return apiClient.get(`${BASE}/suggestions`);
  },

  /** Lấy lịch sử chat */
  getHistory(params = {}) {
    return apiClient.get(`${BASE}/history`, { params });
  },

  /** Xóa lịch sử chat */
  deleteHistory(sessionId) {
    return apiClient.delete(`${BASE}/history`, {
      params: sessionId ? { session_id: sessionId } : {},
    });
  },

  /** Lấy danh sách FAQ */
  getFAQ(category) {
    return apiClient.get(`${BASE}/faq`, {
      params: category ? { category } : {},
    });
  },
};
