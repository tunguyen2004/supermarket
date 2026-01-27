
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

export const getCatalogs = async (params) => {
  return apiClient.get("/api/catalogs", { params });
};

export const getCatalogById = async (id) => {
  return apiClient.get(`/api/catalogs/${id}`);
};

export const updateCatalog = async (id, data) => {
  return apiClient.put(`/api/catalogs/${id}`, data);
};

export const bulkUpdateCatalogs = async (data) => {
  return apiClient.patch("/api/catalogs/bulk-update", data);
};

export const exportCatalogs = async () => {
  return apiClient.get("/api/catalogs/export", { responseType: "blob" });
};

