/**
 * ============================================================================
 *                    FRONTEND SHIPMENT SERVICE
 * ============================================================================
 * Service để tương tác với API vận đơn từ backend
 * ============================================================================
 */

import apiClient from "@/config/axios";

class ShipmentService {
  /**
   * Lấy danh sách vận đơn với phân trang và filter
   * @param {Object} params - Query parameters
   * @param {string} params.search - Tìm kiếm theo mã vận đơn, tracking, tên/SĐT người nhận
   * @param {string} params.status - Trạng thái: pending, confirmed, picking, picked, in_transit, out_for_delivery, delivered, failed, returned, cancelled
   * @param {number} params.carrier_id - ID đơn vị vận chuyển
   * @param {number} params.store_id - ID cửa hàng
   * @param {string} params.from - Từ ngày (YYYY-MM-DD)
   * @param {string} params.to - Đến ngày (YYYY-MM-DD)
   * @param {number} params.page - Trang hiện tại (default: 1)
   * @param {number} params.limit - Số lượng mỗi trang (default: 20)
   * @param {string} params.sortBy - Sắp xếp theo (created_at, shipment_code, recipient_name, total_fee)
   * @param {string} params.order - Thứ tự sắp xếp (ASC, DESC)
   * @returns {Promise<Object>} Response với data và pagination
   */
  async getShipments(params = {}) {
    try {
      const response = await apiClient.get("/api/shipments", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching shipments:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy danh sách vận đơn",
      );
    }
  }

  /**
   * Lấy chi tiết vận đơn theo ID
   * @param {number} id - ID vận đơn
   * @returns {Promise<Object>} Chi tiết vận đơn kèm lịch sử tracking
   */
  async getShipmentById(id) {
    try {
      const response = await apiClient.get(`/api/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy thông tin vận đơn",
      );
    }
  }

  /**
   * Tạo vận đơn mới
   * @param {Object} shipmentData - Dữ liệu vận đơn
   * @returns {Promise<Object>} Vận đơn vừa tạo
   */
  async createShipment(shipmentData) {
    try {
      const response = await apiClient.post("/api/shipments", shipmentData);
      return response.data;
    } catch (error) {
      console.error("Error creating shipment:", error);
      throw new Error(error.response?.data?.message || "Lỗi khi tạo vận đơn");
    }
  }

  /**
   * Cập nhật vận đơn
   * @param {number} id - ID vận đơn
   * @param {Object} updateData - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Vận đơn đã cập nhật
   */
  async updateShipment(id, updateData) {
    try {
      const response = await apiClient.put(`/api/shipments/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating shipment:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi cập nhật vận đơn",
      );
    }
  }

  /**
   * Xóa/Hủy vận đơn
   * @param {number} id - ID vận đơn
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteShipment(id) {
    try {
      const response = await apiClient.delete(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting shipment:", error);
      throw new Error(error.response?.data?.message || "Lỗi khi xóa vận đơn");
    }
  }

  /**
   * Cập nhật trạng thái vận đơn
   * @param {number} id - ID vận đơn
   * @param {Object} statusData - Dữ liệu trạng thái
   * @param {string} statusData.status - Trạng thái mới
   * @param {string} statusData.location - Vị trí hiện tại (optional)
   * @param {string} statusData.description - Mô tả trạng thái (optional)
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async updateShipmentStatus(id, statusData) {
    try {
      const response = await apiClient.patch(
        `/api/shipments/${id}/status`,
        statusData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating shipment status:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái vận đơn",
      );
    }
  }

  /**
   * Lấy danh sách trạng thái vận đơn
   * @returns {Promise<Array>} Danh sách trạng thái
   */
  async getShipmentStatuses() {
    try {
      const response = await apiClient.get("/api/shipments/statuses");
      return response.data;
    } catch (error) {
      console.error("Error fetching shipment statuses:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy danh sách trạng thái",
      );
    }
  }

  /**
   * Lấy danh sách đơn vị vận chuyển
   * @returns {Promise<Array>} Danh sách đơn vị vận chuyển
   */
  async getCarriers() {
    try {
      const response = await apiClient.get("/api/shipments/carriers");
      return response.data;
    } catch (error) {
      console.error("Error fetching carriers:", error);
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi lấy danh sách đơn vị vận chuyển",
      );
    }
  }

  /**
   * Export vận đơn
   * @param {Object} params - Query parameters cho export
   * @param {string} format - Định dạng file: 'excel', 'csv', 'pdf'
   * @returns {Promise<Blob>} File blob để download
   */
  async exportShipments(params = {}, format = "excel") {
    try {
      const response = await apiClient.get("/api/shipments/export", {
        params: { ...params, format },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting shipments:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi xuất file vận đơn",
      );
    }
  }

  /**
   * Import vận đơn từ file
   * @param {File} file - File để import
   * @returns {Promise<Object>} Kết quả import
   */
  async importShipments(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/api/shipments/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error importing shipments:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi nhập file vận đơn",
      );
    }
  }
}

// Export instance
export default new ShipmentService();

// Helper functions để map dữ liệu
export const mapShipmentStatus = (statusCode) => {
  const statusMap = {
    pending: "Chờ lấy hàng",
    confirmed: "Đã xác nhận",
    picking: "Đang lấy hàng",
    picked: "Đã lấy hàng",
    in_transit: "Đang vận chuyển",
    out_for_delivery: "Đang giao hàng",
    delivered: "Giao thành công",
    failed: "Giao thất bại",
    returned: "Chuyển hoàn",
    cancelled: "Đã hủy",
  };
  return statusMap[statusCode] || statusCode;
};

export const mapStatusToTab = (status) => {
  const tabMap = {
    "Chờ lấy hàng": "pending",
    "Đã xác nhận": "pending",
    "Đang lấy hàng": "pending",
    "Đã lấy hàng": "shipping",
    "Đang vận chuyển": "shipping",
    "Đang giao hàng": "shipping",
    "Giao thành công": "delivered",
    "Giao thất bại": "returning",
    "Chuyển hoàn": "returning",
    "Đã hủy": "returning",
  };
  return tabMap[status] || "all";
};

export const getStatusType = (status) => {
  const statusTypeMap = {
    "Giao thành công": "success",
    "Đang giao hàng": "primary",
    "Đang vận chuyển": "primary",
    "Chờ lấy hàng": "warning",
    "Đã xác nhận": "info",
    "Chuyển hoàn": "danger",
    "Giao thất bại": "danger",
    "Đã hủy": "info",
  };
  return statusTypeMap[status] || "info";
};
