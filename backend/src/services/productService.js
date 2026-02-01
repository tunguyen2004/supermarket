const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// ============ MODULE 4: PRODUCTS ============

/**
 * 1. Danh sách sản phẩm - GET /api/products
 * Hỗ trợ: search, filter by category/brand, pagination, sort
 */
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category_id,
      brand_id,
      is_active,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category_id) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (brand_id) {
      whereClause += ` AND p.brand_id = $${paramIndex}`;
      params.push(brand_id);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereClause += ` AND p.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['id', 'code', 'name', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM dim_products p
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get products with relations
    const query = `
      SELECT 
        p.id,
        p.code,
        p.name,
        p.category_id,
        c.name as category_name,
        p.brand_id,
        b.name as brand_name,
        p.unit_id,
        u.name as unit_name,
        p.description,
        p.image_url,
        p.is_active,
        p.has_variants,
        p.created_at,
        p.updated_at,
        COALESCE(
          (SELECT selling_price FROM dim_product_variants WHERE product_id = p.id LIMIT 1),
          0
        ) as price
      FROM dim_products p
      LEFT JOIN subdim_categories c ON p.category_id = c.id
      LEFT JOIN subdim_brands b ON p.brand_id = b.id
      LEFT JOIN subdim_units u ON p.unit_id = u.id
      ${whereClause}
      ORDER BY p.${sortField} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        products: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Lấy danh sách sản phẩm thành công'
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy danh sách sản phẩm'
    });
  }
};

/**
 * 2. Thêm sản phẩm - POST /api/products
 * Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
 */
const createProduct = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const {
      code,
      name,
      category_id,
      brand_id,
      unit_id,
      description,
      image_url,
      is_active = true,
      has_variants = false,
      // Variant info (for simple product)
      sku,
      barcode,
      cost_price,
      selling_price
    } = req.body;

    // Validate required fields
    if (!code || !name || !category_id || !unit_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (code, name, category_id, unit_id)'
      });
    }

    // Check if code already exists
    const existingProduct = await client.query(
      'SELECT id FROM dim_products WHERE code = $1',
      [code]
    );

    if (existingProduct.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã sản phẩm đã tồn tại'
      });
    }

    // ========== BẮT ĐẦU TRANSACTION ==========
    await client.query('BEGIN');

    // Insert product
    const productQuery = `
      INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, image_url, is_active, has_variants)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const productResult = await client.query(productQuery, [
      code, name, category_id, brand_id || null, unit_id, description || null, image_url || null, is_active, has_variants
    ]);

    const product = productResult.rows[0];

    // If not has_variants, create default variant
    if (!has_variants && selling_price) {
      const variantQuery = `
        INSERT INTO dim_product_variants (product_id, sku, barcode, cost_price, selling_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      await client.query(variantQuery, [
        product.id,
        sku || `${code}-SKU`,
        barcode || null,
        cost_price || null,
        selling_price
      ]);
    }

    // ========== COMMIT TRANSACTION ==========
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Thêm sản phẩm thành công'
    });
  } catch (error) {
    // ========== ROLLBACK NẾU CÓ LỖI ==========
    await client.query('ROLLBACK');
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi thêm sản phẩm'
    });
  } finally {
    // ========== LUÔN RELEASE CLIENT ==========
    client.release();
  }
};

/**
 * 3. Chi tiết sản phẩm - GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.code as category_code,
        b.name as brand_name,
        b.code as brand_code,
        u.name as unit_name,
        u.code as unit_code
      FROM dim_products p
      LEFT JOIN subdim_categories c ON p.category_id = c.id
      LEFT JOIN subdim_brands b ON p.brand_id = b.id
      LEFT JOIN subdim_units u ON p.unit_id = u.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Get variants
    const variantsQuery = `
      SELECT * FROM dim_product_variants WHERE product_id = $1 ORDER BY id
    `;
    const variantsResult = await db.query(variantsQuery, [id]);

    // Get gallery images
    const imagesQuery = `
      SELECT * FROM dim_product_images WHERE product_id = $1 ORDER BY sort_order, id
    `;
    const imagesResult = await db.query(imagesQuery, [id]);

    const product = {
      ...result.rows[0],
      variants: variantsResult.rows,
      images: imagesResult.rows
    };

    res.json({
      success: true,
      data: product,
      message: 'Lấy thông tin sản phẩm thành công'
    });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy thông tin sản phẩm'
    });
  }
};

/**
 * 4. Sửa sản phẩm - PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      category_id,
      brand_id,
      unit_id,
      description,
      image_url,
      is_active,
      has_variants
    } = req.body;

    // Check if product exists
    const existingProduct = await db.query(
      'SELECT * FROM dim_products WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Check if new code already exists (if changing code)
    if (code && code !== existingProduct.rows[0].code) {
      const codeExists = await db.query(
        'SELECT id FROM dim_products WHERE code = $1 AND id != $2',
        [code, id]
      );
      if (codeExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Mã sản phẩm đã tồn tại'
        });
      }
    }

    const query = `
      UPDATE dim_products
      SET 
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        category_id = COALESCE($3, category_id),
        brand_id = $4,
        unit_id = COALESCE($5, unit_id),
        description = $6,
        image_url = COALESCE($7, image_url),
        is_active = COALESCE($8, is_active),
        has_variants = COALESCE($9, has_variants),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const result = await db.query(query, [
      code,
      name,
      category_id,
      brand_id || null,
      unit_id,
      description,
      image_url,
      is_active,
      has_variants,
      id
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi cập nhật sản phẩm'
    });
  }
};

/**
 * 5. Xóa sản phẩm - DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await db.query(
      'SELECT * FROM dim_products WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Delete product (variants will be deleted by CASCADE)
    await db.query('DELETE FROM dim_products WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi xóa sản phẩm'
    });
  }
};

/**
 * 9. Bật/tắt trạng thái hàng loạt - PATCH /api/products/bulk-status
 */
const bulkUpdateStatus = async (req, res) => {
  try {
    const { product_ids, is_active } = req.body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 sản phẩm'
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const query = `
      UPDATE dim_products
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($2)
      RETURNING id
    `;

    const result = await db.query(query, [is_active, product_ids]);

    res.json({
      success: true,
      data: {
        updated_count: result.rows.length
      },
      message: `Đã cập nhật trạng thái ${result.rows.length} sản phẩm`
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi cập nhật trạng thái hàng loạt'
    });
  }
};

/**
 * 10. Export sản phẩm ra CSV - GET /api/products/export
 */
const exportProducts = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.code,
        p.name,
        c.name as category,
        b.name as brand,
        u.name as unit,
        p.description,
        p.is_active,
        COALESCE(v.sku, '') as sku,
        COALESCE(v.barcode, '') as barcode,
        COALESCE(v.cost_price, 0) as cost_price,
        COALESCE(v.selling_price, 0) as selling_price
      FROM dim_products p
      LEFT JOIN subdim_categories c ON p.category_id = c.id
      LEFT JOIN subdim_brands b ON p.brand_id = b.id
      LEFT JOIN subdim_units u ON p.unit_id = u.id
      LEFT JOIN dim_product_variants v ON p.id = v.product_id
      ORDER BY p.id
    `;

    const result = await db.query(query);

    // Create CSV content
    const headers = ['code', 'name', 'category', 'brand', 'unit', 'description', 'is_active', 'sku', 'barcode', 'cost_price', 'selling_price'];
    let csv = headers.join(',') + '\n';

    result.rows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send('\uFEFF' + csv); // Add BOM for Excel UTF-8 support
  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi export sản phẩm'
    });
  }
};

/**
 * 11. Import sản phẩm từ CSV - POST /api/products/import
 * File CSV cần có các cột: code, name, category_code, brand_code, unit_code, description, sku, barcode, cost_price, selling_price
 */
const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file CSV'
      });
    }

    const results = [];
    const errors = [];
    let successCount = 0;
    let errorCount = 0;

    // Load lookup tables
    const categoriesResult = await db.query('SELECT id, code FROM subdim_categories');
    const brandsResult = await db.query('SELECT id, code FROM subdim_brands');
    const unitsResult = await db.query('SELECT id, code FROM subdim_units');

    const categoriesMap = new Map(categoriesResult.rows.map(r => [r.code, r.id]));
    const brandsMap = new Map(brandsResult.rows.map(r => [r.code, r.id]));
    const unitsMap = new Map(unitsResult.rows.map(r => [r.code, r.id]));

    // Parse CSV
    const parseCSV = () => {
      return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve(rows))
          .on('error', (err) => reject(err));
      });
    };

    const rows = await parseCSV();

    // Process each row với transaction cho từng row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because row 1 is header
      const client = await db.pool.connect();

      try {
        // Validate required fields
        if (!row.code || !row.name) {
          errors.push({ row: rowNum, error: 'Thiếu code hoặc name' });
          errorCount++;
          continue;
        }

        // Get foreign key IDs
        const category_id = categoriesMap.get(row.category_code);
        const brand_id = brandsMap.get(row.brand_code) || null;
        const unit_id = unitsMap.get(row.unit_code);

        if (!category_id) {
          errors.push({ row: rowNum, code: row.code, error: `Category không tồn tại: ${row.category_code}` });
          errorCount++;
          continue;
        }

        if (!unit_id) {
          errors.push({ row: rowNum, code: row.code, error: `Unit không tồn tại: ${row.unit_code}` });
          errorCount++;
          continue;
        }

        // ========== BẮT ĐẦU TRANSACTION CHO MỖI ROW ==========
        await client.query('BEGIN');

        // Check if product already exists
        const existingProduct = await client.query(
          'SELECT id FROM dim_products WHERE code = $1',
          [row.code]
        );

        let productId;

        if (existingProduct.rows.length > 0) {
          // Update existing product
          productId = existingProduct.rows[0].id;
          await client.query(
            `UPDATE dim_products 
             SET name = $1, category_id = $2, brand_id = $3, unit_id = $4, description = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6`,
            [row.name, category_id, brand_id, unit_id, row.description || null, productId]
          );
        } else {
          // Insert new product
          const insertResult = await client.query(
            `INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [row.code, row.name, category_id, brand_id, unit_id, row.description || null]
          );
          productId = insertResult.rows[0].id;
        }

        // Handle variant/SKU
        if (row.sku && row.selling_price) {
          const existingVariant = await client.query(
            'SELECT id FROM dim_product_variants WHERE product_id = $1',
            [productId]
          );

          if (existingVariant.rows.length > 0) {
            await client.query(
              `UPDATE dim_product_variants 
               SET sku = $1, barcode = $2, cost_price = $3, selling_price = $4
               WHERE product_id = $5`,
              [row.sku, row.barcode || null, parseFloat(row.cost_price) || null, parseFloat(row.selling_price), productId]
            );
          } else {
            await client.query(
              `INSERT INTO dim_product_variants (product_id, sku, barcode, cost_price, selling_price)
               VALUES ($1, $2, $3, $4, $5)`,
              [productId, row.sku, row.barcode || null, parseFloat(row.cost_price) || null, parseFloat(row.selling_price)]
            );
          }
        }

        // ========== COMMIT TRANSACTION ==========
        await client.query('COMMIT');

        successCount++;
        results.push({ row: rowNum, code: row.code, status: 'success' });

      } catch (err) {
        // ========== ROLLBACK NẾU CÓ LỖI ==========
        await client.query('ROLLBACK');
        errors.push({ row: rowNum, code: row.code, error: err.message });
        errorCount++;
      } finally {
        // ========== LUÔN RELEASE CLIENT ==========
        client.release();
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        total: rows.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors
      },
      message: `Import hoàn tất: ${successCount} thành công, ${errorCount} lỗi`
    });

  } catch (error) {
    console.error('Import products error:', error);
    // Clean up uploaded file if exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi import sản phẩm'
    });
  }
};

/**
 * Lấy danh sách brands - GET /api/brands
 */
const getBrands = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subdim_brands ORDER BY name');
    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách thương hiệu thành công'
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy danh sách thương hiệu'
    });
  }
};

/**
 * Lấy danh sách units - GET /api/units
 */
const getUnits = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subdim_units ORDER BY name');
    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách đơn vị tính thành công'
    });
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy danh sách đơn vị tính'
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkUpdateStatus,
  exportProducts,
  importProducts,
  getBrands,
  getUnits
};
