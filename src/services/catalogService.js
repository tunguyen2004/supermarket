import apiClient from './apiClient';

// --- Collections Data ---
const sampleCollections = [
  { id: 1, code: "DM001", name: "Sữa, Bơ & Phô mai", productCount: 12 },
  { id: 2, code: "DM002", name: "Bánh kẹo các loại", productCount: 25 },
  { id: 3, code: "DM003", name: "Nước giải khát & Trà", productCount: 18 },
  { id: 4, code: "DM004", name: "Mì, Cháo, Phở ăn liền", productCount: 10 },
];

// --- Catalogs (Price Lists) Data ---
const sampleCatalogs = [
    { id: 1, code: "SP001", name: "Sữa tươi Vinamilk không đường 1L", price: 32000, unit: "Hộp" },
    { id: 2, code: "SP002", name: "Bánh quy kẹp kem Oreo Socola", price: 15000, unit: "Gói" },
    { id: 3, code: "SP003", name: "Nước giải khát Coca-Cola 1.5L", price: 18000, unit: "Chai" },
    { id: 4, code: "SP004", name: "Mì ăn liền Hảo Hảo tôm chua cay", price: 5000, unit: "Gói" },
    { id: 5, code: "SP005", name: "Dầu ăn thực vật Neptune Light 1L", price: 45000, unit: "Chai" },
];


// --- Collection API ---
export const getCollections = async () => {
  return Promise.resolve({ data: sampleCollections });
};

export const createCollection = async (collectionData) => {
  const newCollection = { 
    ...collectionData, 
    id: new Date().getTime(), 
    productCount: 0 
  };
  sampleCollections.push(newCollection);
  return Promise.resolve({ data: newCollection });
};

export const updateCollection = async (id, collectionData) => {
  const index = sampleCollections.findIndex(c => c.id === id);
  if (index !== -1) {
    sampleCollections[index] = { ...sampleCollections[index], ...collectionData };
    return Promise.resolve({ data: sampleCollections[index] });
  }
  return Promise.reject(new Error('Collection not found'));
};

export const deleteCollection = async (id) => {
  const index = sampleCollections.findIndex(c => c.id === id);
  if (index !== -1) {
    sampleCollections.splice(index, 1);
    return Promise.resolve();
  }
  return Promise.reject(new Error('Collection not found'));
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
    const index = sampleCatalogs.findIndex(c => c.id === id);
    if (index !== -1) {
        sampleCatalogs[index] = { ...sampleCatalogs[index], ...catalogData };
        return Promise.resolve({ data: sampleCatalogs[index] });
    }
    return Promise.reject(new Error('Catalog not found'));
};

export const deleteCatalog = async (id) => {
    const index = sampleCatalogs.findIndex(c => c.id === id);
    if (index !== -1) {
        sampleCatalogs.splice(index, 1);
        return Promise.resolve();
    }
    return Promise.reject(new Error('Catalog not found'));
};
