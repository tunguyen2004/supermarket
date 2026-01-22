import apiClient from "./apiClient";
console.log("productService loaded");

// Lấy danh sách sản phẩm
// params: { page, limit, search, ... }
export const getProducts = async (params) => {
  return apiClient.get("/api/products", { params });
};

// Lấy chi tiết sản phẩm
export const getProductById = async (id) => {
  return apiClient.get(`/api/products/${id}`);
};

// Thêm sản phẩm mới
export const createProduct = async (productData) => {
  return apiClient.post("/api/products", productData);
};

// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  return apiClient.put(`/api/products/${id}`, productData);
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  return apiClient.delete(`/api/products/${id}`);
};

// Bật/tắt trạng thái hàng loạt
export const bulkUpdateStatus = async (productIds, isActive) => {
  return apiClient.patch("/api/products/bulk-status", {
    product_ids: productIds,
    is_active: isActive,
  });
};

// Export CSV
export const exportProducts = async () => {
  return apiClient.get("/api/products/export", {
    responseType: "blob", // Quan trọng để tải file
  });
};

// Import CSV
export const importProducts = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post("/api/products/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Lấy danh sách thương hiệu
export const getBrands = async () => {
  return apiClient.get("/api/brands");
};

// Lấy danh sách danh mục (dùng cho dropdown)
export const getCategories = async () => {
  // Lấy tất cả (hoặc số lượng lớn) để hiển thị trong dropdown
  return apiClient.get("/api/collections", { params: { limit: 100 } });
};

// Lấy danh sách đơn vị tính
export const getUnits = async () => {
  return apiClient.get("/api/units");
};
