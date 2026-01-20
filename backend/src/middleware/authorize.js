/**
 * Middleware phân quyền (RBAC - Role-Based Access Control)
 * Kiểm tra role của user có quyền truy cập API hay không
 * 
 * ROLE_ID:
 * 1 = Admin (toàn quyền)
 * 2 = Staff (nhân viên thường - quyền cơ bản)
 * 3 = Manager (quản lý - quyền cao hơn staff)
 */

/**
 * Middleware kiểm tra user là Admin
 * Chỉ Admin (role_id = 1) mới có quyền truy cập
 */
const requireAdmin = (req, res, next) => {
  try {
    // Kiểm tra user đã được xác thực (từ verifyToken middleware)
    if (!req.user) {
      console.log('[AUTHORIZE] ❌ No user in request');
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized: No user information found',
      });
    }

    console.log('[AUTHORIZE] User role_id:', req.user.role_id, 'User email:', req.user.email);

    // Kiểm tra role
    if (req.user.role_id !== 1) {
      console.log('[AUTHORIZE] ❌ User is not Admin, role_id:', req.user.role_id);
      return res.status(403).json({
        status: 'ERROR',
        message: 'Forbidden: Admin access required',
        requiredRole: 'Admin',
        userRole: getRoleName(req.user.role_id),
      });
    }

    console.log('[AUTHORIZE] ✅ User is Admin, proceeding');
    next();
  } catch (error) {
    console.log('[AUTHORIZE] ❌ Error:', error.message);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Authorization check failed',
      error: error.message,
    });
  }
};

/**
 * Middleware kiểm tra user có role Manager hoặc Admin
 * Chỉ Manager (role_id = 3) hoặc Admin (role_id = 1) mới có quyền
 */
const requireManagerOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized: No user information found',
      });
    }

    // role_id = 1 (Admin) hoặc role_id = 3 (Manager)
    if (req.user.role_id !== 1 && req.user.role_id !== 3) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Forbidden: Manager or Admin access required',
        requiredRole: 'Manager or Admin',
        userRole: getRoleName(req.user.role_id),
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      message: 'Authorization check failed',
      error: error.message,
    });
  }
};

/**
 * Middleware kiểm tra user có role trong danh sách cho phép
 * @param {number[]} allowedRoles - Danh sách role_id được phép truy cập (VD: [1, 3])
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Unauthorized: No user information found',
        });
      }

      // Kiểm tra role có trong danh sách cho phép
      if (!allowedRoles.includes(req.user.role_id)) {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Forbidden: Insufficient permissions',
          requiredRoles: allowedRoles.map(getRoleName),
          userRole: getRoleName(req.user.role_id),
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'ERROR',
        message: 'Authorization check failed',
        error: error.message,
      });
    }
  };
};

/**
 * Hàm helper: Chuyển đổi role_id thành tên role
 * @param {number} roleId - ID của role
 * @returns {string} Tên role
 */
const getRoleName = (roleId) => {
  const roles = {
    1: 'Admin',
    2: 'Staff',
    3: 'Manager',
  };
  return roles[roleId] || 'Unknown';
};

/**
 * Hàm helper: Lấy mô tả quyền của từng role
 * @returns {Object} Object chứa mô tả quyền của từng role
 */
const getRolePermissions = () => {
  return {
    1: {
      name: 'Admin',
      description: 'Toàn quyền',
      permissions: [
        'Quản lý nhân viên (thêm, sửa, xóa, phân quyền)',
        'Quản lý sản phẩm',
        'Quản lý đơn hàng',
        'Quản lý kho hàng',
        'Xem báo cáo',
        'Quản lý cài đặt hệ thống',
      ],
    },
    2: {
      name: 'Staff',
      description: 'Nhân viên thường - quyền cơ bản',
      permissions: [
        'Xem danh sách sản phẩm',
        'Tạo đơn hàng',
        'Xem đơn hàng của mình',
        'Xem thông tin cá nhân',
        'Đổi mật khẩu',
      ],
    },
    3: {
      name: 'Manager',
      description: 'Quản lý - quyền cao hơn staff',
      permissions: [
        'Xem tất cả nhân viên',
        'Quản lý sản phẩm',
        'Quản lý tất cả đơn hàng',
        'Quản lý kho hàng',
        'Xem báo cáo chi tiết',
      ],
    },
  };
};

module.exports = {
  requireAdmin,
  requireManagerOrAdmin,
  requireRole,
  getRoleName,
  getRolePermissions,
};
