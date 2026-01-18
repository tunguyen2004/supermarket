export default [
    {
      path: "/staff",
      component: () => import("@/layouts/StaffLayout.vue"),
      meta: { requiresAuth: true, roles: ["staff"] },
      children: [
        { path: "", redirect: "/staff/pos" },
        { path: "pos", name: "StaffPOS", component: () => import("@/staff/views/Pos.vue") },
        { path: "end-of-day", name: "EndOfDay", component: () => import("@/staff/views/EndOfDay.vue") },
      ],
    },
  ];
  