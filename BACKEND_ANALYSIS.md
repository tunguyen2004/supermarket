# 🔍 BACKEND ANALYSIS - PHÂN TÍCH & ĐỀ XUẤT CẢI TIẾN

**Ngày phân tích:** 31/01/2026  
**Phiên bản hiện tại:** 1.0.0

---

## 📊 TỔNG QUAN KIẾN TRÚC HIỆN TẠI

### Cấu trúc thư mục
```
backend/src/
├── index.js              # Entry point, Express app
├── config/
│   └── database.js       # PostgreSQL connection pool
├── middleware/
│   ├── auth.js           # JWT verification + blacklist check
│   ├── authorize.js      # RBAC (Role-Based Access Control)
│   └── upload.js         # Multer file upload config
├── routes/
│   └── index.js          # Tất cả routes trong 1 file (793 lines!)
└── services/
    ├── authService.js        # Login, logout, refresh
    ├── profileService.js     # Profile management
    ├── staffService.js       # Staff CRUD
    ├── productService.js     # Product CRUD + import/export
    ├── collectionService.js  # Category CRUD
    ├── catalogService.js     # Price list
    ├── inventoryService.js   # Stock management
    ├── productImageService.js# Product images
    ├── dashboardService.js   # Reports & stats
    └── orderService.js       # Order management
```

---

## ✅ ĐIỂM TỐT CỦA HỆ THỐNG

### 1. Authentication & Security
- ✅ **JWT Token** với expiry time 7 ngày
- ✅ **Token Blacklist** khi logout (in-memory với auto cleanup)
- ✅ **Account Lock** sau 5 lần đăng nhập sai
- ✅ **RBAC** với 3 roles: Admin (1), Staff (2), Manager (3)
- ✅ **Password hashing** với bcryptjs

### 2. Code Structure
- ✅ **Separation of Concerns**: Routes → Services → Database
- ✅ **Middleware pattern**: auth → authorize → handler
- ✅ **Error handling**: Global error handler với mã lỗi rõ ràng
- ✅ **Graceful shutdown**: Xử lý SIGTERM/SIGINT
- ✅ **Health check endpoints**: `/api/health`, `/api/status`

### 3. Database
- ✅ **Connection pooling** với pg Pool
- ✅ **Parameterized queries** chống SQL injection
- ✅ **Snowflake schema** với dim/fact tables

### 4. File Upload
- ✅ **Multer** cho file upload (CSV, images)
- ✅ **File validation**: extension + mimetype
- ✅ **Size limits**: 50MB CSV, 5MB images

### 5. API Design
- ✅ **RESTful** conventions
- ✅ **Pagination** cho list APIs
- ✅ **Filter & Search** capabilities
- ✅ **Consistent response format**

---

## ❌ VẤN ĐỀ & ĐỀ XUẤT CẢI TIẾN

### 🔴 VẤN ĐỀ 1: Routes tập trung 1 file (793 lines!)

**Hiện tại:** Tất cả routes nằm trong `routes/index.js`

**Vấn đề:**
- File quá lớn (793 dòng), khó maintain
- Khó tìm và debug
- Conflict khi nhiều người cùng edit

**Đề xuất:** Tách routes theo module

```
routes/
├── index.js              # Main router (import all)
├── authRoutes.js         # /api/auth/*
├── staffRoutes.js        # /api/staff/*
├── profileRoutes.js      # /api/users/*
├── productRoutes.js      # /api/products/*
├── collectionRoutes.js   # /api/collections/*
├── catalogRoutes.js      # /api/catalogs/*
├── inventoryRoutes.js    # /api/inventories/*
├── orderRoutes.js        # /api/orders/*
└── dashboardRoutes.js    # /api/dashboard/*
```

**Code mẫu `routes/index.js`:**
```javascript
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const staffRoutes = require('./staffRoutes');
const productRoutes = require('./productRoutes');
// ... other imports

router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/products', productRoutes);
// ... other routes

module.exports = router;
```

---

### 🔴 VẤN ĐỀ 2: Token Blacklist chỉ lưu In-Memory

**Hiện tại:** `tokenBlacklist = new Map()` trong authService.js

**Vấn đề:**
- Mất data khi restart server
- Không hoạt động khi scale nhiều instances (load balancer)
- Memory leak nếu không cleanup đúng

**Đề xuất:**
1. **Short-term:** Giữ in-memory nhưng thêm persistence
2. **Long-term:** Dùng Redis cho production

```javascript
// Option 1: Redis (recommended cho production)
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const addToBlacklist = async (token) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  await redis.setex(`blacklist:${token}`, ttl, '1');
};

const isTokenBlacklisted = async (token) => {
  return await redis.exists(`blacklist:${token}`);
};

// Option 2: Database table (simpler)
// Tạo bảng: token_blacklist(token, expires_at)
```

---

### 🔴 VẤN ĐỀ 3: Không có Request Validation Layer

**Hiện tại:** Validation nằm rải rác trong từng service

**Vấn đề:**
- Code duplicate
- Không consistent
- Khó maintain

**Đề xuất:** Dùng Joi hoặc express-validator

```javascript
// middleware/validators/authValidator.js
const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(1),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error.details[0].message,
    });
  }
  next();
};

// routes/authRoutes.js
router.post('/login', validateLogin, authService.login);
```

---

### ✅ VẤN ĐỀ 4: Không có Transaction cho multi-table operations [ĐÃ FIX]

**Đã sửa:** Thêm transaction support cho:
- `orderService.js` → `createOrder()` - Wrap trong BEGIN/COMMIT/ROLLBACK
- `productService.js` → `createProduct()` - Transaction cho product + variant
- `productService.js` → `importProducts()` - Transaction cho mỗi row import

**Cải tiến thêm:**
- Sử dụng batch insert cho order items (tối ưu performance)
- Thêm FOR UPDATE để tránh race condition khi gen order code
- Đảm bảo client.release() trong finally block

**Code pattern áp dụng:**
```javascript
const createOrder = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert order
    const orderResult = await client.query('INSERT INTO fact_orders...', [...]);
    
    // Insert items (batch insert)
    await client.query('INSERT INTO fact_order_items...VALUES...', [...]);
    
    await client.query('COMMIT');
    res.status(201).json({ success: true, ... });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

---

### ✅ VẤN ĐỀ 5: Thiếu Rate Limiting [ĐÃ FIX]

**Hiện tại:** Không có rate limiting

**Vấn đề:**
- Có thể bị brute force attack
- DDoS vulnerability
- Resource exhaustion

**Đề xuất:** Thêm express-rate-limit

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    status: 'ERROR',
    message: 'Too many requests, please try again later.',
  },
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: {
    status: 'ERROR',
    message: 'Too many login attempts, please try again later.',
  },
});

// index.js
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

---

### 🟡 VẤN ĐỀ 6: Logging chưa đầy đủ

**Hiện tại:** Chỉ có console.log cơ bản

**Đề xuất:** Dùng Winston logger

```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

---

### 🟡 VẤN ĐỀ 7: Thiếu API Versioning

**Hiện tại:** `/api/products`

**Đề xuất:** Thêm version prefix `/api/v1/products`

```javascript
// index.js
app.use('/api/v1', require('./routes'));
// Future: app.use('/api/v2', require('./routes/v2'));
```

---

### 🟢 VẤN ĐỀ 8: Response format không nhất quán

**Hiện tại:** 
- Một số: `{ success: true, data: {...} }`
- Một số: `{ status: 'OK', message: '...', data: {...} }`

**Đề xuất:** Tạo response helper thống nhất

```javascript
// utils/responseHelper.js
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: 'OK',
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const error = (res, message, statusCode = 400, code = 'ERROR') => {
  return res.status(statusCode).json({
    success: false,
    status: 'ERROR',
    code,
    message,
    timestamp: new Date().toISOString(),
  });
};

const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    status: 'OK',
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { success, error, paginated };
```

---

### 🟢 VẤN ĐỀ 9: Thiếu API Documentation (Swagger)

**Hiện tại:** Documentation trong file API.md (manual)

**Đề xuất:** Tích hợp Swagger/OpenAPI

```javascript
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Supermarket API',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:5000/api' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

// index.js
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

### 🟢 VẤN ĐỀ 10: Không có Unit Tests

**Hiện tại:** Không có tests

**Đề xuất:** Thêm Jest tests

```javascript
// __tests__/services/authService.test.js
const authService = require('../../src/services/authService');

describe('AuthService', () => {
  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const token = authService.generateToken(1, 'test@test.com', 1);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return false for non-blacklisted token', () => {
      const result = authService.isTokenBlacklisted('some-token');
      expect(result).toBe(false);
    });
  });
});
```

---

## 📊 TỔNG KẾT

### Priority Matrix

| Vấn đề | Mức độ | Effort | Impact | Status |
|--------|--------|--------|--------|--------|
| 1. Routes tập trung | 🔴 HIGH | Medium | High | ✅ DONE |
| 2. Token Blacklist in-memory | 🔴 HIGH | Low | High | ⏭️ SKIPPED |
| 3. Thiếu Validation Layer | 🔴 HIGH | Medium | High | ✅ DONE |
| 4. Thiếu Transaction | 🟡 MEDIUM | Medium | Medium | ⏳ TODO |
| 5. Thiếu Rate Limiting | 🟡 MEDIUM | Low | High | ✅ DONE |
| 6. Logging chưa đủ | 🟡 MEDIUM | Low | Medium | ⏭️ SKIPPED |
| 7. Thiếu API Versioning | 🟡 MEDIUM | Low | Low | ⏭️ SKIPPED |
| 8. Response format | 🟢 LOW | Low | Medium | ✅ DONE |
| 9. Thiếu Swagger | 🟢 LOW | Medium | Low | ✅ DONE |
| 10. Thiếu Tests | 🟢 LOW | High | High | ✅ DONE |

### Đề xuất thứ tự thực hiện

1. **Tuần 1:** Rate Limiting + Response Helper (quick wins)
2. **Tuần 2:** Tách Routes theo module
3. **Tuần 3:** Thêm Validation Layer (Joi)
4. **Tuần 4:** Transaction cho orders + inventory
5. **Tương lai:** Redis blacklist, Logging, Tests, Swagger

---

## 🔧 QUICK FIXES (Có thể làm ngay)

### 1. Thêm Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// index.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/', limiter);
```

### 2. Thêm Helmet (Security Headers)

```bash
npm install helmet
```

```javascript
// index.js
const helmet = require('helmet');
app.use(helmet());
```

### 3. Thêm Compression

```bash
npm install compression
```

```javascript
// index.js
const compression = require('compression');
app.use(compression());
```

---

## 📝 KẾT LUẬN

**Điểm mạnh:**
- Kiến trúc cơ bản tốt, dễ hiểu
- Security features cơ bản đầy đủ
- RESTful API design

**Cần cải thiện:**
- Tách routes để dễ maintain
- Thêm validation layer
- Chuẩn hóa response format
- Production-ready features (rate limit, logging, transactions)

**Tổng thể:** Backend đủ tốt cho giai đoạn development/MVP. Cần refactor và bổ sung features trước khi production.

---

**Cập nhật:** 31/01/2026
