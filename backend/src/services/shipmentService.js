/**
 * ============================================================================
 *                    MODULE 15: SHIPMENT SERVICE (VẬN CHUYỂN)
 * ============================================================================
 * Quản lý vận đơn / giao hàng
 * Sử dụng bảng: fact_shipments, fact_shipment_tracking, dim_carriers, 
 *               subdim_shipment_statuses
 * 
 * Chức năng:
 * - Danh sách vận đơn
 * - Tạo vận đơn
 * - Chi tiết vận đơn
 * - Sửa vận đơn
 * - Xóa vận đơn
 * - Cập nhật trạng thái
 * ============================================================================
 */

const db = require('../config/database');

/**
 * 1. Danh sách vận đơn - GET /api/shipments
 * Query: search, status, carrier_id, store_id, from, to, page, limit
 */
const getShipments = async (req, res) => {
  try {
    const {
      search,
      status,
      carrier_id,
      store_id,
      from,
      to,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ` AND (
        s.shipment_code ILIKE $${paramIndex} OR 
        s.tracking_code ILIKE $${paramIndex} OR
        s.recipient_name ILIKE $${paramIndex} OR
        s.recipient_phone ILIKE $${paramIndex} OR
        o.order_code ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND ss.code = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (carrier_id) {
      whereClause += ` AND s.carrier_id = $${paramIndex}`;
      params.push(carrier_id);
      paramIndex++;
    }

    if (store_id) {
      whereClause += ` AND s.sender_store_id = $${paramIndex}`;
      params.push(store_id);
      paramIndex++;
    }

    if (from) {
      whereClause += ` AND s.created_at >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      whereClause += ` AND s.created_at <= $${paramIndex}`;
      params.push(to + ' 23:59:59');
      paramIndex++;
    }

    // Validate sortBy
    const allowedSortFields = ['created_at', 'shipment_code', 'recipient_name', 'total_fee'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM fact_shipments s
      JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
      JOIN fact_orders o ON s.order_id = o.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get shipments
    const query = `
      SELECT 
        s.id,
        s.shipment_code,
        s.order_id,
        o.order_code,
        c.code as carrier_code,
        c.name as carrier_name,
        s.tracking_code,
        ss.code as status_code,
        ss.name as status_name,
        st.name as sender_store_name,
        s.recipient_name,
        s.recipient_phone,
        s.recipient_address,
        s.shipping_fee,
        s.cod_amount,
        s.total_fee,
        s.estimated_delivery_date,
        s.actual_delivery_date,
        s.created_at,
        u.full_name as created_by_name
      FROM fact_shipments s
      JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
      JOIN fact_orders o ON s.order_id = o.id
      JOIN dim_stores st ON s.sender_store_id = st.id
      LEFT JOIN dim_carriers c ON s.carrier_id = c.id
      JOIN dim_users u ON s.created_by = u.id
      ${whereClause}
      ORDER BY s.${sortField} ${sortOrder}
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
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách vận đơn thành công'
    });

  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách vận đơn',
      error: error.message
    });
  }
};

/**
 * 2. Chi tiết vận đơn - GET /api/shipments/:id
 */
const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        s.*,
        o.order_code,
        o.final_amount as order_amount,
        c.code as carrier_code,
        c.name as carrier_name,
        c.tracking_url_template,
        ss.code as status_code,
        ss.name as status_name,
        st.name as sender_store_name,
        st.code as sender_store_code,
        city.name as recipient_city_name,
        u.full_name as created_by_name
      FROM fact_shipments s
      JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
      JOIN fact_orders o ON s.order_id = o.id
      JOIN dim_stores st ON s.sender_store_id = st.id
      LEFT JOIN dim_carriers c ON s.carrier_id = c.id
      LEFT JOIN subdim_cities city ON s.recipient_city_id = city.id
      JOIN dim_users u ON s.created_by = u.id
      WHERE s.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vận đơn'
      });
    }

    // Get tracking history
    const trackingQuery = `
      SELECT 
        st.id,
        ss.code as status_code,
        ss.name as status_name,
        st.location,
        st.description,
        st.tracked_at,
        u.full_name as created_by_name
      FROM fact_shipment_tracking st
      JOIN subdim_shipment_statuses ss ON st.status_id = ss.id
      LEFT JOIN dim_users u ON st.created_by = u.id
      WHERE st.shipment_id = $1
      ORDER BY st.tracked_at DESC
    `;
    const trackingResult = await db.query(trackingQuery, [id]);

    // Build tracking URL
    const shipment = result.rows[0];
    let trackingUrl = null;
    if (shipment.tracking_code && shipment.tracking_url_template) {
      trackingUrl = shipment.tracking_url_template.replace('{tracking_code}', shipment.tracking_code);
    }

    res.json({
      success: true,
      data: {
        ...shipment,
        tracking_url: trackingUrl,
        tracking_history: trackingResult.rows
      },
      message: 'Lấy thông tin vận đơn thành công'
    });

  } catch (error) {
    console.error('Get shipment by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin vận đơn',
      error: error.message
    });
  }
};

/**
 * 3. Tạo vận đơn - POST /api/shipments
 */
const createShipment = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      order_id,
      carrier_id,
      tracking_code,
      sender_store_id,
      recipient_name,
      recipient_phone,
      recipient_address,
      recipient_city_id,
      recipient_district,
      recipient_ward,
      package_weight,
      package_length,
      package_width,
      package_height,
      items_description,
      shipping_fee = 0,
      cod_amount = 0,
      insurance_fee = 0,
      estimated_delivery_date,
      notes,
      special_instructions
    } = req.body;

    // Validate required fields
    if (!order_id || !sender_store_id || !recipient_name || !recipient_phone || !recipient_address) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    await client.query('BEGIN');

    // Check order exists
    const orderCheck = await client.query(
      'SELECT id, order_code FROM fact_orders WHERE id = $1',
      [order_id]
    );
    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    // Check if shipment already exists for this order
    const existingShipment = await client.query(
      'SELECT id FROM fact_shipments WHERE order_id = $1',
      [order_id]
    );
    if (existingShipment.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã có vận đơn'
      });
    }

    // Get pending status
    const statusResult = await client.query(
      "SELECT id FROM subdim_shipment_statuses WHERE code = 'pending'"
    );
    const statusId = statusResult.rows[0].id;

    // Generate shipment code
    const shipmentCode = `SHP-${Date.now()}`;

    // Calculate total fee
    const totalFee = parseFloat(shipping_fee) + parseFloat(insurance_fee);

    // Get sender info from store
    const storeResult = await client.query(
      'SELECT name, phone, address FROM dim_stores WHERE id = $1',
      [sender_store_id]
    );
    const store = storeResult.rows[0];

    // Insert shipment
    const insertQuery = `
      INSERT INTO fact_shipments (
        shipment_code, order_id, carrier_id, tracking_code, status_id,
        sender_store_id, sender_name, sender_phone, sender_address,
        recipient_name, recipient_phone, recipient_address, recipient_city_id,
        recipient_district, recipient_ward,
        package_weight, package_length, package_width, package_height, items_description,
        shipping_fee, cod_amount, insurance_fee, total_fee,
        estimated_delivery_date, notes, special_instructions, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING id
    `;

    const insertResult = await client.query(insertQuery, [
      shipmentCode, order_id, carrier_id, tracking_code, statusId,
      sender_store_id, store.name, store.phone, store.address,
      recipient_name, recipient_phone, recipient_address, recipient_city_id,
      recipient_district, recipient_ward,
      package_weight, package_length, package_width, package_height, items_description,
      shipping_fee, cod_amount, insurance_fee, totalFee,
      estimated_delivery_date, notes, special_instructions, req.user.id
    ]);

    const shipmentId = insertResult.rows[0].id;

    // Insert initial tracking record
    await client.query(`
      INSERT INTO fact_shipment_tracking (shipment_id, status_id, description, created_by)
      VALUES ($1, $2, $3, $4)
    `, [shipmentId, statusId, 'Vận đơn được tạo', req.user.id]);

    await client.query('COMMIT');

    // Get created shipment
    const resultQuery = `
      SELECT 
        s.*,
        o.order_code,
        c.name as carrier_name,
        ss.code as status_code,
        ss.name as status_name,
        st.name as sender_store_name
      FROM fact_shipments s
      JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
      JOIN fact_orders o ON s.order_id = o.id
      JOIN dim_stores st ON s.sender_store_id = st.id
      LEFT JOIN dim_carriers c ON s.carrier_id = c.id
      WHERE s.id = $1
    `;
    const result = await db.query(resultQuery, [shipmentId]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Tạo vận đơn thành công'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo vận đơn',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * 4. Cập nhật vận đơn - PUT /api/shipments/:id
 */
const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      carrier_id,
      tracking_code,
      recipient_name,
      recipient_phone,
      recipient_address,
      recipient_city_id,
      recipient_district,
      recipient_ward,
      package_weight,
      package_length,
      package_width,
      package_height,
      items_description,
      shipping_fee,
      cod_amount,
      insurance_fee,
      estimated_delivery_date,
      notes,
      special_instructions
    } = req.body;

    // Check shipment exists
    const existingResult = await db.query(
      `SELECT s.id, ss.code as status_code 
       FROM fact_shipments s 
       JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
       WHERE s.id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vận đơn'
      });
    }

    // Can only edit pending/confirmed shipments
    const editableStatuses = ['pending', 'confirmed'];
    if (!editableStatuses.includes(existingResult.rows[0].status_code)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể sửa vận đơn ở trạng thái chờ xử lý hoặc đã xác nhận'
      });
    }

    // Build update query
    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    const fieldMappings = {
      carrier_id, tracking_code, recipient_name, recipient_phone, recipient_address,
      recipient_city_id, recipient_district, recipient_ward,
      package_weight, package_length, package_width, package_height, items_description,
      shipping_fee, cod_amount, insurance_fee, estimated_delivery_date, notes, special_instructions
    };

    for (const [key, value] of Object.entries(fieldMappings)) {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    // Recalculate total fee if needed
    if (shipping_fee !== undefined || insurance_fee !== undefined) {
      const currentShipment = await db.query(
        'SELECT shipping_fee, insurance_fee FROM fact_shipments WHERE id = $1',
        [id]
      );
      const newShippingFee = shipping_fee !== undefined ? shipping_fee : currentShipment.rows[0].shipping_fee;
      const newInsuranceFee = insurance_fee !== undefined ? insurance_fee : currentShipment.rows[0].insurance_fee;
      
      updateFields.push(`total_fee = $${paramIndex++}`);
      params.push(parseFloat(newShippingFee) + parseFloat(newInsuranceFee));
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin cập nhật'
      });
    }

    params.push(id);
    await db.query(
      `UPDATE fact_shipments SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      params
    );

    // Get updated shipment
    const resultQuery = `
      SELECT 
        s.*,
        o.order_code,
        c.name as carrier_name,
        ss.code as status_code,
        ss.name as status_name
      FROM fact_shipments s
      JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
      JOIN fact_orders o ON s.order_id = o.id
      LEFT JOIN dim_carriers c ON s.carrier_id = c.id
      WHERE s.id = $1
    `;
    const result = await db.query(resultQuery, [id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật vận đơn thành công'
    });

  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật vận đơn',
      error: error.message
    });
  }
};

/**
 * 5. Xóa vận đơn - DELETE /api/shipments/:id
 */
const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check shipment exists and status
    const existingResult = await db.query(
      `SELECT s.id, s.shipment_code, ss.code as status_code 
       FROM fact_shipments s 
       JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
       WHERE s.id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vận đơn'
      });
    }

    const shipment = existingResult.rows[0];

    // Can only delete pending shipments, others are cancelled
    if (shipment.status_code !== 'pending') {
      // Update to cancelled
      const cancelledStatus = await db.query(
        "SELECT id FROM subdim_shipment_statuses WHERE code = 'cancelled'"
      );
      
      await db.query(
        'UPDATE fact_shipments SET status_id = $1, updated_at = NOW() WHERE id = $2',
        [cancelledStatus.rows[0].id, id]
      );

      return res.json({
        success: true,
        message: `Đã hủy vận đơn ${shipment.shipment_code}`
      });
    }

    // Delete tracking history first
    await db.query('DELETE FROM fact_shipment_tracking WHERE shipment_id = $1', [id]);
    
    // Delete shipment
    await db.query('DELETE FROM fact_shipments WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Đã xóa vận đơn ${shipment.shipment_code}`
    });

  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa vận đơn',
      error: error.message
    });
  }
};

/**
 * 6. Cập nhật trạng thái - PATCH /api/shipments/:id/status
 */
const updateShipmentStatus = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { status, location, description } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái là bắt buộc'
      });
    }

    // Check shipment exists
    const existingResult = await client.query(
      `SELECT s.id, s.shipment_code, ss.code as current_status 
       FROM fact_shipments s 
       JOIN subdim_shipment_statuses ss ON s.status_id = ss.id
       WHERE s.id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vận đơn'
      });
    }

    // Get new status id
    const statusResult = await client.query(
      'SELECT id, name FROM subdim_shipment_statuses WHERE code = $1',
      [status]
    );

    if (statusResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const newStatusId = statusResult.rows[0].id;
    const statusName = statusResult.rows[0].name;

    await client.query('BEGIN');

    // Update shipment status
    let updateQuery = 'UPDATE fact_shipments SET status_id = $1, updated_at = NOW()';
    let updateParams = [newStatusId];

    // Set timestamps based on status
    if (status === 'picked') {
      updateQuery += ', picked_at = NOW()';
    } else if (status === 'delivered') {
      updateQuery += ', delivered_at = NOW(), actual_delivery_date = NOW()';
    }

    updateQuery += ' WHERE id = $' + (updateParams.length + 1);
    updateParams.push(id);

    await client.query(updateQuery, updateParams);

    // Add tracking record
    await client.query(`
      INSERT INTO fact_shipment_tracking (shipment_id, status_id, location, description, created_by)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, newStatusId, location || null, description || statusName, req.user.id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái vận đơn thành "${statusName}"`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update shipment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái vận đơn',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * 7. Lấy danh sách trạng thái - GET /api/shipment-statuses
 */
const getShipmentStatuses = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, code, name, description FROM subdim_shipment_statuses ORDER BY sort_order'
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách trạng thái vận đơn thành công'
    });

  } catch (error) {
    console.error('Get shipment statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách trạng thái',
      error: error.message
    });
  }
};

/**
 * 8. Lấy danh sách đơn vị vận chuyển - GET /api/carriers
 */
const getCarriers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, code, name, phone, website, tracking_url_template 
       FROM dim_carriers 
       WHERE is_active = true
       ORDER BY name`
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách đơn vị vận chuyển thành công'
    });

  } catch (error) {
    console.error('Get carriers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn vị vận chuyển',
      error: error.message
    });
  }
};

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
  getShipmentStatuses,
  getCarriers
};
