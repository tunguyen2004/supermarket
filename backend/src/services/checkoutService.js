/**
 * Checkout Service
 * @module services/checkoutService
 * @description Quản lý đơn chưa hoàn tất (abandoned carts)
 */

const { pool, query } = require('../config/database');

/**
 * Get all checkouts (abandoned/draft orders) with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} List of checkouts with pagination
 */
async function getAllCheckouts(options = {}) {
  const {
    page = 1,
    limit = 20,
    store_id,
    status,
    search,
    from,
    to,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = options;

  const offset = (page - 1) * limit;
  const params = [];
  let paramIndex = 1;

  // Filter for abandoned/draft orders
  let whereClause = `WHERE o.status IN ('draft', 'abandoned', 'pending')`;

  if (store_id) {
    whereClause += ` AND o.store_id = $${paramIndex}`;
    params.push(store_id);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND o.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (from) {
    whereClause += ` AND o.created_at >= $${paramIndex}`;
    params.push(from);
    paramIndex++;
  }

  if (to) {
    whereClause += ` AND o.created_at <= $${paramIndex}`;
    params.push(to);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (
      o.order_code ILIKE $${paramIndex} OR 
      c.full_name ILIKE $${paramIndex} OR
      c.email ILIKE $${paramIndex} OR
      c.phone ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Validate sort columns
  const allowedSortColumns = ['created_at', 'final_amount', 'order_code'];
  const sortColumn = allowedSortColumns.includes(sort_by) ? sort_by : 'created_at';
  const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM fact_orders o
    LEFT JOIN dim_customers c ON o.customer_id = c.id
    ${whereClause}
  `;

  // Data query
  const dataQuery = `
    SELECT 
      o.id,
      o.order_code,
      o.date_key,
      o.customer_id,
      c.full_name as customer_name,
      c.email as customer_email,
      c.phone as customer_phone,
      o.store_id,
      s.name as store_name,
      o.status,
      o.payment_status,
      o.subtotal,
      o.discount_amount,
      o.tax_amount,
      o.shipping_fee,
      o.final_amount,
      o.payment_method,
      o.customer_note,
      o.created_at,
      o.email_sent,
      o.email_sent_at,
      (
        SELECT COUNT(*) FROM fact_order_items oi WHERE oi.order_id = o.id
      ) as item_count
    FROM fact_orders o
    LEFT JOIN dim_customers c ON o.customer_id = c.id
    LEFT JOIN dim_stores s ON o.store_id = s.id
    ${whereClause}
    ORDER BY o.${sortColumn} ${sortDir}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, params.slice(0, paramIndex - 1)),
    pool.query(dataQuery, params)
  ]);

  const total = parseInt(countResult.rows[0].total);

  // Format response
  const checkouts = dataResult.rows.map(row => ({
    id: row.id,
    checkoutCode: row.order_code,
    customerName: row.customer_name || 'Khách vãng lai',
    customerContact: row.customer_email || row.customer_phone || '',
    customerId: row.customer_id,
    storeId: row.store_id,
    storeName: row.store_name,
    createdDate: row.created_at,
    totalAmount: parseFloat(row.final_amount) || 0,
    subtotal: parseFloat(row.subtotal) || 0,
    discountAmount: parseFloat(row.discount_amount) || 0,
    status: row.email_sent ? 'Đã gửi email' : 'Chưa liên hệ',
    paymentStatus: row.payment_status,
    itemCount: parseInt(row.item_count) || 0,
    emailSentAt: row.email_sent_at
  }));

  return {
    data: checkouts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get checkout by ID with full details
 * @param {number} id - Checkout/Order ID
 * @returns {Promise<Object|null>} Checkout details with items
 */
async function getCheckoutById(id) {
  // Get order details
  const orderQuery = `
    SELECT 
      o.id,
      o.order_code,
      o.date_key,
      o.customer_id,
      c.full_name as customer_name,
      c.email as customer_email,
      c.phone as customer_phone,
      c.address as customer_address,
      o.store_id,
      s.name as store_name,
      o.status,
      o.payment_status,
      o.subtotal,
      o.discount_amount,
      o.tax_amount,
      o.shipping_fee,
      o.final_amount,
      o.payment_method,
      o.shipping_address,
      o.customer_note,
      o.internal_note,
      o.created_by,
      o.created_at,
      o.email_sent,
      o.email_sent_at,
      u.full_name as created_by_name
    FROM fact_orders o
    LEFT JOIN dim_customers c ON o.customer_id = c.id
    LEFT JOIN dim_stores s ON o.store_id = s.id
    LEFT JOIN dim_users u ON o.created_by = u.id
    WHERE o.id = $1
  `;

  // Get order items
  const itemsQuery = `
    SELECT 
      oi.id,
      oi.variant_id,
      pv.sku,
      pv.barcode,
      p.name as product_name,
      pv.variant_name,
      oi.quantity,
      oi.unit_price,
      oi.discount_per_item,
      oi.line_subtotal,
      oi.line_total,
      pi.image_url as product_image
    FROM fact_order_items oi
    JOIN dim_product_variants pv ON oi.variant_id = pv.id
    JOIN dim_products p ON pv.product_id = p.id
    LEFT JOIN dim_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    WHERE oi.order_id = $1
    ORDER BY oi.id
  `;

  const [orderResult, itemsResult] = await Promise.all([
    pool.query(orderQuery, [id]),
    pool.query(itemsQuery, [id])
  ]);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];
  
  return {
    id: order.id,
    checkoutCode: order.order_code,
    dateKey: order.date_key,
    customer: {
      id: order.customer_id,
      name: order.customer_name || 'Khách vãng lai',
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.customer_address
    },
    store: {
      id: order.store_id,
      name: order.store_name
    },
    status: order.status,
    displayStatus: order.email_sent ? 'Đã gửi email' : 'Chưa liên hệ',
    paymentStatus: order.payment_status,
    subtotal: parseFloat(order.subtotal) || 0,
    discountAmount: parseFloat(order.discount_amount) || 0,
    taxAmount: parseFloat(order.tax_amount) || 0,
    shippingFee: parseFloat(order.shipping_fee) || 0,
    totalAmount: parseFloat(order.final_amount) || 0,
    paymentMethod: order.payment_method,
    shippingAddress: order.shipping_address,
    customerNote: order.customer_note,
    internalNote: order.internal_note,
    createdBy: {
      id: order.created_by,
      name: order.created_by_name
    },
    createdAt: order.created_at,
    emailSent: order.email_sent,
    emailSentAt: order.email_sent_at,
    items: itemsResult.rows.map(item => ({
      id: item.id,
      variantId: item.variant_id,
      sku: item.sku,
      barcode: item.barcode,
      productName: item.product_name,
      variantName: item.variant_name,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unit_price),
      discountPerItem: parseFloat(item.discount_per_item) || 0,
      lineSubtotal: parseFloat(item.line_subtotal),
      lineTotal: parseFloat(item.line_total),
      productImage: item.product_image
    }))
  };
}

/**
 * Send payment link email to customer
 * @param {number} checkoutId - Checkout/Order ID
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Result of sending
 */
async function sendPaymentLink(checkoutId, options = {}) {
  const { custom_message, sender_id } = options;

  // Get checkout details
  const checkout = await getCheckoutById(checkoutId);
  
  if (!checkout) {
    throw new Error('Checkout not found');
  }

  if (!checkout.customer.email && !checkout.customer.phone) {
    throw new Error('Customer has no email or phone contact');
  }

  // Generate payment link
  const paymentLink = generatePaymentLink(checkout);

  // In a real implementation, this would send an actual email
  // For now, we'll just update the database to mark it as sent
  
  const updateQuery = `
    UPDATE fact_orders 
    SET 
      email_sent = TRUE,
      email_sent_at = CURRENT_TIMESTAMP,
      internal_note = COALESCE(internal_note, '') || $2
    WHERE id = $1
    RETURNING id
  `;

  const noteAddition = `\n[${new Date().toISOString()}] Payment link sent to ${checkout.customer.email || checkout.customer.phone}`;
  
  await pool.query(updateQuery, [checkoutId, noteAddition]);

  return {
    success: true,
    checkout_id: checkoutId,
    checkout_code: checkout.checkoutCode,
    payment_link: paymentLink,
    sent_to: checkout.customer.email || checkout.customer.phone,
    sent_at: new Date().toISOString(),
    message: custom_message || 'Payment link has been sent'
  };
}

/**
 * Send mass email to multiple checkouts
 * @param {Object} options - Filter and email options
 * @returns {Promise<Object>} Result of mass email
 */
async function sendMassEmail(options = {}) {
  const {
    checkout_ids,
    store_id,
    exclude_already_sent = true,
    custom_message,
    sender_id
  } = options;

  // Build query to find eligible checkouts
  let whereClause = `
    WHERE o.status IN ('draft', 'abandoned', 'pending')
      AND (c.email IS NOT NULL OR c.phone IS NOT NULL)
  `;
  const params = [];
  let paramIndex = 1;

  if (exclude_already_sent) {
    whereClause += ` AND (o.email_sent IS NULL OR o.email_sent = FALSE)`;
  }

  if (checkout_ids && checkout_ids.length > 0) {
    whereClause += ` AND o.id = ANY($${paramIndex})`;
    params.push(checkout_ids);
    paramIndex++;
  }

  if (store_id) {
    whereClause += ` AND o.store_id = $${paramIndex}`;
    params.push(store_id);
    paramIndex++;
  }

  // Get eligible checkouts
  const query = `
    SELECT 
      o.id,
      o.order_code,
      c.email as customer_email,
      c.phone as customer_phone,
      o.final_amount
    FROM fact_orders o
    LEFT JOIN dim_customers c ON o.customer_id = c.id
    ${whereClause}
    LIMIT 100
  `;

  const result = await pool.query(query, params);
  
  if (result.rows.length === 0) {
    return {
      success: true,
      sent_count: 0,
      failed_count: 0,
      message: 'No eligible checkouts found'
    };
  }

  // Process each checkout
  const sentIds = [];
  const failedIds = [];

  for (const checkout of result.rows) {
    try {
      // In real implementation, send actual email here
      sentIds.push(checkout.id);
    } catch (error) {
      failedIds.push({ id: checkout.id, error: error.message });
    }
  }

  // Update all sent checkouts at once
  if (sentIds.length > 0) {
    const updateQuery = `
      UPDATE fact_orders 
      SET 
        email_sent = TRUE,
        email_sent_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1)
    `;
    await pool.query(updateQuery, [sentIds]);
  }

  return {
    success: true,
    sent_count: sentIds.length,
    failed_count: failedIds.length,
    sent_checkout_ids: sentIds,
    failed_checkouts: failedIds,
    message: `Sent ${sentIds.length} emails, ${failedIds.length} failed`
  };
}

/**
 * Delete/Cancel a checkout
 * @param {number} checkoutId - Checkout ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteCheckout(checkoutId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if checkout exists and is in cancellable state
    const checkQuery = `
      SELECT id, status FROM fact_orders 
      WHERE id = $1 AND status IN ('draft', 'abandoned', 'pending')
    `;
    const checkResult = await client.query(checkQuery, [checkoutId]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    // Delete order items first
    await client.query('DELETE FROM fact_order_items WHERE order_id = $1', [checkoutId]);

    // Delete order
    await client.query('DELETE FROM fact_orders WHERE id = $1', [checkoutId]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Mark checkout as abandoned
 * @param {number} checkoutId - Checkout ID
 * @returns {Promise<Object|null>} Updated checkout
 */
async function markAsAbandoned(checkoutId) {
  const query = `
    UPDATE fact_orders 
    SET status = 'abandoned'
    WHERE id = $1 AND status = 'draft'
    RETURNING id, order_code, status
  `;

  const result = await pool.query(query, [checkoutId]);
  return result.rows[0] || null;
}

/**
 * Generate payment link for a checkout
 * @private
 */
function generatePaymentLink(checkout) {
  // In production, this would be a real payment gateway link
  const baseUrl = process.env.PAYMENT_BASE_URL || 'https://pay.example.com';
  const token = Buffer.from(`${checkout.id}:${checkout.checkoutCode}:${Date.now()}`).toString('base64');
  return `${baseUrl}/checkout/${token}`;
}

/**
 * Get checkout statistics
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Statistics
 */
async function getCheckoutStats(options = {}) {
  const { store_id, from, to } = options;

  const params = [];
  let paramIndex = 1;
  let whereClause = `WHERE o.status IN ('draft', 'abandoned', 'pending')`;

  if (store_id) {
    whereClause += ` AND o.store_id = $${paramIndex}`;
    params.push(store_id);
    paramIndex++;
  }

  if (from) {
    whereClause += ` AND o.created_at >= $${paramIndex}`;
    params.push(from);
    paramIndex++;
  }

  if (to) {
    whereClause += ` AND o.created_at <= $${paramIndex}`;
    params.push(to);
    paramIndex++;
  }

  const query = `
    SELECT 
      COUNT(*) as total_checkouts,
      COUNT(CASE WHEN email_sent = TRUE THEN 1 END) as emailed_count,
      COUNT(CASE WHEN email_sent IS NULL OR email_sent = FALSE THEN 1 END) as not_contacted_count,
      SUM(final_amount) as total_value,
      AVG(final_amount) as avg_value
    FROM fact_orders o
    ${whereClause}
  `;

  const result = await pool.query(query, params);
  const row = result.rows[0];

  return {
    totalCheckouts: parseInt(row.total_checkouts) || 0,
    emailedCount: parseInt(row.emailed_count) || 0,
    notContactedCount: parseInt(row.not_contacted_count) || 0,
    totalValue: parseFloat(row.total_value) || 0,
    avgValue: parseFloat(row.avg_value) || 0
  };
}

module.exports = {
  getAllCheckouts,
  getCheckoutById,
  sendPaymentLink,
  sendMassEmail,
  deleteCheckout,
  markAsAbandoned,
  getCheckoutStats
};
