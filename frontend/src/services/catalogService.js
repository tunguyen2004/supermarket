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
export const getCatalogs = async () => {
  return Promise.resolve({ data: sampleCatalogs });
};

export const createCatalog = async (catalogData) => {
  const newCatalog = { ...catalogData, id: new Date().getTime() };
  sampleCatalogs.push(newCatalog);
  return Promise.resolve({ data: newCatalog });
};

export const updateCatalog = async (id, catalogData) => {
  const index = sampleCatalogs.findIndex((c) => c.id === id);
  if (index !== -1) {
    sampleCatalogs[index] = { ...sampleCatalogs[index], ...catalogData };
    return Promise.resolve({ data: sampleCatalogs[index] });
  }
  return Promise.reject(new Error("Catalog not found"));
};

export const deleteCatalog = async (id) => {
  const index = sampleCatalogs.findIndex((c) => c.id === id);
  if (index !== -1) {
    sampleCatalogs.splice(index, 1);
    return Promise.resolve();
  }
  return Promise.reject(new Error("Catalog not found"));
};
