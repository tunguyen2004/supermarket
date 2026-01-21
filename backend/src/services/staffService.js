const bcrypt = require('bcryptjs');
const db = require('../config/database');

/**
 * Danh sách nhân viên - GET /api/staff
 * Query params: ?limit=10&offset=0 (optional - để phân trang)
 */
const getStaffList = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Đảm bảo limit và offset là số
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const parsedOffset = parseInt(offset) || 0;

    // Lấy tổng số nhân viên
    const countResult = await db.query('SELECT COUNT(*) FROM dim_users');
    const total = parseInt(countResult.rows[0].count);

    // Lấy danh sách nhân viên với role_id và role_name
    const result = await db.query(
      `SELECT 
        u.id, u.username, u.email, u.full_name, u.phone, u.avatar_url, u.is_active, u.created_at,
        u.role_id, r.name as role_name
       FROM dim_users u
       LEFT JOIN subdim_roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parsedLimit, parsedOffset]
    );

    res.json({
      status: 'OK',
      message: 'Staff list retrieved successfully',
      data: result.rows,
      pagination: {
        total: total,
        limit: parsedLimit,
        offset: parsedOffset,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error('Get staff list error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get staff list',
      error: error.message,
    });
  }
};

/**
 * Thêm nhân viên mới - POST /api/staff
 * Body: { username, email, full_name, phone, password, role_id }
 */
const addStaff = async (req, res) => {
  try {
    const { username, email, full_name, phone, password, role_id = 2 } = req.body;

    // Kiểm tra input bắt buộc
    if (!username || !email || !full_name || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username, email, full_name and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password must be at least 6 characters',
      });
    }

    // Kiểm tra username đã tồn tại
    const usernameExists = await db.query(
      'SELECT id FROM dim_users WHERE username = $1',
      [username]
    );

    if (usernameExists.rows.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username already exists',
      });
    }

    // Kiểm tra email đã tồn tại
    const emailExists = await db.query(
      'SELECT id FROM dim_users WHERE email = $1',
      [email]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm nhân viên
    const result = await db.query(
      `INSERT INTO dim_users (username, email, full_name, phone, password_hash, role_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
       RETURNING id, username, email, full_name, phone, is_active, created_at`,
      [username, email, full_name, phone || null, hashedPassword, role_id]
    );

    res.status(201).json({
      status: 'OK',
      message: 'Staff added successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to add staff',
      error: error.message,
    });
  }
};

/**
 * Chi tiết nhân viên - GET /api/staff/:id
 */
const getStaffDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        u.id, u.username, u.email, u.full_name, u.phone, u.avatar_url, u.is_active, u.created_at,
        u.role_id, r.name as role_name
       FROM dim_users u
       LEFT JOIN subdim_roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Staff not found',
      });
    }

    res.json({
      status: 'OK',
      message: 'Staff detail retrieved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get staff detail error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get staff detail',
      error: error.message,
    });
  }
};

/**
 * Sửa thông tin nhân viên - PUT /api/staff/:id
 * Body: { full_name, phone, role_id }
 */
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, role_id } = req.body;

    if (!full_name) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Full name is required',
      });
    }

    // Kiểm tra role_id hợp lệ nếu được cung cấp
    if (role_id !== undefined) {
      if (typeof role_id !== 'number') {
        return res.status(400).json({
          status: 'ERROR',
          message: 'role_id must be a number',
        });
      }

      const roleExists = await db.query(
        'SELECT id FROM subdim_roles WHERE id = $1',
        [role_id]
      );

      if (roleExists.rows.length === 0) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Invalid role_id',
        });
      }
    }

    // Cập nhật nhân viên với hoặc không có role_id
    let result;
    if (role_id !== undefined) {
      result = await db.query(
        `UPDATE dim_users 
         SET full_name = $1, phone = $2, role_id = $3
         WHERE id = $4
         RETURNING id, username, email, full_name, phone, role_id, is_active`,
        [full_name, phone || null, role_id, id]
      );
    } else {
      result = await db.query(
        `UPDATE dim_users 
         SET full_name = $1, phone = $2
         WHERE id = $3
         RETURNING id, username, email, full_name, phone, role_id, is_active`,
        [full_name, phone || null, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Staff not found',
      });
    }

    // Lấy role_name để trả về
    const staffWithRole = await db.query(
      `SELECT 
        u.id, u.username, u.email, u.full_name, u.phone, u.role_id, u.is_active,
        r.name as role_name
       FROM dim_users u
       LEFT JOIN subdim_roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id]
    );

    res.json({
      status: 'OK',
      message: 'Staff updated successfully',
      data: staffWithRole.rows[0],
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update staff',
      error: error.message,
    });
  }
};

/**
 * Xóa nhân viên - DELETE /api/staff/:id
 */
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra nhân viên có tồn tại không
    const staffExists = await db.query(
      'SELECT id FROM dim_users WHERE id = $1',
      [id]
    );

    if (staffExists.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Staff not found',
      });
    }

    // Xóa nhân viên
    await db.query(
      'DELETE FROM dim_users WHERE id = $1',
      [id]
    );

    res.json({
      status: 'OK',
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete staff',
      error: error.message,
    });
  }
};

/**
 * Phân quyền nhân viên - PUT /api/staff/:id/role
 * Body: { role_id } - role_id từ subdim_roles table
 */
const updateStaffRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    // Kiểm tra role_id hợp lệ
    if (!role_id || typeof role_id !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid role_id is required (must be a number)',
      });
    }

    // Kiểm tra role_id có tồn tại không
    const roleExists = await db.query(
      'SELECT id FROM subdim_roles WHERE id = $1',
      [role_id]
    );

    if (roleExists.rows.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid role_id',
      });
    }

    const result = await db.query(
      `UPDATE dim_users 
       SET role_id = $1
       WHERE id = $2
       RETURNING id, username, email, full_name, role_id, is_active`,
      [role_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Staff not found',
      });
    }

    res.json({
      status: 'OK',
      message: 'Staff role updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update staff role error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update staff role',
      error: error.message,
    });
  }
};

module.exports = {
  getStaffList,
  addStaff,
  getStaffDetail,
  updateStaff,
  deleteStaff,
  updateStaffRole,
};
