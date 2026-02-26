const db = require("../config/database");

/**
 * ============================================================================
 *                    REPORT SERVICE - BÁO CÁO CUỐI NGÀY
 * ============================================================================
 * Service xử lý các API báo cáo doanh thu và dữ liệu bán hàng
 *
 * Endpoints:
 * - GET /api/reports/daily - Doanh thu theo ngày
 * - GET /api/reports/actual-revenue - Thống kê thực thu
 * - GET /api/reports/sold-products - Danh sách sản phẩm đã bán
 * - GET /api/reports/daily/print - In báo cáo cuối ngày
 */

/**
 * GET /api/reports/daily
 * Lấy thống kê doanh thu theo ngày/khoảng thời gian
 *
 * Query params:
 * - from: Ngày bắt đầu (YYYY-MM-DD), mặc định: hôm nay
 * - to: Ngày kết thúc (YYYY-MM-DD), mặc định: hôm nay
 * - staff_id: Lọc theo nhân viên (optional)
 * - store_id: Lọc theo cửa hàng (optional)
 *
 * Response:
 * - summary: Tổng quan doanh thu
 * - by_date: Chi tiết theo ngày
 * - by_payment_method: Chi tiết theo phương thức thanh toán
 * - by_staff: Chi tiết theo nhân viên
 */
const getDailyReport = async (req, res) => {
  try {
    const { from, to, staff_id, store_id } = req.query;

    // Default to today
    const today = new Date().toISOString().split("T")[0];
    const fromDate = from || today;
    const toDate = to || today;

    // Build filters
    const filters = ["o.date_key BETWEEN $1 AND $2"];
    const params = [fromDate, toDate];
    let paramIndex = 2;

    // Only count completed and paid orders
    filters.push("o.status IN ('completed', 'delivered')");
    filters.push("o.payment_status = 'paid'");

    if (staff_id) {
      paramIndex++;
      filters.push(`o.created_by = $${paramIndex}`);
      params.push(parseInt(staff_id));
    }

    if (store_id) {
      paramIndex++;
      filters.push(`o.store_id = $${paramIndex}`);
      params.push(parseInt(store_id));
    }

    const whereClause = filters.join(" AND ");

    // 1. Summary totals
    const summaryResult = await db.query(
      `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(o.subtotal), 0) as gross_revenue,
        COALESCE(SUM(o.discount_amount), 0) as total_discount,
        COALESCE(SUM(o.shipping_fee), 0) as total_shipping,
        COALESCE(SUM(o.tax_amount), 0) as total_tax,
        COALESCE(SUM(o.final_amount), 0) as net_revenue,
        COALESCE(AVG(o.final_amount), 0) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM fact_orders o
      WHERE ${whereClause}
    `,
      params,
    );

    const summary = {
      total_orders: parseInt(summaryResult.rows[0]?.total_orders || 0),
      gross_revenue: parseFloat(summaryResult.rows[0]?.gross_revenue || 0),
      total_discount: parseFloat(summaryResult.rows[0]?.total_discount || 0),
      total_shipping: parseFloat(summaryResult.rows[0]?.total_shipping || 0),
      total_tax: parseFloat(summaryResult.rows[0]?.total_tax || 0),
      net_revenue: parseFloat(summaryResult.rows[0]?.net_revenue || 0),
      avg_order_value: parseFloat(summaryResult.rows[0]?.avg_order_value || 0),
      unique_customers: parseInt(summaryResult.rows[0]?.unique_customers || 0),
    };

    // 2. Group by date
    const byDateResult = await db.query(
      `
      SELECT 
        o.date_key as date,
        COUNT(*) as order_count,
        COALESCE(SUM(o.subtotal), 0) as gross,
        COALESCE(SUM(o.discount_amount), 0) as discount,
        COALESCE(SUM(o.final_amount), 0) as net
      FROM fact_orders o
      WHERE ${whereClause}
      GROUP BY o.date_key
      ORDER BY o.date_key ASC
    `,
      params,
    );

    // 3. Group by payment method
    const byPaymentResult = await db.query(
      `
      SELECT 
        o.payment_method,
        COUNT(*) as order_count,
        COALESCE(SUM(o.final_amount), 0) as total_amount
      FROM fact_orders o
      WHERE ${whereClause}
      GROUP BY o.payment_method
      ORDER BY total_amount DESC
    `,
      params,
    );

    // 4. Group by staff
    const byStaffResult = await db.query(
      `
      SELECT 
        COALESCE(s.full_name, 'Không xác định') as staff_name,
        o.created_by as staff_id,
        COUNT(*) as order_count,
        COALESCE(SUM(o.final_amount), 0) as total_amount
      FROM fact_orders o
      LEFT JOIN dim_users s ON o.created_by = s.id
      WHERE ${whereClause}
      GROUP BY o.created_by, s.full_name
      ORDER BY total_amount DESC
    `,
      params,
    );

    // 5. Returns/Refunds in period
    const returnsResult = await db.query(
      `
      SELECT 
        COUNT(*) as return_count,
        COALESCE(SUM(o.final_amount), 0) as refund_total
      FROM fact_orders o
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status = 'returned'
      ${staff_id ? `AND o.created_by = ${parseInt(staff_id)}` : ""}
      ${store_id ? `AND o.store_id = ${parseInt(store_id)}` : ""}
    `,
      [fromDate, toDate],
    );

    return res.status(200).json({
      success: true,
      message: "Lấy báo cáo doanh thu thành công",
      data: {
        period: {
          from: fromDate,
          to: toDate,
        },
        summary,
        by_date: byDateResult.rows.map((row) => ({
          date: row.date,
          order_count: parseInt(row.order_count),
          gross_revenue: parseFloat(row.gross),
          discount: parseFloat(row.discount),
          net_revenue: parseFloat(row.net),
        })),
        by_payment_method: byPaymentResult.rows.map((row) => ({
          method: row.payment_method,
          order_count: parseInt(row.order_count),
          total_amount: parseFloat(row.total_amount),
        })),
        by_staff: byStaffResult.rows.map((row) => ({
          staff_id: row.staff_id,
          staff_name: row.staff_name,
          order_count: parseInt(row.order_count),
          total_amount: parseFloat(row.total_amount),
        })),
        returns: {
          return_count: parseInt(returnsResult.rows[0]?.return_count || 0),
          refund_total: parseFloat(returnsResult.rows[0]?.refund_total || 0),
        },
      },
    });
  } catch (error) {
    console.error("Get daily report error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy báo cáo doanh thu",
      error: error.message,
    });
  }
};

/**
 * GET /api/reports/actual-revenue
 * Lấy thống kê thực thu theo phương thức thanh toán
 *
 * Query params:
 * - from: Ngày bắt đầu (YYYY-MM-DD), mặc định: hôm nay
 * - to: Ngày kết thúc (YYYY-MM-DD), mặc định: hôm nay
 * - staff_id: Lọc theo nhân viên (optional)
 * - store_id: Lọc theo cửa hàng (optional)
 *
 * Response:
 * - summary: Tổng thực thu
 * - by_method: Chi tiết theo phương thức
 * - pending: Đơn chưa thanh toán
 */
const getActualRevenue = async (req, res) => {
  try {
    const { from, to, staff_id, store_id } = req.query;

    const today = new Date().toISOString().split("T")[0];
    const fromDate = from || today;
    const toDate = to || today;

    // Build base filters
    let staffFilter = "";
    let storeFilter = "";
    if (staff_id) {
      staffFilter = `AND o.created_by = ${parseInt(staff_id)}`;
    }
    if (store_id) {
      storeFilter = `AND o.store_id = ${parseInt(store_id)}`;
    }

    // 1. Paid orders by payment method
    const paidResult = await db.query(
      `
      SELECT 
        o.payment_method,
        COUNT(*) as order_count,
        COALESCE(SUM(o.final_amount), 0) as paid_amount
      FROM fact_orders o
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status IN ('completed', 'delivered')
        AND o.payment_status = 'paid'
        ${staffFilter}
        ${storeFilter}
      GROUP BY o.payment_method
      ORDER BY paid_amount DESC
    `,
      [fromDate, toDate],
    );

    // 2. Pending payments
    const pendingResult = await db.query(
      `
      SELECT 
        COUNT(*) as order_count,
        COALESCE(SUM(o.final_amount), 0) as pending_amount
      FROM fact_orders o
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status NOT IN ('cancelled', 'returned')
        AND o.payment_status IN ('pending', 'partial')
        ${staffFilter}
        ${storeFilter}
    `,
      [fromDate, toDate],
    );

    // 3. Refunds in period (returned orders)
    const refundResult = await db.query(
      `
      SELECT 
        COUNT(*) as refund_count,
        COALESCE(SUM(o.final_amount), 0) as refund_amount
      FROM fact_orders o
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status = 'returned'
        ${staffFilter}
        ${storeFilter}
    `,
      [fromDate, toDate],
    );

    // Calculate totals
    const totalPaid = paidResult.rows.reduce(
      (sum, row) => sum + parseFloat(row.paid_amount),
      0,
    );
    const totalPending = parseFloat(pendingResult.rows[0]?.pending_amount || 0);
    const totalRefund = parseFloat(refundResult.rows[0]?.refund_amount || 0);

    // 4. Cashbook income (additional income)
    const cashbookResult = await db.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN ct.transaction_direction = 1 THEN t.amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN ct.transaction_direction = -1 THEN t.amount ELSE 0 END), 0) as expense
      FROM fact_cashbook_transactions t
      JOIN subdim_cashbook_types ct ON t.cashbook_type_id = ct.id
      WHERE t.date_key BETWEEN $1 AND $2
        AND t.status = 'approved'
        ${store_id ? `AND t.store_id = ${parseInt(store_id)}` : ""}
    `,
      [fromDate, toDate],
    );

    const cashbookIncome = parseFloat(cashbookResult.rows[0]?.income || 0);
    const cashbookExpense = parseFloat(cashbookResult.rows[0]?.expense || 0);

    return res.status(200).json({
      success: true,
      message: "Lấy báo cáo thực thu thành công",
      data: {
        period: {
          from: fromDate,
          to: toDate,
        },
        summary: {
          total_paid: totalPaid,
          total_pending: totalPending,
          total_refund: totalRefund,
          net_actual: totalPaid - totalRefund,
          cashbook_income: cashbookIncome,
          cashbook_expense: cashbookExpense,
          cashbook_net: cashbookIncome - cashbookExpense,
          grand_total:
            totalPaid - totalRefund + cashbookIncome - cashbookExpense,
        },
        by_method: paidResult.rows.map((row) => ({
          method: row.payment_method,
          order_count: parseInt(row.order_count),
          amount: parseFloat(row.paid_amount),
        })),
        pending: {
          order_count: parseInt(pendingResult.rows[0]?.order_count || 0),
          amount: totalPending,
        },
        refunds: {
          count: parseInt(refundResult.rows[0]?.refund_count || 0),
          amount: totalRefund,
        },
      },
    });
  } catch (error) {
    console.error("Get actual revenue error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy báo cáo thực thu",
      error: error.message,
    });
  }
};

/**
 * GET /api/reports/sold-products
 * Lấy danh sách sản phẩm đã bán trong khoảng thời gian
 *
 * Query params:
 * - from: Ngày bắt đầu (YYYY-MM-DD), mặc định: hôm nay
 * - to: Ngày kết thúc (YYYY-MM-DD), mặc định: hôm nay
 * - staff_id: Lọc theo nhân viên (optional)
 * - store_id: Lọc theo cửa hàng (optional)
 * - page: Trang (default: 1)
 * - limit: Số lượng (default: 50)
 * - sort_by: Cột sắp xếp (quantity, revenue, profit)
 * - sort_order: ASC/DESC
 *
 * Response:
 * - products: Danh sách sản phẩm đã bán
 * - summary: Tổng hợp
 */
const getSoldProducts = async (req, res) => {
  try {
    const {
      from,
      to,
      staff_id,
      store_id,
      page = 1,
      limit = 50,
      sort_by = "quantity",
      sort_order = "DESC",
    } = req.query;

    const today = new Date().toISOString().split("T")[0];
    const fromDate = from || today;
    const toDate = to || today;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate sort
    const validSorts = ["quantity", "revenue", "orders", "profit"];
    const sortColumn = validSorts.includes(sort_by) ? sort_by : "quantity";
    const sortDir = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const sortMap = {
      quantity: "total_quantity",
      revenue: "total_revenue",
      orders: "order_count",
      profit: "total_profit",
    };

    // Build filters
    let staffFilter = "";
    let storeFilter = "";
    if (staff_id) {
      staffFilter = `AND o.created_by = ${parseInt(staff_id)}`;
    }
    if (store_id) {
      storeFilter = `AND o.store_id = ${parseInt(store_id)}`;
    }

    // Get sold products with aggregations
    const productsResult = await db.query(
      `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        v.sku,
        v.id as variant_id,
        v.variant_name,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.line_subtotal) as gross_revenue,
        SUM(oi.discount_per_item) as total_discount,
        SUM(oi.line_total) as total_revenue,
        0 as total_tax,
        AVG(oi.unit_price) as avg_price,
        SUM((oi.unit_price - COALESCE(v.cost_price, 0)) * oi.quantity) as total_profit
      FROM fact_order_items oi
      JOIN fact_orders o ON oi.order_id = o.id
      JOIN dim_product_variants v ON oi.variant_id = v.id
      JOIN dim_products p ON v.product_id = p.id
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status IN ('completed', 'delivered')
        AND o.payment_status = 'paid'
        ${staffFilter}
        ${storeFilter}
      GROUP BY p.id, p.name, v.sku, v.id, v.variant_name
      ORDER BY ${sortMap[sortColumn]} ${sortDir}
      LIMIT $3 OFFSET $4
    `,
      [fromDate, toDate, parseInt(limit), offset],
    );

    // Get total count
    const countResult = await db.query(
      `
      SELECT COUNT(DISTINCT (p.id, v.id)) as total
      FROM fact_order_items oi
      JOIN fact_orders o ON oi.order_id = o.id
      JOIN dim_product_variants v ON oi.variant_id = v.id
      JOIN dim_products p ON v.product_id = p.id
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status IN ('completed', 'delivered')
        AND o.payment_status = 'paid'
        ${staffFilter}
        ${storeFilter}
    `,
      [fromDate, toDate],
    );

    const total = parseInt(countResult.rows[0]?.total || 0);

    // Summary totals
    const summaryResult = await db.query(
      `
      SELECT 
        SUM(oi.quantity) as total_quantity,
        SUM(oi.line_subtotal) as gross_revenue,
        SUM(oi.discount_per_item) as total_discount,
        SUM(oi.line_total) as net_revenue,
        0 as total_tax,
        SUM((oi.unit_price - COALESCE(v.cost_price, 0)) * oi.quantity) as total_profit
      FROM fact_order_items oi
      JOIN fact_orders o ON oi.order_id = o.id
      JOIN dim_product_variants v ON oi.variant_id = v.id
      JOIN dim_products p ON v.product_id = p.id
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status IN ('completed', 'delivered')
        AND o.payment_status = 'paid'
        ${staffFilter}
        ${storeFilter}
    `,
      [fromDate, toDate],
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm đã bán thành công",
      data: {
        period: {
          from: fromDate,
          to: toDate,
        },
        products: productsResult.rows.map((row, index) => ({
          stt: offset + index + 1,
          product_id: row.product_id,
          product_name: row.product_name,
          sku: row.sku,
          variant_id: row.variant_id,
          variant_name: row.variant_name,
          order_count: parseInt(row.order_count),
          quantity_sold: parseInt(row.total_quantity),
          gross_revenue: parseFloat(row.gross_revenue || 0),
          discount: parseFloat(row.total_discount || 0),
          net_revenue: parseFloat(row.total_revenue || 0),
          tax: parseFloat(row.total_tax || 0),
          avg_price: parseFloat(row.avg_price || 0),
          profit: parseFloat(row.total_profit || 0),
        })),
        summary: {
          total_quantity: parseInt(summaryResult.rows[0]?.total_quantity || 0),
          gross_revenue: parseFloat(summaryResult.rows[0]?.gross_revenue || 0),
          total_discount: parseFloat(
            summaryResult.rows[0]?.total_discount || 0,
          ),
          net_revenue: parseFloat(summaryResult.rows[0]?.net_revenue || 0),
          total_tax: parseFloat(summaryResult.rows[0]?.total_tax || 0),
          total_profit: parseFloat(summaryResult.rows[0]?.total_profit || 0),
        },
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: offset + productsResult.rows.length < total,
      },
    });
  } catch (error) {
    console.error("Get sold products error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm đã bán",
      error: error.message,
    });
  }
};

/**
 * GET /api/reports/daily/print
 * Lấy dữ liệu đầy đủ để in báo cáo cuối ngày
 *
 * Query params:
 * - date: Ngày báo cáo (YYYY-MM-DD), mặc định: hôm nay
 * - staff_id: Lọc theo nhân viên (optional)
 * - store_id: Lọc theo cửa hàng (optional)
 *
 * Response:
 * - report_info: Thông tin báo cáo
 * - revenue_summary: Tổng hợp doanh thu
 * - actual_revenue: Thực thu
 * - top_products: Top sản phẩm bán chạy
 * - orders_list: Danh sách đơn hàng
 */
const getDailyPrintReport = async (req, res) => {
  try {
    const { date, staff_id, store_id } = req.query;

    const reportDate = date || new Date().toISOString().split("T")[0];

    // Build filters
    let staffFilter = "";
    let storeFilter = "";
    if (staff_id) {
      staffFilter = `AND o.created_by = ${parseInt(staff_id)}`;
    }
    if (store_id) {
      storeFilter = `AND o.store_id = ${parseInt(store_id)}`;
    }

    // 1. Revenue summary
    const revenueResult = await db.query(
      `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(o.subtotal), 0) as gross_revenue,
        COALESCE(SUM(o.discount_amount), 0) as total_discount,
        COALESCE(SUM(o.shipping_fee), 0) as shipping_fee,
        COALESCE(SUM(o.tax_amount), 0) as tax_amount,
        COALESCE(SUM(o.final_amount), 0) as net_revenue,
        COALESCE(AVG(o.final_amount), 0) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM fact_orders o
      WHERE o.date_key = $1
        AND o.status IN ('completed', 'delivered')
        AND o.payment_status = 'paid'
        ${staffFilter}
        ${storeFilter}
    `,
      [reportDate],
    );

    // 2. Actual revenue by payment method
    const paymentResult = await db.query(
      `
      SELECT 
        o.payment_method,
        COUNT(*) as order_count,
        COALESCE(SUM(o.final_amount), 0) as amount
      FROM fact_orders o
      WHERE o.date_key = $1
        AND o.status IN ('completed', 'delivered')
        AND o.payment_status = 'paid'
        ${staffFilter}
        ${storeFilter}
      GROUP BY o.payment_method
      ORDER BY amount DESC
    `,
      [reportDate],
    );

    // 3. Returns
    const returnsResult = await db.query(
      `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(o.final_amount), 0) as amount
      FROM fact_orders o
      WHERE o.date_key = $1
        AND o.status = 'returned'
        ${staffFilter}
        ${storeFilter}
    `,
      [reportDate],
    );

    // 4. Top 10 products
    const topProductsResult = await db.query(
      `
      SELECT 
        p.name as product_name,
        v.sku,
        SUM(oi.quantity) as quantity,
        SUM(oi.line_total) as revenue
      FROM fact_order_items oi
      JOIN fact_orders o ON oi.order_id = o.id
      JOIN dim_product_variants v ON oi.variant_id = v.id
      JOIN dim_products p ON v.product_id = p.id
      WHERE o.date_key = $1
        AND o.status IN ('completed', 'delivered')
        AND o.payment_status = 'paid'
        ${staffFilter}
        ${storeFilter}
      GROUP BY p.id, p.name, v.sku
      ORDER BY quantity DESC
      LIMIT 10
    `,
      [reportDate],
    );

    // 5. Orders list
    const ordersResult = await db.query(
      `
      SELECT 
        o.id,
        o.order_code as code,
        o.created_at,
        COALESCE(c.full_name, 'Khách lẻ') as customer_name,
        o.payment_method,
        o.status,
        o.final_amount as amount
      FROM fact_orders o
      LEFT JOIN dim_customers c ON o.customer_id = c.id
      WHERE o.date_key = $1
        ${staffFilter}
        ${storeFilter}
      ORDER BY o.created_at ASC
    `,
      [reportDate],
    );

    // Get staff name if filtered
    let staffName = "Tất cả nhân viên";
    if (staff_id) {
      const staffResult = await db.query(
        "SELECT full_name FROM dim_users WHERE id = $1",
        [parseInt(staff_id)],
      );
      staffName = staffResult.rows[0]?.full_name || "Không xác định";
    }

    // Get store name if filtered
    let storeName = "Tất cả cửa hàng";
    if (store_id) {
      const storeResult = await db.query(
        "SELECT name FROM dim_stores WHERE id = $1",
        [parseInt(store_id)],
      );
      storeName = storeResult.rows[0]?.name || "Không xác định";
    }

    return res.status(200).json({
      success: true,
      message: "Lấy báo cáo in thành công",
      data: {
        report_info: {
          date: reportDate,
          generated_at: new Date().toISOString(),
          staff_filter: staffName,
          store_filter: storeName,
          generated_by: req.user?.full_name || "System",
        },
        revenue_summary: {
          total_orders: parseInt(revenueResult.rows[0]?.total_orders || 0),
          gross_revenue: parseFloat(revenueResult.rows[0]?.gross_revenue || 0),
          total_discount: parseFloat(
            revenueResult.rows[0]?.total_discount || 0,
          ),
          shipping_fee: parseFloat(revenueResult.rows[0]?.shipping_fee || 0),
          tax_amount: parseFloat(revenueResult.rows[0]?.tax_amount || 0),
          net_revenue: parseFloat(revenueResult.rows[0]?.net_revenue || 0),
          avg_order_value: parseFloat(
            revenueResult.rows[0]?.avg_order_value || 0,
          ),
          unique_customers: parseInt(
            revenueResult.rows[0]?.unique_customers || 0,
          ),
        },
        actual_revenue: {
          by_payment: paymentResult.rows.map((row) => ({
            method: row.payment_method,
            order_count: parseInt(row.order_count),
            amount: parseFloat(row.amount),
          })),
          total: paymentResult.rows.reduce(
            (sum, row) => sum + parseFloat(row.amount),
            0,
          ),
          returns: {
            count: parseInt(returnsResult.rows[0]?.count || 0),
            amount: parseFloat(returnsResult.rows[0]?.amount || 0),
          },
          net_actual:
            paymentResult.rows.reduce(
              (sum, row) => sum + parseFloat(row.amount),
              0,
            ) - parseFloat(returnsResult.rows[0]?.amount || 0),
        },
        top_products: topProductsResult.rows.map((row, index) => ({
          rank: index + 1,
          product_name: row.product_name,
          sku: row.sku,
          quantity: parseInt(row.quantity),
          revenue: parseFloat(row.revenue),
        })),
        orders_list: ordersResult.rows.map((row) => ({
          id: row.id,
          code: row.code,
          time: row.created_at,
          customer: row.customer_name,
          payment_method: row.payment_method,
          status: row.status,
          amount: parseFloat(row.amount),
        })),
      },
    });
  } catch (error) {
    console.error("Get daily print report error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy báo cáo in",
      error: error.message,
    });
  }
};

/**
 * GET /api/reports/staff
 * Danh sách nhân viên để lọc báo cáo
 */
const getStaffList = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, full_name, username, role_id
      FROM dim_users
      WHERE is_active = true
      ORDER BY full_name ASC
    `);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhân viên thành công",
      data: result.rows,
    });
  } catch (error) {
    console.error("Get staff list error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhân viên",
      error: error.message,
    });
  }
};

// ============================================================================
//                    SUBMITTED REPORTS (NỘP BÁO CÁO)
// ============================================================================

const { generateSequentialCode, getDateStr } = require("../utils/codeGenerator");

/**
 * POST /api/reports/submit
 * Staff nộp báo cáo cuối ngày — snapshot dữ liệu hiện tại vào DB
 */
const submitReport = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      title,
      period_from,
      period_to,
      staff_filter_id,
      notes,
      revenue_summary,
      actual_summary,
      by_payment_method,
      by_staff,
      products_summary,
      top_products,
      returns_data,
    } = req.body;

    if (!title || !period_from || !period_to) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tiêu đề và khoảng thời gian",
      });
    }

    await client.query("BEGIN");

    // Generate report code: RPT-YYYYMMDD-NNNNN
    const reportCode = await generateSequentialCode(
      client,
      "RPT",
      "fact_submitted_reports",
      "report_code"
    );

    const summary = revenue_summary || {};
    const actual = actual_summary || {};

    const result = await client.query(
      `INSERT INTO fact_submitted_reports 
        (report_code, title, period_from, period_to, staff_filter_id, submitted_by, notes,
         revenue_summary, actual_summary, by_payment_method, by_staff,
         products_summary, top_products, returns_data,
         total_orders, net_revenue, total_discount, unique_customers, grand_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING id, report_code, submitted_at`,
      [
        reportCode,
        title,
        period_from,
        period_to,
        staff_filter_id || null,
        req.user.id,
        notes || null,
        JSON.stringify(revenue_summary || {}),
        JSON.stringify(actual_summary || {}),
        JSON.stringify(by_payment_method || []),
        JSON.stringify(by_staff || []),
        JSON.stringify(products_summary || {}),
        JSON.stringify(top_products || []),
        JSON.stringify(returns_data || {}),
        summary.total_orders || 0,
        summary.net_revenue || 0,
        summary.total_discount || 0,
        summary.unique_customers || 0,
        actual.grand_total || actual.net_actual || 0,
      ]
    );

    await client.query("COMMIT");

    const row = result.rows[0];
    return res.status(201).json({
      success: true,
      message: `Nộp báo cáo thành công! Mã báo cáo: ${row.report_code}`,
      data: {
        id: row.id,
        report_code: row.report_code,
        submitted_at: row.submitted_at,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Submit report error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi nộp báo cáo",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/reports/submitted
 * Admin xem danh sách báo cáo đã nộp (phân trang)
 */
const getSubmittedReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { search, status, from, to } = req.query;

    let where = "WHERE 1=1";
    const params = [];
    let paramIdx = 1;

    if (search) {
      where += ` AND (r.report_code ILIKE $${paramIdx} OR r.title ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (status) {
      where += ` AND r.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }
    if (from) {
      where += ` AND r.period_from >= $${paramIdx}`;
      params.push(from);
      paramIdx++;
    }
    if (to) {
      where += ` AND r.period_to <= $${paramIdx}`;
      params.push(to);
      paramIdx++;
    }

    // Count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM fact_submitted_reports r ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Data
    const dataResult = await db.query(
      `SELECT 
        r.id, r.report_code, r.title, r.report_type, r.status,
        r.period_from, r.period_to,
        r.total_orders, r.net_revenue, r.total_discount, r.unique_customers, r.grand_total,
        r.submitted_at, r.notes,
        r.revenue_summary, r.actual_summary, r.by_payment_method, r.by_staff,
        r.products_summary, r.top_products, r.returns_data,
        r.reviewed_at,
        u.full_name as submitted_by_name,
        u2.full_name as reviewed_by_name
       FROM fact_submitted_reports r
       JOIN dim_users u ON r.submitted_by = u.id
       LEFT JOIN dim_users u2 ON r.reviewed_by = u2.id
       ${where}
       ORDER BY r.submitted_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get submitted reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách báo cáo",
      error: error.message,
    });
  }
};

/**
 * GET /api/reports/submitted/:id
 * Xem chi tiết một báo cáo đã nộp
 */
const getSubmittedReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        r.*,
        u.full_name as submitted_by_name,
        u2.full_name as reviewed_by_name
       FROM fact_submitted_reports r
       JOIN dim_users u ON r.submitted_by = u.id
       LEFT JOIN dim_users u2 ON r.reviewed_by = u2.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get submitted report detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết báo cáo",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/reports/submitted/:id/status
 * Admin duyệt / từ chối báo cáo
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ (approved / rejected)",
      });
    }

    const result = await db.query(
      `UPDATE fact_submitted_reports
       SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING id, report_code, status`,
      [status, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
    }

    const statusLabel = status === "approved" ? "duyệt" : "từ chối";
    return res.status(200).json({
      success: true,
      message: `Đã ${statusLabel} báo cáo ${result.rows[0].report_code}`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update report status error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái báo cáo",
      error: error.message,
    });
  }
};

module.exports = {
  getDailyReport,
  getActualRevenue,
  getSoldProducts,
  getDailyPrintReport,
  getStaffList,
  submitReport,
  getSubmittedReports,
  getSubmittedReportById,
  updateReportStatus,
};
