export default [
  {
    path: "/staff",
    component: () => import("@/layouts/StaffLayout.vue"),
    meta: { requiresAuth: true, roles: ["staff"] },
    children: [
      { path: "", redirect: "/staff/pos" },
      {
        path: "end-of-day",
        name: "EndOfDay",
        component: () => import("@/staff/views/EndOfDay.vue"),
      },

      {
        path: "pos",
        name: "StaffPOS",
        component: () => import("@/staff/views/Pos.vue"),
      },
    ],
  },
];
