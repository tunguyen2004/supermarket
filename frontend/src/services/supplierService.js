import api from "./apiClient";

export const getSuppliers = () => api.get("/suppliers");
export const createSupplier = (data) => api.post("/suppliers", data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

export const returnToSupplier = (data) => api.post("/suppliers/returns", data);
