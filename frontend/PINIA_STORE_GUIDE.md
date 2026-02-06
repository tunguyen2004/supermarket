# 📚 Hướng dẫn sử dụng Pinia Store

## 📦 Các Store đã tạo

1. **authStore** - Quản lý authentication
2. **productStore** - Quản lý sản phẩm
3. **orderStore** - Quản lý đơn hàng
4. **customerStore** - Quản lý khách hàng
5. **inventoryStore** - Quản lý tồn kho

---

## 🚀 Cách sử dụng trong Component

### 1️⃣ Import Store vào Component

```vue
<script setup>
import { useAuthStore } from '@/store';
import { useProductStore } from '@/store';
import { useOrderStore } from '@/store';
import { storeToRefs } from 'pinia';

// Khởi tạo store
const authStore = useAuthStore();
const productStore = useProductStore();

// Lấy reactive state/getters (QUAN TRỌNG: dùng storeToRefs để giữ reactivity)
const { user, isAuthenticated, isAdmin } = storeToRefs(authStore);
const { products, loading, pagination } = storeToRefs(productStore);

// Actions có thể gọi trực tiếp (không cần storeToRefs)
const { login, logout } = authStore;
const { fetchProducts, createProduct } = productStore;
</script>
```

### 2️⃣ Sử dụng trong Template

```vue
<template>
  <div>
    <!-- Hiển thị loading -->
    <div v-if="loading">Đang tải...</div>
    
    <!-- Hiển thị error -->
    <div v-if="productStore.error" class="error">
      {{ productStore.error }}
    </div>
    
    <!-- Hiển thị data -->
    <div v-for="product in products" :key="product.id">
      {{ product.name }} - {{ product.price }}
    </div>
    
    <!-- Pagination -->
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.limit"
      :total="pagination.total"
      @current-change="handlePageChange"
    />
  </div>
</template>
```

---

## 📝 Ví dụ thực tế

### VD 1: Login Page với Auth Store

```vue
<!-- LoginPage.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

// Lấy state từ store
const { loading, error } = storeToRefs(authStore);

// Form data
const loginForm = ref({
  username: '',
  password: ''
});

// Handle login
const handleLogin = async () => {
  const result = await authStore.login(loginForm.value);
  
  if (result.success) {
    ElMessage.success('Đăng nhập thành công!');
    router.push('/dashboard');
  } else {
    ElMessage.error(result.error || 'Đăng nhập thất bại');
  }
};
</script>

<template>
  <el-form @submit.prevent="handleLogin">
    <el-form-item label="Username">
      <el-input v-model="loginForm.username" />
    </el-form-item>
    <el-form-item label="Password">
      <el-input v-model="loginForm.password" type="password" />
    </el-form-item>
    <el-button type="primary" native-type="submit" :loading="loading">
      Đăng nhập
    </el-button>
    <div v-if="error" class="error">{{ error }}</div>
  </el-form>
</template>
```

### VD 2: Product List với Product Store

```vue
<!-- ProductList.vue -->
<script setup>
import { onMounted } from 'vue';
import { useProductStore } from '@/store';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

const productStore = useProductStore();

// Lấy state từ store
const { products, loading, pagination, filters } = storeToRefs(productStore);

// Fetch products khi component mount
onMounted(async () => {
  await productStore.fetchProducts();
  await productStore.fetchBrands();
  await productStore.fetchUnits();
});

// Handle search
const handleSearch = async (searchText) => {
  productStore.setFilters({ search: searchText });
  await productStore.fetchProducts({ page: 1 });
};

// Handle filter change
const handleFilterChange = async (filterData) => {
  productStore.setFilters(filterData);
  await productStore.fetchProducts({ page: 1 });
};

// Handle page change
const handlePageChange = async (page) => {
  await productStore.fetchProducts({ page });
};

// Handle delete
const handleDelete = async (productId) => {
  const result = await productStore.deleteProduct(productId);
  
  if (result.success) {
    ElMessage.success('Xóa sản phẩm thành công!');
  } else {
    ElMessage.error(result.error || 'Xóa thất bại');
  }
};

// Handle bulk update status
const handleBulkActivate = async (productIds, isActive) => {
  const result = await productStore.bulkUpdateStatus(productIds, isActive);
  
  if (result.success) {
    ElMessage.success('Cập nhật trạng thái thành công!');
    await productStore.fetchProducts(); // Refresh list
  }
};
</script>

<template>
  <div class="product-list">
    <!-- Search -->
    <el-input
      :model-value="filters.search"
      @input="handleSearch"
      placeholder="Tìm kiếm..."
    />
    
    <!-- Filters -->
    <el-select
      :model-value="filters.brand_id"
      @change="handleFilterChange({ brand_id: $event })"
      placeholder="Chọn thương hiệu"
    >
      <el-option
        v-for="brand in productStore.brands"
        :key="brand.id"
        :label="brand.name"
        :value="brand.id"
      />
    </el-select>
    
    <!-- Table -->
    <el-table :data="products" v-loading="loading">
      <el-table-column prop="code" label="Mã" />
      <el-table-column prop="name" label="Tên" />
      <el-table-column prop="price" label="Giá" />
      <el-table-column label="Thao tác">
        <template #default="{ row }">
          <el-button @click="handleDelete(row.id)" type="danger" size="small">
            Xóa
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- Pagination -->
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.limit"
      :total="pagination.total"
      @current-change="handlePageChange"
    />
  </div>
</template>
```

### VD 3: Order Management với Order Store

```vue
<!-- Orders.vue -->
<script setup>
import { onMounted, computed } from 'vue';
import { useOrderStore } from '@/store';
import { storeToRefs } from 'pinia';

const orderStore = useOrderStore();
const { orders, loading, stats, pagination } = storeToRefs(orderStore);

// Computed getters
const pendingCount = computed(() => orderStore.pendingOrders.length);
const completedCount = computed(() => orderStore.completedOrders.length);

onMounted(async () => {
  await orderStore.fetchOrders();
  await orderStore.fetchOrderStats();
});

// Handle filter by status
const filterByStatus = async (status) => {
  orderStore.setFilters({ status });
  await orderStore.fetchOrders({ page: 1 });
};

// Handle cancel order
const handleCancelOrder = async (orderId, reason) => {
  const result = await orderStore.cancelOrder(orderId, reason);
  if (result.success) {
    ElMessage.success('Hủy đơn hàng thành công!');
  }
};
</script>

<template>
  <div>
    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <h3>Đơn chờ xử lý</h3>
        <p>{{ pendingCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Đơn hoàn thành</h3>
        <p>{{ completedCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Tổng doanh thu</h3>
        <p>{{ stats.total_revenue }}</p>
      </div>
    </div>
    
    <!-- Filters -->
    <el-button @click="filterByStatus('pending')">Đơn chờ</el-button>
    <el-button @click="filterByStatus('completed')">Hoàn thành</el-button>
    <el-button @click="filterByStatus('cancelled')">Đã hủy</el-button>
    
    <!-- Orders list -->
    <el-table :data="orders" v-loading="loading">
      <!-- ... columns ... -->
    </el-table>
  </div>
</template>
```

### VD 4: Customer Search với Customer Store

```vue
<!-- POS or Customer Selector -->
<script setup>
import { ref } from 'vue';
import { useCustomerStore } from '@/store';
import { storeToRefs } from 'pinia';

const customerStore = useCustomerStore();
const { customers, loading } = storeToRefs(customerStore);

const searchQuery = ref('');
const selectedCustomer = ref(null);

// Quick search for POS
const handleQuickSearch = async (query) => {
  const result = await customerStore.quickSearch(query);
  if (result.success) {
    // result.data là danh sách customers tìm được
    console.log('Found customers:', result.data);
  }
};

// Find by phone
const findByPhone = (phone) => {
  const customer = customerStore.findByPhone(phone);
  if (customer) {
    selectedCustomer.value = customer;
  }
};
</script>
```

### VD 5: Inventory Management với Inventory Store

```vue
<!-- Inventories.vue -->
<script setup>
import { onMounted } from 'vue';
import { useInventoryStore } from '@/store';
import { storeToRefs } from 'pinia';

const inventoryStore = useInventoryStore();
const { inventories, loading, lowStockCount, outOfStockCount } = storeToRefs(inventoryStore);

onMounted(async () => {
  await inventoryStore.fetchInventories();
  await inventoryStore.fetchStores();
});

// Handle receive inventory
const handleReceiveInventory = async (data) => {
  const result = await inventoryStore.receiveInventory(data);
  if (result.success) {
    ElMessage.success('Nhập kho thành công!');
    await inventoryStore.fetchInventories(); // Refresh
  }
};

// Handle stock transfer
const handleTransferStock = async (data) => {
  const result = await inventoryStore.transferStock(data);
  if (result.success) {
    ElMessage.success('Chuyển kho thành công!');
  }
};

// Filter low stock items
const showLowStock = () => {
  inventoryStore.setFilters({ status: 'low' });
  inventoryStore.fetchInventories();
};
</script>
```

---

## 🎯 Best Practices

### ✅ DO (Nên làm):

1. **Dùng `storeToRefs` cho state/getters**
   ```js
   const { user, loading } = storeToRefs(authStore);
   ```

2. **Gọi actions trực tiếp từ store**
   ```js
   await productStore.fetchProducts();
   ```

3. **Handle errors từ store**
   ```js
   const result = await productStore.createProduct(data);
   if (result.success) {
     // Success
   } else {
     // Show error: result.error
   }
   ```

4. **Load user từ localStorage khi app start**
   ```js
   // main.js
   const authStore = useAuthStore();
   authStore.loadUserFromStorage();
   ```

### ❌ DON'T (Không nên):

1. **Không destructure state trực tiếp** (mất reactivity)
   ```js
   // ❌ SAI
   const { user } = authStore;
   
   // ✅ ĐÚNG
   const { user } = storeToRefs(authStore);
   ```

2. **Không gọi API trực tiếp trong component** (nên dùng store)
   ```js
   // ❌ SAI
   const products = await productService.getProducts();
   
   // ✅ ĐÚNG
   await productStore.fetchProducts();
   ```

3. **Không modify state trực tiếp** (dùng actions)
   ```js
   // ❌ SAI
   productStore.products.push(newProduct);
   
   // ✅ ĐÚNG
   await productStore.createProduct(newProduct);
   ```

---

## 🔄 Router Guards với Auth Store

```js
// router/index.js
import { useAuthStore } from '@/store';

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Load user from storage nếu chưa có
  if (!authStore.user && authStore.token) {
    authStore.loadUserFromStorage();
  }
  
  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/403'); // Forbidden
  } else {
    next();
  }
});
```

---

## 📊 Kết hợp nhiều Store

```vue
<script setup>
import { onMounted } from 'vue';
import { useAuthStore, useProductStore, useOrderStore } from '@/store';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const productStore = useProductStore();
const orderStore = useOrderStore();

const { user } = storeToRefs(authStore);
const { products } = storeToRefs(productStore);
const { orders } = storeToRefs(orderStore);

// Fetch all data
onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    orderStore.fetchOrders(),
  ]);
});
</script>
```

---

## 🚀 Next Steps

1. **Refactor các component hiện có** để sử dụng store thay vì call API trực tiếp
2. **Thêm persistence** (optional): Dùng `pinia-plugin-persistedstate` để lưu state vào localStorage
3. **Thêm stores khác** nếu cần: discount, shipment, report, etc.
4. **Unit tests** cho stores

---

## 📦 Cài thêm Plugin (Optional)

### Pinia Persisted State - Tự động lưu state vào localStorage

```bash
npm install pinia-plugin-persistedstate
```

```js
// main.js
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
```

```js
// store/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({ ... }),
  
  // Tự động lưu state vào localStorage
  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['user', 'token', 'isAuthenticated'] // Chỉ lưu những field này
  },
});
```

---

✅ **Giờ bạn đã có hệ thống Pinia Store hoàn chỉnh!**
