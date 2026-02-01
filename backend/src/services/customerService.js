/**
 * ============================================================================
 *                    MODULE 11: CUSTOMER SERVICE
 * ============================================================================
 * Quản lý khách hàng (Customer Management)
 * Sử dụng bảng: dim_customers, subdim_customer_groups, subdim_cities
 * 
 * Chức năng:
 * - Danh sách khách hàng (có phân trang, lọc, tìm kiếm)
 * - Tìm kiếm nhanh cho POS
 * - CRUD khách hàng
 * - Quản lý nhóm khách hàng
 * ============================================================================
 */

const db = require('../config/database');

/**
 * 1. Danh sách khách hàng - GET /api/customers
 * Query: search, group_id, city_id, page, limit, sortBy, order
 */
const getCustomers = async (req, res) => {
  try {
    const {
      search,
      group_id,
      city_id,
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
        dc.full_name ILIKE $${paramIndex} OR 
        dc.phone ILIKE $${paramIndex} OR 
        dc.email ILIKE $${paramIndex} OR
        dc.code ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (group_id) {
      whereClause += ` AND dc.customer_group_id = $${paramIndex}`;
      params.push(group_id);
      paramIndex++;
    }

    if (city_id) {
      whereClause += ` AND dc.city_id = $${paramIndex}`;
      params.push(city_id);
      paramIndex++;
    }

    // Validate sortBy
    const allowedSortFields = ['created_at', 'full_name', 'total_lifetime_value', 'code'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM dim_customers dc
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get customers
    const query = `
      SELECT 
        dc.id,
        dc.code,
        dc.full_name,
        dc.phone,
        dc.email,
        dc.address,
        dc.date_of_birth,
        dc.gender,
        dc.total_lifetime_value,
        dc.created_at,
        cg.id as group_id,
        cg.name as group_name,
        cg.discount_percentage,
        ct.name as city_name
      FROM dim_customers dc
      LEFT JOIN subdim_customer_groups cg ON dc.customer_group_id = cg.id
      LEFT JOIN subdim_cities ct ON dc.city_id = ct.id
      ${whereClause}
      ORDER BY dc.${sortField} ${sortOrder}
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
      message: 'Lấy danh sách khách hàng thành công'
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng',
      error: error.message
    });
  }
};

/**
 * 2. Tìm kiếm nhanh cho POS - GET /api/customers/search
 * Query: q (phone/name), limit
 */
const searchCustomers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Nhập ít nhất 2 ký tự để tìm kiếm'
      });
    }

    const query = `
      SELECT 
        dc.id,
        dc.code,
        dc.full_name,
        dc.phone,
        dc.email,
        dc.address,
        cg.name as group_name,
        cg.discount_percentage
      FROM dim_customers dc
      LEFT JOIN subdim_customer_groups cg ON dc.customer_group_id = cg.id
      WHERE 
        dc.phone ILIKE $1 OR 
        dc.full_name ILIKE $1 OR
        dc.code ILIKE $1
      ORDER BY 
        CASE WHEN dc.phone LIKE $2 THEN 0 ELSE 1 END,
        dc.full_name
      LIMIT $3
    `;

    const result = await db.query(query, [`%${q}%`, `${q}%`, limit]);

    res.json({
      success: true,
      data: result.rows,
      message: 'Tìm kiếm thành công'
    });

  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm khách hàng',
      error: error.message
    });
  }
};

/**
 * 3. Thêm khách hàng - POST /api/customers
 */
const createCustomer = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      customer_group_id,
      city_id,
      address,
      date_of_birth,
      gender
    } = req.body;

    // Validate required fields
    if (!full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên và số điện thoại là bắt buộc'
      });
    }

    // Check duplicate phone
    const existingPhone = await db.query(
      'SELECT id FROM dim_customers WHERE phone = $1',
      [phone]
    );

    if (existingPhone.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã tồn tại'
      });
    }

    // Check duplicate email if provided
    if (email) {
      const existingEmail = await db.query(
        'SELECT id FROM dim_customers WHERE email = $1',
        [email]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại'
        });
      }
    }

    // Generate customer code: KH-YYYYMM-XXXXX
    const now = new Date();
    const prefix = `KH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const seqResult = await db.query(
      `SELECT COALESCE(MAX(CAST(RIGHT(code, 5) AS INTEGER)), 0) as max_seq
       FROM dim_customers 
       WHERE code LIKE $1`,
      [`${prefix}-%`]
    );
    
    const nextSeq = String((seqResult.rows[0].max_seq || 0) + 1).padStart(5, '0');
    const code = `${prefix}-${nextSeq}`;

    // Insert customer
    const query = `
      INSERT INTO dim_customers (
        code, full_name, phone, email, customer_group_id, city_id, 
        address, date_of_birth, gender, total_lifetime_value, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, NOW())
      RETURNING *
    `;

    const result = await db.query(query, [
      code, full_name, phone, email || null, customer_group_id || null, 
      city_id || null, address || null, date_of_birth || null, gender || null
    ]);

    // Get full customer info with joins
    const customerQuery = `
      SELECT 
        dc.*,
        cg.name as group_name,
        cg.discount_percentage,
        ct.name as city_name
      FROM dim_customers dc
      LEFT JOIN subdim_customer_groups cg ON dc.customer_group_id = cg.id
      LEFT JOIN subdim_cities ct ON dc.city_id = ct.id
      WHERE dc.id = $1
    `;
    const customerResult = await db.query(customerQuery, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      data: customerResult.rows[0],
      message: 'Thêm khách hàng thành công'
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm khách hàng',
      error: error.message
    });
  }
};

/**
 * 4. Chi tiết khách hàng - GET /api/customers/:id
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        dc.*,
        cg.name as group_name,
        cg.discount_percentage,
        ct.name as city_name,
        (SELECT COUNT(*) FROM fact_orders WHERE customer_id = dc.id) as total_orders,
        (SELECT COALESCE(SUM(final_amount), 0) FROM fact_orders WHERE customer_id = dc.id AND status = 'completed') as total_spent
      FROM dim_customers dc
      LEFT JOIN subdim_customer_groups cg ON dc.customer_group_id = cg.id
      LEFT JOIN subdim_cities ct ON dc.city_id = ct.id
      WHERE dc.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Get recent orders
    const ordersQuery = `
      SELECT 
        id, order_code, date_key, status, payment_status, final_amount, created_at
      FROM fact_orders
      WHERE customer_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const ordersResult = await db.query(ordersQuery, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        recent_orders: ordersResult.rows
      },
      message: 'Lấy thông tin khách hàng thành công'
    });

  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng',
      error: error.message
    });
  }
};

/**
 * 5. Cập nhật khách hàng - PUT /api/customers/:id
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      phone,
      email,
      customer_group_id,
      city_id,
      address,
      date_of_birth,
      gender
    } = req.body;

    // Check customer exists
    const existingCustomer = await db.query(
      'SELECT id FROM dim_customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Check duplicate phone
    if (phone) {
      const duplicatePhone = await db.query(
        'SELECT id FROM dim_customers WHERE phone = $1 AND id != $2',
        [phone, id]
      );

      if (duplicatePhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã được sử dụng bởi khách hàng khác'
        });
      }
    }

    // Check duplicate email
    if (email) {
      const duplicateEmail = await db.query(
        'SELECT id FROM dim_customers WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (duplicateEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng bởi khách hàng khác'
        });
      }
    }

    // Update customer
    const query = `
      UPDATE dim_customers SET
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        email = $3,
        customer_group_id = $4,
        city_id = $5,
        address = $6,
        date_of_birth = $7,
        gender = $8
      WHERE id = $9
      RETURNING *
    `;

    await db.query(query, [
      full_name, phone, email || null, customer_group_id || null, 
      city_id || null, address || null, date_of_birth || null, gender || null, id
    ]);

    // Get updated customer with joins
    const customerQuery = `
      SELECT 
        dc.*,
        cg.name as group_name,
        cg.discount_percentage,
        ct.name as city_name
      FROM dim_customers dc
      LEFT JOIN subdim_customer_groups cg ON dc.customer_group_id = cg.id
      LEFT JOIN subdim_cities ct ON dc.city_id = ct.id
      WHERE dc.id = $1
    `;
    const result = await db.query(customerQuery, [id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật khách hàng thành công'
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khách hàng',
      error: error.message
    });
  }
};

/**
 * 6. Xóa khách hàng - DELETE /api/customers/:id
 */
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check customer exists
    const existingCustomer = await db.query(
      'SELECT id, full_name FROM dim_customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Check if customer has orders
    const ordersCheck = await db.query(
      'SELECT COUNT(*) as count FROM fact_orders WHERE customer_id = $1',
      [id]
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa khách hàng đã có đơn hàng. Hãy vô hiệu hóa thay vì xóa.'
      });
    }

    // Delete customer
    await db.query('DELETE FROM dim_customers WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Đã xóa khách hàng "${existingCustomer.rows[0].full_name}"`
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khách hàng',
      error: error.message
    });
  }
};

/**
 * 7. Danh sách nhóm khách hàng - GET /api/customer-groups
 */
const getCustomerGroups = async (req, res) => {
  try {
    const query = `
      SELECT 
        cg.*,
        (SELECT COUNT(*) FROM dim_customers WHERE customer_group_id = cg.id) as customer_count
      FROM subdim_customer_groups cg
      ORDER BY cg.name
    `;

    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách nhóm khách hàng thành công'
    });

  } catch (error) {
    console.error('Get customer groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhóm khách hàng',
      error: error.message
    });
  }
};

/**
 * 8. Chuyển nhóm khách hàng - PUT /api/customers/:id/group
 */
const updateCustomerGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id } = req.body;

    // Check customer exists
    const existingCustomer = await db.query(
      'SELECT id, full_name FROM dim_customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Check group exists if provided
    if (group_id) {
      const groupCheck = await db.query(
        'SELECT id FROM subdim_customer_groups WHERE id = $1',
        [group_id]
      );

      if (groupCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nhóm khách hàng không tồn tại'
        });
      }
    }

    // Update group
    await db.query(
      'UPDATE dim_customers SET customer_group_id = $1 WHERE id = $2',
      [group_id || null, id]
    );

    // Get updated customer
    const customerQuery = `
      SELECT 
        dc.*,
        cg.name as group_name,
        cg.discount_percentage
      FROM dim_customers dc
      LEFT JOIN subdim_customer_groups cg ON dc.customer_group_id = cg.id
      WHERE dc.id = $1
    `;
    const result = await db.query(customerQuery, [id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật nhóm khách hàng thành công'
    });

  } catch (error) {
    console.error('Update customer group error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật nhóm khách hàng',
      error: error.message
    });
  }
};

module.exports = {
  getCustomers,
  searchCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerGroups,
  updateCustomerGroup
};
