import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "@/layouts/AuthLayout.vue"; // layout cho cÃ¡c trang Ä‘Äƒng nháº­p, Ä‘Äƒng kÃ½
import LoginPage from "@/views/LoginPage.vue"; // trang Ä‘Äƒng nháº­p
import RegisterPage from "@/views/RegisterPage.vue"; // trang Ä‘Äƒng kÃ½
import DashboardOverview from "@/views/DashboardOverview.vue"; // trang chá»§ dashboard
import AppLayout from "@/layouts/AppLayout.vue"; // layout cho cÃ¡c trang á»©ng dá»¥ng chÃ­nh
// import cÃ¡c trang Product
import Catalogs from "@/views/Product/Catalogs.vue"; // báº£ng giÃ¡
import ProductList from "@/views/Product/ProductList.vue"; // danh sÃ¡ch sáº£n pháº©m
import Collections from "@/views/Product/Collections.vue"; // danh má»¥c sáº£n pháº©m

// import cÃ¡c trang Inventory
import Inventories from "@/views/Inventory/Inventories.vue"; // danh sÃ¡ch tá»“n kho
import Purchase_orders from "@/views/Inventory/Purchase_orders.vue"; // Danh sÃ¡ch Ä‘Æ¡n Ä‘áº·t hÃ ng nháº­p
import Receive_inventories from "@/views/Inventory/Receive_inventories.vue"; // Danh sÃ¡ch Ä‘Æ¡n nháº­p hÃ ng
import Stock_transfers from "@/views/Inventory/Stock_transfers.vue"; // chuyá»ƒn kho
import Supplier_returns from "@/views/Inventory/Supplier_returns.vue"; // tráº£ hÃ ng nháº­p
import Suppliers from "@/views/Inventory/Suppliers.vue"; // nhÃ  cung cáº¥p

// import cÃ¡c trang Oders
import Orders from "@/views/Orders/Orders.vue"; // danh sÃ¡ch Ä‘Æ¡n hÃ ng
import Draft_Orders from "@/views/Orders/Draft_Orders.vue"; // Ä‘Æ¡n hÃ ng nhÃ¡p
import Order_Returns from "@/views/Orders/Order_Returns.vue"; // tráº£ hÃ ng
import Checkouts from "@/views/Orders/Checkouts.vue"; // Ä‘Æ¡n hÃ ng chÆ°a hoÃ n táº¥t
import OrderForm from "@/views/Orders/OrderForm.vue"; // form táº¡o vÃ  sá»­a Ä‘Æ¡n hÃ ng

// cÃ¡c trang sales
import Discounts from "@/views/Sales/Discounts.vue"; // giáº£m giÃ¡
import DiscountForm from "@/views/Sales/DiscountForm.vue";

// import cÃ¡c trang váº­n chuyá»ƒn
import Shipments from "@/views/Shipments/Shipments.vue"; // danh sÃ¡ch váº­n chuyá»ƒn
import Reports_Shipments from "@/views/Shipments/Reports_Shipments.vue"; // bÃ¡o cÃ¡o tá»•ng quan
import ShipmentForm from "@/views/Shipments/ShipmentForm.vue";

// import cÃ¡c ngÆ°á»i dÃ¹ng
import CustomerList from "@/views/Users/CustomerList.vue"; // danh sÃ¡ch khÃ¡ch hÃ ng
import Customer_groups from "@/views/Users/Customer_groups.vue"; // nhÃ³m khÃ¡ch hÃ ng

// import reports
import Reports_list from "@/views/Reports/Reports_list.vue"; // danh sÃ¡ch bÃ¡o cÃ¡o
import Reports from "@/views/Reports/Reports.vue"; // bÃ¡o cÃ¡o tá»•ng quan

// import trang sá»• quá»¹ fundbook
import Fundbook from "@/views/Cashbook/Fundbook.vue";

//import trang tk
import MyAccount from "@/views/Account/MyAccount.vue";

// import trang quáº£n lÃ½ nhÃ¢n viÃªn
import Staff from "@/views/Users/personnel-management/staff.vue";

// test role nhÃ¢n viÃªn
import staffRoutes from "./modules/staff.routes";

const routes = [
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true, roles: ["admin"] },
    children: [
      {
        path: "",
        redirect: { name: "DashboardOverview" },
      },
      {
        path: "dashboard",
        name: "DashboardOverview",
        component: DashboardOverview,
      },
      {
        path: "staff",
        name: "Staff",
        component: Staff,
      },
      {
        path: "products",
        name: "ProductCollections",
        component: ProductList,
      },
      {
        path: "catalogs",
        name: "Catalogs",
        component: Catalogs,
      },
      {
        path: "collections",
        name: "Collections",
        component: Collections,
      },
      {
        path: "inventories",
        name: "Inventories",
        component: Inventories,
      },
      {
        path: "purchase-orders",
        name: "PurchaseOrders",
        component: Purchase_orders,
      },
      {
        path: "receive-inventories",
        name: "ReceiveInventories",
        component: Receive_inventories,
      },
      {
        path: "stock-transfers",
        name: "StockTransfers",
        component: Stock_transfers,
      },
      {
        path: "supplier-returns",
        name: "SupplierReturns",
        component: Supplier_returns,
      },
      {
        path: "suppliers",
        name: "Suppliers",
        component: Suppliers,
      },
      {
        path: "orders",
        name: "Orders",
        component: Orders,
      },
      {
        path: "draft-orders",
        name: "DraftOrders",
        component: Draft_Orders,
      },
      {
        path: "order-returns",
        name: "OrderReturns",
        component: Order_Returns,
      },
      {
        path: "checkouts",
        name: "Checkouts",
        component: Checkouts,
      },
      {
        path: "orders/new",
        name: "NewOrder",
        component: OrderForm,
      },
      {
        path: "orders/edit/:id",
        name: "EditOrder",
        component: OrderForm,
      },
      {
        path: "discounts",
        name: "Discounts",
        component: Discounts,
      },
      {
        path: "discounts/new",
        name: "CreateDiscount",
        component: DiscountForm,
      },
      {
        path: "discounts/edit/:id",
        name: "EditDiscount",
        component: DiscountForm,
      },
      {
        path: "shipments",
        name: "Shipments",
        component: Shipments,
      },
      {
        path: "shipments/new",
        name: "CreateShipment",
        component: ShipmentForm,
      },
      {
        path: "reports",
        name: "Reports",
        component: Reports,
      },
      {
        path: "customer-list",
        name: "CustomerList",
        component: CustomerList,
      },
      {
        path: "customer-groups",
        name: "CustomerGroups",
        component: Customer_groups,
      },
      {
        path: "reports-list",
        name: "ReportsList",
        component: Reports_list,
      },
      {
        path: "reports-shipments",
        name: "Reports-Shipments",
        component: Reports_Shipments,
      },
      {
        path: "Fundbook",
        name: "Fundbook",
        component: Fundbook,
      },
      {
        path: "account",
        name: "MyAccount",
        component: MyAccount,
        meta: { requiresAuth: true, title: "TÃ i khoáº£n cÃ¡ nhÃ¢n" },
      },
      {
        path: "products/new",
        name: "CreateProduct",
        component: () => import("@/components/CreateProduct.vue"),
      },

      // ThÃªm cÃ¡c route con khÃ¡c náº¿u cáº§n
    ],
  },
  {
    path: "/login",
    component: AuthLayout,
    children: [
      {
        path: "",
        name: "Login",
        component: LoginPage,
      },
    ],
  },
  // má»Ÿ trang Ä‘Äƒng kÃ­ thÃ¬ bá» comment vÃ o dÃ²ng nÃ y
  // {
  //   path: "/register",
  //   component: AuthLayout,
  //   children: [
  //     {
  //       path: "",
  //       component: RegisterPage,
  //     },
  //   ],
  // },
  ...staffRoutes,
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Import Auth Store để check authentication
import { useAuthStore } from "@/store";

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
  const routeRoles = to.matched.flatMap((record) => record.meta?.roles || []);

  // Load user from storage nếu chưa có (trường hợp refresh page)
  if (!authStore.user && authStore.token) {
    authStore.loadUserFromStorage();
  }

  // Nếu đã authenticated và đang truy cập login page → redirect về dashboard
  if (to.name === "Login" && authStore.isAuthenticated) {
    return next({ name: "DashboardOverview" });
  }

  // Check authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }

  // Nếu không require auth → cho qua
  if (!requiresAuth) {
    return next();
  }

  // Check roles nếu route có yêu cầu roles cụ thể
  if (routeRoles.length > 0 && authStore.user) {
    // Map role_id sang role name để so sánh
    const roleMap = {
      1: "admin",
      2: "manager",
      3: "staff",
    };

    const userRole = roleMap[authStore.user.role_id];

    // Kiểm tra user có role phù hợp không
    if (!userRole || !routeRoles.includes(userRole)) {
      // Redirect based on role
      if (authStore.isAdmin) {
        return next({ name: "DashboardOverview" });
      }
      if (authStore.isStaff) {
        return next({ name: "StaffPOS" });
      }
      // Nếu không có role phù hợp → logout
      authStore.logout();
      return next({ name: "Login" });
    }
  }

  // Tất cả checks passed → cho qua
  next();
});

export default router;
