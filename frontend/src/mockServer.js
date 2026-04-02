import {
  createSvgDataUri,
  getMockDb,
  getVariant,
  resetMockDb,
  updateMockDb,
} from "@/mockData";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

function nowIso() {
  return new Date().toISOString();
}

function normalizePath(url = "") {
  try {
    const parsed = new URL(url, "http://mock.local");
    return parsed.pathname.replace(/\/+$/, "") || "/";
  } catch (error) {
    const cleanUrl = String(url || "")
      .replace(/^https?:\/\/[^/]+/i, "")
      .split("?")[0];
    return cleanUrl.replace(/\/+$/, "") || "/";
  }
}

function mergeParams(config = {}) {
  const params = { ...(config.params || {}) };

  try {
    const parsed = new URL(config.url || "", "http://mock.local");
    parsed.searchParams.forEach((value, key) => {
      if (params[key] === undefined) params[key] = value;
    });
  } catch (error) {
    // Ignore invalid URLs in mock mode.
  }

  return params;
}

function parseBody(data) {
  if (!data) return {};

  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const form = {};
    data.forEach((value, key) => {
      if (form[key] === undefined) {
        form[key] = value;
      } else if (Array.isArray(form[key])) {
        form[key].push(value);
      } else {
        form[key] = [form[key], value];
      }
    });
    return form;
  }

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  return data;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function includesText(value, query) {
  if (!query) return true;
  return String(value || "").toLowerCase().includes(String(query).toLowerCase());
}

function dateKey(value) {
  return new Date(value || nowIso()).toISOString().slice(0, 10);
}

function isBetween(value, from, to) {
  const key = dateKey(value);
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
}

function sortItems(items, sortBy = "created_at", order = "DESC") {
  const direction = String(order).toUpperCase() === "ASC" ? 1 : -1;
  return [...items].sort((left, right) => {
    const a = left?.[sortBy];
    const b = right?.[sortBy];

    if (typeof a === "number" || typeof b === "number") {
      return (toNumber(a) - toNumber(b)) * direction;
    }

    return String(a || "").localeCompare(String(b || "")) * direction;
  });
}

function paginate(items, page = 1, limit = 20) {
  const currentPage = Math.max(1, toNumber(page, 1));
  const pageSize = Math.max(1, toNumber(limit, 20));
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    pagination: {
      page: currentPage,
      limit: pageSize,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    },
  };
}

function success(data, message = "OK", extra = {}) {
  return {
    success: true,
    status: "OK",
    message,
    data,
    timestamp: nowIso(),
    ...extra,
  };
}

function successPage(items, page, limit, message = "OK") {
  const result = paginate(items, page, limit);
  return success(result.items, message, {
    pagination: result.pagination,
  });
}

function fail(message = "Request failed", code = 400, extra = {}) {
  return {
    success: false,
    status: "ERROR",
    code,
    message,
    timestamp: nowIso(),
    ...extra,
  };
}

function raw(data, headers = {}) {
  return {
    __raw: true,
    data,
    headers,
  };
}

function csvBlob(rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

function currentUserId() {
  if (typeof window === "undefined") return 1;

  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.id || 1;
  } catch (error) {
    return 1;
  }
}

function currentUser(db) {
  return db.staff.find((item) => item.id === currentUserId()) || db.staff[0];
}

function nextId(db, key) {
  db.meta.ids[key] = toNumber(db.meta.ids[key], 0) + 1;
  return db.meta.ids[key];
}

function syncStoredUser(user) {
  if (typeof window === "undefined" || !user) return;

  const current = JSON.parse(localStorage.getItem("user") || "{}");
  localStorage.setItem(
    "user",
    JSON.stringify({
      ...current,
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      role_name: user.role_name,
      store_id: user.store_id,
      store_name: user.store_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      avatarUrl: user.avatar_url,
    }),
  );
}

function buildResponse(config, payload, status = 200, headers = DEFAULT_HEADERS) {
  return Promise.resolve({
    data: payload,
    status,
    statusText: status >= 400 ? "Error" : "OK",
    headers,
    config,
    request: { mocked: true },
  });
}

function makeRequest(config) {
  return {
    method: String(config.method || "get").toUpperCase(),
    path: normalizePath(config.url),
    params: mergeParams(config),
    body: parseBody(config.data),
    config,
  };
}

function findProduct(db, productId) {
  return db.products.find((item) => item.id === toNumber(productId));
}

function findOrder(db, orderId) {
  return db.orders.find((item) => item.id === toNumber(orderId));
}

function paymentLabel(code) {
  const labels = {
    cash: "Tien mat",
    card: "The",
    bank_qr: "QR code",
    delivery: "Giao hang",
  };
  return labels[code] || code || "Khac";
}

function receiptData(order) {
  return {
    order_id: order.id,
    invoice_number: `INV-${order.order_code}`,
    order_code: order.order_code,
    created_at: order.created_at,
    store: order.store,
    customer: order.customer,
    payment_method: order.payment_method,
    payment_label: paymentLabel(order.payment_method),
    subtotal: order.amount?.subtotal || order.subtotal || 0,
    discount: order.amount?.discount || order.discount_amount || 0,
    tax: order.amount?.tax || 0,
    shipping: order.amount?.shipping || 0,
    total: order.final_amount,
    amount_received: order.amount_received || order.final_amount,
    change: order.change || 0,
    items: (order.items || []).map((item) => ({
      ...item,
      total: item.total || item.line_total || item.quantity * item.unit_price,
    })),
  };
}

function invoiceData(order) {
  return receiptData(order);
}

function filterOrders(db, params = {}) {
  const search = params.search || params.q || "";
  return sortItems(
    db.orders.filter((order) => {
      if (params.store_id && toNumber(order.store_id) !== toNumber(params.store_id)) {
        return false;
      }
      if (
        params.staff_id &&
        toNumber(order.created_by_id) !== toNumber(params.staff_id)
      ) {
        return false;
      }
      if (params.status && String(order.status) !== String(params.status)) {
        return false;
      }
      if (!isBetween(order.created_at, params.from, params.to)) {
        return false;
      }
      return (
        !search ||
        includesText(order.order_code, search) ||
        includesText(order.customer_name, search) ||
        includesText(order.customer?.phone, search)
      );
    }),
    params.sortBy || params.sort_by || "created_at",
    params.order || params.sort_order || "DESC",
  );
}

function paymentSummary(orders) {
  const summary = new Map();
  orders.forEach((order) => {
    const key = order.payment_method || "cash";
    if (!summary.has(key)) {
      summary.set(key, {
        method: key,
        order_count: 0,
        total_amount: 0,
        amount: 0,
      });
    }
    const item = summary.get(key);
    item.order_count += 1;
    item.total_amount += toNumber(order.final_amount);
    item.amount += toNumber(order.final_amount);
  });
  return [...summary.values()];
}

function revenueSummary(orders) {
  const grossRevenue = orders.reduce(
    (sum, order) => sum + toNumber(order.amount?.subtotal),
    0,
  );
  const totalDiscount = orders.reduce(
    (sum, order) => sum + toNumber(order.amount?.discount || order.discount_amount),
    0,
  );
  const totalTax = orders.reduce((sum, order) => sum + toNumber(order.amount?.tax), 0);
  const totalShipping = orders.reduce(
    (sum, order) => sum + toNumber(order.amount?.shipping),
    0,
  );
  const netRevenue = orders.reduce((sum, order) => sum + toNumber(order.final_amount), 0);
  const uniqueCustomers = new Set(
    orders.filter((order) => order.customer_id).map((order) => order.customer_id),
  ).size;

  return {
    total_orders: orders.length,
    gross_revenue: grossRevenue,
    total_discount: totalDiscount,
    total_tax: totalTax,
    tax_amount: totalTax,
    total_shipping: totalShipping,
    shipping_fee: totalShipping,
    net_revenue: netRevenue,
    avg_order_value: orders.length ? Math.round(netRevenue / orders.length) : 0,
    unique_customers: uniqueCustomers,
  };
}

function soldProductsData(orders) {
  const summary = new Map();

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = item.variant_id || item.product_id;
      if (!summary.has(key)) {
        summary.set(key, {
          variant_id: item.variant_id,
          product_id: item.product_id,
          product_name: item.name || item.product,
          sku: item.sku,
          quantity_sold: 0,
          gross_revenue: 0,
          total_discount: 0,
          net_revenue: 0,
          total_profit: 0,
        });
      }

      const row = summary.get(key);
      const lineTotal = toNumber(item.line_total || item.total);
      const quantity = toNumber(item.quantity);
      const discount = toNumber(item.discount_per_item) * quantity;
      const cost = toNumber(item.cost_price || 0) * quantity;

      row.quantity_sold += quantity;
      row.gross_revenue += lineTotal;
      row.total_discount += discount;
      row.net_revenue += lineTotal - discount;
      row.total_profit += lineTotal - discount - cost;
    });
  });

  const products = [...summary.values()].sort(
    (left, right) => right.quantity_sold - left.quantity_sold,
  );

  const totals = products.reduce(
    (accumulator, item) => ({
      total_quantity: accumulator.total_quantity + item.quantity_sold,
      gross_revenue: accumulator.gross_revenue + item.gross_revenue,
      total_discount: accumulator.total_discount + item.total_discount,
      net_revenue: accumulator.net_revenue + item.net_revenue,
      total_profit: accumulator.total_profit + item.total_profit,
    }),
    {
      total_quantity: 0,
      gross_revenue: 0,
      total_discount: 0,
      net_revenue: 0,
      total_profit: 0,
    },
  );

  return { products, summary: totals };
}

function topProducts(orders, limit = 5) {
  return soldProductsData(orders)
    .products.slice(0, limit)
    .map((item, index) => ({
      rank: index + 1,
      product_name: item.product_name,
      sku: item.sku,
      quantity: item.quantity_sold,
      quantity_sold: item.quantity_sold,
      revenue: item.net_revenue,
      net_revenue: item.net_revenue,
    }));
}

function topCustomers(db, orders, limit = 5) {
  const summary = new Map();
  orders
    .filter((order) => order.customer_id)
    .forEach((order) => {
      if (!summary.has(order.customer_id)) {
        summary.set(order.customer_id, {
          customer_id: order.customer_id,
          customer_name: order.customer_name,
          order_count: 0,
          total_amount: 0,
        });
      }
      const item = summary.get(order.customer_id);
      item.order_count += 1;
      item.total_amount += toNumber(order.final_amount);
    });

  return [...summary.values()]
    .sort((left, right) => right.total_amount - left.total_amount)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      customer: db.customers.find((customer) => customer.id === item.customer_id),
    }));
}

function lowStock(db, limit = 5) {
  return db.products
    .flatMap((product) =>
      (product.variants || []).map((variant) => ({
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        sku: variant.sku,
        stock: toNumber(variant.total_stock),
        reorder_point: toNumber(variant.reorder_point, 0),
      })),
    )
    .sort((left, right) => left.stock - right.stock)
    .slice(0, limit);
}

function revenueChart(orders, groupBy = "day") {
  const buckets = new Map();
  orders.forEach((order) => {
    const date = new Date(order.created_at);
    const key =
      groupBy === "hour"
        ? `${String(date.getHours()).padStart(2, "0")}:00`
        : dateKey(order.created_at);

    if (!buckets.has(key)) {
      buckets.set(key, { revenue: 0, orders: 0 });
    }
    const item = buckets.get(key);
    item.revenue += toNumber(order.final_amount);
    item.orders += 1;
  });

  const labels = [...buckets.keys()].sort();
  return {
    labels,
    datasets: [
      {
        label: "Doanh thu",
        data: labels.map((label) => buckets.get(label)?.revenue || 0),
      },
      {
        label: "Don hang",
        data: labels.map((label) => buckets.get(label)?.orders || 0),
      },
    ],
  };
}

function salesChannels(orders) {
  const channels = new Map();
  const total = orders.reduce((sum, order) => sum + toNumber(order.final_amount), 0);
  orders.forEach((order) => {
    const key = order.source || "pos";
    if (!channels.has(key)) channels.set(key, 0);
    channels.set(key, channels.get(key) + toNumber(order.final_amount));
  });
  return [...channels.entries()].map(([channel, revenue]) => ({
    channel,
    revenue,
    percentage: total ? Math.round((revenue / total) * 100) : 0,
  }));
}

function orderStatusData(orders) {
  const labels = {
    pending: "Cho xu ly",
    processing: "Dang xu ly",
    completed: "Hoan thanh",
    delivered: "Da giao",
    cancelled: "Da huy",
  };
  const summary = new Map();
  orders.forEach((order) => {
    if (!summary.has(order.status)) summary.set(order.status, 0);
    summary.set(order.status, summary.get(order.status) + 1);
  });
  return [...summary.entries()].map(([status, count]) => ({
    status,
    label: labels[status] || status,
    count,
  }));
}

function todayStats(db) {
  const today = dateKey(nowIso());
  const orders = db.orders.filter((order) => dateKey(order.created_at) === today);
  const revenue = orders.reduce((sum, order) => sum + toNumber(order.final_amount), 0);
  return {
    revenue,
    orders: orders.length,
    newCustomers: db.customers.filter((item) => dateKey(item.created_at) === today).length,
    avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
  };
}

function inventoryLookupList(db, params) {
  return db.products
    .filter((product) => {
      const query = params.query || "";
      return (
        !query ||
        includesText(product.name, query) ||
        includesText(product.code, query) ||
        product.variants.some((variant) => includesText(variant.sku, query))
      );
    })
    .map((product) => ({
      id: product.id,
      product_id: product.id,
      code: product.code,
      name: product.name,
      sku: product.variants[0]?.sku || "",
      barcode: product.variants[0]?.barcode || "",
      price: product.price,
      stock: product.stock,
      available: product.stock,
      total_stock: product.stock,
      imageUrl: product.main_image,
      image_url: product.main_image,
      stock_status: product.stock <= 0 ? "out" : product.stock <= 10 ? "low" : "ok",
    }));
}

function inventoryLookupDetail(db, productId) {
  const product = findProduct(db, productId);
  if (!product) return null;

  const stores = db.stores.map((store) => ({
    store_id: store.id,
    store_code: store.code,
    store_name: store.name,
    city: store.city,
    variants: product.variants
      .map((variant) => {
        const inventory = db.inventories.find(
          (item) => item.store_id === store.id && item.variant_id === variant.id,
        );
        return inventory
          ? {
              variant_id: variant.id,
              sku: variant.sku,
              stock: toNumber(inventory.quantity_available),
              location: inventory.location,
            }
          : null;
      })
      .filter(Boolean),
  }));

  return {
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description,
    is_active: product.is_active,
    price: product.price,
    total_stock: product.stock,
    imageUrl: product.main_image,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      barcode: variant.barcode,
      stock: variant.total_stock,
    })),
    stores: stores.filter((store) => store.variants.length > 0),
  };
}

function handleAuth(request, db) {
  if (request.path === "/api/auth/login" && request.method === "POST") {
    const username = String(
      request.body.username || request.body.email || "",
    ).toLowerCase();
    const user =
      db.staff.find((item) => item.username.toLowerCase() === username) ||
      db.staff.find((item) => item.email.toLowerCase() === username);

    if (!user) return fail("Sai ten dang nhap hoac mat khau", 401);

    const storeName = db.stores.find((store) => store.id === user.store_id)?.name || "";
    const payload = {
      token: `mock-token-${user.id}`,
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      role_name: user.role_name,
      store_id: user.store_id,
      store_name: storeName,
      avatar_url: user.avatar_url,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("token", payload.token);
      syncStoredUser({ ...user, store_name: storeName });
    }

    return success(payload, "Dang nhap thanh cong");
  }

  if (request.path === "/api/auth/logout" && request.method === "POST") {
    return success({}, "Dang xuat thanh cong");
  }

  return null;
}

function handleProfile(request, db) {
  const user = currentUser(db);
  if (!user) return null;

  if (request.path === "/api/users/profile" && request.method === "GET") {
    return success({
      ...user,
      gender: user.gender || "other",
      date_of_birth: user.date_of_birth || "1995-01-01",
      address: user.address || "Ho Chi Minh",
    });
  }

  if (request.path === "/api/users/profile" && request.method === "PUT") {
    let updatedUser = null;
    updateMockDb((draft) => {
      const index = draft.staff.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        draft.staff[index] = {
          ...draft.staff[index],
          ...request.body,
        };
        updatedUser = draft.staff[index];
      }
      return draft;
    });
    syncStoredUser(updatedUser);
    return success(updatedUser || user, "Cap nhat thanh cong");
  }

  if (request.path === "/api/users/change-password" && request.method === "PUT") {
    return success({}, "Doi mat khau thanh cong");
  }

  if (request.path === "/api/users/avatar" && request.method === "POST") {
    let updatedUser = null;
    updateMockDb((draft) => {
      const index = draft.staff.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        draft.staff[index].avatar_url = createSvgDataUri(
          draft.staff[index].full_name || "Avatar",
          "#DBEAFE",
          "#1D4ED8",
          240,
          240,
        );
        updatedUser = draft.staff[index];
      }
      return draft;
    });
    syncStoredUser(updatedUser);
    return success(updatedUser || user, "Cap nhat avatar thanh cong");
  }

  if (request.path === "/api/users/avatar" && request.method === "DELETE") {
    let updatedUser = null;
    updateMockDb((draft) => {
      const index = draft.staff.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        draft.staff[index].avatar_url = "";
        updatedUser = draft.staff[index];
      }
      return draft;
    });
    syncStoredUser(updatedUser);
    return success(updatedUser || user, "Da xoa avatar");
  }

  return null;
}

function handleMetadata(request, db) {
  const routes = {
    "/api/stores": db.stores,
    "/api/brands": db.brands,
    "/api/units": db.units,
    "/api/customer-groups": db.customer_groups,
    "/api/cashbook-types": db.cashbook_types,
    "/api/payment-methods": db.payment_methods,
    "/api/shipments/statuses": db.shipment_statuses,
    "/api/shipments/carriers": db.carriers,
    "/api/reports/staff": db.staff,
    "/api/transaction-types": [
      { code: "IMPORT", name: "Nhap kho" },
      { code: "TRANSFER_IN", name: "Chuyen kho nhan" },
      { code: "TRANSFER_OUT", name: "Chuyen kho xuat" },
      { code: "RETURN", name: "Tra nha cung cap" },
      { code: "ADJUST", name: "Dieu chinh" },
    ],
    "/api/discount/types": [
      { code: "PERCENTAGE", name: "Phan tram" },
      { code: "FIXED", name: "So tien co dinh" },
    ],
  };

  if (request.path === "/api/customers/cities" && request.method === "GET") {
    return success(db.cities);
  }

  if (request.method === "GET" && routes[request.path]) {
    return success(routes[request.path]);
  }

  return null;
}

function handleProducts(request, db) {
  if (request.path === "/api/products" && request.method === "GET") {
    const items = db.products.filter((product) => {
      if (
        request.params.search &&
        !(
          includesText(product.name, request.params.search) ||
          includesText(product.code, request.params.search) ||
          product.variants.some((variant) =>
            includesText(variant.sku, request.params.search),
          )
        )
      ) {
        return false;
      }
      if (
        request.params.brand_id &&
        toNumber(product.brand_id) !== toNumber(request.params.brand_id)
      ) {
        return false;
      }
      if (
        request.params.collection_id &&
        toNumber(product.collection_id) !== toNumber(request.params.collection_id)
      ) {
        return false;
      }
      return true;
    });

    const page = successPage(items, request.params.page, request.params.limit);
    return success(
      { products: page.data, total: page.pagination.total },
      "OK",
      { pagination: page.pagination },
    );
  }

  if (request.path === "/api/products/export" && request.method === "GET") {
    return raw(
      csvBlob([
        ["Code", "Name", "Brand", "Price", "Stock"],
        ...db.products.map((item) => [
          item.code,
          item.name,
          item.brand_name,
          item.price,
          item.stock,
        ]),
      ]),
      { "Content-Type": "text/csv;charset=utf-8" },
    );
  }

  if (request.path === "/api/products/import" && request.method === "POST") {
    return success({}, "Da nhap file mock");
  }

  if (request.path === "/api/products/bulk-status" && request.method === "PATCH") {
    updateMockDb((draft) => {
      draft.products.forEach((item) => {
        if ((request.body.product_ids || []).includes(item.id)) {
          item.is_active = !!request.body.is_active;
        }
      });
      return draft;
    });
    return success({}, "Cap nhat trang thai thanh cong");
  }

  if (request.path === "/api/products" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      const productId = nextId(draft, "product");
      const variantId = draft.products.reduce((max, item) => {
        return Math.max(max, ...(item.variants || []).map((variant) => variant.id));
      }, 1000) + 1;
      created = {
        id: productId,
        code: request.body.code || `SP${String(productId).padStart(3, "0")}`,
        name: request.body.name || "San pham moi",
        brand_id: toNumber(request.body.brand_id, 1),
        collection_id: toNumber(request.body.category_id || request.body.collection_id, 1),
        unit_id: toNumber(request.body.unit_id, 1),
        description: request.body.description || "",
        is_active: request.body.is_active !== false,
        image_url:
          request.body.image_url ||
          createSvgDataUri(request.body.name || "Product", "#DBEAFE", "#1D4ED8"),
        variants: [
          {
            id: variantId,
            name: request.body.variant_name || "Mac dinh",
            sku: request.body.sku || `SKU-${variantId}`,
            barcode: request.body.barcode || `8934673${variantId}`,
            cost_price: toNumber(request.body.cost_price, 0),
            selling_price: toNumber(request.body.selling_price, 0),
            reorder_point: 10,
          },
        ],
      };
      draft.products.unshift(created);
      draft.inventories.push({
        id: nextId(draft, "inventory"),
        product_id: productId,
        variant_id: variantId,
        store_id: currentUser(draft)?.store_id || 1,
        location: "Kho demo",
        quantity_available: 0,
        reserved: 0,
      });
      return draft;
    });
    return success(created, "Tao san pham thanh cong");
  }

  const productImageMatch = request.path.match(/^\/api\/products\/(\d+)\/image$/);
  if (productImageMatch) {
    const productId = toNumber(productImageMatch[1]);
    if (request.method === "POST") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.products.findIndex((item) => item.id === productId);
        if (index >= 0) {
          draft.products[index].image_url = createSvgDataUri(
            draft.products[index].name,
            "#DCFCE7",
            "#166534",
          );
          updated = draft.products[index];
        }
        return draft;
      });
      return success({ image_url: updated?.image_url || "" }, "Cap nhat anh thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        const product = draft.products.find((item) => item.id === productId);
        if (product) product.image_url = "";
        return draft;
      });
      return success({}, "Da xoa anh");
    }
  }

  const productImagesMatch = request.path.match(/^\/api\/products\/(\d+)\/images$/);
  if (productImagesMatch) {
    const productId = toNumber(productImagesMatch[1]);
    if (request.method === "GET") {
      const product = findProduct(db, productId);
      return success({
        main_image: product?.main_image || product?.image_url || "",
        gallery: product?.gallery || [],
      });
    }
    if (request.method === "POST") {
      return success({}, "Da upload gallery mock");
    }
  }

  const galleryDeleteMatch = request.path.match(/^\/api\/products\/(\d+)\/images\/(.+)$/);
  if (galleryDeleteMatch && request.method === "DELETE") {
    return success({}, "Da xoa anh gallery");
  }

  const primaryImageMatch = request.path.match(/^\/api\/products\/(\d+)\/images\/(.+)\/primary$/);
  if (primaryImageMatch && request.method === "PUT") {
    return success({}, "Da dat anh chinh");
  }

  const reorderImagesMatch = request.path.match(/^\/api\/products\/(\d+)\/images\/reorder$/);
  if (reorderImagesMatch && request.method === "PUT") {
    return success({}, "Da sap xep lai anh");
  }

  const productMatch = request.path.match(/^\/api\/products\/(\d+)$/);
  if (productMatch) {
    const id = toNumber(productMatch[1]);
    if (request.method === "GET") {
      return success(findProduct(db, id) || null);
    }
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.products.findIndex((item) => item.id === id);
        if (index >= 0) {
          const current = draft.products[index];
          draft.products[index] = {
            ...current,
            name: request.body.name ?? current.name,
            brand_id: request.body.brand_id ?? current.brand_id,
            collection_id:
              request.body.category_id ?? request.body.collection_id ?? current.collection_id,
            unit_id: request.body.unit_id ?? current.unit_id,
            description: request.body.description ?? current.description,
            is_active: request.body.is_active ?? current.is_active,
            image_url: request.body.image_url ?? current.image_url,
            variants: current.variants.map((variant, indexVariant) =>
              indexVariant === 0
                ? {
                    ...variant,
                    sku: request.body.sku ?? variant.sku,
                    barcode: request.body.barcode ?? variant.barcode,
                    cost_price: request.body.cost_price ?? variant.cost_price,
                    selling_price: request.body.selling_price ?? variant.selling_price,
                  }
                : variant,
            ),
          };
          updated = draft.products[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat san pham thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.products = draft.products.filter((item) => item.id !== id);
        draft.inventories = draft.inventories.filter((item) => item.product_id !== id);
        return draft;
      });
      return success({}, "Da xoa san pham");
    }
  }

  return null;
}

function buildCollectionTree(items, parentId = null) {
  return items
    .filter((item) => toNumber(item.parent_id, 0) === toNumber(parentId, 0))
    .map((item) => ({
      ...item,
      children: buildCollectionTree(items, item.id),
    }));
}

function handleCollections(request, db) {
  if (request.path === "/api/collections" && request.method === "GET") {
    const items = db.collections.filter((item) => {
      if (request.params.search && !includesText(item.name, request.params.search)) {
        return false;
      }
      if (
        request.params.parent_id !== undefined &&
        toNumber(item.parent_id, 0) !== toNumber(request.params.parent_id, 0)
      ) {
        return false;
      }
      return true;
    });
    return successPage(items, request.params.page, request.params.limit || 100);
  }

  if (request.path === "/api/collections/tree" && request.method === "GET") {
    return success(buildCollectionTree(db.collections));
  }

  if (request.path === "/api/catalogs" && request.method === "GET") {
    const items = db.catalogs.filter((item) => {
      const search = request.params.search || "";
      return (
        !search ||
        includesText(item.product_name, search) ||
        includesText(item.sku, search) ||
        includesText(item.brand_name, search)
      );
    });
    return successPage(items, request.params.page, request.params.limit || 100);
  }

  if (request.path === "/api/catalogs/export" && request.method === "GET") {
    return raw(
      csvBlob([
        ["Product", "SKU", "Cost", "Price", "Active"],
        ...db.catalogs.map((item) => [
          item.product_name,
          item.sku,
          item.cost_price,
          item.selling_price,
          item.is_active,
        ]),
      ]),
      { "Content-Type": "text/csv;charset=utf-8" },
    );
  }

  const collectionMatch = request.path.match(/^\/api\/collections\/(\d+)$/);
  if (collectionMatch) {
    const id = toNumber(collectionMatch[1]);

    if (request.method === "GET") {
      return success(db.collections.find((item) => item.id === id) || null);
    }

    if (request.method === "POST") return fail("Method not allowed", 405);

    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.collections.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.collections[index] = { ...draft.collections[index], ...request.body };
          updated = draft.collections[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat danh muc thanh cong");
    }

    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.collections = draft.collections.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa danh muc");
    }
  }

  if (request.path === "/api/collections" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "collection"),
        code: request.body.code || `CAT${Date.now()}`,
        name: request.body.name || "Danh muc moi",
        parent_id: request.body.parent_id || null,
        is_active: request.body.is_active !== false,
      };
      draft.collections.push(created);
      return draft;
    });
    return success(created, "Tao danh muc thanh cong");
  }

  const catalogMatch = request.path.match(/^\/api\/catalogs\/(\d+)$/);
  if (catalogMatch) {
    const id = toNumber(catalogMatch[1]);

    if (request.method === "GET") {
      return success(db.catalogs.find((item) => item.id === id) || null);
    }

    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const catalog = draft.catalogs.find((item) => item.id === id);
        if (!catalog) return draft;
        updated = { ...catalog, ...request.body };
        const product = draft.products.find((item) => item.id === catalog.product_id);
        const variant = product?.variants?.find((item) => item.id === catalog.variant_id);
        if (variant) {
          variant.cost_price = toNumber(request.body.cost_price, variant.cost_price);
          variant.selling_price = toNumber(
            request.body.selling_price,
            variant.selling_price,
          );
        }
        return draft;
      });
      return success(updated, "Cap nhat bang gia thanh cong");
    }
  }

  if (request.path === "/api/catalogs/bulk-update" && request.method === "PATCH") {
    updateMockDb((draft) => {
      const variantIds = request.body.variant_ids || [];
      draft.products.forEach((product) => {
        product.variants.forEach((variant) => {
          if (variantIds.includes(variant.id)) {
            const value = toNumber(request.body.price_change_value);
            if (request.body.price_change_type === "percentage") {
              variant.selling_price = Math.round(variant.selling_price * (1 + value / 100));
            } else {
              variant.selling_price += value;
            }
          }
        });
      });
      return draft;
    });
    return success({}, "Cap nhat hang loat thanh cong");
  }

  return null;
}

function handleCustomers(request, db) {
  if (request.path === "/api/customers/search" && request.method === "GET") {
    const limit = request.params.limit || 10;
    const query = request.params.q || "";
    const items = db.customers
      .filter((item) => {
        return (
          !query ||
          includesText(item.full_name, query) ||
          includesText(item.phone, query) ||
          includesText(item.email, query)
        );
      })
      .slice(0, toNumber(limit, 10));
    return success(items);
  }

  if (request.path === "/api/customers" && request.method === "GET") {
    const items = db.customers.filter((item) => {
      if (request.params.search) {
        const search = request.params.search;
        if (
          !(
            includesText(item.full_name, search) ||
            includesText(item.phone, search) ||
            includesText(item.email, search)
          )
        ) {
          return false;
        }
      }
      if (
        request.params.group_id &&
        toNumber(item.customer_group_id) !== toNumber(request.params.group_id)
      ) {
        return false;
      }
      return true;
    });
    return successPage(items, request.params.page, request.params.limit);
  }

  if (request.path === "/api/customers" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "customer"),
        code: `KH${String(draft.meta.ids.customer).padStart(3, "0")}`,
        full_name: request.body.full_name || request.body.name || "Khach hang moi",
        phone: request.body.phone || "",
        email: request.body.email || "",
        address: request.body.address || "",
        city_id: toNumber(request.body.city_id, 1),
        customer_group_id: toNumber(request.body.customer_group_id, 1),
        gender: request.body.gender || "other",
        created_at: nowIso(),
        avatar_url: createSvgDataUri("KH", "#DCFCE7", "#166534", 120, 120),
      };
      draft.customers.push(created);
      return draft;
    });
    return success(created, "Tao khach hang thanh cong");
  }

  const customerMatch = request.path.match(/^\/api\/customers\/(\d+)$/);
  if (customerMatch) {
    const id = toNumber(customerMatch[1]);
    if (request.method === "GET") {
      return success(db.customers.find((item) => item.id === id) || null);
    }
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.customers.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.customers[index] = { ...draft.customers[index], ...request.body };
          updated = draft.customers[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat khach hang thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.customers = draft.customers.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa khach hang");
    }
  }

  return null;
}

function handleSearch(request, db) {
  if (request.path !== "/api/search" || request.method !== "GET") return null;

  const query = request.params.q || "";
  const limit = toNumber(request.params.limit, 5);

  return success({
    products: db.products
      .filter((item) => includesText(item.name, query) || includesText(item.code, query))
      .slice(0, limit),
    orders: db.orders
      .filter(
        (item) =>
          includesText(item.order_code, query) || includesText(item.customer_name, query),
      )
      .slice(0, limit),
    customers: db.customers
      .filter(
        (item) =>
          includesText(item.full_name, query) || includesText(item.phone, query),
      )
      .slice(0, limit),
  });
}

function handleDashboard(request, db) {
  const orders = filterOrders(db, request.params);

  if (request.path === "/api/dashboard/overview" && request.method === "GET") {
    return success({
      recentOrders: orders.slice(0, 5),
    });
  }

  if (request.path === "/api/dashboard/stats" && request.method === "GET") {
    const summary = revenueSummary(orders);
    return success({
      revenue: summary.net_revenue,
      orders: summary.total_orders,
      newCustomers: db.customers.filter((item) =>
        isBetween(item.created_at, request.params.from, request.params.to),
      ).length,
      avgOrderValue: summary.avg_order_value,
    });
  }

  if (request.path === "/api/dashboard/revenue-chart" && request.method === "GET") {
    return success(revenueChart(orders, request.params.groupBy || "day"));
  }

  if (request.path === "/api/dashboard/top-products" && request.method === "GET") {
    return success(topProducts(orders, request.params.limit || 5));
  }

  if (request.path === "/api/dashboard/top-customers" && request.method === "GET") {
    return success(topCustomers(db, orders, request.params.limit || 5));
  }

  if (request.path === "/api/dashboard/low-stock" && request.method === "GET") {
    return success(lowStock(db, request.params.limit || 5));
  }

  if (request.path === "/api/dashboard/sales-channels" && request.method === "GET") {
    return success(salesChannels(orders));
  }

  if (request.path === "/api/dashboard/today-stats" && request.method === "GET") {
    return success(todayStats(db));
  }

  if (request.path === "/api/dashboard/order-status" && request.method === "GET") {
    return success(orderStatusData(orders));
  }

  return null;
}

function handleInventory(request, db) {
  if (request.path === "/api/inventory/lookup/search" && request.method === "GET") {
    const items = inventoryLookupList(db, request.params);
    return successPage(items, 1, request.params.limit || items.length || 20);
  }

  const lookupMatch = request.path.match(/^\/api\/inventory\/lookup\/(\d+)$/);
  if (lookupMatch && request.method === "GET") {
    const detail = inventoryLookupDetail(db, lookupMatch[1]);
    return detail ? success(detail) : fail("Khong tim thay san pham", 404);
  }

  if (request.path === "/api/inventories" && request.method === "GET") {
    const items = db.inventories
      .map((inventory) => {
        const found = getVariant(db.products, inventory.variant_id);
        return {
          ...inventory,
          product_id: found.product?.id,
          code: found.product?.code,
          name: found.product?.name,
          unit: found.product?.unit,
          sku: found.variant?.sku,
          barcode: found.variant?.barcode,
          stock_status:
            toNumber(inventory.quantity_available) <= 0
              ? "out"
              : toNumber(inventory.quantity_available) <= 10
                ? "low"
                : "ok",
        };
      })
      .filter((item) => {
        if (request.params.store_id && toNumber(item.store_id) !== toNumber(request.params.store_id)) {
          return false;
        }
        if (request.params.search) {
          return (
            includesText(item.name, request.params.search) ||
            includesText(item.code, request.params.search) ||
            includesText(item.sku, request.params.search)
          );
        }
        return true;
      });
    return successPage(items, request.params.page, request.params.limit);
  }

  if (request.path === "/api/inventories/transactions" && request.method === "GET") {
    const filters = String(request.params.type || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const items = db.inventory_transactions.filter((item) => {
      if (filters.length && !filters.includes(String(item.transaction_code || item.type).toLowerCase()) && !filters.includes(String(item.type || "").toLowerCase()) && !filters.includes(String(item.code || "").toLowerCase())) {
        return false;
      }
      if (request.params.store_id && toNumber(item.store_id) !== toNumber(request.params.store_id)) {
        return false;
      }
      if (!isBetween(item.created_at, request.params.from, request.params.to)) {
        return false;
      }
      return !request.params.search || includesText(item.transaction_code, request.params.search);
    });
    return successPage(sortItems(items), request.params.page, request.params.limit);
  }

  const inventoryHistoryMatch = request.path.match(/^\/api\/inventories\/(\d+)\/history$/);
  if (inventoryHistoryMatch && request.method === "GET") {
    const variantId = toNumber(inventoryHistoryMatch[1]);
    return success(
      sortItems(
        db.inventory_transactions.filter((item) => toNumber(item.variant_id) === variantId),
      ),
    );
  }

  const inventoryDetailMatch = request.path.match(/^\/api\/inventories\/(\d+)$/);
  if (inventoryDetailMatch) {
    const variantId = toNumber(inventoryDetailMatch[1]);
    if (request.method === "GET") {
      const found = getVariant(db.products, variantId);
      return success({
        variant_id: variantId,
        product: found.product,
        variant: found.variant,
        inventories: db.inventories.filter((item) => item.variant_id === variantId),
      });
    }
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        draft.inventories = draft.inventories.map((item) => {
          if (item.variant_id === variantId) {
            updated = { ...item, ...request.body };
            return updated;
          }
          return item;
        });
        return draft;
      });
      return success(updated, "Cap nhat ton kho thanh cong");
    }
  }

  if (request.path === "/api/inventories/receive" && request.method === "POST") {
    updateMockDb((draft) => {
      (request.body.items || []).forEach((item) => {
        const inventory = draft.inventories.find(
          (entry) =>
            entry.variant_id === toNumber(item.variant_id) &&
            entry.store_id === toNumber(request.body.store_id),
        );
        if (inventory) inventory.quantity_available += toNumber(item.quantity);
        else {
          draft.inventories.push({
            id: nextId(draft, "inventory"),
            product_id: getVariant(draft.products, toNumber(item.variant_id)).product?.id,
            variant_id: toNumber(item.variant_id),
            store_id: toNumber(request.body.store_id),
            location: "Kho nhan",
            quantity_available: toNumber(item.quantity),
            reserved: 0,
          });
        }
        draft.inventory_transactions.unshift({
          id: nextId(draft, "inventory_transaction"),
          transaction_code: `IMPORT-${Date.now()}`,
          variant_id: toNumber(item.variant_id),
          product_id: getVariant(draft.products, toNumber(item.variant_id)).product?.id,
          type: "import",
          quantity: toNumber(item.quantity),
          store_id: toNumber(request.body.store_id),
          location: "Kho nhan",
          notes: request.body.notes || "",
          created_at: nowIso(),
          created_by_id: currentUserId(),
        });
      });
      return draft;
    });
    return success({}, "Nhap kho thanh cong");
  }

  if (request.path === "/api/inventories/transfer" && request.method === "POST") {
    updateMockDb((draft) => {
      (request.body.items || []).forEach((item) => {
        const quantity = toNumber(item.quantity);
        const variantId = toNumber(item.variant_id);
        const fromInventory = draft.inventories.find(
          (entry) =>
            entry.variant_id === variantId &&
            entry.store_id === toNumber(request.body.from_store_id),
        );
        const toInventory = draft.inventories.find(
          (entry) =>
            entry.variant_id === variantId &&
            entry.store_id === toNumber(request.body.to_store_id),
        );
        if (fromInventory) fromInventory.quantity_available = Math.max(0, fromInventory.quantity_available - quantity);
        if (toInventory) toInventory.quantity_available += quantity;
        else {
          draft.inventories.push({
            id: nextId(draft, "inventory"),
            product_id: getVariant(draft.products, variantId).product?.id,
            variant_id: variantId,
            store_id: toNumber(request.body.to_store_id),
            location: "Kho nhan",
            quantity_available: quantity,
            reserved: 0,
          });
        }
      });
      return draft;
    });
    return success({}, "Chuyen kho thanh cong");
  }

  if (request.path === "/api/inventories/return" && request.method === "POST") {
    return success({}, "Da tao phieu tra nha cung cap");
  }

  return null;
}

function buildOrderItems(db, items = []) {
  return (items || []).map((item) => {
    const variantId = toNumber(item.variant_id || item.id);
    const found = getVariant(db.products, variantId);
    const quantity = toNumber(item.quantity, 1);
    const unitPrice = toNumber(
      item.unit_price || item.price || found.variant?.selling_price,
      0,
    );
    const discount = toNumber(item.discount_amount || item.discount || 0);
    return {
      product_id: found.product?.id,
      variant_id: found.variant?.id,
      name: found.product?.name || item.name || "San pham",
      variant_name: found.variant?.name || "",
      sku: found.variant?.sku || "",
      barcode: found.variant?.barcode || "",
      quantity,
      unit_price: unitPrice,
      discount_per_item: Math.round(discount / Math.max(quantity, 1)),
      cost_price: found.variant?.cost_price || 0,
      total: unitPrice * quantity,
      line_total: unitPrice * quantity,
    };
  });
}

function createOrderRecord(db, payload = {}, overrides = {}) {
  const items = buildOrderItems(db, payload.items || []);
  const subtotal = items.reduce((sum, item) => sum + toNumber(item.line_total), 0);
  const discountAmount = toNumber(payload.discount_amount || payload.discount || 0);
  const tax = toNumber(payload.tax, Math.round(subtotal * 0.08));
  const shipping = toNumber(payload.shipping || payload.shipping_fee || 0);
  const total = Math.max(0, subtotal - discountAmount + tax + shipping);
  const nextNumber = toNumber(db.meta.ids.order, 5000) + 1;

  return {
    id: nextNumber,
    order_code: payload.order_code || `DH${String(nextNumber).padStart(6, "0")}`,
    customer_id: payload.customer_id || payload.customerId || null,
    created_by_id: payload.created_by_id || currentUserId(),
    store_id: toNumber(payload.store_id || payload.storeId, currentUser(db)?.store_id || 1),
    created_at: nowIso(),
    updated_at: nowIso(),
    status: payload.status || "completed",
    payment_status: payload.payment_status || (payload.amount_received >= total ? "paid" : "unpaid"),
    payment_method: payload.payment_method || payload.paymentMethod || "cash",
    source: payload.source || "manual",
    notes: payload.notes || "",
    shipping_address: payload.shipping_address || "",
    receiver_name: payload.receiver_name || "",
    receiver_phone: payload.receiver_phone || "",
    amount_received: toNumber(payload.amount_received, total),
    change: Math.max(0, toNumber(payload.amount_received, total) - total),
    items,
    amount: {
      subtotal,
      discount: discountAmount,
      tax,
      shipping,
      total,
      final: total,
    },
    subtotal,
    discount_amount: discountAmount,
    final_amount: total,
    total_amount: total,
    ...overrides,
  };
}

function handleOrders(request, db) {
  if (request.path === "/api/orders" && request.method === "GET") {
    return successPage(filterOrders(db, request.params), request.params.page, request.params.limit);
  }

  if (request.path === "/api/orders" && request.method === "POST") {
    const order = createOrderRecord(db, request.body, { source: "manual" });
    updateMockDb((draft) => {
      draft.meta.ids.order = order.id;
      draft.orders.unshift(order);
      return draft;
    });
    return success(order, "Tao don hang thanh cong");
  }

  if (request.path === "/api/orders/stats/summary" && request.method === "GET") {
    const orders = filterOrders(db, request.params);
    return success(revenueSummary(orders));
  }

  if (request.path === "/api/orders/stats/detailed" && request.method === "GET") {
    const orders = filterOrders(db, request.params);
    return success({
      summary: revenueSummary(orders),
      by_payment_method: paymentSummary(orders),
      by_status: orderStatusData(orders),
    });
  }

  if (request.path === "/api/orders/drafts" && request.method === "GET") {
    const items = sortItems(
      db.order_drafts.filter((item) => {
        return !request.params.search || includesText(item.code, request.params.search);
      }),
    ).map((item) => ({
      ...item,
      order_code: item.code,
      created_by: currentUser(db)?.full_name || "Nhan vien",
      final_amount: item.total,
      note: item.notes,
    }));
    return successPage(items, request.params.page, request.params.limit);
  }

  if (request.path === "/api/orders/drafts" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      const id = nextId(draft, "order_draft");
      created = {
        id,
        code: `DR${String(id).slice(-3)}`,
        created_at: nowIso(),
        updated_at: nowIso(),
        store_id: toNumber(request.body.store_id, currentUser(draft)?.store_id || 1),
        customerId: request.body.customer_id || request.body.customerId || null,
        customer_name: request.body.customer_name || "Khach le",
        items: request.body.items || [],
        subtotal: toNumber(request.body.subtotal),
        discount: toNumber(request.body.discount),
        discount_amount: toNumber(request.body.discount_amount || request.body.discount),
        total: toNumber(request.body.total || request.body.final_amount),
        notes: request.body.notes || "",
      };
      draft.order_drafts.unshift(created);
      return draft;
    });
    return success(created, "Luu don nhap thanh cong");
  }

  const draftConvertMatch = request.path.match(/^\/api\/orders\/drafts\/(\d+)\/convert$/);
  if (draftConvertMatch && request.method === "POST") {
    const draftId = toNumber(draftConvertMatch[1]);
    const draft = db.order_drafts.find((item) => item.id === draftId);
    if (!draft) return fail("Khong tim thay don nhap", 404);

    const order = createOrderRecord(db, {
      customer_id: draft.customerId,
      items: draft.items,
      discount_amount: draft.discount_amount,
      payment_method: "cash",
      source: "draft",
      notes: draft.notes,
      store_id: draft.store_id,
    });

    updateMockDb((draftDb) => {
      draftDb.meta.ids.order = order.id;
      draftDb.orders.unshift(order);
      draftDb.order_drafts = draftDb.order_drafts.filter((item) => item.id !== draftId);
      return draftDb;
    });
    return success(order, "Da chuyen don nhap thanh don hang");
  }

  const draftMatch = request.path.match(/^\/api\/orders\/drafts\/(\d+)$/);
  if (draftMatch && request.method === "DELETE") {
    const id = toNumber(draftMatch[1]);
    updateMockDb((draft) => {
      draft.order_drafts = draft.order_drafts.filter((item) => item.id !== id);
      return draft;
    });
    return success({}, "Da xoa don nhap");
  }

  if (request.path === "/api/orders/returns" && request.method === "GET") {
    const items = db.order_returns
      .map((item) => {
        const order = findOrder(db, item.order_id);
        return {
          id: item.id,
          return_code: `TH${String(item.id).slice(-4)}`,
          original_order_code: item.order_code || order?.order_code || "",
          customer_name: order?.customer_name || "Khach le",
          return_date: item.created_at,
          refund_amount: item.refund_amount,
          status: item.status === "completed" ? "Đã hoàn tiền" : "Chờ xử lý",
          note: item.reason || "",
        };
      })
      .filter((item) => {
        if (request.params.search) {
          return (
            includesText(item.return_code, request.params.search) ||
            includesText(item.original_order_code, request.params.search) ||
            includesText(item.customer_name, request.params.search)
          );
        }
        return true;
      });
    return successPage(items, request.params.page, request.params.limit);
  }

  const createReturnMatch = request.path.match(/^\/api\/orders\/(\d+)\/return$/);
  if (createReturnMatch && request.method === "POST") {
    const orderId = toNumber(createReturnMatch[1]);
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "order_return"),
        order_id: orderId,
        order_code: findOrder(draft, orderId)?.order_code || "",
        reason: request.body.reason || "",
        refund_amount: toNumber(request.body.refund_amount || request.body.refundAmount),
        status: "completed",
        created_at: nowIso(),
      };
      draft.order_returns.unshift(created);
      return draft;
    });
    return success(created, "Tao don tra hang thanh cong");
  }

  const invoiceMatch = request.path.match(/^\/api\/orders\/(\d+)\/invoice$/);
  if (invoiceMatch && request.method === "GET") {
    const order = findOrder(db, invoiceMatch[1]);
    return order ? success(invoiceData(order)) : fail("Khong tim thay don hang", 404);
  }

  const orderMatch = request.path.match(/^\/api\/orders\/(\d+)$/);
  if (orderMatch) {
    const id = toNumber(orderMatch[1]);
    if (request.method === "GET") {
      const order = findOrder(db, id);
      return order ? success(order) : fail("Khong tim thay don hang", 404);
    }
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.orders.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.orders[index] = { ...draft.orders[index], ...request.body, updated_at: nowIso() };
          updated = draft.orders[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat don hang thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.orders = draft.orders.map((item) =>
          item.id === id
            ? { ...item, status: "cancelled", notes: request.body.reason || item.notes }
            : item,
        );
        return draft;
      });
      return success({}, "Da huy don hang");
    }
  }

  return null;
}

function handleCheckouts(request, db) {
  if (request.path === "/api/checkouts" && request.method === "GET") {
    return successPage(db.checkouts, request.params.page, request.params.limit);
  }

  if (request.path === "/api/checkouts/mass-email" && request.method === "POST") {
    return {
      success: true,
      sent_count: db.checkouts.length,
      message: "Da gui email hang loat",
    };
  }

  const sendLinkMatch = request.path.match(/^\/api\/checkouts\/(\d+)\/send-link$/);
  if (sendLinkMatch && request.method === "POST") {
    const id = toNumber(sendLinkMatch[1]);
    return {
      success: true,
      payment_link: `https://demo.pay.local/checkout/${id}`,
      message: "Da tao link thanh toan",
    };
  }

  const checkoutMatch = request.path.match(/^\/api\/checkouts\/(\d+)$/);
  if (checkoutMatch) {
    const id = toNumber(checkoutMatch[1]);
    if (request.method === "GET") {
      return success(db.checkouts.find((item) => item.id === id) || null);
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.checkouts = draft.checkouts.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa checkout");
    }
  }

  return null;
}

function handleDiscounts(request, db) {
  if (request.path === "/api/discounts" && request.method === "GET") {
    return successPage(db.discounts, request.params.page, request.params.limit || 50);
  }

  if (request.path === "/api/discounts" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "discount"),
        code: request.body.code || `DC${Date.now()}`,
        name: request.body.name || "Khuyen mai moi",
        status: request.body.status || "active",
        type_code: request.body.type_code || "PERCENTAGE",
        type: request.body.type || "percentage",
        value: toNumber(request.body.value, 0),
        minimum_order_amount: toNumber(request.body.minimum_order_amount, 0),
        customer_group_id: request.body.customer_group_id || null,
        description: request.body.description || "",
        start_date: request.body.start_date || dateKey(nowIso()),
        end_date: request.body.end_date || dateKey(nowIso()),
        is_active: request.body.is_active !== false,
      };
      draft.discounts.unshift(created);
      return draft;
    });
    return success(created, "Tao khuyen mai thanh cong");
  }

  const validateDiscount = (code, amount, customerId) => {
    const discount = db.discounts.find(
      (item) =>
        item.code?.toLowerCase() === String(code || "").toLowerCase() &&
        item.is_active,
    );
    if (!discount) return null;

    const customer = db.customers.find((item) => item.id === toNumber(customerId));
    if (
      discount.customer_group_id &&
      toNumber(customer?.customer_group_id) !== toNumber(discount.customer_group_id)
    ) {
      return null;
    }
    if (toNumber(amount) < toNumber(discount.minimum_order_amount)) return null;

    const discountAmount =
      discount.type_code === "PERCENTAGE"
        ? Math.round((toNumber(amount) * toNumber(discount.value)) / 100)
        : toNumber(discount.value);

    return {
      isValid: true,
      discount,
      discount_id: discount.id,
      code: discount.code,
      type: discount.type_code,
      value: discount.value,
      discount_amount: discountAmount,
      final_amount: Math.max(0, toNumber(amount) - discountAmount),
    };
  };

  if (request.path === "/api/discounts/validate" && request.method === "POST") {
    const result = validateDiscount(
      request.body.code,
      request.body.order_amount,
      request.body.customer_id,
    );
    return result ? success(result) : fail("Ma giam gia khong hop le", 400);
  }

  if (request.path === "/api/pos/discounts/active" && request.method === "GET") {
    const orderAmount = toNumber(request.params.order_amount, 0);
    const customerId = request.params.customer_id;
    const items = db.discounts.filter((item) => {
      if (!item.is_active) return false;
      if (orderAmount && orderAmount < toNumber(item.minimum_order_amount)) return false;
      if (!item.customer_group_id) return true;
      const customer = db.customers.find((entry) => entry.id === toNumber(customerId));
      return toNumber(customer?.customer_group_id) === toNumber(item.customer_group_id);
    });
    return success(items);
  }

  if (request.path === "/api/pos/discounts/validate" && request.method === "POST") {
    const result = validateDiscount(
      request.body.code,
      request.body.order_amount,
      request.body.customer_id,
    );
    return result ? success(result) : fail("Ma giam gia khong hop le", 400);
  }

  const discountDeactivateMatch = request.path.match(/^\/api\/discounts\/(\d+)\/deactivate$/);
  if (discountDeactivateMatch && request.method === "PATCH") {
    const id = toNumber(discountDeactivateMatch[1]);
    updateMockDb((draft) => {
      draft.discounts = draft.discounts.map((item) =>
        item.id === id ? { ...item, is_active: false, status: "expired" } : item,
      );
      return draft;
    });
    return success({}, "Da ket thuc khuyen mai");
  }

  const discountMatch = request.path.match(/^\/api\/discounts\/(\d+)$/);
  if (discountMatch) {
    const id = toNumber(discountMatch[1]);
    if (request.method === "GET") {
      return success(db.discounts.find((item) => item.id === id) || null);
    }
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.discounts.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.discounts[index] = { ...draft.discounts[index], ...request.body };
          updated = draft.discounts[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat khuyen mai thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.discounts = draft.discounts.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa khuyen mai");
    }
  }

  return null;
}

function handleShipments(request, db) {
  if (request.path === "/api/shipments" && request.method === "GET") {
    const items = db.shipments.filter((item) => {
      if (request.params.search) {
        return (
          includesText(item.shipment_code, request.params.search) ||
          includesText(item.tracking_code, request.params.search) ||
          includesText(item.recipient_name, request.params.search)
        );
      }
      if (request.params.status && item.status_code !== request.params.status) return false;
      if (request.params.store_id) {
        const order = db.orders.find((entry) => entry.id === item.order_id);
        if (toNumber(order?.store_id) !== toNumber(request.params.store_id)) return false;
      }
      return isBetween(item.created_at, request.params.from, request.params.to);
    });
    return successPage(sortItems(items), request.params.page, request.params.limit);
  }

  if (request.path === "/api/shipments/export" && request.method === "GET") {
    return raw(
      csvBlob([
        ["Code", "Order", "Recipient", "Carrier", "Status", "Fee"],
        ...db.shipments.map((item) => [
          item.shipment_code,
          item.order_code,
          item.recipient_name,
          item.carrier_name,
          item.status_code,
          item.total_fee,
        ]),
      ]),
      { "Content-Type": "text/csv;charset=utf-8" },
    );
  }

  if (request.path === "/api/shipments/import" && request.method === "POST") {
    return success({}, "Da import van don mock");
  }

  if (request.path === "/api/shipments/reports/dashboard" && request.method === "GET") {
    const filtered = db.shipments.filter((item) => isBetween(item.created_at, request.params.from, request.params.to));
    const statusSummary = new Map();
    filtered.forEach((item) => {
      statusSummary.set(item.status_code, (statusSummary.get(item.status_code) || 0) + 1);
    });
    return success({
      statusCards: [...statusSummary.entries()].map(([status, count]) => ({ status, count })),
      avgPickup: {
        labels: ["GHN", "GHTK", "Noi bo"],
        data: [32, 45, 18],
      },
      avgDelivery: {
        labels: ["GHN", "GHTK", "Noi bo"],
        data: [125, 162, 96],
      },
      successRate: {
        delivered: filtered.filter((item) => item.status_code === "delivered").length,
        failed: filtered.filter((item) => item.status_code === "failed").length,
        returnedCancelled: filtered.filter((item) =>
          ["returned", "cancelled"].includes(item.status_code),
        ).length,
      },
      weightDistribution: {
        labels: ["<2kg", "2-5kg", ">5kg"],
        data: [4, 7, 2],
      },
    });
  }

  const statusMatch = request.path.match(/^\/api\/shipments\/(\d+)\/status$/);
  if (statusMatch && request.method === "PATCH") {
    const id = toNumber(statusMatch[1]);
    let updated = null;
    updateMockDb((draft) => {
      const index = draft.shipments.findIndex((item) => item.id === id);
      if (index >= 0) {
        draft.shipments[index].status_code = request.body.status || draft.shipments[index].status_code;
        draft.shipments[index].tracking_history = [
          {
            status: request.body.status || draft.shipments[index].status_code,
            description: request.body.description || "Cap nhat trang thai",
            location: request.body.location || "Kho demo",
            created_at: nowIso(),
          },
          ...(draft.shipments[index].tracking_history || []),
        ];
        updated = draft.shipments[index];
      }
      return draft;
    });
    return success(updated, "Cap nhat trang thai van don thanh cong");
  }

  const shipmentMatch = request.path.match(/^\/api\/shipments\/(\d+)$/);
  if (shipmentMatch) {
    const id = toNumber(shipmentMatch[1]);
    if (request.method === "GET") {
      return success(db.shipments.find((item) => item.id === id) || null);
    }
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.shipments.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.shipments[index] = { ...draft.shipments[index], ...request.body };
          updated = draft.shipments[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat van don thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.shipments = draft.shipments.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa van don");
    }
  }

  if (request.path === "/api/shipments" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "shipment"),
        shipment_code: `VC${String(draft.meta.ids.shipment).padStart(3, "0")}`,
        order_id: toNumber(request.body.order_id),
        order_code: findOrder(draft, request.body.order_id)?.order_code || "",
        recipient_name: request.body.recipient_name || "Khach hang",
        recipient_phone: request.body.recipient_phone || "",
        recipient_address: request.body.recipient_address || "",
        carrier_id: toNumber(request.body.carrier_id, 1),
        carrier_name: draft.carriers.find((item) => item.id === toNumber(request.body.carrier_id, 1))?.name || "",
        shipping_fee: toNumber(request.body.shipping_fee, 0),
        total_fee: toNumber(request.body.shipping_fee, 0),
        status_code: request.body.status_code || "pending",
        tracking_code: `TRACK${Date.now()}`,
        created_at: nowIso(),
        tracking_history: [],
      };
      draft.shipments.unshift(created);
      return draft;
    });
    return success(created, "Tao van don thanh cong");
  }

  return null;
}

function handleCashbook(request, db) {
  const filterTransactions = (items) =>
    items.filter((item) => {
      if (request.params.store_id && toNumber(item.store_id) !== toNumber(request.params.store_id)) return false;
      if (request.params.status && item.status !== request.params.status) return false;
      if (!isBetween(item.created_at || item.transaction_date, request.params.from, request.params.to)) return false;
      if (request.params.search) {
        return (
          includesText(item.transaction_code, request.params.search) ||
          includesText(item.description, request.params.search)
        );
      }
      return true;
    });

  if (request.path === "/api/transactions" && request.method === "GET") {
    return successPage(sortItems(filterTransactions(db.transactions)), request.params.page, request.params.limit);
  }

  if (request.path === "/api/transactions/summary" && request.method === "GET") {
    const items = filterTransactions(db.transactions);
    const totals = items.reduce(
      (accumulator, item) => {
        const amount = toNumber(item.amount);
        if (toNumber(item.transaction_direction, 0) > 0) accumulator.total_income += amount;
        else accumulator.total_expense += amount;
        return accumulator;
      },
      { total_income: 0, total_expense: 0 },
    );
    totals.net_amount = totals.total_income - totals.total_expense;
    const byStore = db.stores.map((store) => ({
      store_id: store.id,
      store_name: store.name,
      pending_count: items.filter((item) => item.store_id === store.id && item.status === "pending").length,
    }));
    return success({ totals, by_store: byStore });
  }

  if (request.path === "/api/transactions/my-transactions" && request.method === "GET") {
    const items = filterTransactions(
      db.transactions.filter((item) => toNumber(item.created_by_id) === currentUserId()),
    );
    const summary = {
      total_income: items.filter((item) => item.transaction_direction > 0).reduce((sum, item) => sum + toNumber(item.amount), 0),
      total_expense: items.filter((item) => item.transaction_direction < 0).reduce((sum, item) => sum + toNumber(item.amount), 0),
      count: items.length,
    };
    summary.net = summary.total_income - summary.total_expense;
    return {
      success: true,
      data: items,
      summary,
      message: "OK",
      timestamp: nowIso(),
    };
  }

  if (request.path === "/api/transactions" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      const type =
        draft.cashbook_types.find((item) => item.id === toNumber(request.body.cashbook_type_id)) ||
        draft.cashbook_types.find((item) => item.code === request.body.cashbook_type) ||
        draft.cashbook_types[0];
      const method =
        draft.payment_methods.find((item) => item.id === toNumber(request.body.payment_method_id)) ||
        draft.payment_methods.find((item) => item.code === request.body.payment_method) ||
        draft.payment_methods[0];
      created = {
        id: nextId(draft, "transaction"),
        transaction_code: `${type.transaction_direction > 0 ? "PT" : "PC"}${String(draft.meta.ids.transaction).padStart(3, "0")}`,
        transaction_type: type.transaction_direction > 0 ? "thu" : "chi",
        cashbook_type_id: type.id,
        amount: toNumber(request.body.amount),
        store_id: toNumber(request.body.store_id, currentUser(draft)?.store_id || 1),
        payment_method_id: method.id,
        status: "pending",
        description: request.body.description || "",
        recipient_name: request.body.recipient_name || "",
        notes: request.body.notes || "",
        created_at: nowIso(),
        transaction_date: dateKey(nowIso()),
        created_by_id: currentUserId(),
        approved_by_id: null,
      };
      draft.transactions.unshift(created);
      return draft;
    });
    return success(created, "Tao phieu thu chi thanh cong");
  }

  const approveMatch = request.path.match(/^\/api\/transactions\/(\d+)\/approve$/);
  if (approveMatch && request.method === "PATCH") {
    const id = toNumber(approveMatch[1]);
    let updated = null;
    updateMockDb((draft) => {
      const index = draft.transactions.findIndex((item) => item.id === id);
      if (index >= 0) {
        draft.transactions[index].status = request.body.action === "reject" ? "rejected" : "approved";
        draft.transactions[index].approved_by_id = currentUserId();
        updated = draft.transactions[index];
      }
      return draft;
    });
    return success(updated, "Da cap nhat duyet giao dich");
  }

  const transactionMatch = request.path.match(/^\/api\/transactions\/(\d+)$/);
  if (transactionMatch) {
    const id = toNumber(transactionMatch[1]);
    if (request.method === "GET") {
      return success(db.transactions.find((item) => item.id === id) || null);
    }
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.transactions.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.transactions[index] = { ...draft.transactions[index], ...request.body };
          updated = draft.transactions[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat giao dich thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.transactions = draft.transactions.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa giao dich");
    }
  }

  return null;
}

function handleReports(request, db) {
  const orders = filterOrders(db, request.params);
  const returns = db.order_returns.filter((item) => isBetween(item.created_at, request.params.from || request.params.date, request.params.to || request.params.date));
  const byStaff = new Map();
  orders.forEach((order) => {
    const staff = db.staff.find((item) => item.id === order.created_by_id);
    if (!byStaff.has(order.created_by_id)) {
      byStaff.set(order.created_by_id, {
        staff_id: order.created_by_id,
        staff_name: staff?.full_name || "Nhan vien",
        order_count: 0,
        total_amount: 0,
      });
    }
    const row = byStaff.get(order.created_by_id);
    row.order_count += 1;
    row.total_amount += toNumber(order.final_amount);
  });

  if (request.path === "/api/reports/daily" && request.method === "GET") {
    return success({
      summary: revenueSummary(orders),
      by_payment_method: paymentSummary(orders),
      by_staff: [...byStaff.values()],
      returns: {
        return_count: returns.length,
        refund_total: returns.reduce((sum, item) => sum + toNumber(item.refund_amount), 0),
      },
    });
  }

  if (request.path === "/api/reports/actual-revenue" && request.method === "GET") {
    const paidOrders = orders.filter((item) => item.payment_status === "paid");
    const totalPaid = paidOrders.reduce((sum, item) => sum + toNumber(item.final_amount), 0);
    const totalPending = orders
      .filter((item) => item.payment_status !== "paid")
      .reduce((sum, item) => sum + toNumber(item.final_amount), 0);
    const totalRefund = returns.reduce((sum, item) => sum + toNumber(item.refund_amount), 0);
    const txItems = db.transactions.filter((item) => isBetween(item.created_at, request.params.from, request.params.to));
    const cashbookIncome = txItems.filter((item) => item.transaction_direction > 0).reduce((sum, item) => sum + toNumber(item.amount), 0);
    const cashbookExpense = txItems.filter((item) => item.transaction_direction < 0).reduce((sum, item) => sum + toNumber(item.amount), 0);
    const netActual = totalPaid - totalRefund;
    const cashbookNet = cashbookIncome - cashbookExpense;
    return success({
      summary: {
        total_paid: totalPaid,
        total_pending: totalPending,
        total_refund: totalRefund,
        net_actual: netActual,
        cashbook_income: cashbookIncome,
        cashbook_expense: cashbookExpense,
        cashbook_net: cashbookNet,
        grand_total: netActual + cashbookNet,
      },
      by_method: paymentSummary(paidOrders),
    });
  }

  if (request.path === "/api/reports/sold-products" && request.method === "GET") {
    const report = soldProductsData(orders);
    const page = paginate(report.products, request.params.page, request.params.limit || 50);
    return success(
      { products: page.items, summary: report.summary },
      "OK",
      { pagination: page.pagination },
    );
  }

  if (request.path === "/api/reports/daily/print" && request.method === "GET") {
    return success({
      report_info: {
        date: request.params.date || dateKey(nowIso()),
        staff_filter: request.params.staff_id || "Tat ca",
        store_filter: request.params.store_id || "Tat ca",
        generated_at: nowIso(),
        generated_by: currentUser(db)?.full_name || "Admin",
      },
      revenue_summary: revenueSummary(orders),
      actual_revenue: {
        by_payment: paymentSummary(orders),
        total: orders.reduce((sum, item) => sum + toNumber(item.final_amount), 0),
        returns: {
          count: returns.length,
          amount: returns.reduce((sum, item) => sum + toNumber(item.refund_amount), 0),
        },
        net_actual:
          orders.reduce((sum, item) => sum + toNumber(item.final_amount), 0) -
          returns.reduce((sum, item) => sum + toNumber(item.refund_amount), 0),
      },
      top_products: topProducts(orders, 10),
      orders_list: orders.slice(0, 20).map((item) => ({
        code: item.order_code,
        time: item.created_at,
        customer: item.customer_name,
        payment_method: item.payment_method,
        status: item.status,
        amount: item.final_amount,
      })),
    });
  }

  if (request.path === "/api/reports/submit" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "report"),
        report_code: `RPT${String(draft.meta.ids.report).padStart(3, "0")}`,
        title: request.body.title || "Bao cao cuoi ngay",
        period_from: request.body.period_from,
        period_to: request.body.period_to,
        store_id: currentUser(draft)?.store_id || 1,
        store_name: currentUser(draft)?.store_name || draft.stores[0]?.name || "",
        submitted_by_id: currentUserId(),
        submitted_by_name: currentUser(draft)?.full_name || "Nhan vien",
        submitted_at: nowIso(),
        status: "submitted",
        notes: request.body.notes || "",
        net_revenue: toNumber(request.body.revenue_summary?.net_revenue),
        total_orders: toNumber(request.body.revenue_summary?.total_orders),
        revenue_summary: request.body.revenue_summary || {},
        actual_summary: request.body.actual_summary || {},
        by_payment_method: request.body.by_payment_method || [],
      };
      draft.reports_submitted.unshift(created);
      return draft;
    });
    return success(created, "Nop bao cao thanh cong");
  }

  if (request.path === "/api/reports/submitted" && request.method === "GET") {
    const items = db.reports_submitted.filter((item) => {
      if (request.params.search && !includesText(item.report_code, request.params.search)) return false;
      if (request.params.status && item.status !== request.params.status) return false;
      return true;
    });
    return successPage(sortItems(items, "submitted_at"), request.params.page, request.params.limit);
  }

  const reportStatusMatch = request.path.match(/^\/api\/reports\/submitted\/(\d+)\/status$/);
  if (reportStatusMatch && request.method === "PATCH") {
    const id = toNumber(reportStatusMatch[1]);
    let updated = null;
    updateMockDb((draft) => {
      const index = draft.reports_submitted.findIndex((item) => item.id === id);
      if (index >= 0) {
        draft.reports_submitted[index].status = request.body.status || draft.reports_submitted[index].status;
        updated = draft.reports_submitted[index];
      }
      return draft;
    });
    const response = success(updated, "Cap nhat trang thai bao cao thanh cong");
    if (request.body.status === "approved") {
      response.data = {
        ...updated,
        cashbook_transaction: {
          transaction_code: "PT-MOCK",
        },
      };
    }
    return response;
  }

  const reportMatch = request.path.match(/^\/api\/reports\/submitted\/(\d+)$/);
  if (reportMatch && request.method === "GET") {
    return success(db.reports_submitted.find((item) => item.id === toNumber(reportMatch[1])) || null);
  }

  if (request.path === "/reports/overview" || request.path === "/reports/revenue" || request.path === "/reports") {
    return success([]);
  }

  return null;
}

function handleStaff(request, db) {
  if (request.path === "/api/staff" && request.method === "GET") {
    return successPage(sortItems(db.staff, "created_at"), request.params.page, request.params.limit || 50);
  }

  if (request.path === "/api/staff" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "staff"),
        username: request.body.username || `staff${draft.meta.ids.staff}`,
        full_name: request.body.full_name || request.body.name || "Nhan vien moi",
        email: request.body.email || "",
        phone: request.body.phone || "",
        role_id: toNumber(request.body.role_id, 2),
        role_name: toNumber(request.body.role_id, 2) === 1 ? "Admin" : "Staff",
        store_id: toNumber(request.body.store_id, 1),
        is_active: request.body.is_active !== false,
        created_at: nowIso(),
        avatar_url: createSvgDataUri("NV", "#E0E7FF", "#1E3A8A", 120, 120),
      };
      draft.staff.unshift(created);
      return draft;
    });
    return success(created, "Tao nhan vien thanh cong");
  }

  const roleMatch = request.path.match(/^\/api\/staff\/(\d+)\/role$/);
  if (roleMatch && request.method === "PUT") {
    const id = toNumber(roleMatch[1]);
    let updated = null;
    updateMockDb((draft) => {
      const index = draft.staff.findIndex((item) => item.id === id);
      if (index >= 0) {
        draft.staff[index].role_id = toNumber(request.body.role_id, draft.staff[index].role_id);
        draft.staff[index].role_name = draft.staff[index].role_id === 1 ? "Admin" : "Staff";
        updated = draft.staff[index];
      }
      return draft;
    });
    return success(updated, "Cap nhat vai tro thanh cong");
  }

  const staffMatch = request.path.match(/^\/api\/staff\/(\d+)$/);
  if (staffMatch) {
    const id = toNumber(staffMatch[1]);
    if (request.method === "GET") return success(db.staff.find((item) => item.id === id) || null);
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.staff.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.staff[index] = { ...draft.staff[index], ...request.body };
          updated = draft.staff[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat nhan vien thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.staff = draft.staff.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa nhan vien");
    }
  }

  return null;
}

function handlePos(request, db) {
  if (request.path === "/api/pos/products/search" && request.method === "GET") {
    const query = request.params.q || "";
    const items = db.products.flatMap((product) =>
      product.variants
        .filter(
          (variant) =>
            !query ||
            includesText(product.name, query) ||
            includesText(variant.sku, query) ||
            includesText(variant.barcode, query),
        )
        .map((variant) => ({
          id: variant.id,
          variant_id: variant.id,
          product_id: product.id,
          name: product.name,
          sku: variant.sku,
          barcode: variant.barcode,
          price: variant.selling_price,
          stock: variant.total_stock,
          available: variant.total_stock,
          image: product.main_image,
        })),
    );
    return success(items.slice(0, toNumber(request.params.limit, 20)));
  }

  const priceMatch = request.path.match(/^\/api\/pos\/products\/(\d+)\/price$/);
  if (priceMatch && request.method === "GET") {
    const found = getVariant(db.products, toNumber(priceMatch[1]));
    return success({
      variant_id: found.variant?.id,
      price: found.variant?.selling_price || 0,
      stock: found.variant?.total_stock || 0,
      available: found.variant?.total_stock || 0,
    });
  }

  if (request.path === "/api/pos/orders/drafts" && request.method === "GET") {
    return success({ drafts: db.order_drafts });
  }

  const posDraftDetailMatch = request.path.match(/^\/api\/pos\/orders\/drafts\/(\d+)$/);
  if (posDraftDetailMatch && request.method === "GET") {
    return success(db.order_drafts.find((item) => item.id === toNumber(posDraftDetailMatch[1])) || null);
  }

  if (request.path === "/api/pos/orders/draft/create-empty" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "order_draft"),
        code: `DR${String(draft.meta.ids.order_draft).slice(-3)}`,
        store_id: toNumber(request.body.store_id, currentUser(draft)?.store_id || 1),
        created_at: nowIso(),
        updated_at: nowIso(),
        customerId: null,
        customer_name: "Khach le",
        items: [],
        subtotal: 0,
        discount: 0,
        discount_amount: 0,
        total: 0,
        notes: "",
      };
      draft.order_drafts.unshift(created);
      return draft;
    });
    return success(created, "Tao don nhap rong thanh cong");
  }

  if (request.path === "/api/pos/orders/draft" && request.method === "POST") {
    let created = null;
    updateMockDb((draft) => {
      created = {
        id: nextId(draft, "order_draft"),
        code: `DR${String(draft.meta.ids.order_draft).slice(-3)}`,
        created_at: nowIso(),
        updated_at: nowIso(),
        ...request.body,
      };
      draft.order_drafts.unshift(created);
      return draft;
    });
    return success(created, "Luu draft POS thanh cong");
  }

  const posDraftMutateMatch = request.path.match(/^\/api\/pos\/orders\/draft\/(\d+)$/);
  if (posDraftMutateMatch) {
    const id = toNumber(posDraftMutateMatch[1]);
    if (request.method === "PUT") {
      let updated = null;
      updateMockDb((draft) => {
        const index = draft.order_drafts.findIndex((item) => item.id === id);
        if (index >= 0) {
          draft.order_drafts[index] = {
            ...draft.order_drafts[index],
            ...request.body,
            updated_at: nowIso(),
          };
          updated = draft.order_drafts[index];
        }
        return draft;
      });
      return success(updated, "Cap nhat draft POS thanh cong");
    }
    if (request.method === "DELETE") {
      updateMockDb((draft) => {
        draft.order_drafts = draft.order_drafts.filter((item) => item.id !== id);
        return draft;
      });
      return success({}, "Da xoa draft POS");
    }
  }

  if (request.path === "/api/pos/checkout" && request.method === "POST") {
    const order = createOrderRecord(db, request.body, {
      source: "pos",
      status: request.body.payment_method === "delivery" ? "processing" : "completed",
      payment_status: request.body.payment_method === "delivery" ? "unpaid" : "paid",
    });
    updateMockDb((draft) => {
      draft.meta.ids.order = order.id;
      draft.orders.unshift(order);
      (order.items || []).forEach((item) => {
        const inventory = draft.inventories.find(
          (entry) =>
            entry.variant_id === item.variant_id &&
            entry.store_id === toNumber(order.store_id),
        );
        if (inventory) {
          inventory.quantity_available = Math.max(
            0,
            toNumber(inventory.quantity_available) - toNumber(item.quantity),
          );
        }
      });
      return draft;
    });
    return success({
      order_id: order.id,
      receiptId: order.id,
      order_code: order.order_code,
      total_amount: order.final_amount,
    });
  }

  const receiptMatch = request.path.match(/^\/api\/pos\/orders\/(\d+)\/receipt$/);
  if (receiptMatch && request.method === "GET") {
    const order = findOrder(db, receiptMatch[1]);
    return order ? success(receiptData(order)) : fail("Khong tim thay hoa don", 404);
  }

  if (request.path === "/api/pos/payment-methods" && request.method === "GET") {
    return success(db.payment_methods);
  }

  if (request.path === "/api/pos/qr/generate" && request.method === "POST") {
    return success({
      qr_url: createSvgDataUri("QR PAY", "#F0FDF4", "#166534", 260, 260),
      bank_name: "Vietcombank",
      account_number: "0123456789",
      account_name: "MINI MART DEMO",
      amount: toNumber(request.body.amount),
      transfer_content: request.body.order_info || `POS-${Date.now()}`,
    });
  }

  if (request.path === "/api/pos/qr/check-payment" && request.method === "GET") {
    return success({ paid: false, transaction: null });
  }

  return null;
}

function handleChatbot(request) {
  if (request.path === "/api/chatbot/faq" && request.method === "GET") {
    return success({
      faqs: [
        { category: "Mua hang", question: "San pham demo co fake data khong?", answer: "Co. Toan bo du lieu dang doc tu mock adapter trong frontend." },
        { category: "Thanh toan", question: "Co the demo QR khong?", answer: "Co. He thong tao QR demo va co the xac nhan thu cong trong giao dien." },
      ],
    });
  }

  if (request.path === "/api/chatbot/message" && request.method === "POST") {
    return success({
      reply: `Demo mode: "${request.body.message}" dang duoc tra loi bang mock data.`,
      intent: "faq",
      type: "text",
      session_id: request.body.session_id || `chat_${Date.now()}`,
    });
  }

  if (request.path === "/api/chatbot/history" && request.method === "GET") {
    return success([]);
  }

  if (request.path === "/api/chatbot/history" && request.method === "DELETE") {
    return success({}, "Da xoa lich su chat");
  }

  if (request.path === "/api/chatbot/suggestions" && request.method === "GET") {
    return success(["Tim san pham", "Kiem tra ton kho", "Bao cao doanh thu"]);
  }

  return null;
}

function routeRequest(request) {
  const db = getMockDb();
  const handlers = [
    handleAuth,
    handleProfile,
    handleMetadata,
    handleProducts,
    handleCollections,
    handleCustomers,
    handleSearch,
    handleDashboard,
    handleInventory,
    handleOrders,
    handleCheckouts,
    handleDiscounts,
    handleShipments,
    handleCashbook,
    handleReports,
    handleStaff,
    handlePos,
    handleChatbot,
  ];

  for (const handler of handlers) {
    const result = handler(request, db);
    if (result !== null) return result;
  }

  if (request.path === "/suppliers" && request.method === "GET") {
    return success(db.suppliers);
  }
  if (request.path === "/suppliers/returns" && request.method === "POST") {
    return success({}, "Da tao phieu tra NCC");
  }
  if (request.path === "/users" && request.method === "GET") {
    return success(db.staff);
  }

  return request.method === "GET" ? success([]) : success({});
}

export async function mockAdapter(config) {
  const request = makeRequest(config);

  if (request.path === "/api/mock/reset" && request.method === "POST") {
    const data = resetMockDb();
    return buildResponse(config, success(data, "Mock data reset"));
  }

  const payload = routeRequest(request);
  if (payload?.__raw) {
    return buildResponse(
      config,
      payload.data,
      payload.status || 200,
      { ...DEFAULT_HEADERS, ...payload.headers },
    );
  }
  const status = payload.success === false ? payload.code || 400 : 200;
  return buildResponse(config, payload, status);
}
