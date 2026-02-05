import axios from "@/config/axios";

class CustomerService {
  // Lấy danh sách khách hàng
  async getCustomers(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 25,
      };

      // Chỉ thêm search khi có giá trị
      if (params.search && params.search.trim()) {
        queryParams.search = params.search.trim();
      }

      // Chỉ thêm group_id khi có giá trị
      if (params.groupId) {
        queryParams.group_id = params.groupId;
      }

      const response = await axios.get("/api/customers", {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  // Lấy chi tiết khách hàng
  async getCustomerById(id) {
    try {
      const response = await axios.get(`/api/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer details:", error);
      throw error;
    }
  }

  // Xóa khách hàng
  async deleteCustomer(id) {
    try {
      const response = await axios.delete(`/api/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  // Tạo khách hàng mới
  async createCustomer(customerData) {
    try {
      const response = await axios.post("/api/customers", customerData);
      return response.data;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  // Cập nhật khách hàng
  async updateCustomer(id, customerData) {
    try {
      const response = await axios.put(`/api/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  // Lấy danh sách nhóm khách hàng
  async getCustomerGroups() {
    try {
      const response = await axios.get("/api/customer-groups");
      return response.data;
    } catch (error) {
      console.error("Error fetching customer groups:", error);
      throw error;
    }
  }

  // Lấy danh sách thành phố
  //   async getCities() {
  //     try {
  //       const response = await axios.get("/api/cities");
  //       return response.data;
  //     } catch (error) {
  //       console.error("Error fetching cities:", error);
  //       throw error;
  //     }
  //   }
}

export default new CustomerService();
