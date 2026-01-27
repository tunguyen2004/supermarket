const db = require('../config/database');

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
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    // Đảm bảo limit và offset là số
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const parsedOffset = parseInt(offset) || 0;

    // Validate sort field (chống SQL injection)
    const validSortFields = ['order_code', 'final_amount', 'status', 'created_at', 'payment_status'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    
    // Validate order direction
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

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
        `(fo.order_code ILIKE $${paramIndex} OR dc.full_name ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

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
    const formattedOrders = result.rows.map(order => ({
      id: order.id,
      order_code: order.order_code,
      date: order.date_key,
      customer: {
        name: order.customer_name,
        phone: order.customer_phone
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
        total: parseFloat(order.final_amount) || 0
      },
      items: {
        count: parseInt(order.item_count),
        total_quantity: parseFloat(order.total_quantity) || 0
      },
      notes: order.customer_note,
      created_by: order.created_by_name,
      created_at: order.created_at
    }));

    res.json({
      status: 'OK',
      message: 'Orders list retrieved successfully',
      data: formattedOrders,
      pagination: {
        total: total,
        limit: parsedLimit,
        offset: parsedOffset,
        pages: Math.ceil(total / parsedLimit),
        current_page: Math.floor(parsedOffset / parsedLimit) + 1
      }
    });

  } catch (error) {
    console.error('Get orders list error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get orders list',
      error: error.message
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
        status: 'ERROR',
        message: 'Order not found',
        data: null
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

    const formattedItems = itemsResult.rows.map(item => ({
      id: item.id,
      product: item.product_name || 'Unknown Product',
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
      discount_per_item: parseFloat(item.discount_per_item) || 0,
      line_subtotal: parseFloat(item.line_subtotal),
      line_total: parseFloat(item.line_total)
    }));

    // Format response
    res.json({
      status: 'OK',
      message: 'Order detail retrieved successfully',
      data: {
        id: order.id,
        order_code: order.order_code,
        date: order.date_key,
        customer: {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email
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
          total: parseFloat(order.final_amount) || 0
        },
        shipping_address: order.shipping_address,
        items: formattedItems,
        notes: {
          customer: order.customer_note,
          internal: order.internal_note
        },
        created_by: order.created_by_name,
        created_at: order.created_at
      }
    });

  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get order detail',
      error: error.message
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
      status: 'OK',
      message: 'Order statistics retrieved successfully',
      data: {
        total_orders: parseInt(stats.total_orders),
        by_status: {
          completed: parseInt(stats.completed_orders),
          pending: parseInt(stats.pending_orders),
          cancelled: parseInt(stats.cancelled_orders)
        },
        by_payment: {
          paid: parseInt(stats.paid_orders),
          unpaid: parseInt(stats.unpaid_orders)
        },
        revenue: {
          total: parseFloat(stats.total_revenue) || 0,
          average_per_order: parseFloat(stats.avg_order_value) || 0,
          max_order: parseFloat(stats.max_order_value) || 0
        }
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get order statistics',
      error: error.message
    });
  }
};

/**
 * Tạo đơn hàng mới - POST /api/orders
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Thông tin đơn hàng vừa tạo
 */
const createOrder = async (req, res) => {
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
      internal_note
    } = req.body;

    // Validate input bắt buộc
    if (!store_id) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'store_id is required',
        data: null
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'items array is required and must contain at least one item',
        data: null
      });
    }

    // Validate items
    for (let item of items) {
      if (!item.variant_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Each item must have variant_id, quantity, and unit_price',
          data: null
        });
      }

      if (item.quantity <= 0 || item.unit_price <= 0) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'quantity and unit_price must be greater than 0',
          data: null
        });
      }
    }

    // Tính toán final_amount
    const final_amount = subtotal - discount_amount + tax_amount + shipping_fee;

    // Lấy date_key (ngày hiện tại)
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];

    // Kiểm tra store tồn tại
    const storeCheck = await db.query(
      'SELECT id FROM dim_stores WHERE id = $1',
      [store_id]
    );

    if (storeCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Store not found',
        data: null
      });
    }

    // Kiểm tra customer nếu có
    if (customer_id) {
      const customerCheck = await db.query(
        'SELECT id FROM dim_customers WHERE id = $1',
        [customer_id]
      );

      if (customerCheck.rows.length === 0) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Customer not found',
          data: null
        });
      }
    }

    // Kiểm tra tất cả variants tồn tại
    const variantIds = items.map(item => item.variant_id);
    const variantsCheck = await db.query(
      `SELECT id FROM dim_product_variants WHERE id = ANY($1)`,
      [variantIds]
    );

    if (variantsCheck.rows.length !== items.length) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'One or more product variants not found',
        data: null
      });
    }

    // Tạo order code (ORD-YYYYMMDD-XXXXX)
    const datePart = dateKey.replace(/-/g, '').substring(2);
    const orderCodePrefix = `ORD-${datePart}`;
    
    // Lấy max sequence của ngày hôm nay 
    // order_code format: ORD-260120-00001, ta cần lấy số 00001
    const sequenceResult = await db.query(
      `SELECT 
        COALESCE(
          MAX(CAST(RIGHT(order_code, 5) AS INTEGER)), 
          0
        ) as max_sequence
       FROM fact_orders 
       WHERE order_code LIKE $1`,
      [`${orderCodePrefix}-%`]
    );

    const nextSequence = String((sequenceResult.rows[0].max_sequence || 0) + 1).padStart(5, '0');
    const orderCode = `${orderCodePrefix}-${nextSequence}`;

    // Tạo đơn hàng
    const orderResult = await db.query(
      `INSERT INTO fact_orders (
        order_code, date_key, customer_id, store_id, status, payment_status,
        subtotal, discount_amount, tax_amount, shipping_fee, final_amount,
        payment_method, shipping_address, customer_note, internal_note, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING id, order_code, date_key, status, payment_status, created_at`,
      [
        orderCode, dateKey, customer_id, store_id, 'pending', 'unpaid',
        subtotal, discount_amount, tax_amount, shipping_fee, final_amount,
        payment_method || 'cash', shipping_address, customer_note, internal_note, 
        req.user.id
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Thêm order items
    for (let item of items) {
      const lineSubtotal = item.quantity * item.unit_price;
      const lineTotal = lineSubtotal - (item.discount_per_item || 0);

      await db.query(
        `INSERT INTO fact_order_items (
          order_id, variant_id, quantity, unit_price, discount_per_item
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId, item.variant_id, item.quantity, item.unit_price,
          item.discount_per_item || 0
        ]
      );
    }

    // Lấy order detail để trả về
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
      [orderId]
    );

    res.status(201).json({
      status: 'OK',
      message: 'Order created successfully',
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
          total: parseFloat(detailResult.rows[0].final_amount)
        },
        items_count: items.length,
        created_at: detailResult.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create order',
      error: error.message
    });
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
      'SELECT id, status, payment_status FROM fact_orders WHERE id = $1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found',
        data: null
      });
    }

    const order = orderCheck.rows[0];

    // Validate status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['unpaid', 'partial', 'paid', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        data: null
      });
    }

    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}`,
        data: null
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
      id
    ]);

    const updatedOrder = result.rows[0];

    res.json({
      status: 'OK',
      message: 'Order updated successfully',
      data: {
        id: updatedOrder.id,
        order_code: updatedOrder.order_code,
        status: updatedOrder.status,
        payment_status: updatedOrder.payment_status,
        payment_method: updatedOrder.payment_method,
        updated_at: updatedOrder.created_at
      }
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update order',
      error: error.message
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
      'SELECT id, status FROM fact_orders WHERE id = $1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found',
        data: null
      });
    }

    const order = orderCheck.rows[0];

    // Không thể hủy order đã shipped/delivered
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Cannot cancel order with status: ${order.status}`,
        data: null
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

    const result = await db.query(cancelQuery, [id, reason || 'No reason provided']);
    const cancelledOrder = result.rows[0];

    res.json({
      status: 'OK',
      message: 'Order cancelled successfully',
      data: {
        id: cancelledOrder.id,
        order_code: cancelledOrder.order_code,
        status: cancelledOrder.status,
        payment_status: cancelledOrder.payment_status,
        cancelled_at: cancelledOrder.created_at,
        note: reason
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to cancel order',
      error: error.message
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
    const completionRate = stats.total_orders > 0 
      ? ((stats.delivered_count / stats.total_orders) * 100).toFixed(2)
      : 0;

    const paymentRate = stats.total_orders > 0
      ? ((stats.paid_count / stats.total_orders) * 100).toFixed(2)
      : 0;

    res.json({
      status: 'OK',
      message: 'Detailed statistics retrieved successfully',
      data: {
        orders: {
          total: parseInt(stats.total_orders),
          by_status: {
            pending: parseInt(stats.pending_count),
            processing: parseInt(stats.processing_count),
            shipped: parseInt(stats.shipped_count),
            delivered: parseInt(stats.delivered_count),
            cancelled: parseInt(stats.cancelled_count)
          },
          completion_rate: parseFloat(completionRate),
          avg_items_per_order: (parseFloat(stats.total_items) / stats.total_orders).toFixed(2)
        },
        payment: {
          total_orders: parseInt(stats.total_orders),
          by_status: {
            unpaid: parseInt(stats.unpaid_count),
            paid: parseInt(stats.paid_count),
            refunded: parseInt(stats.refunded_count)
          },
          payment_rate: parseFloat(paymentRate)
        },
        revenue: {
          total: parseFloat(stats.total_revenue),
          from_delivered: parseFloat(stats.delivered_revenue),
          from_cancelled: parseFloat(stats.cancelled_revenue),
          avg_per_order: parseFloat(stats.avg_order_value)
        },
        financials: {
          total_discount: parseFloat(stats.total_discount),
          total_tax: parseFloat(stats.total_tax),
          total_items: parseInt(stats.total_items)
        }
      }
    });

  } catch (error) {
    console.error('Get detailed stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get detailed statistics',
      error: error.message
    });
  }
};

module.exports = {
  getOrderList,
  getOrderDetail,
  getOrderStats,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getDetailedStats
};
