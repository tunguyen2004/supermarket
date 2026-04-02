const MOCK_DB_STORAGE_KEY = "SUPERMARKET_MOCK_DB_V1";

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSvgDataUri(label, background, foreground, width = 320, height = 220) {
  const safeLabel = String(label || "").slice(0, 18);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" rx="22" fill="${background}"/><rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="18" fill="rgba(255,255,255,0.55)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="${foreground}">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createAvatar(name, background, foreground) {
  const initials = String(name || "MM")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return createSvgDataUri(initials, background, foreground, 120, 120);
}

function createDateFactory() {
  const now = new Date();
  return {
    iso(daysAgo = 0, hours = 9, minutes = 0) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    },
    day(daysAgo = 0) {
      return this.iso(daysAgo).slice(0, 10);
    },
  };
}

function getVariant(products, variantId) {
  for (const product of products) {
    const variant = (product.variants || []).find((item) => item.id === variantId);
    if (variant) return { product, variant };
  }
  return { product: null, variant: null };
}

function buildProducts() {
  return [
    { id: 101, code: "SP001", name: "Sua tuoi Vinamilk 1L", brand_id: 1, collection_id: 1, unit_id: 1, description: "Mat hang ban chay.", is_active: true, image_url: createSvgDataUri("Vinamilk 1L", "#DBEAFE", "#1D4ED8"), variants: [{ id: 1001, name: "Hop 1L", sku: "VMK-1L", barcode: "893467300001", cost_price: 26000, selling_price: 32000, reorder_point: 12 }] },
    { id: 102, code: "SP002", name: "Pepsi lon 330ml", brand_id: 2, collection_id: 1, unit_id: 2, description: "Do uong dong lon.", is_active: true, image_url: createSvgDataUri("Pepsi 330", "#E0E7FF", "#1E3A8A"), variants: [{ id: 1002, name: "Lon 330ml", sku: "PEP-330", barcode: "893467300002", cost_price: 9000, selling_price: 12000, reorder_point: 20 }] },
    { id: 103, code: "SP003", name: "Lays vi tao bien", brand_id: 8, collection_id: 2, unit_id: 3, description: "Snack demo.", is_active: true, image_url: createSvgDataUri("Lays", "#FEF3C7", "#92400E"), variants: [{ id: 1003, name: "Goi 54g", sku: "LAY-SEA", barcode: "893467300003", cost_price: 13000, selling_price: 18000, reorder_point: 15 }] },
    { id: 104, code: "SP004", name: "Mi Hao Hao tom chua cay", brand_id: 3, collection_id: 3, unit_id: 3, description: "Hang thiet yeu.", is_active: true, image_url: createSvgDataUri("Hao Hao", "#FDE68A", "#B45309"), variants: [{ id: 1004, name: "Goi don", sku: "HAO-001", barcode: "893467300004", cost_price: 3600, selling_price: 5000, reorder_point: 40 }] },
    { id: 105, code: "SP005", name: "Ca phe G7 3in1", brand_id: 4, collection_id: 1, unit_id: 3, description: "Co 2 bien the.", is_active: true, image_url: createSvgDataUri("G7", "#FCE7F3", "#9D174D"), variants: [{ id: 1005, name: "Hop 21 goi", sku: "G7-21", barcode: "893467300005", cost_price: 32000, selling_price: 42000, reorder_point: 10 }, { id: 1006, name: "Hop 50 goi", sku: "G7-50", barcode: "893467300006", cost_price: 68000, selling_price: 88000, reorder_point: 8 }] },
    { id: 106, code: "SP006", name: "Gao ST25 5kg", brand_id: 7, collection_id: 4, unit_id: 5, description: "Mat hang gia tri cao.", is_active: true, image_url: createSvgDataUri("ST25 5kg", "#DCFCE7", "#166534"), variants: [{ id: 1007, name: "Tui 5kg", sku: "GAO-ST25", barcode: "893467300007", cost_price: 138000, selling_price: 165000, reorder_point: 6 }] },
    { id: 107, code: "SP007", name: "Omo Matic 3kg", brand_id: 5, collection_id: 5, unit_id: 5, description: "Gia dung.", is_active: true, image_url: createSvgDataUri("Omo 3kg", "#E0F2FE", "#0C4A6E"), variants: [{ id: 1008, name: "Tui 3kg", sku: "OMO-3KG", barcode: "893467300008", cost_price: 118000, selling_price: 149000, reorder_point: 5 }] },
    { id: 108, code: "SP008", name: "Khan giay Pulppy", brand_id: 6, collection_id: 5, unit_id: 5, description: "Co 2 bien the.", is_active: true, image_url: createSvgDataUri("Pulppy", "#F3E8FF", "#6D28D9"), variants: [{ id: 1009, name: "Loc 10 goi", sku: "PUL-10", barcode: "893467300009", cost_price: 70000, selling_price: 89000, reorder_point: 8 }, { id: 1010, name: "Loc 20 goi", sku: "PUL-20", barcode: "893467300010", cost_price: 138000, selling_price: 169000, reorder_point: 4 }] },
  ];
}

function buildInitialMockDb() {
  const dates = createDateFactory();
  const products = buildProducts();
  const stores = [{ id: 1, code: "Q1", name: "Chi nhanh Quan 1", address: "45 Nguyen Hue, Quan 1", city: "Ho Chi Minh", phone: "02873010001", is_active: true }, { id: 2, code: "TD", name: "Chi nhanh Thu Duc", address: "220 Vo Van Ngan, Thu Duc", city: "Ho Chi Minh", phone: "02873010002", is_active: true }, { id: 3, code: "ONL", name: "Kho online", address: "12 Le Van Viet, Thu Duc", city: "Ho Chi Minh", phone: "02873010003", is_active: true }];
  const brands = [{ id: 1, name: "Vinamilk" }, { id: 2, name: "PepsiCo" }, { id: 3, name: "Acecook" }, { id: 4, name: "G7" }, { id: 5, name: "Unilever" }, { id: 6, name: "Pulppy" }, { id: 7, name: "Nong san Viet" }, { id: 8, name: "Lays" }];
  const units = [{ id: 1, name: "Hop" }, { id: 2, name: "Lon" }, { id: 3, name: "Goi" }, { id: 4, name: "Chai" }, { id: 5, name: "Tui" }];
  const collections = [{ id: 1, name: "Do uong", code: "DRINK", parent_id: null, is_active: true }, { id: 2, name: "Snack", code: "SNACK", parent_id: null, is_active: true }, { id: 3, name: "Mi an lien", code: "NOODLE", parent_id: null, is_active: true }, { id: 4, name: "Thuc pham kho", code: "FOOD", parent_id: null, is_active: true }, { id: 5, name: "Gia dung", code: "HOME", parent_id: null, is_active: true }];
  const customer_groups = [{ id: 1, code: "RETAIL", name: "Khach le", discount_percentage: 0 }, { id: 2, code: "LOYAL", name: "Than thiet", discount_percentage: 3 }, { id: 3, code: "VIP", name: "Khach VIP", discount_percentage: 7 }];
  const cities = [{ id: 1, name: "Ho Chi Minh" }, { id: 2, name: "Ha Noi" }, { id: 3, name: "Da Nang" }, { id: 4, name: "Can Tho" }];
  const carriers = [{ id: 1, code: "GHN", name: "Giao Hang Nhanh", fee: 25000, is_active: true }, { id: 2, code: "GHTK", name: "Giao Hang Tiet Kiem", fee: 28000, is_active: true }, { id: 3, code: "INTERNAL", name: "Noi bo", fee: 18000, is_active: true }];
  const shipment_statuses = [{ code: "pending", name: "Cho lay hang" }, { code: "confirmed", name: "Da xac nhan" }, { code: "in_transit", name: "Dang van chuyen" }, { code: "out_for_delivery", name: "Dang giao hang" }, { code: "delivered", name: "Giao thanh cong" }, { code: "failed", name: "Giao that bai" }, { code: "returned", name: "Chuyen hoan" }, { code: "cancelled", name: "Da huy" }];
  const cashbook_types = [{ id: 1, code: "SALES_REVENUE", name: "Thu ban hang", transaction_direction: 1 }, { id: 2, code: "OTHER_INCOME", name: "Thu khac", transaction_direction: 1 }, { id: 3, code: "OTHER_EXPENSE", name: "Chi phi khac", transaction_direction: -1 }, { id: 4, code: "SUPPLIER_PAYMENT", name: "Thanh toan nha cung cap", transaction_direction: -1 }, { id: 5, code: "REPORT_SETTLEMENT", name: "Doi chieu cuoi ngay", transaction_direction: 1 }];
  const payment_methods = [{ id: 1, code: "CASH", name: "Tien mat", label: "Tien mat", icon: "fa-solid fa-money-bill-wave" }, { id: 2, code: "CARD", name: "The", label: "Thanh toan the", icon: "fa-solid fa-credit-card" }, { id: 3, code: "BANK_QR", name: "QR code", label: "QR code", icon: "fa-solid fa-qrcode" }, { id: 4, code: "DELIVERY", name: "Giao hang", label: "Giao hang", icon: "fa-solid fa-truck-fast" }];
  const staff = [{ id: 1, username: "admin", full_name: "Nguyen Quan Ly", email: "admin@demo.local", phone: "0901000001", role_id: 1, role_name: "Admin", store_id: 1, is_active: true, created_at: dates.iso(120, 8, 0), avatar_url: createAvatar("Nguyen Quan Ly", "#DBEAFE", "#1D4ED8") }, { id: 2, username: "thu.ngan", full_name: "Tran Thu Ngan", email: "cashier@demo.local", phone: "0901000002", role_id: 2, role_name: "Staff", store_id: 1, is_active: true, created_at: dates.iso(95, 9, 0), avatar_url: createAvatar("Tran Thu Ngan", "#DCFCE7", "#166534") }, { id: 3, username: "linh.kho", full_name: "Pham Linh Kho", email: "warehouse@demo.local", phone: "0901000003", role_id: 2, role_name: "Staff", store_id: 2, is_active: true, created_at: dates.iso(80, 10, 0), avatar_url: createAvatar("Pham Linh Kho", "#FCE7F3", "#9D174D") }, { id: 4, username: "hoang.sale", full_name: "Le Hoang Sale", email: "sale@demo.local", phone: "0901000004", role_id: 2, role_name: "Staff", store_id: 3, is_active: true, created_at: dates.iso(70, 11, 0), avatar_url: createAvatar("Le Hoang Sale", "#F3E8FF", "#6D28D9") }];
  const suppliers = [{ id: 1, code: "NCC001", name: "Cong ty Vinamilk South", contact_name: "Pham Minh Duc", phone: "02871000001", email: "vinamilk@supplier.local", address: "Quan 7, Ho Chi Minh", city_id: 1, status: "active", created_at: dates.iso(160, 8, 0) }, { id: 2, code: "NCC002", name: "Acecook Trading", contact_name: "Vo Thanh Hai", phone: "02871000002", email: "acecook@supplier.local", address: "Binh Thanh, Ho Chi Minh", city_id: 1, status: "active", created_at: dates.iso(150, 8, 30) }, { id: 3, code: "NCC003", name: "Unilever Viet Nam", contact_name: "Nguyen Ngoc Mai", phone: "02871000003", email: "unilever@supplier.local", address: "Thu Duc, Ho Chi Minh", city_id: 1, status: "active", created_at: dates.iso(140, 9, 0) }];
  const customers = [{ id: 201, code: "KH001", full_name: "Nguyen Thi Lan", phone: "0909000001", email: "lan.nguyen@example.com", address: "1 Nguyen Trai, Quan 1", city_id: 1, customer_group_id: 3, date_of_birth: "1994-05-12", gender: "female", created_at: dates.iso(70, 8, 0), avatar_url: createAvatar("Nguyen Thi Lan", "#FDE68A", "#92400E") }, { id: 202, code: "KH002", full_name: "Tran Quoc Bao", phone: "0909000002", email: "bao.tran@example.com", address: "22 Le Loi, Thu Duc", city_id: 1, customer_group_id: 2, date_of_birth: "1990-09-03", gender: "male", created_at: dates.iso(65, 10, 0), avatar_url: createAvatar("Tran Quoc Bao", "#DBEAFE", "#1D4ED8") }, { id: 203, code: "KH003", full_name: "Le Minh Chau", phone: "0909000003", email: "chau.le@example.com", address: "9 Phan Dinh Phung, Da Nang", city_id: 3, customer_group_id: 1, date_of_birth: "1996-11-18", gender: "female", created_at: dates.iso(55, 11, 0), avatar_url: createAvatar("Le Minh Chau", "#DCFCE7", "#166534") }, { id: 204, code: "KH004", full_name: "Pham Duc Huy", phone: "0909000004", email: "huy.pham@example.com", address: "10 Hai Ba Trung, Ha Noi", city_id: 2, customer_group_id: 2, date_of_birth: "1988-02-09", gender: "male", created_at: dates.iso(48, 9, 0), avatar_url: createAvatar("Pham Duc Huy", "#E0E7FF", "#1E3A8A") }, { id: 205, code: "KH005", full_name: "Vo Gia Han", phone: "0909000005", email: "han.vo@example.com", address: "52 Tran Hung Dao, Can Tho", city_id: 4, customer_group_id: 1, date_of_birth: "2000-01-25", gender: "female", created_at: dates.iso(36, 14, 0), avatar_url: createAvatar("Vo Gia Han", "#FCE7F3", "#9D174D") }, { id: 206, code: "KH006", full_name: "Do Thanh Nam", phone: "0909000006", email: "nam.do@example.com", address: "18 Nguyen Huu Canh, Binh Thanh", city_id: 1, customer_group_id: 2, date_of_birth: "1992-07-07", gender: "male", created_at: dates.iso(28, 16, 0), avatar_url: createAvatar("Do Thanh Nam", "#F3E8FF", "#6D28D9") }];
  const inventories = [{ id: 4001, product_id: 101, variant_id: 1001, store_id: 1, location: "Kho Q1", quantity_available: 28, reserved: 2 }, { id: 4002, product_id: 101, variant_id: 1001, store_id: 2, location: "Kho Thu Duc", quantity_available: 22, reserved: 1 }, { id: 4003, product_id: 101, variant_id: 1001, store_id: 3, location: "Kho Online", quantity_available: 18, reserved: 3 }, { id: 4004, product_id: 102, variant_id: 1002, store_id: 1, location: "Kho Q1", quantity_available: 42, reserved: 0 }, { id: 4005, product_id: 102, variant_id: 1002, store_id: 2, location: "Kho Thu Duc", quantity_available: 31, reserved: 1 }, { id: 4006, product_id: 103, variant_id: 1003, store_id: 1, location: "Kho Q1", quantity_available: 14, reserved: 0 }, { id: 4007, product_id: 103, variant_id: 1003, store_id: 2, location: "Kho Thu Duc", quantity_available: 9, reserved: 0 }, { id: 4008, product_id: 104, variant_id: 1004, store_id: 1, location: "Kho Q1", quantity_available: 85, reserved: 5 }, { id: 4009, product_id: 104, variant_id: 1004, store_id: 2, location: "Kho Thu Duc", quantity_available: 64, reserved: 4 }, { id: 4010, product_id: 105, variant_id: 1005, store_id: 1, location: "Kho Q1", quantity_available: 18, reserved: 1 }, { id: 4011, product_id: 105, variant_id: 1006, store_id: 1, location: "Kho Q1", quantity_available: 7, reserved: 0 }, { id: 4012, product_id: 105, variant_id: 1005, store_id: 2, location: "Kho Thu Duc", quantity_available: 10, reserved: 0 }, { id: 4013, product_id: 106, variant_id: 1007, store_id: 1, location: "Kho Q1", quantity_available: 6, reserved: 0 }, { id: 4014, product_id: 106, variant_id: 1007, store_id: 3, location: "Kho Online", quantity_available: 11, reserved: 2 }, { id: 4015, product_id: 107, variant_id: 1008, store_id: 2, location: "Kho Thu Duc", quantity_available: 4, reserved: 1 }, { id: 4016, product_id: 108, variant_id: 1009, store_id: 1, location: "Kho Q1", quantity_available: 9, reserved: 0 }, { id: 4017, product_id: 108, variant_id: 1010, store_id: 1, location: "Kho Q1", quantity_available: 3, reserved: 0 }, { id: 4018, product_id: 108, variant_id: 1009, store_id: 2, location: "Kho Thu Duc", quantity_available: 5, reserved: 0 }];
  const inventory_transactions = [{ id: 4501, transaction_code: "NK-0001", variant_id: 1001, product_id: 101, type: "receive", type_text: "Nhap kho", quantity: 20, store_id: 1, location: "Kho Q1", notes: "Bo sung ton", created_at: dates.iso(5, 9, 0), created_by_id: 3 }, { id: 4502, transaction_code: "CK-0001", variant_id: 1008, product_id: 107, type: "adjust", type_text: "Dieu chinh", quantity: -2, store_id: 2, location: "Kho Thu Duc", notes: "Hang hu hong", created_at: dates.iso(4, 14, 0), created_by_id: 3 }];

  function buildOrder(id, code, daysAgo, hour, customerId, createdById, storeId, itemSpecs, options = {}) {
    const items = itemSpecs.map((spec) => {
      const found = getVariant(products, spec.variant_id);
      const unitPrice = spec.unit_price || found.variant.selling_price;
      const quantity = spec.quantity;
      const lineTotal = unitPrice * quantity;
      return { product_id: found.product.id, variant_id: found.variant.id, name: found.product.name, product: found.product.name, variant_name: found.variant.name, sku: found.variant.sku, barcode: found.variant.barcode, image_url: found.product.image_url, quantity, unit_price: unitPrice, discount_per_item: spec.discount_per_item || 0, total: lineTotal, line_total: lineTotal };
    });
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const discount = options.discount || 0;
    const tax = options.tax || Math.round(subtotal * 0.08);
    const shipping = options.shipping || 0;
    const total = Math.max(0, subtotal - discount + tax + shipping);
    const createdAt = dates.iso(daysAgo, hour, options.minute || 0);
    return { id, order_code: code, customer_id: customerId || null, created_by_id: createdById, store_id: storeId, created_at: createdAt, updated_at: createdAt, status: options.status || "completed", payment_status: options.payment_status || "paid", payment_method: options.payment_method || "cash", source: options.source || "pos", customer_type: customerId ? "member" : "walk_in", notes: options.notes || "", shipping_address: options.shipping_address || "", receiver_name: options.receiver_name || "", receiver_phone: options.receiver_phone || "", amount_received: options.amount_received || total, change: options.change || 0, items, amount: { subtotal, discount, tax, shipping, total, final: total }, subtotal, discount_amount: discount, final_amount: total, total_amount: total };
  }

  const orders = [
    buildOrder(5001, "DH240001", 0, 9, 201, 2, 1, [{ variant_id: 1001, quantity: 2 }, { variant_id: 1003, quantity: 3 }], { payment_method: "cash", source: "pos" }),
    buildOrder(5002, "DH240002", 0, 11, 202, 2, 1, [{ variant_id: 1005, quantity: 1 }, { variant_id: 1002, quantity: 4 }], { payment_method: "bank_qr", source: "pos" }),
    buildOrder(5003, "DH240003", 0, 15, null, 2, 1, [{ variant_id: 1004, quantity: 8 }, { variant_id: 1002, quantity: 2 }], { status: "pending", payment_status: "unpaid", payment_method: "cash", amount_received: 0, source: "pos" }),
    buildOrder(5004, "DH240004", 1, 14, 204, 3, 2, [{ variant_id: 1008, quantity: 1 }, { variant_id: 1002, quantity: 4 }], { payment_method: "card", source: "store" }),
    buildOrder(5005, "DH240005", 3, 10, 201, 4, 3, [{ variant_id: 1007, quantity: 1 }, { variant_id: 1001, quantity: 2 }], { payment_method: "delivery", shipping: 25000, source: "website", shipping_address: "88 Dien Bien Phu, Binh Thanh", receiver_name: "Nguyen Thi Lan", receiver_phone: "0909000001", status: "processing" }),
    buildOrder(5006, "DH240006", 5, 17, 203, 2, 1, [{ variant_id: 1003, quantity: 2 }, { variant_id: 1002, quantity: 2 }], { payment_method: "card", status: "cancelled", payment_status: "refunded", source: "facebook", notes: "Khach doi y" }),
    buildOrder(5007, "DH240007", 7, 9, 206, 2, 1, [{ variant_id: 1005, quantity: 2 }, { variant_id: 1003, quantity: 2 }], { payment_method: "cash", source: "pos", discount: 10000 }),
    buildOrder(5008, "DH240008", 10, 13, 202, 3, 2, [{ variant_id: 1009, quantity: 1 }, { variant_id: 1008, quantity: 1 }], { payment_method: "bank_qr", source: "zalo" }),
    buildOrder(5009, "DH240009", 12, 16, 205, 4, 3, [{ variant_id: 1007, quantity: 1 }, { variant_id: 1006, quantity: 1 }], { payment_method: "delivery", shipping: 30000, source: "website", shipping_address: "52 Tran Hung Dao, Can Tho", receiver_name: "Vo Gia Han", receiver_phone: "0909000005", status: "delivered" }),
    buildOrder(5010, "DH240010", 20, 12, 204, 3, 2, [{ variant_id: 1008, quantity: 1 }, { variant_id: 1009, quantity: 1 }], { payment_method: "card", source: "store", discount: 5000 }),
  ];
  const order_drafts = [{ id: 5201, code: "DR001", store_id: 1, created_at: dates.iso(0, 8, 20), updated_at: dates.iso(0, 8, 45), customerId: 202, customer_name: "Tran Quoc Bao", items: [{ variant_id: 1002, product_id: 102, name: "Pepsi lon 330ml", price: 12000, quantity: 3 }], subtotal: 36000, discount: 0, discount_amount: 0, total: 36000, notes: "Khach hen quay lai" }, { id: 5202, code: "DR002", store_id: 1, created_at: dates.iso(0, 10, 15), updated_at: dates.iso(0, 10, 35), customerId: null, customer_name: "Khach le", items: [{ variant_id: 1004, product_id: 104, name: "Mi Hao Hao tom chua cay", price: 5000, quantity: 5 }], subtotal: 25000, discount: 0, discount_amount: 0, total: 25000, notes: "" }];
  const order_returns = [{ id: 5401, order_id: 5006, order_code: "DH240006", reason: "Khach doi san pham", refund_amount: 48000, status: "completed", created_at: dates.iso(4, 10, 20) }];
  const checkouts = [{ id: 5601, checkoutCode: "CK001", customerName: "Nguyen Thi Lan", customerContact: "lan.nguyen@example.com", createdDate: dates.iso(1, 19, 10), totalAmount: 124000, status: "Chưa liên hệ" }, { id: 5602, checkoutCode: "CK002", customerName: "Pham Duc Huy", customerContact: "0909000004", createdDate: dates.iso(3, 20, 0), totalAmount: 89000, status: "Đã gửi email" }, { id: 5603, checkoutCode: "CK003", customerName: "Vo Gia Han", customerContact: "han.vo@example.com", createdDate: dates.iso(6, 21, 30), totalAmount: 219000, status: "Chưa liên hệ" }];
  const discounts = [{ id: 5801, code: "WELCOME10", name: "Giam 10% don dau", status: "active", type_code: "PERCENTAGE", type: "percentage", value: 10, minimum_order_amount: 100000, customer_group_id: null, description: "Ap dung don tu 100k.", start_date: dates.day(30), end_date: dates.day(-10), is_active: true }, { id: 5802, code: "VIP50", name: "Giam 50k cho VIP", status: "active", type_code: "FIXED", type: "fixed", value: 50000, minimum_order_amount: 300000, customer_group_id: 3, description: "Danh rieng cho VIP.", start_date: dates.day(20), end_date: dates.day(-5), is_active: true }, { id: 5803, code: "SPRING20", name: "Khuyen mai da het han", status: "expired", type_code: "PERCENTAGE", type: "percentage", value: 20, minimum_order_amount: 150000, customer_group_id: null, description: "Da het han.", start_date: dates.day(60), end_date: dates.day(2), is_active: false }];
  const shipments = [{ id: 6001, shipment_code: "VC001", order_id: 5005, order_code: "DH240005", recipient_name: "Nguyen Thi Lan", recipient_phone: "0909000001", recipient_address: "88 Dien Bien Phu, Binh Thanh", carrier_id: 1, carrier_name: "Giao Hang Nhanh", shipping_fee: 25000, total_fee: 25000, status_code: "in_transit", tracking_code: "GHN240005", created_at: dates.iso(3, 11, 30), estimated_delivery_date: dates.iso(-1, 14, 0), actual_delivery_date: null, tracking_history: [{ status: "confirmed", description: "Da tiep nhan don", location: "Kho online", created_at: dates.iso(3, 12, 0) }, { status: "in_transit", description: "Dang tren duong giao", location: "Binh Thanh", created_at: dates.iso(2, 9, 30) }] }, { id: 6002, shipment_code: "VC002", order_id: 5009, order_code: "DH240009", recipient_name: "Vo Gia Han", recipient_phone: "0909000005", recipient_address: "52 Tran Hung Dao, Can Tho", carrier_id: 2, carrier_name: "Giao Hang Tiet Kiem", shipping_fee: 30000, total_fee: 30000, status_code: "delivered", tracking_code: "GHTK240009", created_at: dates.iso(12, 16, 40), estimated_delivery_date: dates.iso(10, 17, 0), actual_delivery_date: dates.iso(10, 18, 30), tracking_history: [{ status: "confirmed", description: "Da tiep nhan don", location: "Kho online", created_at: dates.iso(12, 17, 0) }, { status: "delivered", description: "Giao thanh cong", location: "Can Tho", created_at: dates.iso(10, 18, 30) }] }, { id: 6003, shipment_code: "VC003", order_id: 5003, order_code: "DH240003", recipient_name: "Khach le", recipient_phone: "0900000000", recipient_address: "Cho xac nhan", carrier_id: 3, carrier_name: "Noi bo", shipping_fee: 18000, total_fee: 18000, status_code: "pending", tracking_code: "NB240003", created_at: dates.iso(0, 16, 0), estimated_delivery_date: dates.iso(-1, 12, 0), actual_delivery_date: null, tracking_history: [{ status: "pending", description: "Cho xep lich giao", location: "Chi nhanh Quan 1", created_at: dates.iso(0, 16, 10) }] }];
  const transactions = [{ id: 7001, transaction_code: "PT001", transaction_type: "thu", type_name: "Thu ban hang", cashbook_type_id: 1, amount: 284000, store_id: 1, payment_method_id: 1, status: "approved", description: "Thu POS ca sang", notes: "", created_at: dates.iso(0, 12, 0), transaction_date: dates.day(0), created_by_id: 2, approved_by_id: 1 }, { id: 7002, transaction_code: "PT002", transaction_type: "thu", type_name: "Thu ban hang", cashbook_type_id: 1, amount: 418000, store_id: 2, payment_method_id: 2, status: "approved", description: "Thu chi nhanh Thu Duc", notes: "", created_at: dates.iso(1, 18, 20), transaction_date: dates.day(1), created_by_id: 3, approved_by_id: 1 }, { id: 7003, transaction_code: "PC001", transaction_type: "chi", type_name: "Chi phi khac", cashbook_type_id: 3, amount: 85000, store_id: 1, payment_method_id: 1, status: "pending", description: "Mua van phong pham", recipient_name: "Nha sach Minh Long", notes: "Cho duyet", created_at: dates.iso(0, 17, 45), transaction_date: dates.day(0), created_by_id: 2, approved_by_id: null }, { id: 7004, transaction_code: "PC002", transaction_type: "chi", type_name: "Thanh toan nha cung cap", cashbook_type_id: 4, amount: 420000, store_id: 2, payment_method_id: 3, status: "approved", description: "Tam ung don nhap", recipient_name: "Acecook Trading", notes: "", created_at: dates.iso(4, 10, 0), transaction_date: dates.day(4), created_by_id: 3, approved_by_id: 1 }, { id: 7005, transaction_code: "PT003", transaction_type: "thu", type_name: "Doi chieu cuoi ngay", cashbook_type_id: 5, amount: 512000, store_id: 1, payment_method_id: 1, status: "approved", description: "Duyet bao cao cuoi ngay", notes: "Tu dong tao khi duyet", created_at: dates.iso(2, 20, 0), transaction_date: dates.day(2), created_by_id: 1, approved_by_id: 1 }];
  const reports_submitted = [{ id: 8001, report_code: "RPT001", title: "Bao cao cuoi ngay Quan 1", period_from: dates.day(1), period_to: dates.day(1), store_id: 1, store_name: "Chi nhanh Quan 1", submitted_by_id: 2, submitted_by_name: "Tran Thu Ngan", submitted_at: dates.iso(1, 21, 5), status: "approved", notes: "Doanh thu on dinh", net_revenue: 198000, total_orders: 3, revenue_summary: {}, actual_summary: {}, by_payment_method: [], linked_transaction_code: "PT003", linked_transaction_id: 7005 }, { id: 8002, report_code: "RPT002", title: "Bao cao cuoi ngay Thu Duc", period_from: dates.day(3), period_to: dates.day(3), store_id: 2, store_name: "Chi nhanh Thu Duc", submitted_by_id: 3, submitted_by_name: "Pham Linh Kho", submitted_at: dates.iso(3, 21, 10), status: "rejected", notes: "Can bo sung chung tu", net_revenue: 245000, total_orders: 2, revenue_summary: {}, actual_summary: {}, by_payment_method: [], linked_transaction_code: "", linked_transaction_id: null }, { id: 8003, report_code: "RPT003", title: "Bao cao ca ban ngay", period_from: dates.day(0), period_to: dates.day(0), store_id: 1, store_name: "Chi nhanh Quan 1", submitted_by_id: 2, submitted_by_name: "Tran Thu Ngan", submitted_at: dates.iso(0, 19, 35), status: "submitted", notes: "", net_revenue: 356000, total_orders: 3, revenue_summary: {}, actual_summary: {}, by_payment_method: [], linked_transaction_code: "", linked_transaction_id: null }];
  return { meta: { ids: { customer: 206, supplier: 3, staff: 4, product: 108, collection: 5, catalog: 0, inventory: 4018, inventory_transaction: 4502, order: 5010, order_draft: 5202, order_return: 5401, checkout: 5603, discount: 5803, shipment: 6003, transaction: 7005, report: 8003 } }, stores, brands, units, collections, customer_groups, cities, carriers, shipment_statuses, cashbook_types, payment_methods, staff, suppliers, customers, products, inventories, inventory_transactions, orders, order_drafts, order_returns, checkouts, discounts, shipments, transactions, reports_submitted };
}

export function rebuildMockDb(db) {
  const next = cloneValue(db);
  const brandMap = new Map(next.brands.map((item) => [item.id, item]));
  const collectionMap = new Map(next.collections.map((item) => [item.id, item]));
  const unitMap = new Map(next.units.map((item) => [item.id, item]));
  const storeMap = new Map(next.stores.map((item) => [item.id, item]));
  const cityMap = new Map(next.cities.map((item) => [item.id, item]));
  const groupMap = new Map(next.customer_groups.map((item) => [item.id, item]));
  const customerMap = new Map(next.customers.map((item) => [item.id, item]));
  const staffMap = new Map(next.staff.map((item) => [item.id, item]));
  const carrierMap = new Map(next.carriers.map((item) => [item.id, item]));
  const paymentMethodMap = new Map(next.payment_methods.map((item) => [item.id, item]));
  const cashbookTypeMap = new Map(next.cashbook_types.map((item) => [item.id, item]));

  next.products = next.products.map((product) => {
    const variants = (product.variants || []).map((variant) => {
      const variantInventories = next.inventories.filter((inventory) => inventory.variant_id === variant.id);
      return { ...variant, total_stock: variantInventories.reduce((sum, inventory) => sum + Number(inventory.quantity_available || 0), 0) };
    });
    return { ...product, brand_name: brandMap.get(product.brand_id)?.name || "", category_name: collectionMap.get(product.collection_id)?.name || "", unit: unitMap.get(product.unit_id)?.name || "", stock: variants.reduce((sum, variant) => sum + Number(variant.total_stock || 0), 0), price: product.price || variants[0]?.selling_price || 0, cost_price: product.cost_price || variants[0]?.cost_price || 0, variants, main_image: product.image_url, gallery: [{ id: `${product.id}-main`, image_url: product.image_url, is_primary: true, sort_order: 1 }] };
  });

  next.catalogs = [];
  let catalogId = 9000;
  next.products.forEach((product) => {
    product.variants.forEach((variant) => {
      catalogId += 1;
      next.catalogs.push({ id: catalogId, variant_id: variant.id, product_id: product.id, product_name: product.name, brand_name: product.brand_name, category_name: product.category_name, sku: variant.sku, cost_price: variant.cost_price, selling_price: variant.selling_price, is_active: product.is_active });
    });
  });
  next.meta.ids.catalog = catalogId;

  next.staff = next.staff.map((user) => ({ ...user, store_name: storeMap.get(user.store_id)?.name || "" }));
  next.customers = next.customers.map((customer) => {
    const group = groupMap.get(customer.customer_group_id);
    const orders = next.orders.filter((order) => order.customer_id === customer.id && order.status !== "cancelled").sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.final_amount || order.total_amount || 0), 0);
    return { ...customer, group_name: group?.name || "", discount_percentage: group?.discount_percentage || 0, city_name: cityMap.get(customer.city_id)?.name || "", total_orders: orders.length, total_spent: totalSpent, total_lifetime_value: totalSpent, recent_orders: orders.slice(0, 5).map((order) => ({ order_code: order.order_code, created_at: order.created_at, status: order.status, payment_status: order.payment_status, final_amount: order.final_amount })) };
  });

  next.orders = next.orders.map((order) => {
    const customer = order.customer_id ? customerMap.get(order.customer_id) : null;
    const createdBy = staffMap.get(order.created_by_id);
    const store = storeMap.get(order.store_id);
    return { ...order, customer: customer ? { id: customer.id, name: customer.full_name, phone: customer.phone, email: customer.email } : null, customer_name: customer?.full_name || "Khach le", created_by: createdBy ? { id: createdBy.id, name: createdBy.full_name } : null, store: store ? { id: store.id, name: store.name, address: store.address, phone: store.phone } : null, total_amount: Number(order.amount?.total || order.final_amount || 0), final_amount: Number(order.amount?.final || order.final_amount || 0) };
  });

  next.shipments = next.shipments.map((shipment) => ({ ...shipment, carrier_name: carrierMap.get(shipment.carrier_id)?.name || shipment.carrier_name }));
  next.transactions = next.transactions.map((transaction) => ({ ...transaction, store_name: storeMap.get(transaction.store_id)?.name || "", created_by_name: staffMap.get(transaction.created_by_id)?.full_name || "", approved_by_name: staffMap.get(transaction.approved_by_id)?.full_name || "", payment_method_name: paymentMethodMap.get(transaction.payment_method_id)?.name || transaction.payment_method_name || "", type_name: cashbookTypeMap.get(transaction.cashbook_type_id)?.name || transaction.type_name, transaction_direction: cashbookTypeMap.get(transaction.cashbook_type_id)?.transaction_direction || (transaction.transaction_type === "chi" ? -1 : 1) }));
  return next;
}

export function getMockDb() {
  if (typeof window === "undefined") return rebuildMockDb(buildInitialMockDb());
  try {
    const stored = localStorage.getItem(MOCK_DB_STORAGE_KEY);
    if (!stored) {
      const seeded = rebuildMockDb(buildInitialMockDb());
      localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return rebuildMockDb(JSON.parse(stored));
  } catch (error) {
    const seeded = rebuildMockDb(buildInitialMockDb());
    localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveMockDb(db) {
  const rebuilt = rebuildMockDb(db);
  if (typeof window !== "undefined") localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(rebuilt));
  return rebuilt;
}

export function updateMockDb(mutator) {
  const draft = cloneValue(getMockDb());
  const result = mutator(draft) || draft;
  return saveMockDb(result);
}

export function resetMockDb() {
  return saveMockDb(buildInitialMockDb());
}

export { MOCK_DB_STORAGE_KEY, cloneValue, getVariant, createSvgDataUri };
