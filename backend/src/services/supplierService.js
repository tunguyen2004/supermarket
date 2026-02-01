/**
 * ============================================================================
 *                    MODULE 12: SUPPLIER SERVICE
 * ============================================================================
 * Quản lý nhà cung cấp (Supplier Management)
 * Sử dụng bảng: dim_suppliers, subdim_cities
 * 
 * Chức năng:
 * - Danh sách nhà cung cấp (có phân trang, lọc, tìm kiếm)
 * - CRUD nhà cung cấp
 * ============================================================================
 */

const db = require('../config/database');

/**
 * 1. Danh sách nhà cung cấp - GET /api/suppliers
 * Query: search, city_id, is_active, page, limit, sortBy, order
 */
const getSuppliers = async (req, res) => {
  try {
    const {
      search,
      city_id,
      is_active,
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
        s.name ILIKE $${paramIndex} OR 
        s.code ILIKE $${paramIndex} OR 
        s.phone ILIKE $${paramIndex} OR
        s.email ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (city_id) {
      whereClause += ` AND s.city_id = $${paramIndex}`;
      params.push(city_id);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereClause += ` AND s.is_active = $${paramIndex}`;
      params.push(is_active === 'true' || is_active === true);
      paramIndex++;
    }

    // Validate sortBy
    const allowedSortFields = ['created_at', 'name', 'code'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM dim_suppliers s
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get suppliers
    const query = `
      SELECT 
        s.id,
        s.code,
        s.name,
        s.phone,
        s.email,
        s.address,
        s.tax_code,
        s.payment_terms,
        s.is_active,
        s.created_at,
        ct.name as city_name,
        r.name as region_name
      FROM dim_suppliers s
      LEFT JOIN subdim_cities ct ON s.city_id = ct.id
      LEFT JOIN subdim_regions r ON ct.region_id = r.id
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
      message: 'Lấy danh sách nhà cung cấp thành công'
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhà cung cấp',
      error: error.message
    });
  }
};

/**
 * 2. Chi tiết nhà cung cấp - GET /api/suppliers/:id
 */
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        s.*,
        ct.name as city_name,
        r.name as region_name
      FROM dim_suppliers s
      LEFT JOIN subdim_cities ct ON s.city_id = ct.id
      LEFT JOIN subdim_regions r ON ct.region_id = r.id
      WHERE s.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    // Get inventory transactions for this supplier (returns)
    const transactionsQuery = `
      SELECT 
        fit.transaction_code,
        fit.date_key,
        fit.quantity_change,
        fit.notes,
        fit.created_at,
        dpv.sku,
        dp.name as product_name
      FROM fact_inventory_transactions fit
      JOIN dim_product_variants dpv ON fit.variant_id = dpv.id
      JOIN dim_products dp ON dpv.product_id = dp.id
      WHERE fit.reference_type = 'SUPPLIER_RETURN'
      ORDER BY fit.created_at DESC
      LIMIT 10
    `;
    const transactionsResult = await db.query(transactionsQuery);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        recent_transactions: transactionsResult.rows
      },
      message: 'Lấy thông tin nhà cung cấp thành công'
    });

  } catch (error) {
    console.error('Get supplier by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin nhà cung cấp',
      error: error.message
    });
  }
};

/**
 * 3. Thêm nhà cung cấp - POST /api/suppliers
 */
const createSupplier = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      city_id,
      address,
      tax_code,
      payment_terms,
      is_active = true
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên nhà cung cấp là bắt buộc'
      });
    }

    // Generate supplier code: NCC-YYYYMM-XXXXX
    const now = new Date();
    const prefix = `NCC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const seqResult = await db.query(
      `SELECT COALESCE(MAX(CAST(RIGHT(code, 5) AS INTEGER)), 0) as max_seq
       FROM dim_suppliers 
       WHERE code LIKE $1`,
      [`${prefix}-%`]
    );
    
    const nextSeq = String((seqResult.rows[0].max_seq || 0) + 1).padStart(5, '0');
    const code = `${prefix}-${nextSeq}`;

    // Check duplicate email
    if (email) {
      const existingEmail = await db.query(
        'SELECT id FROM dim_suppliers WHERE email = $1',
        [email]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại'
        });
      }
    }

    // Insert supplier
    const query = `
      INSERT INTO dim_suppliers (
        code, name, phone, email, city_id, address, 
        tax_code, payment_terms, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const result = await db.query(query, [
      code, name, phone || null, email || null, city_id || null, 
      address || null, tax_code || null, payment_terms || null, is_active
    ]);

    // Get full supplier info with joins
    const supplierQuery = `
      SELECT 
        s.*,
        ct.name as city_name
      FROM dim_suppliers s
      LEFT JOIN subdim_cities ct ON s.city_id = ct.id
      WHERE s.id = $1
    `;
    const supplierResult = await db.query(supplierQuery, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      data: supplierResult.rows[0],
      message: 'Thêm nhà cung cấp thành công'
    });

  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm nhà cung cấp',
      error: error.message
    });
  }
};

/**
 * 4. Cập nhật nhà cung cấp - PUT /api/suppliers/:id
 */
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      city_id,
      address,
      tax_code,
      payment_terms,
      is_active
    } = req.body;

    // Check supplier exists
    const existingSupplier = await db.query(
      'SELECT id FROM dim_suppliers WHERE id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    // Check duplicate email
    if (email) {
      const duplicateEmail = await db.query(
        'SELECT id FROM dim_suppliers WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (duplicateEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng bởi nhà cung cấp khác'
        });
      }
    }

    // Update supplier
    const query = `
      UPDATE dim_suppliers SET
        name = COALESCE($1, name),
        phone = $2,
        email = $3,
        city_id = $4,
        address = $5,
        tax_code = $6,
        payment_terms = $7,
        is_active = COALESCE($8, is_active)
      WHERE id = $9
      RETURNING *
    `;

    await db.query(query, [
      name, phone || null, email || null, city_id || null, 
      address || null, tax_code || null, payment_terms || null, is_active, id
    ]);

    // Get updated supplier with joins
    const supplierQuery = `
      SELECT 
        s.*,
        ct.name as city_name
      FROM dim_suppliers s
      LEFT JOIN subdim_cities ct ON s.city_id = ct.id
      WHERE s.id = $1
    `;
    const result = await db.query(supplierQuery, [id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật nhà cung cấp thành công'
    });

  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật nhà cung cấp',
      error: error.message
    });
  }
};

/**
 * 5. Xóa/Vô hiệu hóa nhà cung cấp - DELETE /api/suppliers/:id
 */
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check supplier exists
    const existingSupplier = await db.query(
      'SELECT id, name FROM dim_suppliers WHERE id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    // Check if supplier has inventory transactions
    const transactionsCheck = await db.query(
      `SELECT COUNT(*) as count FROM fact_inventory_transactions 
       WHERE reference_type IN ('SUPPLIER_RETURN', 'PURCHASE_ORDER') 
       AND notes LIKE $1`,
      [`%${existingSupplier.rows[0].name}%`]
    );

    if (parseInt(transactionsCheck.rows[0].count) > 0) {
      // Soft delete - just deactivate
      await db.query(
        'UPDATE dim_suppliers SET is_active = false WHERE id = $1',
        [id]
      );

      return res.json({
        success: true,
        message: `Đã vô hiệu hóa nhà cung cấp "${existingSupplier.rows[0].name}" (có lịch sử giao dịch)`
      });
    }

    // Hard delete
    await db.query('DELETE FROM dim_suppliers WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Đã xóa nhà cung cấp "${existingSupplier.rows[0].name}"`
    });

  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa nhà cung cấp',
      error: error.message
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
