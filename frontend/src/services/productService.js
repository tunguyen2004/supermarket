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

// ========== PRODUCT IMAGES ==========

// Lấy danh sách ảnh của sản phẩm
export const getProductImages = async (productId) => {
  return apiClient.get(`/api/products/${productId}/images`);
};

// Upload ảnh chính sản phẩm
export const uploadProductImage = async (productId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiClient.post(`/api/products/${productId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Xóa ảnh chính sản phẩm
export const deleteProductImage = async (productId) => {
  return apiClient.delete(`/api/products/${productId}/image`);
};

// Upload gallery ảnh (tối đa 5 ảnh)
export const uploadProductGallery = async (productId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });
  return apiClient.post(`/api/products/${productId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Xóa ảnh trong gallery
export const deleteGalleryImage = async (productId, imageId) => {
  return apiClient.delete(`/api/products/${productId}/images/${imageId}`);
};

// Đặt ảnh làm ảnh chính
export const setPrimaryImage = async (productId, imageId) => {
  return apiClient.put(`/api/products/${productId}/images/${imageId}/primary`);
};

// Sắp xếp lại thứ tự ảnh
export const reorderImages = async (productId, imageIds) => {
  return apiClient.put(`/api/products/${productId}/images/reorder`, {
    imageIds,
  });
};
