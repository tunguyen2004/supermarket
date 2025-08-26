import api from "./apiClient";

export const getInventories = () => api.get("/inventories");
export const createInventory = (data) => api.post("/inventories", data);
export const updateInventory = (id, data) =>
  api.put(`/inventories/${id}`, data);
export const deleteInventory = (id) => api.delete(`/inventories/${id}`);

export const receiveInventory = (data) =>
  api.post("/inventories/receive", data);
export const transferStock = (data) => api.post("/inventories/transfer", data);
export const returnToSupplier = (data) => api.post("/inventories/return", data);
