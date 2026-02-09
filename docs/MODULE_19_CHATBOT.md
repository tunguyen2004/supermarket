# 🤖 Module 19: Chatbot AI — Trợ lý quản lý siêu thị MiniMart

> **Ngày hoàn thành:** 09/02/2026  
> **Phiên bản:** 1.0.0  
> **Loại:** Offline Chatbot (không cần API bên ngoài)

---

## 📋 Tổng quan

Module Chatbot AI hỗ trợ nhân viên và quản lý siêu thị tra cứu thông tin nhanh chóng thông qua giao diện chat. Chatbot sử dụng **keyword matching** (regex tiếng Việt) để phân loại ý định (intent) và truy vấn trực tiếp PostgreSQL để lấy dữ liệu thật.

### Đặc điểm chính
- ✅ **100% Offline** — không phụ thuộc API bên ngoài (Gemini, OpenAI, ...)
- ✅ **15 intents** truy vấn dữ liệu thực từ database
- ✅ **44 FAQ** hướng dẫn sử dụng, chia 15 danh mục
- ✅ **RBAC** — phân quyền theo vai trò (Staff bị chặn xem doanh thu/sổ quỹ)
- ✅ **Lưu lịch sử chat** theo session
- ✅ **Docker ready** — chạy `docker-compose up -d --build` là hoạt động

---

## 🏗️ Kiến trúc

```
Frontend (Vue 3)                    Backend (Express.js)               Database (PostgreSQL)
┌─────────────────┐    HTTP/REST   ┌──────────────────┐    SQL Query  ┌──────────────────┐
│ ChatbotWidget   │ ──────────────▶│ chatbotRoutes    │ ────────────▶│ 30+ tables       │
│ (draggable,     │    /api/chatbot│ chatbotService   │              │ fact_chat_history │
│  FAQ + Data)    │◀──────────────│ chatbotValidator │◀────────────│ dim_products...  │
└─────────────────┘    JSON        └──────────────────┘    Results    └──────────────────┘
                                          │
                                   ┌──────┴──────┐
                                   │chatbotFAQ   │
                                   │.json (44 Q) │
                                   └─────────────┘
```

---

## 📁 Files đã tạo/sửa

### Files mới (7 files)
| File | Mô tả |
|------|--------|
| `backend/src/services/chatbotService.js` | Service chính — intent detection, DB queries, RBAC, FAQ handler (859 dòng) |
| `backend/src/routes/chatbotRoutes.js` | 5 API endpoints + Swagger docs (197 dòng) |
| `backend/src/validators/chatbotValidator.js` | Joi validation schemas (57 dòng) |
| `backend/src/data/chatbotFAQ.json` | 44 câu FAQ, 15 danh mục (314 dòng) |
| `database/chatbot_migration.sql` | Script migration cho DB đã có sẵn (31 dòng) |
| `frontend/src/components/ChatbotWidget.vue` | Widget chat draggable + FAQ UI (847 dòng) |
| `frontend/src/services/chatbotService.js` | Axios client cho chatbot API (42 dòng) |

### Files đã sửa (10 files)
| File | Thay đổi |
|------|----------|
| `backend/src/routes/index.js` | Thêm import + mount chatbotRoutes |
| `backend/src/validators/index.js` | Thêm export chatbotValidator |
| `backend/src/config/swagger.js` | Giữ bản upstream sau merge |
| `backend/src/services/inventoryService.js` | Giữ bản upstream sau merge |
| `backend/package.json` | Thêm dependency `@google/generative-ai` |
| `database/schema.sql` | Thêm bảng `fact_chat_history` + indexes |
| `docker-compose.yml` | Thêm env `GEMINI_API_KEY` |
| `frontend/nginx.conf` | Thêm `Cache-Control: no-cache` headers |
| `frontend/src/App.vue` | Thêm `<ChatbotWidget />`, wrap single root div |

---

## 🔌 API Endpoints (5 endpoints)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| `POST` | `/api/chatbot/message` | Gửi tin nhắn, nhận phản hồi | ✅ JWT |
| `GET` | `/api/chatbot/suggestions` | Lấy gợi ý câu hỏi theo role | ✅ JWT |
| `GET` | `/api/chatbot/history` | Lấy lịch sử chat | ✅ JWT |
| `DELETE` | `/api/chatbot/history` | Xóa lịch sử chat | ✅ JWT |
| `GET` | `/api/chatbot/faq` | Lấy danh sách FAQ (44 câu) | ✅ JWT |

---

## 🎯 15 Intents — Truy vấn dữ liệu

| # | Intent | Mô tả | Câu hỏi mẫu | Quyền |
|---|--------|--------|-------------|-------|
| 1 | `greeting` | Chào hỏi | "Xin chào", "Hello" | Tất cả |
| 2 | `product_count` | Đếm sản phẩm | "Có bao nhiêu sản phẩm?" | Tất cả |
| 3 | `product_search` | Tìm sản phẩm | "Tìm sản phẩm sữa" | Tất cả |
| 4 | `product_info` | Chi tiết sản phẩm | "Thông tin sản phẩm Coca" | Tất cả |
| 5 | `product_low_stock` | SP sắp hết hàng | "Sản phẩm nào sắp hết hàng?" | Tất cả |
| 6 | `revenue_today` | Doanh thu hôm nay | "Doanh thu hôm nay bao nhiêu?" | 🔒 Admin/Manager |
| 7 | `revenue_overview` | Tổng quan doanh thu | "Tổng quan doanh thu" | 🔒 Admin/Manager |
| 8 | `top_products` | Top SP bán chạy | "Top 5 sản phẩm bán chạy" | 🔒 Admin/Manager |
| 9 | `top_customers` | Top KH mua nhiều | "Top khách hàng mua nhiều" | 🔒 Admin/Manager |
| 10 | `customer_count` | Đếm khách hàng | "Có bao nhiêu khách hàng?" | Tất cả |
| 11 | `customer_search` | Tìm khách hàng | "Tìm khách hàng Nguyễn" | Tất cả |
| 12 | `order_recent` | Đơn gần đây | "Đơn hàng gần đây" | Tất cả |
| 13 | `order_stats` | Thống kê đơn | "Thống kê đơn hàng" | Tất cả |
| 14 | `inventory_check` | Kiểm tra tồn kho | "Kiểm tra tồn kho" | Tất cả |
| 15 | `inventory_by_store` | Tồn kho theo CH | "Tồn kho tại cửa hàng Q1" | Tất cả |
| 16 | `store_list` | Danh sách cửa hàng | "Danh sách cửa hàng" | Tất cả |
| 17 | `transaction_summary` | Tổng kết sổ quỹ | "Tổng kết thu chi" | 🔒 Admin/Manager |
| 18 | `transaction_recent` | GD gần đây | "Giao dịch sổ quỹ gần đây" | 🔒 Admin/Manager |
| 19 | `faq` | Hướng dẫn sử dụng | "Làm sao thêm sản phẩm?" | Tất cả |

---

## 🔒 Phân quyền (RBAC)

| Vai trò | role_id | Quyền chatbot |
|---------|---------|---------------|
| Admin | 1 | Tất cả intents |
| Sales Staff | 2 | ❌ Bị chặn: doanh thu, sổ quỹ, top SP, top KH |
| Manager | 3 | Tất cả intents |

Khi Staff hỏi câu bị chặn → chatbot trả lời: *"🔒 Bạn không có quyền xem thông tin này. Chức năng này yêu cầu quyền Admin / Quản lý."*

---

## 📖 FAQ — 44 câu hỏi, 15 danh mục

| Danh mục | Số câu | Ví dụ |
|----------|--------|-------|
| Sản phẩm | 6 | Thêm SP, nhập CSV, sửa/xóa SP, upload ảnh, biến thể |
| Đơn hàng | 5 | Tạo đơn, trạng thái đơn, hủy đơn, phương thức thanh toán |
| Tồn kho | 4 | Kiểm tra tồn, min stock, nhập kho, chuyển kho |
| Sổ quỹ | 3 | Tạo phiếu thu/chi, duyệt phiếu, loại giao dịch |
| Khách hàng | 3 | Thêm KH, nhóm KH, tìm KH |
| Danh mục | 2 | Tạo danh mục, danh mục đa cấp |
| Bảng giá | 2 | Tạo bảng giá, gán SP vào bảng giá |
| Giảm giá | 2 | Tạo mã giảm giá, áp dụng giảm giá |
| Phân quyền | 2 | Vai trò hệ thống, quyền Staff |
| Cửa hàng | 2 | Thêm cửa hàng, quản lý chi nhánh |
| Nhà cung cấp | 2 | Thêm NCC, quản lý NCC |
| Báo cáo | 2 | Dashboard, xuất dữ liệu |
| Hệ thống | 5 | Đăng nhập, đổi mật khẩu, tech stack, API docs, avatar |
| POS | 2 | Bán hàng POS, in hóa đơn |
| Chatbot | 2 | Tính năng chatbot, chatbot trả lời gì |

---

## 🖥️ Giao diện Frontend

### ChatbotWidget.vue
- **Floating bubble** 68×68px, draggable, góc phải dưới
- **Chat window** 528×744px
- **2 nhóm chủ đề:**
  - 📊 **Truy vấn dữ liệu** (6 categories) — click → gửi `/message` → lấy data từ DB
  - 📖 **FAQ hướng dẫn** (15 categories) — click → hiển thị câu trả lời ngay (từ FAQ file)
- **Category browser:** click category → xem danh sách câu hỏi → click câu hỏi
- **Quick category bar:** xuất hiện sau khi đã chat, chọn nhanh câu hỏi
- **Input box:** gõ tự do bất kỳ câu hỏi nào
- **Typing indicator:** animation 3 dots khi chờ phản hồi
- **Intent tag:** hiển thị loại intent trên mỗi tin nhắn bot
- **Xóa lịch sử:** nút trash trên header

---

## 🗄️ Database

### Bảng `fact_chat_history`
```sql
CREATE TABLE fact_chat_history (
    id                 SERIAL PRIMARY KEY,
    user_id            INTEGER NOT NULL REFERENCES dim_users(id) ON DELETE CASCADE,
    session_id         VARCHAR(100) NOT NULL,
    user_message       TEXT NOT NULL,
    bot_reply          TEXT NOT NULL,
    intent             VARCHAR(50),
    response_type      VARCHAR(50),
    processing_time_ms INTEGER DEFAULT 0,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
- `idx_chat_history_user_id` — query theo user
- `idx_chat_history_session_id` — query theo phiên chat
- `idx_chat_history_created_at` — sắp xếp thời gian
- `idx_chat_history_intent` — thống kê intent

---

## 🐳 Docker

Không cần cấu hình thêm. Bảng `fact_chat_history` đã có trong `schema.sql`, tự tạo khi chạy:

```bash
docker-compose up -d --build
```

**File `chatbot_migration.sql`** chỉ dùng khi DB đã tồn tại trước đó (dùng `CREATE TABLE IF NOT EXISTS`).

---

## 🧪 Kiểm tra đã thực hiện

| Hạng mục | Kết quả |
|----------|---------|
| Docker build from scratch (xóa volume) | ✅ Pass |
| 36 tables created (schema.sql) | ✅ Pass |
| Seed data: 6 users, 49 SP, 150 đơn, 25 KH | ✅ Pass |
| 14/14 data intents nhận diện đúng | ✅ Pass |
| FAQ API trả 44 entries, 15 categories | ✅ Pass |
| RBAC: Staff bị chặn doanh thu/sổ quỹ | ✅ Pass |
| Frontend serve qua nginx (port 8080) | ✅ Pass |
| API proxy qua nginx `/api` → backend | ✅ Pass |
| Swagger docs load thành công | ✅ Pass |
