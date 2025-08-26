const sampleProducts = [
    {
        id: 1,
        name: "Kem dưỡng ẩm Nivea Soft 200ml",
        imageUrl: "https://i.imgur.com/8mB3H6f.png",
        stock: 150,
        type: "Chăm sóc da mặt",
        brand: "Nivea",
        isActive: true,
    },
    {
        id: 2,
        name: "Mặt nạ ngủ Laneige",
        imageUrl: "https://i.imgur.com/sC7t1qg.png",
        stock: 88,
        type: "Chăm sóc da mặt",
        brand: "Laneige",
        isActive: true,
    },
    {
        id: 3,
        name: "Kem dưỡng V7 Toning Light",
        imageUrl: "https://i.imgur.com/L1dC6dC.png",
        stock: 0,
        type: "Chăm sóc da mặt",
        brand: "Dr.Jart+",
        isActive: false,
    },
];

export const getProducts = async () => {
    return Promise.resolve({ data: sampleProducts });
};

export const createProduct = async (productData) => {
    const newProduct = { ...productData, id: new Date().getTime() };
    sampleProducts.push(newProduct);
    return Promise.resolve({ data: newProduct });
};

export const updateProduct = async (id, productData) => {
    const index = sampleProducts.findIndex(p => p.id === id);
    if (index !== -1) {
        sampleProducts[index] = { ...sampleProducts[index], ...productData };
        return Promise.resolve({ data: sampleProducts[index] });
    }
    return Promise.reject(new Error('Product not found'));
};

export const deleteProduct = async (id) => {
    const index = sampleProducts.findIndex(p => p.id === id);
    if (index !== -1) {
        sampleProducts.splice(index, 1);
        return Promise.resolve();
    }
    return Promise.reject(new Error('Product not found'));
};