const bcrypt = require('bcryptjs');
const db = require('../config/database');

/**
 * Xem thông tin cá nhân - GET /api/users/profile
 * Cần header: Authorization: Bearer <token>
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
        u.id, u.username, u.email, u.full_name, u.phone, 
        u.date_of_birth, u.gender, u.address,
        u.role_id, r.name as role_name,
        u.is_active, u.created_at 
       FROM dim_users u
       LEFT JOIN subdim_roles r ON u.role_id = r.id
       WHERE u.id = $1`,
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
      message: 'Profile retrieved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get profile',
      error: error.message,
    });
  }
};

/**
 * Cập nhật thông tin cá nhân - PUT /api/users/profile
 * Cần header: Authorization: Bearer <token>
 * Body: { full_name, phone, date_of_birth, gender, address }
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, date_of_birth, gender, address } = req.body;

    // Kiểm tra input
    if (!full_name) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Full name is required',
      });
    }

    // Validate gender nếu được cung cấp
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Gender must be one of: male, female, other',
      });
    }

    const result = await db.query(
      `UPDATE dim_users 
       SET full_name = $1, phone = $2, date_of_birth = $3, gender = $4, address = $5
       WHERE id = $6
       RETURNING id, username, email, full_name, phone, date_of_birth, gender, address, is_active`,
      [full_name, phone || null, date_of_birth || null, gender || null, address || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    res.json({
      status: 'OK',
      message: 'Profile updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * Đổi mật khẩu - PUT /api/users/change-password
 * Cần header: Authorization: Bearer <token>
 * Body: { oldPassword, newPassword, confirmPassword }
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'All password fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'New password and confirm password do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'New password must be at least 6 characters',
      });
    }

    // Lấy user hiện tại
    const userResult = await db.query(
      'SELECT password_hash FROM dim_users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Kiểm tra mật khẩu cũ
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Old password is incorrect',
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    await db.query(
      'UPDATE dim_users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      status: 'OK',
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

/**
 * Upload avatar - POST /api/users/avatar
 * Cần header: Authorization: Bearer <token>
 * Body: FormData với file 'avatar'
 * 
 * Lưu ý: Chức năng này chưa implement upload file
 * Cần cài multer để xử lý file upload
 */
const uploadAvatar = async (req, res) => {
  try {
    return res.status(501).json({
      status: 'ERROR',
      message: 'Avatar upload feature not implemented yet',
      note: 'Cần cài đặt multer để hỗ trợ file upload',
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to upload avatar',
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
};
