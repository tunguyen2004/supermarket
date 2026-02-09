/**
 * ============================================================================
 *                    MODULE 19: CHATBOT VALIDATOR
 * ============================================================================
 * Joi schemas cho chatbot API
 * ============================================================================
 */

const Joi = require('joi');

/**
 * Schema validate body POST /api/chatbot/message
 */
const sendMessageSchema = Joi.object({
  message: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Tin nhắn không được để trống',
      'string.min': 'Tin nhắn phải có ít nhất 1 ký tự',
      'string.max': 'Tin nhắn không được vượt quá 500 ký tự',
      'any.required': 'Tin nhắn là bắt buộc',
    }),
  session_id: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Session ID không được vượt quá 100 ký tự',
    }),
});

/**
 * Schema validate query GET /api/chatbot/history
 */
const chatHistoryQuerySchema = Joi.object({
  session_id: Joi.string().trim().max(100).optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .optional()
    .messages({
      'number.min': 'Limit phải lớn hơn 0',
      'number.max': 'Limit không được vượt quá 100',
    }),
});

module.exports = {
  chatbotValidator: {
    sendMessageSchema,
    chatHistoryQuerySchema,
  },
};
