const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database
const db = require('./config/database');

// Import routes
const apiRoutes = require('./routes/index');

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running ✅',
  });
});

// ============ API ROUTES ============

// Sử dụng routes từ routes/index.js
app.use('/api', apiRoutes);

// ============ ROOT ENDPOINT ============

app.get('/', (req, res) => {
  res.json({
    message: 'Supermarket Management System API',
    version: '1.0.0',
    modules: [
      {
        name: 'Authentication',
        endpoints: [
          'POST /api/auth/login - Đăng nhập',
          'POST /api/auth/logout - Đăng xuất',
          'POST /api/auth/refresh - Refresh token',
          'GET /api/auth/me - Lấy thông tin user đang đăng nhập',
        ],
      },
      {
        name: 'Profile',
        endpoints: [
          'GET /api/users/profile - Xem thông tin cá nhân',
          'PUT /api/users/profile - Cập nhật thông tin cá nhân',
          'PUT /api/users/change-password - Đổi mật khẩu',
          'POST /api/users/avatar - Upload avatar',
        ],
      },
      {
        name: 'Staff Management',
        endpoints: [
          'GET /api/staff - Danh sách nhân viên',
          'POST /api/staff - Thêm nhân viên',
          'GET /api/staff/:id - Chi tiết nhân viên',
          'PUT /api/staff/:id - Sửa nhân viên',
          'DELETE /api/staff/:id - Xóa nhân viên',
          'PUT /api/staff/:id/role - Phân quyền nhân viên',
        ],
      },
    ],
  });
});


// ============ ERROR HANDLING ============

app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Route not found',
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║  🚀 Server running on port ${PORT}    ║
    ║  📍 http://localhost:${PORT}           ║
    ║  Environment: ${process.env.NODE_ENV} ║
    ║  📖 Docs: http://localhost:${PORT}    ║
    ╚═══════════════════════════════════════╝
  `);
});

