const db = require("../config/database");

/**
 * ============================================================================
 *                    ORDER SERVICE
 * ============================================================================
 * Quản lý các thao tác liên quan đến đơn hàng
 */

/**
 * Danh sách đơn hàng - GET /api/orders
 * Query params: ?limit=10&offset=0&status=pending&payment_status=unpaid
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Danh sách đơn hàng với pagination
 */
const getOrderList = async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      status,
      payment_status,
      search,
      sort = "created_at",
      order = "DESC",
    } = req.query;

    // Đảm bảo limit và offset là số
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const parsedOffset = parseInt(offset) || 0;

    // Validate sort field (chống SQL injection)
    const validSortFields = [
      "order_code",
      "final_amount",
      "status",
      "created_at",
      "payment_status",
    ];
    const sortField = validSortFields.includes(sort) ? sort : "created_at";

    // Validate order direction
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Xây dựng WHERE clause động
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`fo.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (payment_status) {
      whereConditions.push(`fo.payment_status = $${paramIndex}`);
      queryParams.push(payment_status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(
        `(fo.order_code ILIKE $${paramIndex} OR dc.full_name ILIKE $${paramIndex})`,
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Lấy tổng số đơn hàng
    const countQuery = `
      SELECT COUNT(*) as total
      FROM fact_orders fo
      LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Lấy danh sách đơn hàng
    const listQuery = `
      SELECT 
        fo.id,
        fo.order_code,
        fo.date_key,
        COALESCE(dc.full_name, 'Guest Customer') as customer_name,
        COALESCE(dc.phone, 'N/A') as customer_phone,
        ds.name as store_name,
        fo.status,
        fo.payment_status,
        fo.payment_method,
        fo.subtotal,
        fo.discount_amount,
        fo.tax_amount,
        fo.shipping_fee,
        fo.final_amount,
        fo.customer_note,
        fo.created_at,
        du.full_name as created_by_name,
        (
          SELECT COUNT(*) FROM fact_order_items 
          WHERE order_id = fo.id
        ) as item_count,
        (
          SELECT COALESCE(SUM(quantity), 0) FROM fact_order_items 
          WHERE order_id = fo.id
        ) as total_quantity
      FROM fact_orders fo
      LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
      LEFT JOIN dim_stores ds ON fo.store_id = ds.id
      LEFT JOIN dim_users du ON fo.created_by = du.id
      ${whereClause}
      ORDER BY fo.${sortField} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parsedLimit);
    queryParams.push(parsedOffset);

    const result = await db.query(listQuery, queryParams);

    // Format response
    const formattedOrders = result.rows.map((order) => ({
      id: order.id,
      order_code: order.order_code,
      date: order.date_key,
      customer: {
        name: order.customer_name,
        phone: order.customer_phone,
      },
      store: order.store_name,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      amount: {
        subtotal: parseFloat(order.subtotal) || 0,
        discount: parseFloat(order.discount_amount) || 0,
        tax: parseFloat(order.tax_amount) || 0,
        shipping: parseFloat(order.shipping_fee) || 0,
        total: parseFloat(order.final_amount) || 0,
      },
      items: {
        count: parseInt(order.item_count),
        total_quantity: parseFloat(order.total_quantity) || 0,
      },
      notes: order.customer_note,
      created_by: order.created_by_name,
      created_at: order.created_at,
    }));

    res.json({
      status: "OK",
      message: "Orders list retrieved successfully",
      data: formattedOrders,
      pagination: {
        total: total,
        limit: parsedLimit,
        offset: parsedOffset,
        pages: Math.ceil(total / parsedLimit),
        current_page: Math.floor(parsedOffset / parsedLimit) + 1,
      },
    });
  } catch (error) {
    console.error("Get orders list error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to get orders list",
      error: error.message,
    });
  }
};

/**
 * Chi tiết đơn hàng - GET /api/orders/:id
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Chi tiết đơn hàng và các items
 */
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin đơn hàng chính
    const orderQuery = `
      SELECT 
        fo.id,
        fo.order_code,
        fo.date_key,
        COALESCE(dc.full_name, 'Guest Customer') as customer_name,
        COALESCE(dc.phone, 'N/A') as customer_phone,
        COALESCE(dc.email, 'N/A') as customer_email,
        ds.name as store_name,
        fo.status,
        fo.payment_status,
        fo.payment_method,
        fo.subtotal,
        fo.discount_amount,
        fo.tax_amount,
        fo.shipping_fee,
        fo.final_amount,
        fo.shipping_address,
        fo.customer_note,
        fo.internal_note,
        fo.created_at,
        du.full_name as created_by_name
      FROM fact_orders fo
      LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
      LEFT JOIN dim_stores ds ON fo.store_id = ds.id
      LEFT JOIN dim_users du ON fo.created_by = du.id
      WHERE fo.id = $1
    `;

    const orderResult = await db.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Order not found",
        data: null,
      });
    }

    const order = orderResult.rows[0];

    // Lấy các items trong đơn hàng
    const itemsQuery = `
      SELECT 
        foi.id,
        foi.quantity,
        foi.unit_price,
        foi.discount_per_item,
        foi.line_subtotal,
        foi.line_total,
        foi.custom_product_name,
        dp.name as product_name,
        dp.code as product_code,
        dpv.sku,
        dpv.variant_name
      FROM fact_order_items foi
      LEFT JOIN dim_product_variants dpv ON foi.variant_id = dpv.id
      LEFT JOIN dim_products dp ON dpv.product_id = dp.id
      WHERE foi.order_id = $1
      ORDER BY foi.id
    `;

    const itemsResult = await db.query(itemsQuery, [id]);

    const formattedItems = itemsResult.rows.map((item) => ({
      id: item.id,
      product:
        item.product_name || item.custom_product_name || "Unknown Product",
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
      discount_per_item: parseFloat(item.discount_per_item) || 0,
      line_subtotal: parseFloat(item.line_subtotal),
      line_total: parseFloat(item.line_total),
    }));

    // Format response
    res.json({
      status: "OK",
      message: "Order detail retrieved successfully",
      data: {
        id: order.id,
        order_code: order.order_code,
        date: order.date_key,
        customer: {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
        },
        store: order.store_name,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        amount: {
          subtotal: parseFloat(order.subtotal) || 0,
          discount: parseFloat(order.discount_amount) || 0,
          tax: parseFloat(order.tax_amount) || 0,
          shipping: parseFloat(order.shipping_fee) || 0,
          total: parseFloat(order.final_amount) || 0,
        },
        shipping_address: order.shipping_address,
        items: formattedItems,
        notes: {
          customer: order.customer_note,
          internal: order.internal_note,
        },
        created_by: order.created_by_name,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to get order detail",
      error: error.message,
    });
  }
};

/**
 * Thống kê đơn hàng - GET /api/orders/stats/summary
 * Lấy các số liệu thống kê về đơn hàng
 */
const getOrderStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_orders,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(AVG(final_amount), 0) as avg_order_value,
        COALESCE(MAX(final_amount), 0) as max_order_value
      FROM fact_orders
    `;

    const statsResult = await db.query(statsQuery);
    const stats = statsResult.rows[0];

    res.json({
      status: "OK",
      message: "Order statistics retrieved successfully",
      data: {
        total_orders: parseInt(stats.total_orders),
        by_status: {
          completed: parseInt(stats.completed_orders),
          pending: parseInt(stats.pending_orders),
          cancelled: parseInt(stats.cancelled_orders),
        },
        by_payment: {
          paid: parseInt(stats.paid_orders),
          unpaid: parseInt(stats.unpaid_orders),
        },
        revenue: {
          total: parseFloat(stats.total_revenue) || 0,
          average_per_order: parseFloat(stats.avg_order_value) || 0,
          max_order: parseFloat(stats.max_order_value) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to get order statistics",
      error: error.message,
    });
  }
};

/**
 * Tạo đơn hàng mới - POST /api/orders
 * Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Thông tin đơn hàng vừa tạo
 */
const createOrder = async (req, res) => {
  // Lấy client từ pool để sử dụng transaction
  const client = await db.pool.connect();

  try {
    const {
      customer_id,
      store_id,
      items = [],
      subtotal = 0,
      discount_amount = 0,
      tax_amount = 0,
      shipping_fee = 0,
      payment_method,
      shipping_address,
      customer_note,
      internal_note,
    } = req.body;

    // Validate input bắt buộc
    if (!store_id) {
      return res.status(400).json({
        status: "ERROR",
        message: "store_id is required",
        data: null,
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "ERROR",
        message: "items array is required and must contain at least one item",
        data: null,
      });
    }

    // Validate items
    for (let item of items) {
      if (!item.variant_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          status: "ERROR",
          message: "Each item must have variant_id, quantity, and unit_price",
          data: null,
        });
      }

      if (item.quantity <= 0 || item.unit_price <= 0) {
        return res.status(400).json({
          status: "ERROR",
          message: "quantity and unit_price must be greater than 0",
          data: null,
        });
      }
    }

    // Tính toán final_amount
    const final_amount = subtotal - discount_amount + tax_amount + shipping_fee;

    // Lấy date_key (ngày hiện tại)
    const today = new Date();
    const dateKey = today.toISOString().split("T")[0];

    // Kiểm tra store tồn tại
    const storeCheck = await client.query(
      "SELECT id FROM dim_stores WHERE id = $1",
      [store_id],
    );

    if (storeCheck.rows.length === 0) {
      return res.status(400).json({
        status: "ERROR",
        message: "Store not found",
        data: null,
      });
    }

    // Kiểm tra customer nếu có
    if (customer_id) {
      const customerCheck = await client.query(
        "SELECT id FROM dim_customers WHERE id = $1",
        [customer_id],
      );

      if (customerCheck.rows.length === 0) {
        return res.status(400).json({
          status: "ERROR",
          message: "Customer not found",
          data: null,
        });
      }
    }

    // Kiểm tra tất cả variants tồn tại
    const variantIds = items.map((item) => item.variant_id);
    const variantsCheck = await client.query(
      `SELECT id FROM dim_product_variants WHERE id = ANY($1)`,
      [variantIds],
    );

    if (variantsCheck.rows.length !== items.length) {
      return res.status(400).json({
        status: "ERROR",
        message: "One or more product variants not found",
        data: null,
      });
    }

    // ========== BẮT ĐẦU TRANSACTION ==========
    await client.query("BEGIN");

    // Tạo order code (ORD-YYYYMMDD-XXXXX)
    const datePart = dateKey.replace(/-/g, "").substring(2);
    const orderCodePrefix = `ORD-${datePart}`;

    // Lấy max sequence của ngày hôm nay (trong transaction để tránh race condition)
    // order_code format: ORD-260120-00001, ta cần lấy số 00001
    const sequenceResult = await client.query(
      `SELECT 
        COALESCE(
          MAX(CAST(RIGHT(order_code, 5) AS INTEGER)), 
          0
        ) as max_sequence
       FROM fact_orders 
       WHERE order_code LIKE $1
       FOR UPDATE`,
      [`${orderCodePrefix}-%`],
    );

    const nextSequence = String(
      (sequenceResult.rows[0].max_sequence || 0) + 1,
    ).padStart(5, "0");
    const orderCode = `${orderCodePrefix}-${nextSequence}`;

    // Tạo đơn hàng
    const orderResult = await client.query(
      `INSERT INTO fact_orders (
        order_code, date_key, customer_id, store_id, status, payment_status,
        subtotal, discount_amount, tax_amount, shipping_fee, final_amount,
        payment_method, shipping_address, customer_note, internal_note, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING id, order_code, date_key, status, payment_status, created_at`,
      [
        orderCode,
        dateKey,
        customer_id,
        store_id,
        "pending",
        "unpaid",
        subtotal,
        discount_amount,
        tax_amount,
        shipping_fee,
        final_amount,
        payment_method || "cash",
        shipping_address,
        customer_note,
        internal_note,
        req.user.id,
      ],
    );

    const orderId = orderResult.rows[0].id;

    // Thêm order items (batch insert để tối ưu)
    const itemValues = [];
    const itemParams = [];
    let paramIndex = 1;

    for (let item of items) {
      itemValues.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
      );
      itemParams.push(
        orderId,
        item.variant_id,
        item.quantity,
        item.unit_price,
        item.discount_per_item || 0,
      );
    }

    await client.query(
      `INSERT INTO fact_order_items (
        order_id, variant_id, quantity, unit_price, discount_per_item
      ) VALUES ${itemValues.join(", ")}`,
      itemParams,
    );

    // ========== COMMIT TRANSACTION ==========
    await client.query("COMMIT");

    // Lấy order detail để trả về (sau khi commit)
    const detailResult = await db.query(
      `SELECT 
        fo.id, fo.order_code, fo.date_key, 
        COALESCE(dc.full_name, 'Guest Customer') as customer_name,
        ds.name as store_name,
        fo.status, fo.payment_status, fo.payment_method,
        fo.subtotal, fo.discount_amount, fo.tax_amount, 
        fo.shipping_fee, fo.final_amount, fo.created_at
      FROM fact_orders fo
      LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
      LEFT JOIN dim_stores ds ON fo.store_id = ds.id
      WHERE fo.id = $1`,
      [orderId],
    );

    res.status(201).json({
      status: "OK",
      message: "Order created successfully",
      data: {
        id: detailResult.rows[0].id,
        order_code: detailResult.rows[0].order_code,
        date: detailResult.rows[0].date_key,
        customer_name: detailResult.rows[0].customer_name,
        store_name: detailResult.rows[0].store_name,
        status: detailResult.rows[0].status,
        payment_status: detailResult.rows[0].payment_status,
        payment_method: detailResult.rows[0].payment_method,
        amount: {
          subtotal: parseFloat(detailResult.rows[0].subtotal),
          discount: parseFloat(detailResult.rows[0].discount_amount),
          tax: parseFloat(detailResult.rows[0].tax_amount),
          shipping: parseFloat(detailResult.rows[0].shipping_fee),
          total: parseFloat(detailResult.rows[0].final_amount),
        },
        items_count: items.length,
        created_at: detailResult.rows[0].created_at,
      },
    });
  } catch (error) {
    // ========== ROLLBACK NẾU CÓ LỖI ==========
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to create order",
      error: error.message,
    });
  } finally {
    // ========== LUÔN RELEASE CLIENT ==========
    client.release();
  }
};

/**
 * Cập nhật trạng thái đơn hàng - PUT /api/orders/:id
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Order đã cập nhật
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, payment_method } = req.body;

    // Kiểm tra order tồn tại
    const orderCheck = await db.query(
      "SELECT id, status, payment_status FROM fact_orders WHERE id = $1",
      [id],
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Order not found",
        data: null,
      });
    }

    const order = orderCheck.rows[0];

    // Validate status values
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const validPaymentStatuses = ["unpaid", "partial", "paid", "refunded"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: "ERROR",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        data: null,
      });
    }

    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        status: "ERROR",
        message: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(", ")}`,
        data: null,
      });
    }

    // Update order
    const updateQuery = `
      UPDATE fact_orders 
      SET status = COALESCE($1, status),
          payment_status = COALESCE($2, payment_status),
          payment_method = COALESCE($3, payment_method)
      WHERE id = $4
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      status || null,
      payment_status || null,
      payment_method || null,
      id,
    ]);

    const updatedOrder = result.rows[0];

    res.json({
      status: "OK",
      message: "Order updated successfully",
      data: {
        id: updatedOrder.id,
        order_code: updatedOrder.order_code,
        status: updatedOrder.status,
        payment_status: updatedOrder.payment_status,
        payment_method: updatedOrder.payment_method,
        updated_at: updatedOrder.created_at,
      },
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to update order",
      error: error.message,
    });
  }
};

/**
 * Hủy đơn hàng - DELETE /api/orders/:id
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Order đã hủy
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Kiểm tra order tồn tại
    const orderCheck = await db.query(
      "SELECT id, status FROM fact_orders WHERE id = $1",
      [id],
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Order not found",
        data: null,
      });
    }

    const order = orderCheck.rows[0];

    // Không thể hủy order đã shipped/delivered
    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({
        status: "ERROR",
        message: `Cannot cancel order with status: ${order.status}`,
        data: null,
      });
    }

    // Soft delete - set status to cancelled
    const cancelQuery = `
      UPDATE fact_orders 
      SET status = 'cancelled',
          payment_status = CASE 
            WHEN payment_status = 'paid' THEN 'refunded'
            ELSE payment_status
          END,
          internal_note = CASE 
            WHEN internal_note IS NULL THEN $2
            ELSE internal_note || ' | Cancelled: ' || $2
          END
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(cancelQuery, [
      id,
      reason || "No reason provided",
    ]);
    const cancelledOrder = result.rows[0];

    res.json({
      status: "OK",
      message: "Order cancelled successfully",
      data: {
        id: cancelledOrder.id,
        order_code: cancelledOrder.order_code,
        status: cancelledOrder.status,
        payment_status: cancelledOrder.payment_status,
        cancelled_at: cancelledOrder.created_at,
        note: reason,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/** // đang làm chức năng trạng thái à
 * Lấy statistics chi tiết - GET /api/orders/stats/detailed
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Statistics chi tiết
 */
const getDetailedStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        -- Số lượng đơn hàng
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
        
        -- Payment status
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_count,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN payment_status = 'refunded' THEN 1 END) as refunded_count,
        
        -- Doanh số
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN final_amount ELSE 0 END), 0) as delivered_revenue,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN final_amount ELSE 0 END), 0) as cancelled_revenue,
        
        -- Giá trị trung bình
        ROUND(AVG(final_amount), 2) as avg_order_value,
        
        -- Discount
        COALESCE(SUM(discount_amount), 0) as total_discount,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        
        -- Items
        (SELECT COALESCE(SUM(quantity), 0) FROM fact_order_items) as total_items
      FROM fact_orders
    `;

    const result = await db.query(statsQuery);
    const stats = result.rows[0];

    // Tính toán thêm ( làm gì đây ???)
    const completionRate =
      stats.total_orders > 0
        ? ((stats.delivered_count / stats.total_orders) * 100).toFixed(2)
        : 0;

    const paymentRate =
      stats.total_orders > 0
        ? ((stats.paid_count / stats.total_orders) * 100).toFixed(2)
        : 0;

    res.json({
      status: "OK",
      message: "Detailed statistics retrieved successfully",
      data: {
        orders: {
          total: parseInt(stats.total_orders),
          by_status: {
            pending: parseInt(stats.pending_count),
            processing: parseInt(stats.processing_count),
            shipped: parseInt(stats.shipped_count),
            delivered: parseInt(stats.delivered_count),
            cancelled: parseInt(stats.cancelled_count),
          },
          completion_rate: parseFloat(completionRate),
          avg_items_per_order: (
            parseFloat(stats.total_items) / stats.total_orders
          ).toFixed(2),
        },
        payment: {
          total_orders: parseInt(stats.total_orders),
          by_status: {
            unpaid: parseInt(stats.unpaid_count),
            paid: parseInt(stats.paid_count),
            refunded: parseInt(stats.refunded_count),
          },
          payment_rate: parseFloat(paymentRate),
        },
        revenue: {
          total: parseFloat(stats.total_revenue),
          from_delivered: parseFloat(stats.delivered_revenue),
          from_cancelled: parseFloat(stats.cancelled_revenue),
          avg_per_order: parseFloat(stats.avg_order_value),
        },
        financials: {
          total_discount: parseFloat(stats.total_discount),
          total_tax: parseFloat(stats.total_tax),
          total_items: parseInt(stats.total_items),
        },
      },
    });
  } catch (error) {
    console.error("Get detailed stats error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to get detailed statistics",
      error: error.message,
    });
  }
};

/**
 * Hoàn trả đơn hàng - POST /api/orders/:id/return
 * Body: { items: [{ variant_id, quantity, reason }], reason, refund_method }
 */
const returnOrder = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { id } = req.params;
    const { items, reason, refund_method = "cash" } = req.body;

    // Check order exists and is delivered
    const orderCheck = await client.query(
      `SELECT fo.*, ds.name as store_name 
       FROM fact_orders fo 
       JOIN dim_stores ds ON fo.store_id = ds.id
       WHERE fo.id = $1`,
      [id],
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const order = orderCheck.rows[0];

    if (order.status !== "delivered" && order.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hoàn trả đơn hàng đã giao",
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách sản phẩm hoàn trả không hợp lệ",
      });
    }

    // Get order items
    const orderItemsResult = await client.query(
      `SELECT foi.*, dpv.sku, dp.name as product_name
       FROM fact_order_items foi
       JOIN dim_product_variants dpv ON foi.variant_id = dpv.id
       JOIN dim_products dp ON dpv.product_id = dp.id
       WHERE foi.order_id = $1`,
      [id],
    );

    const orderItems = orderItemsResult.rows;

    // Validate return items
    let totalRefund = 0;
    const returnItems = [];

    for (const item of items) {
      const orderItem = orderItems.find(
        (oi) => oi.variant_id === item.variant_id,
      );

      if (!orderItem) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm variant_id=${item.variant_id} không có trong đơn hàng`,
        });
      }

      if (item.quantity > orderItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Số lượng hoàn trả (${item.quantity}) vượt quá số lượng đã mua (${orderItem.quantity})`,
        });
      }

      const itemRefund = item.quantity * orderItem.unit_price;
      totalRefund += itemRefund;
      returnItems.push({
        ...item,
        unit_price: orderItem.unit_price,
        refund_amount: itemRefund,
        sku: orderItem.sku,
        product_name: orderItem.product_name,
      });
    }

    // ========== BẮT ĐẦU TRANSACTION ==========
    await client.query("BEGIN");

    // Generate return code
    const today = new Date();
    const dateKey = today.toISOString().split("T")[0];
    const datePart = dateKey.replace(/-/g, "").substring(2);
    const returnCodePrefix = `RTN-${datePart}`;

    const seqResult = await client.query(
      `SELECT COALESCE(MAX(CAST(RIGHT(order_code, 5) AS INTEGER)), 0) as max_seq
       FROM fact_orders 
       WHERE order_code LIKE $1
       FOR UPDATE`,
      [`${returnCodePrefix}-%`],
    );

    const nextSeq = String((seqResult.rows[0].max_seq || 0) + 1).padStart(
      5,
      "0",
    );
    const returnCode = `${returnCodePrefix}-${nextSeq}`;

    // Create return order record
    const returnOrderResult = await client.query(
      `INSERT INTO fact_orders (
        order_code, date_key, customer_id, store_id, status, payment_status,
        subtotal, discount_amount, final_amount, payment_method,
        internal_note, created_by, created_at
      ) VALUES ($1, $2, $3, $4, 'returned', 'refunded', $5, 0, $5, $6, $7, $8, NOW())
      RETURNING id`,
      [
        returnCode,
        dateKey,
        order.customer_id,
        order.store_id,
        -totalRefund,
        refund_method,
        `Hoàn trả từ đơn ${order.order_code}. Lý do: ${reason || "Không có"}`,
        req.user.id,
      ],
    );

    const returnOrderId = returnOrderResult.rows[0].id;

    // Insert return items & update inventory
    for (const item of returnItems) {
      // Insert return item (negative quantity)
      await client.query(
        `INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
         VALUES ($1, $2, $3, $4, 0)`,
        [returnOrderId, item.variant_id, -item.quantity, item.unit_price],
      );

      // Update inventory (add back to stock)
      await client.query(
        `UPDATE fact_inventory_stocks 
         SET quantity_on_hand = quantity_on_hand + $1, last_updated = NOW()
         WHERE store_id = $2 AND variant_id = $3`,
        [item.quantity, order.store_id, item.variant_id],
      );

      // Create inventory transaction
      const transactionCode = `RTN-INV-${Date.now()}-${item.variant_id}`;
      await client.query(
        `INSERT INTO fact_inventory_transactions 
         (transaction_code, date_key, transaction_type_id, store_id, variant_id,
          quantity_change, balance_before, balance_after, reference_type, reference_id,
          created_by, notes)
         SELECT $1, $2, 
           (SELECT id FROM subdim_transaction_types WHERE code = 'RETURN'),
           $3, $4, $5, 
           COALESCE((SELECT quantity_on_hand FROM fact_inventory_stocks WHERE store_id = $3 AND variant_id = $4), 0) - $5,
           COALESCE((SELECT quantity_on_hand FROM fact_inventory_stocks WHERE store_id = $3 AND variant_id = $4), 0),
           'ORDER_RETURN', $6, $7, $8`,
        [
          transactionCode,
          dateKey,
          order.store_id,
          item.variant_id,
          item.quantity,
          returnOrderId,
          req.user.id,
          `Hoàn trả từ đơn ${order.order_code}: ${item.reason || reason || ""}`,
        ],
      );
    }

    // Update original order status if full return
    const originalTotal = orderItems.reduce(
      (sum, oi) => sum + parseFloat(oi.quantity),
      0,
    );
    const returnTotal = returnItems.reduce((sum, ri) => sum + ri.quantity, 0);

    if (returnTotal >= originalTotal) {
      await client.query(
        `UPDATE fact_orders SET status = 'returned', payment_status = 'refunded' WHERE id = $1`,
        [id],
      );
    }

    // ========== COMMIT TRANSACTION ==========
    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: {
        return_code: returnCode,
        original_order_code: order.order_code,
        return_items: returnItems,
        total_refund: totalRefund,
        refund_method,
        reason,
      },
      message: "Hoàn trả đơn hàng thành công",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Return order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi hoàn trả đơn hàng",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Lấy thông tin in hóa đơn - GET /api/orders/:id/invoice
 */
const getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order with full details
    const orderQuery = `
      SELECT 
        fo.*,
        dc.full_name as customer_name,
        dc.phone as customer_phone,
        dc.address as customer_address,
        ds.name as store_name,
        ds.address as store_address,
        ds.phone as store_phone,
        u.full_name as staff_name
      FROM fact_orders fo
      LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
      JOIN dim_stores ds ON fo.store_id = ds.id
      JOIN dim_users u ON fo.created_by = u.id
      WHERE fo.id = $1
    `;
    const orderResult = await db.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        foi.quantity,
        foi.unit_price,
        foi.discount_per_item,
        foi.line_subtotal,
        foi.line_total,
        dpv.sku,
        dpv.barcode,
        dp.name as product_name,
        dp.code as product_code,
        su.name as unit_name
      FROM fact_order_items foi
      JOIN dim_product_variants dpv ON foi.variant_id = dpv.id
      JOIN dim_products dp ON dpv.product_id = dp.id
      LEFT JOIN subdim_units su ON dp.unit_id = su.id
      WHERE foi.order_id = $1
      ORDER BY dp.name
    `;
    const itemsResult = await db.query(itemsQuery, [id]);

    // Format invoice data
    const invoice = {
      invoice_number: order.order_code,
      date: order.date_key,
      created_at: order.created_at,

      store: {
        name: order.store_name,
        address: order.store_address,
        phone: order.store_phone,
      },

      customer: {
        name: order.customer_name || "Khách lẻ",
        phone: order.customer_phone || "",
        address: order.customer_address || order.shipping_address || "",
      },

      staff: order.staff_name,

      items: itemsResult.rows.map((item) => ({
        sku: item.sku,
        barcode: item.barcode,
        name: item.product_name,
        unit: item.unit_name,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        discount: parseFloat(item.discount_per_item),
        subtotal: parseFloat(item.line_subtotal),
        total: parseFloat(item.line_total),
      })),

      summary: {
        subtotal: parseFloat(order.subtotal),
        discount: parseFloat(order.discount_amount),
        tax: parseFloat(order.tax_amount),
        shipping: parseFloat(order.shipping_fee),
        total: parseFloat(order.final_amount),
      },

      payment: {
        method: order.payment_method,
        status: order.payment_status,
      },

      notes: {
        customer: order.customer_note,
        internal: order.internal_note,
      },
    };

    res.json({
      success: true,
      data: invoice,
      message: "Lấy thông tin hóa đơn thành công",
    });
  } catch (error) {
    console.error("Get order invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin hóa đơn",
      error: error.message,
    });
  }
};

/**
 * Danh sách đơn hoàn trả - GET /api/orders/returns
 */
const getReturnOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, from, to, store_id } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;

    let whereClause = `WHERE fo.status = 'returned' OR fo.order_code LIKE 'RTN-%'`;

    if (from) {
      whereClause += ` AND fo.date_key >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      whereClause += ` AND fo.date_key <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    if (store_id) {
      whereClause += ` AND fo.store_id = $${paramIndex}`;
      params.push(store_id);
      paramIndex++;
    }

    // Count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM fact_orders fo ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total);

    // Get returns
    const query = `
      SELECT 
        fo.id,
        fo.order_code,
        fo.date_key,
        fo.final_amount,
        fo.payment_method,
        fo.internal_note,
        fo.created_at,
        dc.full_name as customer_name,
        ds.name as store_name,
        u.full_name as staff_name
      FROM fact_orders fo
      LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
      JOIN dim_stores ds ON fo.store_id = ds.id
      JOIN dim_users u ON fo.created_by = u.id
      ${whereClause}
      ORDER BY fo.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      message: "Lấy danh sách đơn hoàn trả thành công",
    });
  } catch (error) {
    console.error("Get return orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hoàn trả",
      error: error.message,
    });
  }
};

/**
 * Danh sách đơn nháp - GET /api/orders/drafts
 */
const getDraftOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, from, to } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;

    let whereClause = `WHERE fo.status = 'draft'`;

    if (search) {
      whereClause += ` AND (fo.order_code ILIKE $${paramIndex} OR dc.full_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (from) {
      whereClause += ` AND fo.created_at >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      whereClause += ` AND fo.created_at <= $${paramIndex}`;
      params.push(to + " 23:59:59");
      paramIndex++;
    }

    // Count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM fact_orders fo 
       LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
       ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total);

    // Get drafts
    const query = `
      SELECT 
        fo.id,
        fo.order_code,
        fo.final_amount,
        fo.customer_note as note,
        fo.created_at,
        COALESCE(dc.full_name, 'Khách vãng lai') as customer_name,
        u.full_name as created_by
      FROM fact_orders fo
      LEFT JOIN dim_customers dc ON fo.customer_id = dc.id
      LEFT JOIN dim_users u ON fo.created_by = u.id
      ${whereClause}
      ORDER BY fo.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get draft orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn nháp",
      error: error.message,
    });
  }
};

/**
 * Tạo đơn nháp - POST /api/orders/drafts
 */
const createDraftOrder = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const {
      customer_name,
      customer_id,
      store_id = 1,
      items = [],
      note,
    } = req.body;

    await client.query("BEGIN");

    // Generate draft code
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const draftCountResult = await client.query(
      `
      SELECT COUNT(*) + 1 as next_num
      FROM fact_orders
      WHERE date_key = $1 AND status = 'draft'
    `,
      [today.toISOString().split("T")[0]],
    );

    const draftNumber = String(draftCountResult.rows[0].next_num).padStart(
      5,
      "0",
    );
    const draftCode = `DRAFT-${dateStr}-${draftNumber}`;

    // Calculate totals from items
    let subtotal = 0;
    if (items && items.length > 0) {
      subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );
    }

    // Create draft order
    const orderResult = await client.query(
      `
      INSERT INTO fact_orders (
        order_code, date_key, store_id, customer_id,
        subtotal, final_amount, status, 
        customer_note, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, NOW())
      RETURNING id, order_code
    `,
      [
        draftCode,
        today.toISOString().split("T")[0],
        store_id,
        customer_id || null,
        subtotal,
        subtotal,
        note || null,
        req.user?.id || 1,
      ],
    );

    const orderId = orderResult.rows[0].id;

    // Insert draft items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `
          INSERT INTO fact_order_items (
            order_id, variant_id, quantity, unit_price, 
            subtotal, total
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            orderId,
            item.variant_id,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price,
            item.quantity * item.unit_price,
          ],
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: {
        id: orderId,
        order_code: orderResult.rows[0].order_code,
        customer_name: customer_name || "Khách vãng lai",
        total_amount: subtotal,
        note: note || "",
      },
      message: "Tạo đơn nháp thành công",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create draft order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn nháp",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Chuyển đổi đơn nháp thành đơn hàng - POST /api/orders/drafts/:id/convert
 */
const convertDraftToOrder = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // Check if draft exists
    const draftCheck = await client.query(
      `SELECT * FROM fact_orders WHERE id = $1 AND status = 'draft'`,
      [id],
    );

    if (draftCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn nháp",
      });
    }

    // Update status to pending/confirmed
    await client.query(
      `UPDATE fact_orders 
       SET status = 'pending', payment_status = 'unpaid'
       WHERE id = $1`,
      [id],
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Chuyển đổi đơn nháp thành đơn hàng thành công",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Convert draft order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi chuyển đổi đơn nháp",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Xóa đơn nháp - DELETE /api/orders/drafts/:id
 */
const deleteDraftOrder = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // Check if draft exists
    const draftCheck = await client.query(
      `SELECT * FROM fact_orders WHERE id = $1 AND status = 'draft'`,
      [id],
    );

    if (draftCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn nháp",
      });
    }

    // Delete order items first
    await client.query(`DELETE FROM fact_order_items WHERE order_id = $1`, [
      id,
    ]);

    // Delete draft order
    await client.query(`DELETE FROM fact_orders WHERE id = $1`, [id]);

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Xóa đơn nháp thành công",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete draft order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đơn nháp",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getOrderList,
  getOrderDetail,
  getOrderStats,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getDetailedStats,
  returnOrder,
  getOrderInvoice,
  getReturnOrders,
  getDraftOrders,
  createDraftOrder,
  convertDraftToOrder,
  deleteDraftOrder,
};
