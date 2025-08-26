import api from "./apiClient";

export const getOverviewReport = () => api.get("/reports/overview");
export const getRevenueChart = () => api.get("/reports/revenue");
export const getAllReports = () => api.get("/reports");
