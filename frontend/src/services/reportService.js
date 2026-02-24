import api from "./apiClient";

export const getOverviewReport = () => api.get("/reports/overview");
export const getRevenueChart = () => api.get("/reports/revenue");
export const getAllReports = () => api.get("/reports");

// ============ Staff End-of-Day Report APIs ============

/**
 * Lấy báo cáo doanh thu theo khoảng thời gian
 * @param {Object} params - { from, to, staff_id, store_id }
 */
export const getDailyReport = (params) =>
  api.get("/api/reports/daily", { params });

/**
 * Lấy thống kê thực thu theo phương thức thanh toán
 * @param {Object} params - { from, to, staff_id, store_id }
 */
export const getActualRevenue = (params) =>
  api.get("/api/reports/actual-revenue", { params });

/**
 * Lấy danh sách sản phẩm đã bán
 * @param {Object} params - { from, to, staff_id, store_id, page, limit, sort_by, sort_order }
 */
export const getSoldProducts = (params) =>
  api.get("/api/reports/sold-products", { params });

/**
 * Lấy dữ liệu in báo cáo cuối ngày
 * @param {Object} params - { date, staff_id, store_id }
 */
export const getDailyPrintReport = (params) =>
  api.get("/api/reports/daily/print", { params });

/**
 * Lấy danh sách nhân viên để lọc báo cáo
 */
export const getStaffList = () => api.get("/api/reports/staff");
