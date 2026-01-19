const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Tạo JWT token
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email: email },
    JWT_SECRET,
    { expiresIn: '7d' } // Token hết hạn sau 7 ngày
  );
};

/**
 * Đăng nhập - POST /api/auth/login
 * Body: { username, password }
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra input
    if (!username || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username and password are required',
      });
    }

    // Tìm user theo username
    const result = await db.query(
      'SELECT id, username, email, password_hash, full_name FROM dim_users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Username or password is incorrect',
      });
    }

    const user = result.rows[0];

    // Kiểm tra password (so sánh với hash)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Username or password is incorrect',
      });
    }

    // Tạo token
    const token = generateToken(user.id, user.username);

    res.json({
      status: 'OK',
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        token: token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * Đăng xuất - POST /api/auth/logout
 * (Trong thực tế, client sẽ xóa token ở phía client)
 */
const logout = async (req, res) => {
  try {
    // Vì dùng JWT stateless, đăng xuất chỉ cần xóa token ở client
    res.json({
      status: 'OK',
      message: 'Logout successful. Please remove token on client side',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Logout failed',
      error: error.message,
    });
  }
};

/**
 * Refresh token - POST /api/auth/refresh
 * Body: { token }
 */
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Token is required',
      });
    }

    // Xác minh token (ngay cả khi hết hạn)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    // Kiểm tra xem token có hết hạn không
    const isExpired = decoded.exp * 1000 < Date.now();

    // Tạo token mới
    const newToken = generateToken(decoded.id, decoded.email);

    res.json({
      status: 'OK',
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        wasExpired: isExpired,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: 'ERROR',
      message: 'Invalid token',
      error: error.message,
    });
  }
};

/**
 * Lấy thông tin user đang đăng nhập - GET /api/auth/me
 * Cần header: Authorization: Bearer <token>
 */
const getMe = async (req, res) => {
  try {
    // req.user được set bởi middleware verifyToken
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, username, email, full_name, created_at FROM dim_users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    res.json({
      status: 'OK',
      message: 'User info retrieved',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get user info',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getMe,
};
