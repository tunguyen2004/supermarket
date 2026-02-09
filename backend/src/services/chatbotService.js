/**
 * ============================================================================
 *                    MODULE 19: CHATBOT SERVICE
 * ============================================================================
 * Chatbot hỗ trợ quản lý siêu thị — Offline (không cần API bên ngoài)
 * 
 * Cơ chế:
 * - Keyword Matching (regex tiếng Việt) → phân loại intent
 * - Query trực tiếp PostgreSQL → lấy dữ liệu thật
 * - Format response thân thiện → trả cho user
 * - FAQ tĩnh cho câu hỏi nghiệp vụ
 * - Lưu lịch sử chat theo session
 * 
 * Không phụ thuộc API bên ngoài, hoạt động offline 100%
 * ============================================================================
 */

const db = require('../config/database');
const faqData = require('../data/chatbotFAQ.json');
const response = require('../utils/responseHelper');

// ============ INTENT DEFINITIONS ============

const INTENTS = {
  PRODUCT_SEARCH: 'product_search',
  PRODUCT_COUNT: 'product_count',
  PRODUCT_LOW_STOCK: 'product_low_stock',
  PRODUCT_INFO: 'product_info',
  REVENUE_TODAY: 'revenue_today',
  REVENUE_OVERVIEW: 'revenue_overview',
  TOP_PRODUCTS: 'top_products',
  TOP_CUSTOMERS: 'top_customers',
  INVENTORY_CHECK: 'inventory_check',
  INVENTORY_BY_STORE: 'inventory_by_store',
  TRANSACTION_SUMMARY: 'transaction_summary',
  TRANSACTION_RECENT: 'transaction_recent',
  CUSTOMER_COUNT: 'customer_count',
  CUSTOMER_SEARCH: 'customer_search',
  ORDER_RECENT: 'order_recent',
  ORDER_STATS: 'order_stats',
  STORE_LIST: 'store_list',
  FAQ: 'faq',
  GREETING: 'greeting',
  UNKNOWN: 'unknown',
};

// ============ INTENT PERMISSIONS (RBAC) ============
// role_id: 1 = Admin, 2 = Sales Staff, 3 = Manager
// null = tất cả user đã login đều được dùng
// [1, 3] = chỉ Admin và Manager

const INTENT_PERMISSIONS = {
  [INTENTS.GREETING]:            null,
  [INTENTS.FAQ]:                 null,
  [INTENTS.UNKNOWN]:             null,
  [INTENTS.PRODUCT_SEARCH]:      null,
  [INTENTS.PRODUCT_COUNT]:       null,
  [INTENTS.PRODUCT_INFO]:        null,
  [INTENTS.PRODUCT_LOW_STOCK]:   null,
  [INTENTS.INVENTORY_CHECK]:     null,
  [INTENTS.INVENTORY_BY_STORE]:  null,
  [INTENTS.STORE_LIST]:          null,
  [INTENTS.CUSTOMER_COUNT]:      null,
  [INTENTS.CUSTOMER_SEARCH]:     null,
  [INTENTS.ORDER_RECENT]:        null,
  [INTENTS.ORDER_STATS]:         null,
  // --- Nhạy cảm: chỉ Manager & Admin ---
  [INTENTS.REVENUE_TODAY]:       [1, 3],
  [INTENTS.REVENUE_OVERVIEW]:    [1, 3],
  [INTENTS.TOP_PRODUCTS]:        [1, 3],
  [INTENTS.TOP_CUSTOMERS]:       [1, 3],
  [INTENTS.TRANSACTION_SUMMARY]: [1, 3],
  [INTENTS.TRANSACTION_RECENT]:  [1, 3],
};

const ROLE_NAMES = { 1: 'Admin', 2: 'Nhân viên', 3: 'Quản lý' };

/**
 * Kiểm tra user có quyền sử dụng intent này không
 * @param {string} intent
 * @param {number} roleId
 * @returns {{ allowed: boolean, message?: string }}
 */
function checkIntentPermission(intent, roleId) {
  const allowed = INTENT_PERMISSIONS[intent];
  if (allowed === null || allowed === undefined) return { allowed: true };
  if (allowed.includes(roleId)) return { allowed: true };
  return {
    allowed: false,
    message: `🔒 Bạn không có quyền xem thông tin này.\nChức năng này yêu cầu quyền **${allowed.map(r => ROLE_NAMES[r]).join(' / ')}**.\nVai trò hiện tại của bạn: **${ROLE_NAMES[roleId] || 'Không xác định'}**.`,
  };
}

// ============================================================================
//                    INTENT DETECTION — KEYWORD MATCHING
// ============================================================================

function detectIntent(message) {
  const msg = message.toLowerCase().trim();

  // --- Greeting ---
  if (/^(xin\s+)?ch[aà]o|^hello|^hi\b|^hey|chào bạn|chào\s/.test(msg)) {
    return { intent: INTENTS.GREETING, params: {} };
  }

  // --- Low stock ---
  if (/s[ắa]p\s*h[ếe]t|h[ếe]t\s*h[àa]ng|low[\s_-]?stock|c[ạa]n\s*h[àa]ng|thi[ếe]u\s*h[àa]ng/.test(msg)) {
    return { intent: INTENTS.PRODUCT_LOW_STOCK, params: {} };
  }

  // --- Product count ---
  if (/bao\s*nhi[êe]u\s*s[ảa]n\s*ph[ẩa]m|t[ổo]ng\s*(s[ốo]\s*)?s[ảa]n\s*ph[ẩa]m|s[ốo]\s*l[ưượ]ng\s*s[ảa]n\s*ph[ẩa]m|product\s*count|how\s*many\s*product/.test(msg)) {
    return { intent: INTENTS.PRODUCT_COUNT, params: {} };
  }

  // --- Product search / info ---
  if (/t[ìi]m\s*(ki[ếe]m\s*)?s[ảa]n\s*ph[ẩa]m|search\s*product|find\s*product/.test(msg)) {
    const match = msg.match(/t[ìi]m\s*(?:ki[ếe]m\s*)?(?:s[ảa]n\s*ph[ẩa]m)?\s*(.+)/);
    const term = match?.[1]?.trim() || '';
    return { intent: INTENTS.PRODUCT_SEARCH, params: { search_term: term } };
  }
  if (/th[ôo]ng\s*tin\s*s[ảa]n\s*ph[ẩa]m|chi\s*ti[ếe]t\s*s[ảa]n\s*ph[ẩa]m|product\s*info|product\s*detail/.test(msg)) {
    const match = msg.match(/(?:th[ôo]ng\s*tin|chi\s*ti[ếe]t)\s*(?:s[ảa]n\s*ph[ẩa]m)?\s*(.+)/);
    return { intent: INTENTS.PRODUCT_INFO, params: { search_term: match?.[1]?.trim() || '' } };
  }

  // --- Revenue today ---
  if (/doanh\s*thu\s*(?:c[ủu]a\s*)?h[ôo]m\s*nay|today.*revenue|revenue.*today/.test(msg)) {
    return { intent: INTENTS.REVENUE_TODAY, params: {} };
  }
  // --- Revenue overview ---
  if (/doanh\s*thu|revenue|t[ổo]ng\s*quan\s*doanh/.test(msg)) {
    return { intent: INTENTS.REVENUE_OVERVIEW, params: {} };
  }

  // --- Top products ---
  if (/top\s*\d*\s*s[ảa]n\s*ph[ẩa]m|b[áa]n\s*ch[ạa]y|best[\s_-]?sell|top\s*\d*\s*product/.test(msg)) {
    const match = msg.match(/top\s*(\d+)/);
    return { intent: INTENTS.TOP_PRODUCTS, params: { limit: match ? parseInt(match[1]) : 5 } };
  }

  // --- Top customers ---
  if (/top\s*\d*\s*kh[áa]ch|kh[áa]ch.*nhi[ềe]u\s*nh[ấa]t|top\s*\d*\s*customer/.test(msg)) {
    const match = msg.match(/top\s*(\d+)/);
    return { intent: INTENTS.TOP_CUSTOMERS, params: { limit: match ? parseInt(match[1]) : 5 } };
  }

  // --- Inventory by store ---
  if (/t[ồo]n\s*kho\s*(t[ạa]i|[ởo]|c[ủu]a)\s*(c[ửu]a\s*h[àa]ng|chi\s*nh[áa]nh)\s*(.+)/i.test(msg)) {
    const match = msg.match(/t[ồo]n\s*kho\s*(?:t[ạa]i|[ởo]|c[ủu]a)\s*(?:c[ửu]a\s*h[àa]ng|chi\s*nh[áa]nh)\s*(.+)/i);
    return { intent: INTENTS.INVENTORY_BY_STORE, params: { store_name: match?.[1]?.trim() || '' } };
  }

  // --- Inventory check ---
  if (/t[ồo]n\s*kho|inventory|stock/.test(msg)) {
    const match = msg.match(/(?:t[ồo]n\s*kho|inventory|stock)\s*(?:c[ủu]a|of|cho)?\s*(.+)/i);
    if (match && match[1]?.trim().length > 1) {
      return { intent: INTENTS.INVENTORY_CHECK, params: { search_term: match[1].trim() } };
    }
    return { intent: INTENTS.INVENTORY_CHECK, params: { search_term: '' } };
  }

  // --- Transactions ---
  if (/thu\s*chi|s[ổo]\s*qu[ỹy]|cashbook|giao\s*d[ịi]ch/.test(msg)) {
    if (/g[ầa]n\s*[đd][âa]y|recent|m[ớo]i\s*nh[ấa]t/.test(msg)) {
      const match = msg.match(/(\d+)\s*(?:giao\s*d[ịi]ch|phi[ếe]u)/);
      return { intent: INTENTS.TRANSACTION_RECENT, params: { limit: match ? parseInt(match[1]) : 5 } };
    }
    return { intent: INTENTS.TRANSACTION_SUMMARY, params: {} };
  }

  // --- Orders ---
  if (/[đd][ơo]n\s*h[àa]ng|order/.test(msg)) {
    if (/g[ầa]n\s*[đd][âa]y|recent|m[ớo]i\s*nh[ấa]t/.test(msg)) {
      const match = msg.match(/(\d+)\s*[đd][ơo]n/);
      return { intent: INTENTS.ORDER_RECENT, params: { limit: match ? parseInt(match[1]) : 5 } };
    }
    return { intent: INTENTS.ORDER_STATS, params: {} };
  }

  // --- Stores ---
  if (/c[ửu]a\s*h[àa]ng|store|chi\s*nh[áa]nh|danh\s*s[áa]ch.*c[ửu]a/.test(msg)) {
    return { intent: INTENTS.STORE_LIST, params: {} };
  }

  // --- Customer search ---
  if (/t[ìi]m\s*(ki[ếe]m\s*)?kh[áa]ch\s*h[àa]ng|search\s*customer|find\s*customer/.test(msg)) {
    const match = msg.match(/t[ìi]m\s*(?:ki[ếe]m\s*)?(?:kh[áa]ch\s*h[àa]ng)?\s*(.+)/);
    return { intent: INTENTS.CUSTOMER_SEARCH, params: { search_term: match?.[1]?.trim() || '' } };
  }

  // --- Customer count ---
  if (/kh[áa]ch\s*h[àa]ng|customer|bao\s*nhi[êe]u\s*kh[áa]ch/.test(msg)) {
    return { intent: INTENTS.CUSTOMER_COUNT, params: {} };
  }

  // --- FAQ / Guide --- (catch many question types)
  // Direct FAQ keyword match first — check against all FAQ keywords in the file
  const faqMatch = faqData.faqs.find(faq => {
    const msgLower = msg;
    // Check if message closely matches any FAQ keyword
    return faq.keywords.some(kw => msgLower.includes(kw.toLowerCase()));
  });
  if (faqMatch) {
    return { intent: INTENTS.FAQ, params: { topic: msg, directMatch: faqMatch.id } };
  }

  // Pattern-based FAQ detection
  if (/h[ưướ]+ng\s*d[ẫa]n|c[áa]ch\s*(t[ạa]o|th[êe]m|nh[ậa]p|x[óo]a|s[ửu]a|s[ửu]\s*d[ụu]ng|upload|c[ậa]p\s*nh[ậa]t)|l[àa]m\s*sao|how\s*to|quy\s*tr[ìi]nh|l[àa]\s*g[ìi]|th[ếe]\s*n[àa]o|c[óo]\s*nh[ữu]ng|nh[ữu]ng\s*lo[ạa]i|bao\s*g[ồo]m|kh[áa]c\s*nhau|s[ựu]\s*kh[áa]c|qu[êe]n\s*m[ậa]t|[đd][ổo]i\s*m[ậa]t|c[ôo]ng\s*ngh[ệe]|tech\s*stack|api\s*doc|swagger|[đd][ăa]ng\s*nh[ậa]p|login|ph[ưươ]+ng\s*th[ứu]c\s*thanh|tr[ạa]ng\s*th[áa]i\s*[đd][ơo]n|vai\s*tr[òo]|role|ph[âa]n\s*quy[ềe]n|quy[ềe]n\s*staff|gi[ớo]i\s*h[ạa]n|min\s*stock|t[ồo]n.*t[ốo]i\s*thi[ểe]u|gi[ảa]m\s*gi[áa]|discount|coupon|kh[ôo]ng\s*xem\s*[đd][ượ]+c|in\s*h[óo]a\s*[đd][ơo]n|xu[ấa]t\s*(file|d[ữu]\s*li[ệe]u|csv|excel)|nh[àa]\s*cung\s*c[ấa]p|supplier|ng[âa]n\s*h[àa]ng|bank\s*account|g[áa]n\s*s[ảa]n\s*ph[ẩa]m|chatbot\s*c[óo]\s*th[ểe]|chatbot.*ai|b[áa]o\s*c[áa]o|report|dashboard/.test(msg)) {
    return { intent: INTENTS.FAQ, params: { topic: msg } };
  }

  return { intent: INTENTS.UNKNOWN, params: {} };
}

// ============================================================================
//                    INTENT HANDLERS (DB QUERIES)
// ============================================================================
// DB Schema: All PKs use column "id"
// dim_products(id, code, name, brand_id, unit_id, is_active)
// dim_product_variants(id, product_id, sku, variant_name, cost_price, selling_price, is_active)
// fact_inventory_stocks(store_id, variant_id, quantity_on_hand, quantity_reserved, min_stock_level)
// dim_stores(id, code, name, city_id, address, phone, is_active)
// dim_customers(id, code, full_name, phone, email, customer_group_id, city_id)
// subdim_customer_groups(id, name, discount_percentage)
// fact_orders(id, order_code, date_key, customer_id, store_id, status, final_amount, discount_amount, payment_method, created_at)
// fact_order_items(id, order_id, variant_id, quantity, unit_price, line_total)
// fact_cashbook_transactions(id, transaction_code, date_key, store_id, cashbook_type_id, amount, status, description, created_at)
// subdim_cashbook_types(id, code, name, transaction_direction) -- 1=thu, -1=chi
// subdim_brands(id, name), subdim_units(id, name), subdim_cities(id, name)
// ============================================================================

const intentHandlers = {

  async [INTENTS.PRODUCT_SEARCH](params) {
    const search = params.search_term || '';
    const result = await db.query(`
      SELECT p.id, p.name, p.code, b.name as brand, p.is_active,
             COUNT(pv.id) as variant_count,
             MIN(pv.selling_price) as min_price,
             MAX(pv.selling_price) as max_price
      FROM dim_products p
      LEFT JOIN subdim_brands b ON p.brand_id = b.id
      LEFT JOIN dim_product_variants pv ON p.id = pv.product_id
      WHERE (p.name ILIKE $1 OR p.code ILIKE $1 OR b.name ILIKE $1)
      GROUP BY p.id, p.name, p.code, b.name, p.is_active
      ORDER BY p.name LIMIT 10
    `, [`%${search}%`]);

    if (result.rows.length === 0) {
      return { type: 'product_list', count: 0, data: [], message: `❌ Không tìm thấy sản phẩm nào khớp với "${search}".` };
    }
    const lines = result.rows.map((p, i) =>
      `${i + 1}. **${p.name}** (${p.code}) — ${p.brand || 'N/A'} — ${fmtVND(p.min_price)}${p.min_price !== p.max_price ? ' ~ ' + fmtVND(p.max_price) : ''}`
    );
    return {
      type: 'product_list', count: result.rows.length, data: result.rows,
      message: `🔍 Tìm thấy ${result.rows.length} sản phẩm khớp "${search}":\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.PRODUCT_COUNT]() {
    const result = await db.query(`
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE is_active = true) as active_products,
             COUNT(*) FILTER (WHERE is_active = false) as inactive
      FROM dim_products
    `);
    const d = result.rows[0];
    return {
      type: 'stats', data: d,
      message: `📦 Hệ thống có **${d.total} sản phẩm** (${d.active_products} đang bán, ${d.inactive} ngừng bán).`,
    };
  },

  async [INTENTS.PRODUCT_LOW_STOCK]() {
    const result = await db.query(`
      SELECT p.name, p.code, pv.variant_name, pv.sku,
             COALESCE(fis.quantity_on_hand, 0) as quantity,
             fis.min_stock_level, s.name as store_name
      FROM dim_product_variants pv
      JOIN dim_products p ON pv.product_id = p.id
      LEFT JOIN fact_inventory_stocks fis ON pv.id = fis.variant_id
      LEFT JOIN dim_stores s ON fis.store_id = s.id
      WHERE COALESCE(fis.quantity_on_hand, 0) <= COALESCE(fis.min_stock_level, 0)
        AND p.is_active = true AND pv.is_active = true AND fis.min_stock_level > 0
      ORDER BY COALESCE(fis.quantity_on_hand, 0) ASC LIMIT 15
    `);

    if (result.rows.length === 0) {
      return { type: 'low_stock_list', count: 0, data: [], message: '✅ Tất cả sản phẩm đều đủ hàng!' };
    }
    const lines = result.rows.map((r, i) =>
      `${i + 1}. **${r.name}** (${r.sku}) — Tồn: ${Number(r.quantity).toLocaleString()} / Min: ${Number(r.min_stock_level).toLocaleString()} — ${r.store_name || 'N/A'}`
    );
    return {
      type: 'low_stock_list', count: result.rows.length, data: result.rows,
      message: `⚠️ Có **${result.rows.length} sản phẩm** sắp hết hàng:\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.PRODUCT_INFO](params) {
    const search = params.search_term || '';
    const result = await db.query(`
      SELECT p.id, p.name, p.code, b.name as brand, u.name as unit, p.is_active, p.description,
             json_agg(json_build_object(
               'variant_name', pv.variant_name, 'sku', pv.sku,
               'selling_price', pv.selling_price, 'cost_price', pv.cost_price, 'weight', pv.weight
             )) FILTER (WHERE pv.id IS NOT NULL) as variants
      FROM dim_products p
      LEFT JOIN subdim_brands b ON p.brand_id = b.id
      LEFT JOIN subdim_units u ON p.unit_id = u.id
      LEFT JOIN dim_product_variants pv ON p.id = pv.product_id
      WHERE (p.name ILIKE $1 OR p.code ILIKE $1)
      GROUP BY p.id, p.name, p.code, b.name, u.name, p.is_active, p.description
      LIMIT 1
    `, [`%${search}%`]);

    if (result.rows.length === 0) {
      return { type: 'not_found', message: `❌ Không tìm thấy sản phẩm "${search}".` };
    }
    const p = result.rows[0];
    let msg = `📋 **${p.name}** (${p.code})\n• Thương hiệu: ${p.brand || 'N/A'}\n• Đơn vị: ${p.unit || 'N/A'}\n• Trạng thái: ${p.is_active ? '✅ Đang bán' : '🚫 Ngừng bán'}`;
    if (p.variants) {
      msg += '\n• Biến thể:';
      p.variants.forEach(v => { msg += `\n  — ${v.variant_name || v.sku}: ${fmtVND(v.selling_price)}`; });
    }
    return { type: 'product_detail', data: p, message: msg };
  },

  async [INTENTS.REVENUE_TODAY]() {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.query(`
      SELECT COALESCE(COUNT(*), 0) as total_orders,
             COALESCE(SUM(fo.final_amount), 0) as total_revenue,
             COALESCE(SUM(fo.discount_amount), 0) as total_discount,
             COALESCE(AVG(fo.final_amount), 0) as avg_order_value
      FROM fact_orders fo
      WHERE fo.date_key = $1 AND fo.status != 'cancelled'
    `, [today]);
    const d = result.rows[0];
    return {
      type: 'revenue', data: d,
      message: `💰 Doanh thu hôm nay (${today}):\n• Tổng: **${fmtVND(d.total_revenue)}**\n• Số đơn: ${d.total_orders}\n• TB/đơn: ${fmtVND(d.avg_order_value)}\n• Giảm giá: ${fmtVND(d.total_discount)}`,
    };
  },

  async [INTENTS.REVENUE_OVERVIEW]() {
    const result = await db.query(`
      SELECT COUNT(*) as total_orders,
             COALESCE(SUM(final_amount), 0) as total_revenue,
             COALESCE(AVG(final_amount), 0) as avg_order,
             COUNT(DISTINCT customer_id) as unique_customers
      FROM fact_orders WHERE status != 'cancelled'
    `);
    const d = result.rows[0];
    return {
      type: 'overview', data: d,
      message: `📊 Tổng quan doanh thu:\n• Doanh thu: **${fmtVND(d.total_revenue)}**\n• Đơn hàng: ${d.total_orders}\n• TB/đơn: ${fmtVND(d.avg_order)}\n• Khách hàng: ${d.unique_customers}`,
    };
  },

  async [INTENTS.TOP_PRODUCTS](params) {
    const limit = params.limit || 5;
    const result = await db.query(`
      SELECT p.name, p.code, pv.variant_name,
             SUM(foi.quantity) as total_sold, SUM(foi.line_total) as total_revenue
      FROM fact_order_items foi
      JOIN dim_product_variants pv ON foi.variant_id = pv.id
      JOIN dim_products p ON pv.product_id = p.id
      JOIN fact_orders fo ON foi.order_id = fo.id
      WHERE fo.status != 'cancelled'
      GROUP BY p.name, p.code, pv.variant_name
      ORDER BY total_sold DESC LIMIT $1
    `, [limit]);
    const lines = result.rows.map((r, i) =>
      `${i + 1}. **${r.name}** — Bán: ${Number(r.total_sold).toLocaleString()} — DT: ${fmtVND(r.total_revenue)}`
    );
    return {
      type: 'ranking', data: result.rows,
      message: `🏆 Top ${limit} sản phẩm bán chạy:\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.TOP_CUSTOMERS](params) {
    const limit = params.limit || 5;
    const result = await db.query(`
      SELECT c.full_name, c.phone, c.email,
             COUNT(fo.id) as total_orders, COALESCE(SUM(fo.final_amount), 0) as total_spent
      FROM dim_customers c
      JOIN fact_orders fo ON c.id = fo.customer_id
      WHERE fo.status != 'cancelled'
      GROUP BY c.id, c.full_name, c.phone, c.email
      ORDER BY total_spent DESC LIMIT $1
    `, [limit]);
    const lines = result.rows.map((r, i) =>
      `${i + 1}. **${r.full_name}** (${r.phone}) — ${r.total_orders} đơn — ${fmtVND(r.total_spent)}`
    );
    return {
      type: 'ranking', data: result.rows,
      message: `👑 Top ${limit} khách hàng:\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.INVENTORY_CHECK](params) {
    const search = params.search_term || '';
    const result = await db.query(`
      SELECT p.name, p.code, pv.variant_name, pv.sku, s.name as store_name,
             COALESCE(fis.quantity_on_hand, 0) as quantity, fis.min_stock_level
      FROM dim_product_variants pv
      JOIN dim_products p ON pv.product_id = p.id
      LEFT JOIN fact_inventory_stocks fis ON pv.id = fis.variant_id
      LEFT JOIN dim_stores s ON fis.store_id = s.id
      WHERE (p.name ILIKE $1 OR p.code ILIKE $1 OR pv.sku ILIKE $1) AND p.is_active = true
      ORDER BY p.name, s.name LIMIT 20
    `, [`%${search}%`]);

    if (result.rows.length === 0) {
      return { type: 'inventory_list', count: 0, data: [], message: `❌ Không tìm thấy tồn kho cho "${search}".` };
    }
    const lines = result.rows.map(r =>
      `• **${r.name}** (${r.sku}) — ${r.store_name || 'Chưa phân kho'}: ${Number(r.quantity).toLocaleString()} sp`
    );
    return {
      type: 'inventory_list', count: result.rows.length, data: result.rows,
      message: `📦 Tồn kho "${search}" (${result.rows.length} bản ghi):\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.INVENTORY_BY_STORE](params) {
    const storeName = params.store_name || '';
    const result = await db.query(`
      SELECT s.name as store_name, s.address,
             COUNT(DISTINCT pv.id) as total_variants,
             SUM(COALESCE(fis.quantity_on_hand, 0)) as total_stock,
             COUNT(*) FILTER (WHERE COALESCE(fis.quantity_on_hand, 0) <= COALESCE(fis.min_stock_level, 0) AND fis.min_stock_level > 0) as low_stock_count
      FROM dim_stores s
      LEFT JOIN fact_inventory_stocks fis ON s.id = fis.store_id
      LEFT JOIN dim_product_variants pv ON fis.variant_id = pv.id
      WHERE s.name ILIKE $1 AND s.is_active = true
      GROUP BY s.id, s.name, s.address
    `, [`%${storeName}%`]);

    if (result.rows.length === 0) {
      return { type: 'not_found', message: `❌ Không tìm thấy cửa hàng "${storeName}".` };
    }
    const lines = result.rows.map(s =>
      `🏪 **${s.store_name}**\n  📍 ${s.address}\n  📦 ${s.total_variants} mặt hàng — Tổng tồn: ${Number(s.total_stock).toLocaleString()} — ⚠️ Sắp hết: ${s.low_stock_count}`
    );
    return { type: 'store_inventory', data: result.rows, message: lines.join('\n') };
  },

  async [INTENTS.TRANSACTION_SUMMARY]() {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN ct.transaction_direction = 1 THEN fct.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN ct.transaction_direction = -1 THEN fct.amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE fct.status = 'pending') as pending_count
      FROM fact_cashbook_transactions fct
      JOIN subdim_cashbook_types ct ON fct.cashbook_type_id = ct.id
    `);
    const d = result.rows[0];
    const balance = Number(d.total_income) - Number(d.total_expense);
    return {
      type: 'transaction_summary', data: { ...d, balance },
      message: `💵 Sổ quỹ tổng hợp:\n• Thu: **${fmtVND(d.total_income)}**\n• Chi: **${fmtVND(d.total_expense)}**\n• Tồn quỹ: **${fmtVND(balance)}**\n• Tổng phiếu: ${d.total_transactions} (${d.pending_count} chờ duyệt)`,
    };
  },

  async [INTENTS.TRANSACTION_RECENT](params) {
    const limit = params.limit || 5;
    const result = await db.query(`
      SELECT fct.transaction_code, ct.name as type_name, ct.transaction_direction,
             fct.amount, fct.description, fct.status, fct.date_key as transaction_date,
             s.name as store_name
      FROM fact_cashbook_transactions fct
      JOIN subdim_cashbook_types ct ON fct.cashbook_type_id = ct.id
      LEFT JOIN dim_stores s ON fct.store_id = s.id
      ORDER BY fct.created_at DESC LIMIT $1
    `, [limit]);
    const lines = result.rows.map(r => {
      const dir = r.transaction_direction === 1 ? '📈 Thu' : '📉 Chi';
      return `• ${dir} **${fmtVND(r.amount)}** — ${r.type_name} — ${r.store_name || 'N/A'} (${r.status})`;
    });
    return {
      type: 'transaction_list', data: result.rows,
      message: `💵 ${limit} giao dịch gần đây:\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.CUSTOMER_COUNT]() {
    const result = await db.query('SELECT COUNT(*) as total FROM dim_customers');
    return {
      type: 'stats', data: result.rows[0],
      message: `👥 Hệ thống có **${result.rows[0].total} khách hàng**.`,
    };
  },

  async [INTENTS.CUSTOMER_SEARCH](params) {
    const search = params.search_term || '';
    const result = await db.query(`
      SELECT c.full_name, c.phone, c.email, c.gender,
             cg.name as group_name,
             COUNT(fo.id) as order_count, COALESCE(SUM(fo.final_amount), 0) as total_spent
      FROM dim_customers c
      LEFT JOIN subdim_customer_groups cg ON c.customer_group_id = cg.id
      LEFT JOIN fact_orders fo ON c.id = fo.customer_id AND fo.status != 'cancelled'
      WHERE (c.full_name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1)
      GROUP BY c.id, c.full_name, c.phone, c.email, c.gender, cg.name
      LIMIT 10
    `, [`%${search}%`]);

    if (result.rows.length === 0) {
      return { type: 'customer_list', data: [], message: `❌ Không tìm thấy khách hàng "${search}".` };
    }
    const lines = result.rows.map((c, i) =>
      `${i + 1}. **${c.full_name}** — ${c.phone} — ${c.group_name || 'Chưa phân nhóm'} — ${c.order_count} đơn — ${fmtVND(c.total_spent)}`
    );
    return {
      type: 'customer_list', data: result.rows,
      message: `👥 Tìm thấy ${result.rows.length} khách hàng:\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.ORDER_RECENT](params) {
    const limit = params.limit || 5;
    const result = await db.query(`
      SELECT fo.id, fo.order_code, fo.final_amount, fo.status,
             fo.payment_method, fo.created_at,
             c.full_name as customer_name, s.name as store_name
      FROM fact_orders fo
      LEFT JOIN dim_customers c ON fo.customer_id = c.id
      LEFT JOIN dim_stores s ON fo.store_id = s.id
      ORDER BY fo.created_at DESC LIMIT $1
    `, [limit]);
    const statusEmoji = { completed: '✅', pending: '⏳', cancelled: '❌' };
    const lines = result.rows.map(o =>
      `• ${statusEmoji[o.status] || '❓'} **${o.order_code}** — ${fmtVND(o.final_amount)} — ${o.customer_name || 'Khách lẻ'} — ${o.store_name}`
    );
    return {
      type: 'order_list', data: result.rows,
      message: `🧾 ${limit} đơn hàng gần đây:\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.ORDER_STATS]() {
    const result = await db.query(`
      SELECT COUNT(*) as total_orders,
             COUNT(*) FILTER (WHERE status = 'completed') as completed,
             COUNT(*) FILTER (WHERE status = 'pending') as pending,
             COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
             COALESCE(SUM(CASE WHEN status != 'cancelled' THEN final_amount ELSE 0 END), 0) as total_revenue
      FROM fact_orders
    `);
    const d = result.rows[0];
    return {
      type: 'order_stats', data: d,
      message: `📊 Thống kê đơn hàng:\n• Tổng: **${d.total_orders}** đơn\n• ✅ Hoàn thành: ${d.completed}\n• ⏳ Chờ xử lý: ${d.pending}\n• ❌ Đã hủy: ${d.cancelled}\n• 💰 Doanh thu: **${fmtVND(d.total_revenue)}**`,
    };
  },

  async [INTENTS.STORE_LIST]() {
    const result = await db.query(`
      SELECT s.id, s.name, s.address, s.phone, s.is_active, c.name as city_name
      FROM dim_stores s
      LEFT JOIN subdim_cities c ON s.city_id = c.id
      WHERE s.is_active = true ORDER BY s.name
    `);
    const lines = result.rows.map((s, i) =>
      `${i + 1}. 🏪 **${s.name}**\n   📍 ${s.address} — ${s.city_name || ''}\n   📞 ${s.phone || 'N/A'}`
    );
    return {
      type: 'store_list', data: result.rows,
      message: `🏪 Danh sách ${result.rows.length} cửa hàng:\n${lines.join('\n')}`,
    };
  },

  async [INTENTS.FAQ](params) {
    const topic = (params.topic || '').toLowerCase();

    // 1) Direct match by FAQ id (from detectIntent keyword match)
    if (params.directMatch) {
      const faq = faqData.faqs.find(f => f.id === params.directMatch);
      if (faq) {
        return {
          type: 'faq', data: [{ question: faq.question, answer: faq.answer }],
          message: `📖 **${faq.question}**\n\n${faq.answer}`,
        };
      }
    }

    // 2) Smart multi-word matching: split topic into words, score each FAQ
    const words = topic.replace(/[?!.,]/g, '').split(/\s+/).filter(w => w.length > 1);
    const scored = faqData.faqs.map(faq => {
      const haystack = (faq.keywords.join(' ') + ' ' + faq.question + ' ' + faq.category).toLowerCase();
      let score = 0;
      for (const w of words) {
        if (haystack.includes(w)) score++;
      }
      // Bonus for exact keyword match
      for (const kw of faq.keywords) {
        if (topic.includes(kw.toLowerCase())) score += 3;
      }
      return { faq, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const best = scored[0].faq;
      // If top match is clearly best, show single detailed answer
      if (scored[0].score >= 3 || scored.length === 1) {
        return {
          type: 'faq', data: [{ question: best.question, answer: best.answer }],
          message: `📖 **${best.question}**\n\n${best.answer}`,
        };
      }
      // Multiple decent matches — show top answer + related list
      const related = scored.slice(1, 4).map(s => `• ${s.faq.question}`).join('\n');
      return {
        type: 'faq', data: scored.slice(0, 4).map(s => ({ question: s.faq.question, answer: s.faq.answer })),
        message: `📖 **${best.question}**\n\n${best.answer}\n\n📚 **Câu hỏi liên quan:**\n${related}`,
      };
    }

    // 3) No match — show random categories as suggestions
    const cats = [...new Set(faqData.faqs.map(f => f.category))];
    const sampleFaqs = cats.slice(0, 6).map(cat => {
      const first = faqData.faqs.find(f => f.category === cat);
      return `• ${first.question}`;
    });
    return {
      type: 'faq_not_found', data: sampleFaqs,
      message: `❓ Không tìm thấy hướng dẫn phù hợp.\n\n📚 **Một số câu hỏi gợi ý:**\n${sampleFaqs.join('\n')}`,
    };
  },

  async [INTENTS.GREETING]() {
    return {
      type: 'greeting',
      message: '👋 Xin chào! Tôi là trợ lý của **MiniMart**. Tôi có thể giúp bạn:\n\n'
        + '📦 Tìm kiếm sản phẩm, kiểm tra tồn kho\n'
        + '💰 Xem doanh thu, thống kê đơn hàng\n'
        + '👥 Tra cứu khách hàng\n'
        + '💵 Xem sổ quỹ thu chi\n'
        + '📖 Hướng dẫn sử dụng hệ thống\n\n'
        + 'Hãy hỏi tôi bất cứ điều gì! 😊',
    };
  },

  async [INTENTS.UNKNOWN]() {
    return {
      type: 'unknown',
      message: '🤔 Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể thử:\n\n'
        + '• "Có bao nhiêu sản phẩm?"\n'
        + '• "Doanh thu hôm nay bao nhiêu?"\n'
        + '• "Sản phẩm nào sắp hết hàng?"\n'
        + '• "Tìm sản phẩm Coca"\n'
        + '• "Top 5 khách hàng"\n'
        + '• "Thống kê đơn hàng"\n'
        + '• "Hướng dẫn tạo đơn hàng"',
    };
  },
};

// ============ HELPERS ============

/** Format số tiền VNĐ */
function fmtVND(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString('vi-VN') + 'đ';
}

function generateSessionId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
}

async function saveChatHistory(userId, sessionId, userMessage, result) {
  const sid = sessionId || generateSessionId();
  await db.query(`
    INSERT INTO fact_chat_history (user_id, session_id, user_message, bot_reply, intent, response_type, processing_time_ms)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [userId, sid, userMessage, result.response, result.intent, result.type, result.processing_time_ms]);
}

// ============ MAIN: PROCESS MESSAGE ============

async function processMessage(message, userId, userRoleId) {
  const startTime = Date.now();

  const { intent, params } = detectIntent(message);
  console.log(`[Chatbot] Intent: ${intent}, Params:`, JSON.stringify(params), `Role: ${userRoleId}`);

  // --- RBAC: kiểm tra quyền trước khi xử lý ---
  const permission = checkIntentPermission(intent, userRoleId);
  if (!permission.allowed) {
    const processingTime = Date.now() - startTime;
    return {
      intent,
      response: permission.message,
      data: null,
      type: 'permission_denied',
      processing_time_ms: processingTime,
    };
  }

  const handler = intentHandlers[intent] || intentHandlers[INTENTS.UNKNOWN];
  const queryResult = await handler(params);

  const processingTime = Date.now() - startTime;

  return {
    intent,
    response: queryResult.message,
    data: queryResult.data || null,
    type: queryResult.type,
    processing_time_ms: processingTime,
  };
}

// ============ EXPRESS HANDLERS ============

const sendMessage = async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const userId = req.user.id;
    const userRoleId = req.user.role_id;

    if (!message || message.trim().length === 0) {
      return response.error(res, 'Vui lòng nhập tin nhắn', 400, 'EMPTY_MESSAGE');
    }
    if (message.length > 500) {
      return response.error(res, 'Tin nhắn không được vượt quá 500 ký tự', 400, 'MESSAGE_TOO_LONG');
    }

    const result = await processMessage(message.trim(), userId, userRoleId);

    try {
      await saveChatHistory(userId, session_id, message.trim(), result);
    } catch (historyErr) {
      console.error('[Chatbot] Save history error:', historyErr.message);
    }

    return response.success(res, {
      reply: result.response,
      intent: result.intent,
      data: result.data,
      type: result.type,
      processing_time_ms: result.processing_time_ms,
      session_id: session_id || generateSessionId(),
    }, 'Phản hồi thành công');
  } catch (err) {
    console.error('[Chatbot] Error:', err);
    return response.serverError(res, 'Chatbot gặp lỗi: ' + err.message);
  }
};

const getSuggestions = async (req, res) => {
  try {
    const roleId = req.user.role_id;
    const isManagerOrAdmin = roleId === 1 || roleId === 3;

    // Build FAQ-based category from chatbotFAQ.json
    const faqCategories = {};
    for (const faq of faqData.faqs) {
      if (!faqCategories[faq.category]) faqCategories[faq.category] = [];
      faqCategories[faq.category].push(faq.question);
    }

    const CATEGORY_ICONS = {
      'Sản phẩm': '📦', 'Đơn hàng': '🧾', 'Tồn kho': '📋', 'Sổ quỹ': '💵',
      'Khách hàng': '👥', 'Danh mục': '📂', 'Bảng giá': '💰', 'Giảm giá': '🏷️',
      'Phân quyền': '🔒', 'Cửa hàng': '🏪', 'Nhà cung cấp': '🏭', 'Báo cáo': '📊',
      'Hệ thống': '⚙️', 'POS': '🛒', 'Chatbot': '🤖',
    };

    const suggestions = [
      // Data queries (live DB)
      { category: '📦 Sản phẩm', questions: ['Có bao nhiêu sản phẩm?', 'Tìm sản phẩm sữa', 'Thông tin sản phẩm Coca', 'Sản phẩm nào sắp hết hàng?'] },
      { category: '📋 Tồn kho', questions: ['Kiểm tra tồn kho sữa', 'Tồn kho tại cửa hàng Quận 1'] },
      { category: '👥 Khách hàng', questions: ['Có bao nhiêu khách hàng?', 'Tìm kiếm khách hàng Nguyễn'] },
      { category: '🧾 Đơn hàng', questions: ['Đơn hàng gần đây', 'Thống kê đơn hàng'] },
      { category: '🏪 Cửa hàng', questions: ['Danh sách cửa hàng'] },
    ];

    // Manager/Admin only
    if (isManagerOrAdmin) {
      suggestions.splice(1, 0,
        { category: '💰 Doanh thu', questions: ['Doanh thu hôm nay bao nhiêu?', 'Tổng quan doanh thu', 'Top 5 sản phẩm bán chạy', 'Top 5 khách hàng mua nhiều nhất'] },
        { category: '💵 Sổ quỹ', questions: ['Tổng kết thu chi', 'Giao dịch gần đây'] },
      );
    }

    // FAQ categories from chatbotFAQ.json
    const faqSuggestions = Object.entries(faqCategories).map(([cat, questions]) => ({
      category: `${CATEGORY_ICONS[cat] || '📖'} ${cat}`,
      questions: questions.slice(0, 5),  // max 5 per category
    }));

    // Add a combined "Hướng dẫn" category with top FAQ from each category
    const guideQuestions = Object.entries(faqCategories).flatMap(([, qs]) => qs.slice(0, 1)).slice(0, 8);
    suggestions.push({ category: '📖 Hướng dẫn', questions: guideQuestions });

    return response.success(res, suggestions, 'Lấy gợi ý thành công');
  } catch (err) {
    console.error('[Chatbot] Suggestions error:', err);
    return response.serverError(res);
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { session_id, limit = 50 } = req.query;
    let query = 'SELECT id, session_id, user_message, bot_reply, intent, response_type, processing_time_ms, created_at FROM fact_chat_history WHERE user_id = $1';
    const params = [userId];
    let idx = 2;
    if (session_id) { query += ` AND session_id = $${idx++}`; params.push(session_id); }
    query += ` ORDER BY created_at DESC LIMIT $${idx}`;
    params.push(Math.min(Number(limit), 100));
    const result = await db.query(query, params);
    return response.success(res, result.rows, 'Lấy lịch sử chat thành công');
  } catch (err) {
    console.error('[Chatbot] History error:', err);
    return response.serverError(res);
  }
};

const deleteChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { session_id } = req.query;
    let query = 'DELETE FROM fact_chat_history WHERE user_id = $1';
    const params = [userId];
    if (session_id) { query += ' AND session_id = $2'; params.push(session_id); }
    await db.query(query, params);
    return response.success(res, null, 'Xóa lịch sử chat thành công');
  } catch (err) {
    console.error('[Chatbot] Delete history error:', err);
    return response.serverError(res);
  }
};

const getFAQList = async (req, res) => {
  try {
    const { category } = req.query;
    let faqs = faqData.faqs;
    if (category) { faqs = faqs.filter(f => f.category.toLowerCase() === category.toLowerCase()); }
    const categories = [...new Set(faqData.faqs.map(f => f.category))];
    return response.success(res, { faqs, categories }, 'Lấy FAQ thành công');
  } catch (err) {
    console.error('[Chatbot] FAQ error:', err);
    return response.serverError(res);
  }
};

// ============ EXPORTS ============

module.exports = { sendMessage, getSuggestions, getChatHistory, deleteChatHistory, getFAQList };
