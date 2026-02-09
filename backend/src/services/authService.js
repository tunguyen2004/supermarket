const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_EXPIRY_DAYS = 7; // Token hết hạn sau 7 ngày

// ============================================================================
// TOKEN BLACKLIST (In-Memory)
// ============================================================================
// Lưu các token đã bị vô hiệu hóa (logout)
// Key: token, Value: thời gian hết hạn của token
const tokenBlacklist = new Map();

/**
 * Thêm token vào blacklist khi logout
 * @param {string} token - JWT token cần vô hiệu hóa
 */
const addToBlacklist = (token) => {
  try {
    // Decode token để lấy thời gian hết hạn
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Lưu token với thời gian hết hạn (exp là timestamp tính bằng giây)
      tokenBlacklist.set(token, decoded.exp * 1000);
    }
  } catch (error) {
    console.error("Error adding token to blacklist:", error);
  }
};

/**
 * Kiểm tra token có bị blacklist không
 * @param {string} token - JWT token cần kiểm tra
 * @returns {boolean} true nếu token bị blacklist
 */
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Dọn dẹp các token hết hạn khỏi blacklist (tiết kiệm memory)
 * Nên chạy định kỳ
 */
const cleanupBlacklist = () => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (expiry < now) {
      tokenBlacklist.delete(token);
    }
  }
};

// Tự động cleanup mỗi 1 giờ
setInterval(cleanupBlacklist, 60 * 60 * 1000);

// ============================================================================
// CONSTANTS
// ============================================================================

// Cấu hình bảo mật
const MAX_FAILED_ATTEMPTS = 5; // Số lần đăng nhập sai tối đa
const LOCK_TIME_MINUTES = 1; // Thời gian khóa tài khoản (phút)

/**
 * Tạo JWT token
 */
const generateToken = (userId, email, roleId) => {
  return jwt.sign(
    { id: userId, email: email, role_id: roleId },
    JWT_SECRET,
    { expiresIn: `${TOKEN_EXPIRY_DAYS}d` }, // Token hết hạn sau 7 ngày
  );
};

/**
 * Kiểm tra tài khoản có bị khóa không
 * @param {Object} user - Đối tượng user từ database
 * @returns {Object} { isLocked: boolean, remainingTime: number }
 */
const checkAccountLock = (user) => {
  if (!user.locked_until) {
    return { isLocked: false, remainingTime: 0 };
  }

  const now = new Date();
  const lockedUntil = new Date(user.locked_until);

  if (now < lockedUntil) {
    // Tài khoản còn bị khóa
    const remainingTime = Math.ceil((lockedUntil - now) / 1000); // Tính theo giây
    return { isLocked: true, remainingTime };
  }

  // Thời gian khóa đã hết
  return { isLocked: false, remainingTime: 0 };
};

/**
 * Cập nhật số lần đăng nhập sai
 * @param {number} userId - ID user
 * @param {number} failedAttempts - Số lần đăng nhập sai
 */
const updateFailedLoginAttempts = async (userId, failedAttempts) => {
  let lockedUntil = null;

  // Nếu vượt quá số lần cho phép, khóa tài khoản
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockDate = new Date();
    lockDate.setMinutes(lockDate.getMinutes() + LOCK_TIME_MINUTES);
    lockedUntil = lockDate;
  }

  await db.query(
    `UPDATE dim_users 
     SET failed_login_attempts = $1, locked_until = $2
     WHERE id = $3`,
    [failedAttempts, lockedUntil, userId],
  );
};

/**
 * Reset số lần đăng nhập sai (đăng nhập thành công)
 * @param {number} userId - ID user
 */
const resetFailedLoginAttempts = async (userId) => {
  await db.query(
    `UPDATE dim_users 
     SET failed_login_attempts = 0, locked_until = NULL
     WHERE id = $1`,
    [userId],
  );
};

/**
 * Đăng nhập - POST /api/auth/login
 * Body: { username, password }
 *
 * Tính năng:
 * - Kiểm tra tài khoản có bị khóa không (quá 5 lần sai mật khẩu)
 * - Ghi lại lần đăng nhập cuối cùng
 * - Reset số lần đăng nhập sai khi thành công
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra input
    if (!username || !password) {
      return res.status(400).json({
        status: "ERROR",
        message: "Username and password are required",
      });
    }

    // Tìm user theo username (kèm role_id, failed_login_attempts, store_id và store_name)
    const result = await db.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.password_hash, 
        u.full_name,
        u.role_id,
        u.store_id,
        u.is_active,
        u.failed_login_attempts,
        u.locked_until,
        r.name as role_name,
        s.name as store_name
      FROM dim_users u
      LEFT JOIN subdim_roles r ON u.role_id = r.id
      LEFT JOIN dim_stores s ON u.store_id = s.id
      WHERE u.username = $1`,
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "ERROR",
        message: "Username or password is incorrect",
      });
    }

    const user = result.rows[0];

    // ============ KIỂM TRA TÀI KHOẢN CÓ BỊ KHÓA KHÔNG ============
    const { isLocked, remainingTime } = checkAccountLock(user);
    if (isLocked) {
      return res.status(403).json({
        status: "ERROR",
        code: "ACCOUNT_LOCKED",
        message: `Account is locked due to too many failed login attempts. Please try again in ${remainingTime} seconds`,
        remainingTime,
        lockedUntil: user.locked_until,
      });
    }

    // ============ KIỂM TRA TÀI KHOẢN CÓ ĐƯỢC KÍCH HOẠT KHÔNG ============
    // Note: Tạm thời không kiểm tra is_active vì nó dùng để track online/offline
    // Sẽ kiểm tra lại nếu cần thêm tính năng "vô hiệu hóa tài khoản bởi Admin"

    // if (!user.is_active) {
    //   return res.status(403).json({
    //     status: 'ERROR',
    //     code: 'ACCOUNT_INACTIVE',
    //     message: 'Account has been deactivated. Please contact administrator',
    //   });
    // }

    // ============ KIỂM TRA MẬT KHẨU ============
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Mật khẩu sai - tăng số lần sai
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      await updateFailedLoginAttempts(user.id, newFailedAttempts);

      const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;

      if (remainingAttempts <= 0) {
        return res.status(403).json({
          status: "ERROR",
          code: "ACCOUNT_LOCKED",
          message: `Account has been locked for ${LOCK_TIME_MINUTES} minute(s) due to too many failed login attempts`,
          failedAttempts: newFailedAttempts,
          lockedUntil: new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000),
        });
      }

      return res.status(401).json({
        status: "ERROR",
        message: "Username or password is incorrect",
        failedAttempts: newFailedAttempts,
        remainingAttempts,
      });
    }

    // ============ ĐĂNG NHẬP THÀNH CÔNG ============

    // Reset số lần đăng nhập sai
    await resetFailedLoginAttempts(user.id);

    // Cập nhật is_active = true (người dùng đang online)
    // Cập nhật thời gian đăng nhập cuối cùng
    await db.query(
      `UPDATE dim_users 
       SET is_active = TRUE, last_login = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id],
    );

    // Tạo token (kèm role_id)
    const token = generateToken(user.id, user.email, user.role_id);

    res.json({
      status: "OK",
      message: "Login successful",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role_id: user.role_id,
        role_name: user.role_name || "User",
        store_id: user.store_id,
        store_name: user.store_name,
        is_active: true, // Luôn true vì vừa đăng nhập thành công
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Đăng xuất - POST /api/auth/logout
 *
 * Tính năng:
 * - Thêm token hiện tại vào blacklist (vô hiệu hóa)
 * - Cập nhật is_active thành false (người dùng đang offline)
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy token từ header
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.substring(7) : null;

    // Thêm token vào blacklist (vô hiệu hóa token)
    if (token) {
      addToBlacklist(token);
    }

    // Cập nhật is_active = false (người dùng đang offline)
    await db.query(
      `UPDATE dim_users 
       SET is_active = FALSE
       WHERE id = $1`,
      [userId],
    );

    res.json({
      status: "OK",
      message: "Logout successful",
      note: "Token has been invalidated and user status has been set to offline",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Logout failed",
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
        status: "ERROR",
        message: "Token is required",
      });
    }

    // Xác minh token (ngay cả khi hết hạn)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    // Kiểm tra xem tài khoản còn active không
    const userResult = await db.query(
      `SELECT is_active, locked_until FROM dim_users WHERE id = $1`,
      [decoded.id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // Kiểm tra tài khoản có active không
    if (!user.is_active) {
      return res.status(403).json({
        status: "ERROR",
        code: "ACCOUNT_INACTIVE",
        message: "Account is inactive",
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    const { isLocked, remainingTime } = checkAccountLock(user);
    if (isLocked) {
      return res.status(403).json({
        status: "ERROR",
        code: "ACCOUNT_LOCKED",
        message: `Account is locked. Please try again in ${remainingTime} seconds`,
        remainingTime,
      });
    }

    // Kiểm tra xem token có hết hạn không
    const isExpired = decoded.exp * 1000 < Date.now();

    // Tạo token mới (kèm role_id)
    const newToken = generateToken(decoded.id, decoded.email, decoded.role_id);

    res.json({
      status: "OK",
      message: "Token refreshed successfully",
      data: {
        token: newToken,
        wasExpired: isExpired,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: "ERROR",
      message: "Invalid token",
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
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.full_name,
        u.role_id,
        r.name as role_name,
        u.created_at 
      FROM dim_users u
      LEFT JOIN subdim_roles r ON u.role_id = r.id
      WHERE u.id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "User not found",
      });
    }

    res.json({
      status: "OK",
      message: "User info retrieved",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to get user info",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách role và quyền hạn - GET /api/auth/roles
 */
const getRoles = async (req, res) => {
  try {
    // Định nghĩa role permissions
    const rolePermissions = {
      1: {
        id: 1,
        code: "ADMIN",
        name: "Admin",
        description: "Toàn quyền quản lý hệ thống",
        permissions: [
          "manage_staff", // Quản lý nhân viên
          "manage_products", // Quản lý sản phẩm
          "manage_categories", // Quản lý danh mục
          "manage_orders", // Quản lý đơn hàng
          "view_reports", // Xem báo cáo
          "manage_settings", // Quản lý cài đặt
        ],
      },
      3: {
        id: 3,
        code: "MANAGER",
        name: "Manager",
        description: "Quản lý cấp trung",
        permissions: [
          "manage_products", // Quản lý sản phẩm
          "manage_categories", // Quản lý danh mục
          "manage_orders", // Quản lý tất cả đơn hàng
          "view_reports", // Xem báo cáo chi tiết
        ],
      },
      2: {
        id: 2,
        code: "STAFF",
        name: "Staff",
        description: "Nhân viên thường - quyền cơ bản",
        permissions: [
          "view_products", // Xem sản phẩm
          "view_categories", // Xem danh mục
          "create_orders", // Tạo đơn hàng
          "view_own_orders", // Xem đơn hàng của mình
        ],
      },
    };

    res.json({
      status: "OK",
      message: "Roles retrieved successfully",
      data: {
        roles: rolePermissions,
        roleList: Object.values(rolePermissions),
      },
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to get roles",
      error: error.message,
    });
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getRoles,
  isTokenBlacklisted,
};
