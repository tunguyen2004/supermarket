/**
 * ============================================================================
 *                    MODULE 13: DISCOUNT SERVICE
 * ============================================================================
 * Quản lý khuyến mại/mã giảm giá (Discount Management)
 * Sử dụng bảng: dim_discounts, subdim_discount_types, fact_discount_usages
 * 
 * Chức năng:
 * - Danh sách khuyến mại (có phân trang, lọc)
 * - CRUD khuyến mại
 * - Validate mã giảm giá cho POS
 * - Kết thúc khuyến mại
 * ============================================================================
 */

const db = require('../config/database');

/**
 * 1. Danh sách khuyến mại - GET /api/discounts
 * Query: search, type, status (active/expired/upcoming), page, limit
 */
const getDiscounts = async (req, res) => {
  try {
    const {
      search,
      type,
      status,
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
        d.code ILIKE $${paramIndex} OR 
        d.name ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND dt.code = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Filter by status
    const now = new Date().toISOString();
    if (status === 'active') {
      whereClause += ` AND d.is_active = true AND d.start_date <= $${paramIndex} AND d.end_date >= $${paramIndex}`;
      params.push(now);
      paramIndex++;
    } else if (status === 'expired') {
      whereClause += ` AND d.end_date < $${paramIndex}`;
      params.push(now);
      paramIndex++;
    } else if (status === 'upcoming') {
      whereClause += ` AND d.start_date > $${paramIndex}`;
      params.push(now);
      paramIndex++;
    } else if (status === 'inactive') {
      whereClause += ` AND d.is_active = false`;
    }

    // Validate sortBy
    const allowedSortFields = ['created_at', 'code', 'name', 'start_date', 'end_date', 'discount_value'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM dim_discounts d
      JOIN subdim_discount_types dt ON d.discount_type_id = dt.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get discounts
    const query = `
      SELECT 
        d.id,
        d.code,
        d.name,
        d.description,
        dt.code as discount_type,
        dt.name as discount_type_name,
        d.discount_value,
        d.max_discount_amount,
        d.min_order_amount,
        d.max_uses_total,
        d.max_uses_per_customer,
        d.current_uses,
        d.applies_to,
        d.start_date,
        d.end_date,
        d.is_active,
        d.created_at,
        CASE 
          WHEN d.is_active = false THEN 'inactive'
          WHEN d.end_date < NOW() THEN 'expired'
          WHEN d.start_date > NOW() THEN 'upcoming'
          ELSE 'active'
        END as status
      FROM dim_discounts d
      JOIN subdim_discount_types dt ON d.discount_type_id = dt.id
      ${whereClause}
      ORDER BY d.${sortField} ${sortOrder}
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
      message: 'Lấy danh sách khuyến mại thành công'
    });

  } catch (error) {
    console.error('Get discounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khuyến mại',
      error: error.message
    });
  }
};

/**
 * 2. Chi tiết khuyến mại - GET /api/discounts/:id
 */
const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        d.*,
        dt.code as discount_type,
        dt.name as discount_type_name,
        u.full_name as created_by_name,
        CASE 
          WHEN d.is_active = false THEN 'inactive'
          WHEN d.end_date < NOW() THEN 'expired'
          WHEN d.start_date > NOW() THEN 'upcoming'
          ELSE 'active'
        END as status
      FROM dim_discounts d
      JOIN subdim_discount_types dt ON d.discount_type_id = dt.id
      JOIN dim_users u ON d.created_by = u.id
      WHERE d.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    }

    // Get usage statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_uses,
        COALESCE(SUM(discount_amount), 0) as total_discount_given,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM fact_discount_usages
      WHERE discount_id = $1
    `;
    const statsResult = await db.query(statsQuery, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        usage_stats: statsResult.rows[0]
      },
      message: 'Lấy thông tin khuyến mại thành công'
    });

  } catch (error) {
    console.error('Get discount by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khuyến mại',
      error: error.message
    });
  }
};

/**
 * 3. Tạo khuyến mại - POST /api/discounts
 */
const createDiscount = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discount_type,  // PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y, FREE_SHIPPING
      discount_value,
      max_discount_amount,
      min_order_amount = 0,
      max_uses_total,
      max_uses_per_customer = 1,
      applies_to = 'all',
      applicable_product_ids,
      applicable_category_ids,
      customer_group_ids,
      start_date,
      end_date
    } = req.body;

    // Validate required fields
    if (!code || !name || !discount_type || !discount_value || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: code, name, discount_type, discount_value, start_date, end_date'
      });
    }

    // Validate dates
    if (new Date(end_date) <= new Date(start_date)) {
      return res.status(400).json({
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }

    // Check duplicate code
    const existingCode = await db.query(
      'SELECT id FROM dim_discounts WHERE code = $1',
      [code.toUpperCase()]
    );

    if (existingCode.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mại đã tồn tại'
      });
    }

    // Get discount type ID
    const typeResult = await db.query(
      'SELECT id FROM subdim_discount_types WHERE code = $1',
      [discount_type]
    );

    if (typeResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Loại khuyến mại không hợp lệ'
      });
    }

    const discountTypeId = typeResult.rows[0].id;

    // Insert discount
    const query = `
      INSERT INTO dim_discounts (
        code, name, description, discount_type_id, discount_value,
        max_discount_amount, min_order_amount, max_uses_total, max_uses_per_customer,
        applies_to, applicable_product_ids, applicable_category_ids, customer_group_ids,
        start_date, end_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const result = await db.query(query, [
      code.toUpperCase(),
      name,
      description || null,
      discountTypeId,
      discount_value,
      max_discount_amount || null,
      min_order_amount,
      max_uses_total || null,
      max_uses_per_customer,
      applies_to,
      applicable_product_ids || null,
      applicable_category_ids || null,
      customer_group_ids || null,
      start_date,
      end_date,
      req.user.id
    ]);

    // Get full discount info
    const discountQuery = `
      SELECT 
        d.*,
        dt.code as discount_type,
        dt.name as discount_type_name
      FROM dim_discounts d
      JOIN subdim_discount_types dt ON d.discount_type_id = dt.id
      WHERE d.id = $1
    `;
    const discountResult = await db.query(discountQuery, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      data: discountResult.rows[0],
      message: 'Tạo khuyến mại thành công'
    });

  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khuyến mại',
      error: error.message
    });
  }
};

/**
 * 4. Cập nhật khuyến mại - PUT /api/discounts/:id
 */
const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      max_uses_total,
      max_uses_per_customer,
      applies_to,
      applicable_product_ids,
      applicable_category_ids,
      customer_group_ids,
      start_date,
      end_date,
      is_active
    } = req.body;

    // Check discount exists
    const existingDiscount = await db.query(
      'SELECT id, code FROM dim_discounts WHERE id = $1',
      [id]
    );

    if (existingDiscount.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    }

    // Get discount type ID if provided
    let discountTypeId = null;
    if (discount_type) {
      const typeResult = await db.query(
        'SELECT id FROM subdim_discount_types WHERE code = $1',
        [discount_type]
      );
      if (typeResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Loại khuyến mại không hợp lệ'
        });
      }
      discountTypeId = typeResult.rows[0].id;
    }

    // Validate dates if both provided
    if (start_date && end_date && new Date(end_date) <= new Date(start_date)) {
      return res.status(400).json({
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }

    // Update discount
    const query = `
      UPDATE dim_discounts SET
        name = COALESCE($1, name),
        description = $2,
        discount_type_id = COALESCE($3, discount_type_id),
        discount_value = COALESCE($4, discount_value),
        max_discount_amount = $5,
        min_order_amount = COALESCE($6, min_order_amount),
        max_uses_total = $7,
        max_uses_per_customer = COALESCE($8, max_uses_per_customer),
        applies_to = COALESCE($9, applies_to),
        applicable_product_ids = $10,
        applicable_category_ids = $11,
        customer_group_ids = $12,
        start_date = COALESCE($13, start_date),
        end_date = COALESCE($14, end_date),
        is_active = COALESCE($15, is_active),
        updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `;

    await db.query(query, [
      name,
      description,
      discountTypeId,
      discount_value,
      max_discount_amount,
      min_order_amount,
      max_uses_total,
      max_uses_per_customer,
      applies_to,
      applicable_product_ids,
      applicable_category_ids,
      customer_group_ids,
      start_date,
      end_date,
      is_active,
      id
    ]);

    // Get updated discount with joins
    const discountQuery = `
      SELECT 
        d.*,
        dt.code as discount_type,
        dt.name as discount_type_name
      FROM dim_discounts d
      JOIN subdim_discount_types dt ON d.discount_type_id = dt.id
      WHERE d.id = $1
    `;
    const result = await db.query(discountQuery, [id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật khuyến mại thành công'
    });

  } catch (error) {
    console.error('Update discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khuyến mại',
      error: error.message
    });
  }
};

/**
 * 5. Xóa khuyến mại - DELETE /api/discounts/:id
 */
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check discount exists
    const existingDiscount = await db.query(
      'SELECT id, code, name FROM dim_discounts WHERE id = $1',
      [id]
    );

    if (existingDiscount.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    }

    // Check if discount has been used
    const usageCheck = await db.query(
      'SELECT COUNT(*) as count FROM fact_discount_usages WHERE discount_id = $1',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      // Soft delete - deactivate instead
      await db.query(
        'UPDATE dim_discounts SET is_active = false, updated_at = NOW() WHERE id = $1',
        [id]
      );

      return res.json({
        success: true,
        message: `Đã vô hiệu hóa khuyến mại "${existingDiscount.rows[0].code}" (đã có ${usageCheck.rows[0].count} lượt sử dụng)`
      });
    }

    // Hard delete
    await db.query('DELETE FROM dim_discounts WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Đã xóa khuyến mại "${existingDiscount.rows[0].code}"`
    });

  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khuyến mại',
      error: error.message
    });
  }
};

/**
 * 6. Kết thúc khuyến mại - PATCH /api/discounts/:id/deactivate
 */
const deactivateDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check discount exists
    const existingDiscount = await db.query(
      'SELECT id, code, name, is_active FROM dim_discounts WHERE id = $1',
      [id]
    );

    if (existingDiscount.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    }

    if (!existingDiscount.rows[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'Khuyến mại đã được vô hiệu hóa trước đó'
      });
    }

    // Deactivate
    await db.query(
      `UPDATE dim_discounts SET 
        is_active = false, 
        end_date = NOW(),
        updated_at = NOW() 
       WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: `Đã kết thúc khuyến mại "${existingDiscount.rows[0].code}"`
    });

  } catch (error) {
    console.error('Deactivate discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kết thúc khuyến mại',
      error: error.message
    });
  }
};

/**
 * 7. Validate mã khuyến mại - POST /api/discounts/validate
 * Body: { code, order_amount, customer_id, items }
 */
const validateDiscount = async (req, res) => {
  try {
    const { code, order_amount, customer_id, items } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã khuyến mại'
      });
    }

    // Find discount by code
    const discountQuery = `
      SELECT 
        d.*,
        dt.code as discount_type
      FROM dim_discounts d
      JOIN subdim_discount_types dt ON d.discount_type_id = dt.id
      WHERE d.code = $1
    `;
    const discountResult = await db.query(discountQuery, [code.toUpperCase()]);

    if (discountResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Mã khuyến mại không tồn tại'
      });
    }

    const discount = discountResult.rows[0];

    // Check if active
    if (!discount.is_active) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Mã khuyến mại đã hết hiệu lực'
      });
    }

    // Check dates
    const now = new Date();
    if (now < new Date(discount.start_date)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Mã khuyến mại chưa bắt đầu. Hiệu lực từ ${new Date(discount.start_date).toLocaleDateString('vi-VN')}`
      });
    }

    if (now > new Date(discount.end_date)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Mã khuyến mại đã hết hạn'
      });
    }

    // Check max uses total
    if (discount.max_uses_total && discount.current_uses >= discount.max_uses_total) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Mã khuyến mại đã hết lượt sử dụng'
      });
    }

    // Check customer usage limit
    if (customer_id && discount.max_uses_per_customer) {
      const customerUsageResult = await db.query(
        'SELECT COUNT(*) as count FROM fact_discount_usages WHERE discount_id = $1 AND customer_id = $2',
        [discount.id, customer_id]
      );
      
      if (parseInt(customerUsageResult.rows[0].count) >= discount.max_uses_per_customer) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: 'Bạn đã sử dụng hết lượt cho mã khuyến mại này'
        });
      }
    }

    // Check customer group restriction
    if (discount.customer_group_ids && discount.customer_group_ids.length > 0 && customer_id) {
      const customerGroup = await db.query(
        'SELECT customer_group_id FROM dim_customers WHERE id = $1',
        [customer_id]
      );
      
      if (customerGroup.rows.length > 0 && 
          customerGroup.rows[0].customer_group_id &&
          !discount.customer_group_ids.includes(customerGroup.rows[0].customer_group_id)) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: 'Mã khuyến mại không áp dụng cho nhóm khách hàng của bạn'
        });
      }
    }

    // Check minimum order amount
    if (order_amount && discount.min_order_amount > 0 && order_amount < discount.min_order_amount) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Đơn hàng tối thiểu ${discount.min_order_amount.toLocaleString('vi-VN')}đ để sử dụng mã này`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discount_type === 'PERCENTAGE') {
      discountAmount = (order_amount || 0) * discount.discount_value / 100;
      if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
        discountAmount = discount.max_discount_amount;
      }
    } else if (discount.discount_type === 'FIXED_AMOUNT') {
      discountAmount = discount.discount_value;
    } else if (discount.discount_type === 'FREE_SHIPPING') {
      discountAmount = discount.discount_value; // Giá trị ship được miễn
    }

    res.json({
      success: true,
      valid: true,
      data: {
        discount_id: discount.id,
        code: discount.code,
        name: discount.name,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        discount_amount: discountAmount,
        min_order_amount: discount.min_order_amount,
        max_discount_amount: discount.max_discount_amount
      },
      message: `Mã "${discount.code}" hợp lệ - Giảm ${discountAmount.toLocaleString('vi-VN')}đ`
    });

  } catch (error) {
    console.error('Validate discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra mã khuyến mại',
      error: error.message
    });
  }
};

/**
 * 8. Lấy danh sách loại khuyến mại - GET /api/discount-types
 */
const getDiscountTypes = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM subdim_discount_types ORDER BY id'
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách loại khuyến mại thành công'
    });

  } catch (error) {
    console.error('Get discount types error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách loại khuyến mại',
      error: error.message
    });
  }
};

module.exports = {
  getDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  deactivateDiscount,
  validateDiscount,
  getDiscountTypes
};
