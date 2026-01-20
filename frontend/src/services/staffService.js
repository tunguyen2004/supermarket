import apiClient from "./apiClient";

export default {
  // Lấy danh sách nhân viên
  getStaffs(params) {
    return apiClient.get("/api/staff", { params });
  },

  // Lấy chi tiết nhân viên
  getStaff(id) {
    return apiClient.get(`/api/staff/${id}`);
  },

  // Thêm nhân viên mới
  createStaff(data) {
    return apiClient.post("/api/staff", data);
  },

  // Cập nhật thông tin cơ bản
  updateStaff(id, data) {
    return apiClient.put(`/api/staff/${id}`, data);
  },

  // Cập nhật role
  updateStaffRole(id, roleId) {
    return apiClient.put(`/api/staff/${id}/role`, { role_id: roleId });
  },

  // Xóa nhân viên
  deleteStaff(id) {
    return apiClient.delete(`/api/staff/${id}`);
  },
};
