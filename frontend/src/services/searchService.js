import apiClient from "./apiClient";

/**
 * Global Search Service
 * Gọi API tìm kiếm toàn cục
 */
export const globalSearch = async (query, limit = 5) => {
  const response = await apiClient.get("/api/search", {
    params: { q: query, limit },
  });
  return response.data;
};

export default {
  globalSearch,
};
