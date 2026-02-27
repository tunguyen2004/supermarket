/**
 * Global Search Service
 * Tìm kiếm xuyên suốt: Sản phẩm, Đơn hàng, Khách hàng
 */

const db = require("../config/database");

/**
 * GET /api/search?q=keyword&limit=5
 * Tìm kiếm toàn cục qua nhiều module
 */
const globalSearch = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: { products: [], orders: [], customers: [] },
        message: "Nhập từ khóa để tìm kiếm",
      });
    }

    const keyword = `%${q.trim()}%`;
    const searchLimit = Math.min(parseInt(limit) || 5, 10);

    // Chạy song song 3 truy vấn
    const [productsResult, ordersResult, customersResult] = await Promise.all([
      // 1. Tìm sản phẩm theo tên, mã, barcode
      db.query(
        `SELECT 
          p.id,
          p.code,
          p.name,
          p.image_url,
          COALESCE(pv.selling_price, 0) AS price,
          pv.sku,
          c.name AS category_name,
          p.is_active
        FROM dim_products p
        LEFT JOIN LATERAL (
          SELECT pv2.selling_price, pv2.sku, pv2.barcode
          FROM dim_product_variants pv2
          WHERE pv2.product_id = p.id
          ORDER BY pv2.id ASC
          LIMIT 1
        ) pv ON true
        LEFT JOIN subdim_categories c ON c.id = p.category_id
        WHERE (
          p.name ILIKE $1 
          OR p.code ILIKE $1 
          OR pv.sku ILIKE $1 
          OR pv.barcode ILIKE $1
        )
        ORDER BY 
          CASE WHEN p.name ILIKE $2 THEN 0 ELSE 1 END,
          p.name ASC
        LIMIT $3`,
        [keyword, `${q.trim()}%`, searchLimit],
      ),

      // 2. Tìm đơn hàng theo mã đơn, tên khách hàng
      db.query(
        `SELECT 
          o.id,
          o.order_code,
          o.status,
          o.payment_status,
          o.final_amount,
          o.created_at,
          cust.full_name AS customer_name
        FROM fact_orders o
        LEFT JOIN dim_customers cust ON cust.id = o.customer_id
        WHERE (
          o.order_code ILIKE $1
          OR cust.full_name ILIKE $1
        )
        ORDER BY o.created_at DESC
        LIMIT $2`,
        [keyword, searchLimit],
      ),

      // 3. Tìm khách hàng theo tên, SĐT, email, mã
      db.query(
        `SELECT 
          c.id,
          c.code,
          c.full_name,
          c.phone,
          c.email,
          cg.name AS group_name,
          c.total_lifetime_value
        FROM dim_customers c
        LEFT JOIN subdim_customer_groups cg ON cg.id = c.customer_group_id
        WHERE (
          c.full_name ILIKE $1
          OR c.phone ILIKE $1
          OR c.email ILIKE $1
          OR c.code ILIKE $1
        )
        ORDER BY 
          CASE WHEN c.full_name ILIKE $2 THEN 0 ELSE 1 END,
          c.full_name ASC
        LIMIT $3`,
        [keyword, `${q.trim()}%`, searchLimit],
      ),
    ]);

    const data = {
      products: productsResult.rows.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        image_url: p.image_url,
        price: parseFloat(p.price),
        sku: p.sku,
        category_name: p.category_name,
        is_active: p.is_active,
      })),
      orders: ordersResult.rows.map((o) => ({
        id: o.id,
        order_code: o.order_code,
        status: o.status,
        payment_status: o.payment_status,
        final_amount: parseFloat(o.final_amount),
        created_at: o.created_at,
        customer_name: o.customer_name,
      })),
      customers: customersResult.rows.map((c) => ({
        id: c.id,
        code: c.code,
        full_name: c.full_name,
        phone: c.phone,
        email: c.email,
        group_name: c.group_name,
        total_lifetime_value: parseFloat(c.total_lifetime_value || 0),
      })),
    };

    const totalResults =
      data.products.length + data.orders.length + data.customers.length;

    return res.json({
      success: true,
      data,
      meta: {
        query: q.trim(),
        total: totalResults,
        limit: searchLimit,
      },
      message:
        totalResults > 0
          ? `Tìm thấy ${totalResults} kết quả`
          : "Không tìm thấy kết quả phù hợp",
    });
  } catch (error) {
    console.error("Global search error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm",
      error: error.message,
    });
  }
};

module.exports = {
  globalSearch,
};
