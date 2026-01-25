import api from "./apiClient";

export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Profile Management APIs
export const getProfile = () => api.get("/api/users/profile");
export const updateProfile = (data) => api.put("/api/users/profile", data);
export const changePassword = (data) =>
  api.put("/api/users/change-password", data);
export const uploadAvatar = (formData) =>
  api.post("/api/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteAvatar = () => api.delete("/api/users/avatar");
