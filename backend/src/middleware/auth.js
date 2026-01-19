const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Token not found or invalid format',
      });
    }

    // Tách token từ "Bearer <token>"
    const token = authHeader.substring(7);

    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Lưu user info vào req để dùng ở route handler
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

module.exports = { verifyToken };
