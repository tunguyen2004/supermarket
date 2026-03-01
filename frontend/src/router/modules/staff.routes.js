export default [
  {
    path: "/staff",
    component: () => import("@/staff/layouts/StaffLayout.vue"),
    meta: { requiresAuth: true, roles: ["staff"] },
    children: [
      { path: "", redirect: "/staff/pos" },

      {
        path: "pos",
        name: "StaffPOS",
        component: () => import("@/staff/views/Pos.vue"),
        meta: { title: "Bán hàng (POS)" },
      },
      {
        path: "end-of-day",
        name: "EndOfDay",
        component: () => import("@/staff/views/EndOfDay.vue"),
        meta: { title: "Báo cáo cuối ngày" },
      },

      // tạo view sau:
      {
        path: "orders",
        name: "OrderLookup",
        component: () => import("@/staff/views/OrderLookup.vue"),
        meta: { title: "Tra cứu đơn hàng" },
      },
      {
        path: "inventory-lookup",
        name: "InventoryLookup",
        component: () => import("@/staff/views/InventoryLookup.vue"),
        meta: { title: "Tra cứu tồn kho" },
      },
      {
        path: "inventory-lookup/:productId",
        name: "InventoryLookupDetail",
        component: () => import("@/staff/views/InventoryLookupDetail.vue"),
        meta: { title: "Chi tiết tồn kho" },
      },
      {
        path: "my-profile",
        name: "StaffProfile",
        component: () => import("@/staff/views/MyProfile.vue"),
        meta: { title: "Thông tin cá nhân" },
      },
    ],
  },
];
