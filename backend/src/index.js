/**
 * ============================================================================
 *          SUPERMARKET MANAGEMENT SYSTEM - BACKEND SERVER
 * ============================================================================
 * API Server chính sử dụng Express.js
 * Cổng mặc định: 5000
 * Database: PostgreSQL
 *
 * Modules:
 * - Module 1: Authentication (Đăng nhập, Đăng xuất)
 * - Module 2: Staff Management (Quản lý Nhân viên)
 * - Module 3: Profile Management (Quản lý Profile cá nhân)
 * - Module 4: Product Management (Quản lý Sản phẩm)
 * - Module 5: Collection Management (Quản lý Danh mục)
 * - Module 6: Dashboard & Reports
 * - Module 7: Catalog (Price List)
 * - Module 8: Inventory Management
 * - Module 9: Order Management
 * ============================================================================
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

// ============ IMPORTS ============
const db = require("./config/database");
const router = require("./routes");
const { setupSwagger } = require("./config/swagger");
const { apiLimiter } = require("./middleware/rateLimiter");

// ============ INITIALIZE EXPRESS APP ============
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============ SECURITY MIDDLEWARE ============

/**
 * Helmet - Security Headers
 * Thiết lập các HTTP headers bảo mật
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Cho phép load ảnh từ uploads
  }),
);

/**
 * Compression Middleware
 * Nén response để giảm bandwidth
 */
app.use(compression());

// ============ GLOBAL MIDDLEWARE ============

/**
 * CORS Middleware
 * Cho phép client từ các nguồn khác nhau gọi API
 */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [
          "http://localhost:8080",
          "http://localhost:3000",
          "https://mini-supermarket-fe.vercel.app",
        ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * Body Parser Middleware
 * Phân tích request body dạng JSON
 */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/**
 * Static Files Middleware
 * Phục vụ các file tĩnh từ thư mục uploads
 */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/**
 * Request Logger Middleware
 * Ghi lại các request đến server
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * Rate Limiter Middleware
 * Giới hạn số lượng requests per IP
 */
app.use("/api/", apiLimiter);

// ============ SWAGGER DOCUMENTATION ============

/**
 * Swagger UI available at /api/docs
 */
setupSwagger(app);

// ============ HEALTH CHECK & ROOT ENDPOINTS ============

/**
 * @GET /
 * Endpoint gốc - Thông tin server
 */
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Supermarket Management System API",
    version: "1.0.0",
    status: "running",
    environment: NODE_ENV,
    documentation: "/api/docs",
    baseURL: `http://localhost:${PORT}/api`,
    modules: {
      "Module 1": "Authentication (/api/auth)",
      "Module 2": "Staff Management (/api/staff)",
      "Module 3": "Profile Management (/api/users)",
      "Module 4": "Product Management (/api/products)",
      "Module 5": "Collection Management (/api/collections)",
      "Module 6": "Dashboard & Reports (/api/dashboard)",
      "Module 7": "Catalog - Price List (/api/catalogs)",
      "Module 8": "Inventory Management (/api/inventories)",
      "Module 9": "Order Management (/api/orders)",
    },
    contact: "admin@supermarket.com",
  });
});

/**
 * @GET /api/health
 * Health check endpoint - Kiểm tra server có đang chạy không
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running ✅",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

/**
 * @GET /api/status
 * Trạng thái server chi tiết
 */
app.get("/api/status", async (req, res) => {
  try {
    // Kiểm tra kết nối database
    const dbTest = await db.query("SELECT NOW()");

    res.json({
      status: "OK",
      message: "System is healthy",
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: NODE_ENV,
      },
      database: {
        connected: true,
        tested: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(503).json({
      status: "ERROR",
      message: "Database connection failed",
      database: {
        connected: false,
        error: error.message,
      },
    });
  }
});

// ============ API ROUTES ============

/**
 * Sử dụng router chính từ routes/index.js
 * Chứa tất cả các routes cho 5 modules
 *
 * Route structure:
 * /api/auth/* - Authentication routes
 * /api/staff/* - Staff management routes
 * /api/users/* - Profile & User routes
 * /api/products/* - Product management routes
 * /api/collections/* - Collection/Category routes
 * /api/brands/* - Brand routes
 * /api/units/* - Unit routes
 */
app.use("/api", router);

// ============ UTILITY ENDPOINTS ============

/**
 * @GET /api/endpoints
 * Liệt kê tất cả các endpoints có sẵn
 */
app.get("/api/endpoints", (req, res) => {
  const endpoints = {
    Authentication: [
      { method: "POST", path: "/api/auth/login", description: "Đăng nhập" },
      {
        method: "GET",
        path: "/api/auth/me",
        description: "Lấy thông tin user",
      },
      { method: "POST", path: "/api/auth/logout", description: "Đăng xuất" },
      {
        method: "POST",
        path: "/api/auth/refresh",
        description: "Refresh token",
      },
    ],
    "Staff Management": [
      { method: "GET", path: "/api/staff", description: "Danh sách nhân viên" },
      { method: "POST", path: "/api/staff", description: "Thêm nhân viên" },
      {
        method: "GET",
        path: "/api/staff/:id",
        description: "Chi tiết nhân viên",
      },
      {
        method: "PUT",
        path: "/api/staff/:id",
        description: "Cập nhật nhân viên",
      },
      {
        method: "DELETE",
        path: "/api/staff/:id",
        description: "Xóa nhân viên",
      },
      {
        method: "PUT",
        path: "/api/staff/:id/role",
        description: "Phân quyền nhân viên",
      },
    ],
    "Profile Management": [
      { method: "GET", path: "/api/users/profile", description: "Xem profile" },
      {
        method: "PUT",
        path: "/api/users/profile",
        description: "Cập nhật profile",
      },
      {
        method: "PUT",
        path: "/api/users/change-password",
        description: "Đổi mật khẩu",
      },
      {
        method: "POST",
        path: "/api/users/avatar",
        description: "Upload avatar",
      },
    ],
    "Product Management": [
      {
        method: "GET",
        path: "/api/products",
        description: "Danh sách sản phẩm",
      },
      { method: "POST", path: "/api/products", description: "Thêm sản phẩm" },
      {
        method: "GET",
        path: "/api/products/:id",
        description: "Chi tiết sản phẩm",
      },
      {
        method: "PUT",
        path: "/api/products/:id",
        description: "Cập nhật sản phẩm",
      },
      {
        method: "DELETE",
        path: "/api/products/:id",
        description: "Xóa sản phẩm",
      },
      {
        method: "PATCH",
        path: "/api/products/bulk-status",
        description: "Cập nhật trạng thái hàng loạt",
      },
      {
        method: "GET",
        path: "/api/products/export",
        description: "Export CSV",
      },
      {
        method: "POST",
        path: "/api/products/import",
        description: "Import CSV",
      },
      {
        method: "GET",
        path: "/api/brands",
        description: "Danh sách thương hiệu",
      },
      {
        method: "GET",
        path: "/api/units",
        description: "Danh sách đơn vị tính",
      },
    ],
    "Collection Management": [
      {
        method: "GET",
        path: "/api/collections",
        description: "Danh sách danh mục",
      },
      {
        method: "POST",
        path: "/api/collections",
        description: "Thêm danh mục",
      },
      {
        method: "GET",
        path: "/api/collections/tree",
        description: "Cây danh mục",
      },
      {
        method: "GET",
        path: "/api/collections/:id",
        description: "Chi tiết danh mục",
      },
      {
        method: "PUT",
        path: "/api/collections/:id",
        description: "Cập nhật danh mục",
      },
      {
        method: "DELETE",
        path: "/api/collections/:id",
        description: "Xóa danh mục",
      },
    ],
    System: [
      { method: "GET", path: "/", description: "Root endpoint" },
      { method: "GET", path: "/api/health", description: "Health check" },
      {
        method: "GET",
        path: "/api/status",
        description: "Trạng thái hệ thống",
      },
      {
        method: "GET",
        path: "/api/endpoints",
        description: "Liệt kê endpoints",
      },
    ],
  };

  res.json({
    status: "OK",
    count: Object.values(endpoints).reduce((sum, arr) => sum + arr.length, 0),
    endpoints,
  });
});

// ============ ERROR HANDLING ============

/**
 * 404 Not Found Handler
 * Xử lý các route không được định nghĩa
 */
app.use((req, res) => {
  res.status(404).json({
    status: "ERROR",
    code: "ROUTE_NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
    suggestion: "Check API documentation or use GET /api/endpoints",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Global Error Handler
 * Xử lý tất cả lỗi từ middleware và routes
 */
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Lỗi validation
  if (err.statusCode === 400) {
    return res.status(400).json({
      status: "ERROR",
      code: "VALIDATION_ERROR",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Lỗi authentication
  if (err.statusCode === 401) {
    return res.status(401).json({
      status: "ERROR",
      code: "UNAUTHORIZED",
      message: "Unauthorized access",
      timestamp: new Date().toISOString(),
    });
  }

  // Lỗi database
  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      status: "ERROR",
      code: "DATABASE_CONNECTION_ERROR",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }

  // Lỗi chung
  res.status(err.statusCode || 500).json({
    status: "ERROR",
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// ============ DATABASE CONNECTION ============

/**
 * Kiểm tra kết nối database trước khi start server
 */
const initializeServer = async () => {
  try {
    // Test database connection
    await db.query("SELECT NOW()");
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error(
      "Server will continue running but database operations will fail",
    );
  }
};

// ============ START SERVER ============

const server = app.listen(PORT, async () => {
  await initializeServer();

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎉 Supermarket Management System - Backend Server       ║
║                                                            ║
║   🚀 Server running on port ${PORT}                       ║
║   📍 URL: http://localhost:${PORT}                         ║
║   🌍 API: http://localhost:${PORT}/api                     ║
║   📚 Docs: http://localhost:${PORT}/api/endpoints          ║
║   🔧 Environment: ${NODE_ENV}                             ║
║   ⏰ Started at: ${new Date().toISOString()}            ║
║                                                            ║
║   Available Modules:                                       ║
║   ✓ Module 1: Authentication                              ║
║   ✓ Module 2: Staff Management                            ║
║   ✓ Module 3: Profile Management                          ║
║   ✓ Module 4: Product Management                          ║
║   ✓ Module 5: Collection Management                       ║
║                                                            ║
║   📖 See API.md for full documentation                    ║
║   💡 Use GET /api/endpoints for endpoint list             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// ============ GRACEFUL SHUTDOWN ============

/**
 * Xử lý shutdown server một cách an toàn
 */
process.on("SIGTERM", () => {
  console.log("\n📛 SIGTERM received. Gracefully shutting down...");

  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });

  // Force shutdown sau 30 giây
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
});

process.on("SIGINT", () => {
  console.log("\n📛 SIGINT received. Gracefully shutting down...");

  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });

  // Force shutdown sau 30 giây
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
});

// ============ EXPORTS ============

module.exports = app;
