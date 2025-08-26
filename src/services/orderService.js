import apiClient from './apiClient';

export const getOrders = async () => {
  // return apiClient.get('/orders');
  return []; // Return empty for now
};

export const getOrderById = async (id) => {
  // return apiClient.get(`/orders/${id}`);
  return {}; // Return empty for now
};

export const addOrder = async (orderData) => {
  console.log('Adding order:', orderData);
  // For now, we just simulate a successful response
  return Promise.resolve({ data: { ...orderData, id: new Date().getTime() } });
  // Uncomment the line below to use a real API endpoint
  // return apiClient.post('/orders', orderData);
};

export const updateOrder = async (id, orderData) => {
  console.log(`Updating order ${id}:`, orderData);
  return Promise.resolve({ data: orderData });
  // return apiClient.put(`/orders/${id}`, orderData);
};

export const deleteOrder = async (id) => {
  console.log(`Deleting order ${id}`);
  return Promise.resolve();
  // return apiClient.delete(`/orders/${id}`);
};
