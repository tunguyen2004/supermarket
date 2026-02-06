# Hướng Dẫn Refactor Frontend Sử Dụng Pinia Stores

## ✅ Completed Components

### 1. Authentication Flow
- [x] **LoginPage.vue** - Sử dụng `useAuthStore`
- [x] **AppHeader.vue** - Sử dụng `useAuthStore` cho logout
- [x] **router/index.js** - Auth guards với `useAuthStore`
- [x] **main.js** - Load user từ storage khi khởi động

### 2. Dashboard
- [x] **DashboardOverview.vue** - Sử dụng `useAuthStore` để hiển thị user info
- [x] **dashboard.js store** - Tạo store quản lý dashboard data (có thể refactor thêm)

## 📋 Stores Đã Tạo

### 1. Auth Store (`store/auth.js`)
```javascript
// Import
import { useAuthStore } from '@/store';

// Trong component
const authStore = useAuthStore();
const { user, isAuthenticated, isAdmin } = storeToRefs(authStore);

// Actions
await authStore.login(credentials);
authStore.logout();
await authStore.refreshAccessToken();
```

**Features:**
- ✅ Login/Logout
- ✅ Refresh token
- ✅ Load user từ localStorage
- ✅ Role getters (isAdmin, isManager, isStaff)

### 2. Product Store (`store/product.js`)
```javascript
import { useProductStore } from '@/store';

const productStore = useProductStore();
const { products, loading, activeProducts } = storeToRefs(productStore);

// Actions
await productStore.fetchProducts({ page: 1, limit: 10 });
await productStore.createProduct(productData);
await productStore.updateProduct(id, productData);
await productStore.deleteProduct(id);
await productStore.bulkUpdateStatus(ids, status);
```

**Features:**
- ✅ CRUD operations
- ✅ Filters (search, status, brand, category)
- ✅ Pagination
- ✅ Bulk operations
- ✅ Getters (activeProducts, inactiveProducts, getProductById)

### 3. Order Store (`store/order.js`)
```javascript
import { useOrderStore } from '@/store';

const orderStore = useOrderStore();
const { orders, orderStats, pendingOrders } = storeToRefs(orderStore);

// Actions
await orderStore.fetchOrders({ status: 'pending' });
await orderStore.createOrder(orderData);
await orderStore.updateOrder(id, updates);
await orderStore.cancelOrder(id);
await orderStore.fetchOrderStats();
```

**Features:**
- ✅ CRUD operations
- ✅ Order statistics
- ✅ Status filters
- ✅ Getters (pendingOrders, completedOrders, cancelledOrders)

### 4. Customer Store (`store/customer.js`)
```javascript
import { useCustomerStore } from '@/store';

const customerStore = useCustomerStore();
const { customers, loading } = storeToRefs(customerStore);

// Actions
await customerStore.fetchCustomers();
await customerStore.createCustomer(customerData);
await customerStore.quickSearch(query); // POS search
const customer = await customerStore.findByPhone(phone);
```

**Features:**
- ✅ CRUD operations
- ✅ Quick search for POS
- ✅ Phone lookup
- ✅ Customer groups support

### 5. Inventory Store (`store/inventory.js`)
```javascript
import { useInventoryStore } from '@/store';

const inventoryStore = useInventoryStore();
const { inventories, lowStockItems, outOfStockCount } = storeToRefs(inventoryStore);

// Actions
await inventoryStore.fetchInventories();
await inventoryStore.adjustInventory(data);
await inventoryStore.receiveInventory(data);
await inventoryStore.transferStock(data);
await inventoryStore.returnToSupplier(data);
```

**Features:**
- ✅ Stock management
- ✅ Receive inventory
- ✅ Transfer between warehouses
- ✅ Return to supplier
- ✅ Low stock alerts

### 6. Discount Store (`store/discount.js`) ⭐ NEW
```javascript
import { useDiscountStore } from '@/store';

const discountStore = useDiscountStore();
const { discounts, activeDiscounts, expiringSoonDiscounts } = storeToRefs(discountStore);

// Actions
await discountStore.fetchDiscounts();
await discountStore.createDiscount(discountData);
await discountStore.validateDiscount(code, orderData);
```

**Features:**
- ✅ CRUD operations
- ✅ Validate discount codes
- ✅ Active/expired filters
- ✅ Expiring soon alerts

### 7. Dashboard Store (`store/dashboard.js`) ⭐ NEW
```javascript
import { useDashboardStore } from '@/store';

const dashboardStore = useDashboardStore();
const { overview, stats, recentOrders, topProducts } = storeToRefs(dashboardStore);

// Actions
await dashboardStore.fetchAllData();
await dashboardStore.fetchOverview();
await dashboardStore.fetchStats({ group_by: 'day' });
```

**Features:**
- ✅ Overview stats (revenue, orders, customers)
- ✅ Sales statistics with charts
- ✅ Recent orders
- ✅ Top products/customers
- ✅ Low stock alerts

### 8. POS Store (`store/pos.js`) ⭐ NEW
```javascript
import { usePosStore } from '@/store';

const posStore = usePosStore();
const { currentOrder, cartItemCount, subtotal, total } = storeToRefs(posStore);

// Actions
posStore.addToCart(product, quantity);
posStore.updateQuantity(variantId, quantity);
posStore.removeFromCart(variantId);
posStore.setCustomer(customer);
posStore.setDiscount(discount);
await posStore.createOrder(paymentData);
await posStore.searchProducts(query);
await posStore.searchByBarcode(barcode);

// Tab management
posStore.addNewOrder();
posStore.selectOrder(tabId);
posStore.closeOrder(tabId);
```

**Features:**
- ✅ Multi-tab order management
- ✅ Cart operations (add, update, remove)
- ✅ Product search & barcode scan
- ✅ Customer selection
- ✅ Discount application
- ✅ Checkout & payment
- ✅ Auto-calculated totals

## 🔄 Components Cần Refactor

### High Priority (Sử dụng nhiều)
- [ ] **staff/views/Pos.vue** - Refactor to use `usePosStore`
  - Replace local state với `posStore.currentOrder`
  - Use `posStore.addToCart()` thay vì local function
  - Use computed getters từ store

- [ ] **components/ProductManagement/*.vue** - Use `useProductStore`
  - ProductList, ProductForm, ProductDetail
  - Replace direct API calls với store actions

- [ ] **components/OrderManagement/*.vue** - Use `useOrderStore`
  - OrderList, OrderDetail, OrderForm

- [ ] **components/CustomerManagement/*.vue** - Use `useCustomerStore`
  - CustomerList, CustomerForm, CustomerDetail

### Medium Priority
- [ ] **staff/components/CustomerPicker.vue** - Use `useCustomerStore.quickSearch()`
- [ ] **staff/components/PaymentDrawer.vue** - Use `usePosStore` getters
- [ ] **components/InventoryManagement/*.vue** - Use `useInventoryStore`
- [ ] **components/DiscountManagement/*.vue** - Use `useDiscountStore`

### Low Priority (Optional optimization)
- [ ] **AppHeader.vue** - Complete refactor (thêm profile từ store)
- [ ] **DashboardOverview.vue** - Complete refactor để dùng `useDashboardStore`

## 📝 Refactoring Checklist

Khi refactor một component:

1. **Import store**
   ```javascript
   import { useXxxStore } from '@/store';
   import { storeToRefs } from 'pinia';
   ```

2. **Setup store trong component**
   ```javascript
   setup() {
     const xxxStore = useXxxStore();
     const { data, loading } = storeToRefs(xxxStore);
   }
   ```

3. **Thay thế API calls**
   - ❌ `const res = await xxxService.getData()`
   - ✅ `await xxxStore.fetchData()`

4. **Sử dụng computed từ store**
   - ❌ `const active = computed(() => items.value.filter(i => i.status === 'active'))`
   - ✅ `const { activeItems } = storeToRefs(xxxStore)`

5. **Error handling**
   ```javascript
   const result = await xxxStore.createItem(data);
   if (result.success) {
     ElMessage.success('Thành công!');
   } else {
     ElMessage.error(result.error);
   }
   ```

## 🎯 Benefits of Using Pinia

1. **Centralized State** - Dữ liệu được cache, không cần fetch lại nhiều lần
2. **Type Safety** - IntelliSense support tốt hơn
3. **DevTools** - Debug dễ dàng với Pinia DevTools
4. **Reusability** - Logic có thể tái sử dụng ở nhiều component
5. **Performance** - Chỉ re-render khi data thực sự thay đổi

## 📚 Best Practices

1. **Luôn dùng `storeToRefs`** khi destructure reactive state:
   ```javascript
   // ❌ Wrong - loses reactivity
   const { user } = authStore;
   
   // ✅ Correct
   const { user } = storeToRefs(authStore);
   ```

2. **Actions không cần `storeToRefs`**:
   ```javascript
   // ✅ Correct
   const { login, logout } = authStore;
   ```

3. **Error handling trong actions**:
   - Actions trả về `{ success: boolean, data?: any, error?: string }`
   - Component xử lý error và hiển thị message

4. **Loading state**:
   - Sử dụng `store.loading` để hiển thị skeleton/spinner
   - Không cần quản lý loading state trong component

5. **Cache strategy**:
   - Fetch data khi component mount
   - Sử dụng cached data từ store
   - Refresh khi cần (user action, interval)

## 🚀 Next Steps

1. ✅ Đã hoàn thành: Auth flow, Router guards, Dashboard (partial)
2. 🔄 Tiếp theo: Refactor Pos.vue để sử dụng usePosStore
3. 📋 Sau đó: Products, Orders, Customers, Inventory management
4. 🎨 Optional: Thêm Pinia plugin cho state persistence

## 📞 Support

Nếu cần hỗ trợ refactor component nào, hãy cho tôi biết!
