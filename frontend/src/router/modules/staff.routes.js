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
      },
      {
        path: "end-of-day",
        name: "EndOfDay",
        component: () => import("@/staff/views/EndOfDay.vue"),
      },

      // tạo view sau:
      {
        path: "orders",
        name: "OrderLookup",
        component: () => import("@/staff/views/OrderLookup.vue"),
      },
      {
        path: "inventory-lookup",
        name: "InventoryLookup",
        component: () => import("@/staff/views/InventoryLookup.vue"),
      },
      {
        path: "inventory-lookup/:productId",
        name: "InventoryLookupDetail",
        component: () => import("@/staff/views/InventoryLookupDetail.vue"),
      },
    ],
  },
];
