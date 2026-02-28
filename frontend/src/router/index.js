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
        meta: { title: "Tổng quan" },
      },
      {
        path: "staff",
        name: "Staff",
        component: Staff,
        meta: { title: "Quản lý nhân viên" },
      },
      {
        path: "products",
        name: "ProductCollections",
        component: ProductList,
        meta: { title: "Danh sách sản phẩm" },
      },
      {
        path: "catalogs",
        name: "Catalogs",
        component: Catalogs,
        meta: { title: "Bảng giá" },
      },
      {
        path: "collections",
        name: "Collections",
        component: Collections,
        meta: { title: "Danh mục sản phẩm" },
      },
      {
        path: "inventories",
        name: "Inventories",
        component: Inventories,
        meta: { title: "Tồn kho" },
      },
      {
        path: "purchase-orders",
        name: "PurchaseOrders",
        component: Purchase_orders,
        meta: { title: "Đơn đặt hàng nhập" },
      },
      {
        path: "receive-inventories",
        name: "ReceiveInventories",
        component: Receive_inventories,
        meta: { title: "Nhập hàng" },
      },
      {
        path: "stock-transfers",
        name: "StockTransfers",
        component: Stock_transfers,
        meta: { title: "Chuyển kho" },
      },
      {
        path: "supplier-returns",
        name: "SupplierReturns",
        component: Supplier_returns,
        meta: { title: "Trả hàng nhập" },
      },
      {
        path: "suppliers",
        name: "Suppliers",
        component: Suppliers,
        meta: { title: "Nhà cung cấp" },
      },
      {
        path: "orders",
        name: "Orders",
        component: Orders,
        meta: { title: "Đơn hàng" },
      },
      {
        path: "draft-orders",
        name: "DraftOrders",
        component: Draft_Orders,
        meta: { title: "Đơn hàng nháp" },
      },
      {
        path: "order-returns",
        name: "OrderReturns",
        component: Order_Returns,
        meta: { title: "Trả hàng" },
      },
      {
        path: "checkouts",
        name: "Checkouts",
        component: Checkouts,
        meta: { title: "Đơn hàng chưa hoàn tất" },
      },
      {
        path: "orders/new",
        name: "NewOrder",
        component: OrderForm,
        meta: { title: "Tạo đơn hàng" },
      },
      {
        path: "orders/edit/:id",
        name: "EditOrder",
        component: OrderForm,
        meta: { title: "Chỉnh sửa đơn hàng" },
      },
      {
        path: "discounts",
        name: "Discounts",
        component: Discounts,
        meta: { title: "Giảm giá" },
      },
      {
        path: "discounts/new",
        name: "CreateDiscount",
        component: DiscountForm,
        meta: { title: "Tạo chương trình giảm giá" },
      },
      {
        path: "discounts/edit/:id",
        name: "EditDiscount",
        component: DiscountForm,
        meta: { title: "Chỉnh sửa giảm giá" },
      },
      {
        path: "shipments",
        name: "Shipments",
        component: Shipments,
        meta: { title: "Vận chuyển" },
      },
      {
        path: "shipments/new",
        name: "CreateShipment",
        component: ShipmentForm,
        meta: { title: "Tạo vận đơn" },
      },
      {
        path: "reports",
        name: "Reports",
        component: Reports,
        meta: { title: "Báo cáo tổng quan" },
      },
      {
        path: "customer-list",
        name: "CustomerList",
        component: CustomerList,
        meta: { title: "Danh sách khách hàng" },
      },
      {
        path: "customer-groups",
        name: "CustomerGroups",
        component: Customer_groups,
        meta: { title: "Nhóm khách hàng" },
      },
      {
        path: "reports-list",
        name: "ReportsList",
        component: Reports_list,
        meta: { title: "Danh sách báo cáo" },
      },
      {
        path: "reports-shipments",
        name: "Reports-Shipments",
        component: Reports_Shipments,
        meta: { title: "Báo cáo vận chuyển" },
      },
      {
        path: "Fundbook",
        name: "Fundbook",
        component: Fundbook,
        meta: { title: "Sổ quỹ" },
      },
      {
        path: "account",
        name: "MyAccount",
        component: MyAccount,
        meta: { requiresAuth: true, title: "Tài khoản cá nhân" },
      },
      {
        path: "products/new",
        name: "CreateProduct",
        component: () => import("@/components/CreateProduct.vue"),
        meta: { title: "Tạo sản phẩm" },
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
        meta: { title: "Đăng nhập" },
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
    meta: { title: "Không tìm thấy trang" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // Set document title
  const title =
    to.meta?.title ||
    to.matched
      .slice()
      .reverse()
      .find((r) => r.meta?.title)?.meta?.title;
  document.title = title ? `${title} | Mini Supermarket` : "Mini Supermarket";

  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
  const routeRoles = to.matched.flatMap((record) => record.meta?.roles || []);
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = storedUser.role;

  if (requiresAuth && !token) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }

  if (routeRoles.length && !routeRoles.includes(userRole)) {
    if (userRole === "admin") {
      return next({ name: "DashboardOverview" });
    }
    if (userRole === "staff") {
      return next({ name: "StaffPOS" });
    }
    return next({ name: "Login" });
  }

  next();
});

export default router;
