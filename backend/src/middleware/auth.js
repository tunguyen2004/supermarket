const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header Authorization: Bearer <token>
 * Token phải chứa: { id, email, role_id, iat, exp }
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
    
    // Kiểm tra token có chứa thông tin cần thiết
    if (!decoded.id || !decoded.email || decoded.role_id === undefined) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid token: Missing required user information',
      });
    }
    
    // Lưu user info vào req để dùng ở route handler
    // req.user sẽ chứa: { id, email, role_id, iat, exp }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Token expired',
        error: error.message,
      });
    }
    return res.status(401).json({
      status: 'ERROR',
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

module.exports = { verifyToken };
