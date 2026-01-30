import apiClient from "./apiClient";

// --- Collection API ---

// Lấy danh sách danh mục (có phân trang & tìm kiếm)
export const getCollections = async (params) => {
  // params: { page, limit, search, parent_id }
  return apiClient.get("/api/collections", { params });
};

// Lấy cây danh mục
export const getCollectionTree = async () => {
  return apiClient.get("/api/collections/tree");
};

// Lấy chi tiết danh mục
export const getCollectionById = async (id) => {
  return apiClient.get(`/api/collections/${id}`);
};

// Tạo danh mục mới
export const createCollection = async (collectionData) => {
  return apiClient.post("/api/collections", collectionData);
};

// Cập nhật danh mục
export const updateCollection = async (id, collectionData) => {
  return apiClient.put(`/api/collections/${id}`, collectionData);
};

// Xóa danh mục
export const deleteCollection = async (id) => {
  return apiClient.delete(`/api/collections/${id}`);
};

// --- Catalog (Price List) API ---

// Lấy danh sách bảng giá (có phân trang & tìm kiếm)
export const getCatalogs = async (params) => {
  // params: { page, limit, search }
  return apiClient.get("/api/catalogs", { params });
};

// Lấy chi tiết bảng giá
export const getCatalogById = async (id) => {
  return apiClient.get(`/api/catalogs/${id}`);
};

// Cập nhật giá sản phẩm
export const updateCatalog = async (id, catalogData) => {
  // catalogData: { cost_price, selling_price, is_active }
  return apiClient.put(`/api/catalogs/${id}`, catalogData);
};

// Cập nhật giá hàng loạt
export const bulkUpdateCatalog = async (data) => {
  // data: { variant_ids, price_change_type, price_change_value }
  return apiClient.patch("/api/catalogs/bulk-update", data);
};

// Xuất bảng giá CSV
export const exportCatalog = async () => {
  return apiClient.get("/api/catalogs/export", {
    responseType: "blob",
  });
};
