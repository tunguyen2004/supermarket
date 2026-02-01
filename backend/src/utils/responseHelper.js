/**
 * Response Helper - Chuẩn hóa format response cho toàn bộ API
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to return
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: 'OK',
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} code - Error code
 * @param {*} errors - Detailed errors (for validation)
 */
const error = (res, message = 'Có lỗi xảy ra', statusCode = 400, code = 'ERROR', errors = null) => {
  const response = {
    success: false,
    status: 'ERROR',
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info { total, page, limit, totalPages }
 * @param {string} message - Success message
 */
const paginated = (res, data, pagination, message = 'Thành công') => {
  return res.status(200).json({
    success: true,
    status: 'OK',
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page || Math.floor(pagination.offset / pagination.limit) + 1,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.offset + data.length < pagination.total,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Created response (201)
 */
const created = (res, data, message = 'Tạo mới thành công') => {
  return success(res, data, message, 201);
};

/**
 * No Content response (204)
 */
const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Unauthorized response (401)
 */
const unauthorized = (res, message = 'Không có quyền truy cập') => {
  return error(res, message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden response (403)
 */
const forbidden = (res, message = 'Bạn không có quyền thực hiện hành động này') => {
  return error(res, message, 403, 'FORBIDDEN');
};

/**
 * Not Found response (404)
 */
const notFound = (res, message = 'Không tìm thấy dữ liệu') => {
  return error(res, message, 404, 'NOT_FOUND');
};

/**
 * Validation Error response (422)
 */
const validationError = (res, errors, message = 'Dữ liệu không hợp lệ') => {
  return error(res, message, 422, 'VALIDATION_ERROR', errors);
};

/**
 * Internal Server Error response (500)
 */
const serverError = (res, message = 'Lỗi hệ thống') => {
  return error(res, message, 500, 'INTERNAL_SERVER_ERROR');
};

module.exports = {
  success,
  error,
  paginated,
  created,
  noContent,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  serverError,
};
