# frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


minimart/
├── 📁 frontend/                          # Thư mục gốc dự án
│   ├── 📄 package.json                   # Quản lý dependencies
│   ├── 📄 package-lock.json             # Lock file cho dependencies
│   ├── 📄 README.md                     # Hướng dẫn dự án
│   ├── 📄 vue.config.js                 # Cấu hình Vue CLI
│   ├── 📄 tailwind.config.js            # Cấu hình Tailwind CSS
│   ├── 📄 postcss.config.js             # Cấu hình PostCSS
│   ├── 📄 babel.config.js               # Cấu hình Babel
│   ├── 📄 jsconfig.json                 # Cấu hình JavaScript
│   │
│   ├── 📁 public/                       # Thư mục tĩnh
│   │   ├── 📄 index.html                # File HTML chính
│   │   └── 📄 favicon.ico               # Icon website
│   │
│   ├── 📁 src/                          # Mã nguồn chính
│   │   ├── 📄 main.js                   # Entry point ứng dụng
│   │   ├── 📄 App.vue                   # Component gốc
│   │   │
│   │   ├── 📁 assets/                   # Tài nguyên tĩnh
│   │   │   └── 📄 logo.png              # Logo ứng dụng
│   │   │
│   │   ├── 📁 components/               # Components dùng chung
│   │   │   ├── 📄 AppHeader.vue         # Header chính
│   │   │   ├── 📄 AppSidebar.vue        # Sidebar navigation
│   │   │   ├── 📄 EmptyState.vue        # Component trạng thái trống
│   │   │   └── 📄 ProductTable.vue      # Bảng sản phẩm
│   │   │
│   │   ├── 📁 composables/              # Vue Composition API
│   │   │   └── 📄 useAuth.js            # Hook xác thực
│   │   │
│   │   ├── 📁 layouts/                  # Layout templates
│   │   │   ├── 📄 AppLayout.vue         # Layout chính
│   │   │   ├── 📄 AuthLayout.vue        # Layout xác thực
│   │   │   └── 📄 Notdata.vue           # Layout không có dữ liệu
│   │   │
│   │   ├── 📁 router/                   # Định tuyến
│   │   │   └── 📄 index.js              # Cấu hình router
│   │   │
│   │   ├── 📁 services/                 # API services
│   │   │   ├── 📄 authService.js        # Service xác thực
│   │   │   ├── 📄 inventoryService.js   # Service kho hàng
│   │   │   ├── 📄 productService.js     # Service sản phẩm
│   │   │   └── 📄 userService.js        # Service người dùng
│   │   │
│   │   ├── 📁 store/                    # State management (Pinia)
│   │   │   └── 📄 index.js              # Cấu hình store
│   │   │
│   │   ├── 📁 style/                    # Stylesheets
│   │   │   ├── 📄 main.css              # CSS chính (Tailwind)
│   │   │   ├── 📄 responsive_style.css  # CSS responsive
│   │   │   └── 📄 tailwind.css          # Tailwind utilities
│   │   │
│   │   ├── 📁 utils/                    # Utility functions
│   │   │   └── 📄 formatCurrency.js     # Format tiền tệ
│   │   │
│   │   └── 📁 views/                    # Các trang chính
│   │       ├── 📄 DashboardOverview.vue # Trang tổng quan
│   │       ├── 📄 LoginPage.vue         # Trang đăng nhập
│   │       ├── 📄 RegisterPage.vue      # Trang đăng ký
│   │       ├── 📄 NotFoundPage.vue      # Trang 404
│   │       │
│   │       ├── 📁 Cashbook/             # Module sổ quỹ
│   │       │   └── 📄 Fundbook.vue      # Quản lý quỹ
│   │       │
│   │       ├── 📁 Inventory/            # Module kho hàng
│   │       │   ├── 📄 Inventories.vue   # Danh sách kho
│   │       │   ├── 📄 Purchase_orders.vue    # Đơn đặt hàng
│   │       │   ├── 📄 Receive_inventories.vue # Nhập kho
│   │       │   ├── 📄 Stock_transfers.vue     # Chuyển kho
│   │       │   ├── 📄 Supplier_returns.vue   # Trả hàng nhà cung cấp
│   │       │   └── 📄 Suppliers.vue     # Nhà cung cấp
│   │       │
│   │       ├── 📁 Orders/               # Module đơn hàng
│   │       │   ├── 📄 Checkouts.vue     # Thanh toán
│   │       │   ├── 📄 Draft_Orders.vue  # Đơn hàng nháp
│   │       │   ├── 📄 Order_Returns.vue # Trả hàng
│   │       │   └── 📄 Orders.vue        # Danh sách đơn hàng
│   │       │
│   │       ├── 📁 Product/              # Module sản phẩm
│   │       │   ├── 📄 Catalogs.vue      # Danh mục sản phẩm
│   │       │   ├── 📄 Collections.vue   # Bộ sưu tập
│   │       │   └── 📄 ProductList.vue   # Danh sách sản phẩm
│   │       │
│   │       ├── 📁 Reports/              # Module báo cáo
│   │       │   ├── 📄 Reports_list.vue  # Danh sách báo cáo
│   │       │   ├── 📄 Reports.vue       # Báo cáo tổng quan
│   │       │   └── 📄 RevenueLineChart.vue # Biểu đồ doanh thu
│   │       │
│   │       ├── 📁 Sales/                # Module bán hàng
│   │       │   └── 📄 Discounts.vue     # Quản lý giảm giá
│   │       │
│   │       ├── 📁 Shipments/            # Module vận chuyển
│   │       │   ├── 📄 Shipments.vue     # Quản lý vận chuyển
│   │       │   └── 📄 Reports_Shipments.vue # Báo cáo vận chuyển
│   │       │
│   │       └── 📁 Users/                # Module người dùng
│   │           ├── 📄 Customer_groups.vue # Nhóm khách hàng
│   │           └── 📄 CustomerList.vue   # Danh sách khách hàng
│   │
│   └── 📄 .gitignore                     # File loại trừ Git