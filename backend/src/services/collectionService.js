const db = require('../config/database');

// ============ MODULE 5: COLLECTIONS (Danh mục sản phẩm) ============

/**
 * 1. Danh sách danh mục - GET /api/collections
 */
const getCollections = async (req, res) => {
  try {
    const { search, parent_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;

    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ` AND (c.name ILIKE $${paramIndex} OR c.code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === '') {
        whereClause += ' AND c.parent_id IS NULL';
      } else {
        whereClause += ` AND c.parent_id = $${paramIndex}`;
        params.push(parent_id);
        paramIndex++;
      }
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM subdim_categories c ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get collections with product count
    const query = `
      SELECT 
        c.*,
        pc.name as parent_name,
        (SELECT COUNT(*) FROM dim_products WHERE category_id = c.id) as product_count
      FROM subdim_categories c
      LEFT JOIN subdim_categories pc ON c.parent_id = pc.id
      ${whereClause}
      ORDER BY c.level, c.name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        collections: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Lấy danh sách danh mục thành công'
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy danh sách danh mục'
    });
  }
};

/**
 * Lấy danh mục dạng tree - GET /api/collections/tree
 */
const getCollectionTree = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM dim_products WHERE category_id = c.id) as product_count
      FROM subdim_categories c
      ORDER BY c.level, c.name
    `;
    const result = await db.query(query);

    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    const tree = buildTree(result.rows);

    res.json({
      success: true,
      data: tree,
      message: 'Lấy cây danh mục thành công'
    });
  } catch (error) {
    console.error('Get collection tree error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy cây danh mục'
    });
  }
};

/**
 * 2. Thêm danh mục - POST /api/collections
 */
const createCollection = async (req, res) => {
  try {
    const { code, name, parent_id, level = 0 } = req.body;

    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ mã và tên danh mục'
      });
    }

    // Check if code already exists
    const existingCollection = await db.query(
      'SELECT id FROM subdim_categories WHERE code = $1',
      [code]
    );

    if (existingCollection.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã danh mục đã tồn tại'
      });
    }

    // Calculate path
    let path = '';
    let calculatedLevel = 0;

    if (parent_id) {
      const parentResult = await db.query(
        'SELECT id, path, level FROM subdim_categories WHERE id = $1',
        [parent_id]
      );

      if (parentResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục cha không tồn tại'
        });
      }

      const parent = parentResult.rows[0];
      calculatedLevel = parent.level + 1;
      // Path will be updated after insert
    }

    // Insert collection
    const query = `
      INSERT INTO subdim_categories (code, name, parent_id, level, path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [
      code,
      name,
      parent_id || null,
      level || calculatedLevel,
      path
    ]);

    const newCollection = result.rows[0];

    // Update path with the new id
    const newPath = parent_id 
      ? `${(await db.query('SELECT path FROM subdim_categories WHERE id = $1', [parent_id])).rows[0]?.path || ''}/${newCollection.id}`
      : `/${newCollection.id}`;

    await db.query(
      'UPDATE subdim_categories SET path = $1 WHERE id = $2',
      [newPath, newCollection.id]
    );

    newCollection.path = newPath;

    res.status(201).json({
      success: true,
      data: newCollection,
      message: 'Thêm danh mục thành công'
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi thêm danh mục'
    });
  }
};

/**
 * 3. Chi tiết danh mục - GET /api/collections/:id
 */
const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.*,
        pc.name as parent_name,
        pc.code as parent_code,
        (SELECT COUNT(*) FROM dim_products WHERE category_id = c.id) as product_count
      FROM subdim_categories c
      LEFT JOIN subdim_categories pc ON c.parent_id = pc.id
      WHERE c.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    // Get child categories
    const childrenQuery = `
      SELECT * FROM subdim_categories WHERE parent_id = $1 ORDER BY name
    `;
    const childrenResult = await db.query(childrenQuery, [id]);

    // Get products in this category
    const productsQuery = `
      SELECT id, code, name, is_active
      FROM dim_products
      WHERE category_id = $1
      ORDER BY name
      LIMIT 20
    `;
    const productsResult = await db.query(productsQuery, [id]);

    const collection = {
      ...result.rows[0],
      children: childrenResult.rows,
      products: productsResult.rows
    };

    res.json({
      success: true,
      data: collection,
      message: 'Lấy thông tin danh mục thành công'
    });
  } catch (error) {
    console.error('Get collection by id error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy thông tin danh mục'
    });
  }
};

/**
 * 4. Sửa danh mục - PUT /api/collections/:id
 */
const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, parent_id, level } = req.body;

    // Check if collection exists
    const existingCollection = await db.query(
      'SELECT * FROM subdim_categories WHERE id = $1',
      [id]
    );

    if (existingCollection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    // Check if new code already exists
    if (code && code !== existingCollection.rows[0].code) {
      const codeExists = await db.query(
        'SELECT id FROM subdim_categories WHERE code = $1 AND id != $2',
        [code, id]
      );
      if (codeExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Mã danh mục đã tồn tại'
        });
      }
    }

    // Prevent setting parent to itself or its children
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể chọn chính danh mục này làm danh mục cha'
      });
    }

    // Check for circular reference - prevent setting parent to any descendant
    if (parent_id) {
      const descendantsQuery = `
        WITH RECURSIVE descendants AS (
          SELECT id FROM subdim_categories WHERE parent_id = $1
          UNION ALL
          SELECT c.id FROM subdim_categories c
          INNER JOIN descendants d ON c.parent_id = d.id
        )
        SELECT id FROM descendants WHERE id = $2
      `;
      const descendantsResult = await db.query(descendantsQuery, [id, parent_id]);
      if (descendantsResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể chọn danh mục con làm danh mục cha (circular reference)'
        });
      }
    }

    const query = `
      UPDATE subdim_categories
      SET 
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        parent_id = $3,
        level = COALESCE($4, level)
      WHERE id = $5
      RETURNING *
    `;

    const result = await db.query(query, [
      code,
      name,
      parent_id || null,
      level,
      id
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật danh mục thành công'
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi cập nhật danh mục'
    });
  }
};

/**
 * 5. Xóa danh mục - DELETE /api/collections/:id
 */
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if collection exists
    const existingCollection = await db.query(
      'SELECT * FROM subdim_categories WHERE id = $1',
      [id]
    );

    if (existingCollection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    // Check if has products
    const productsCount = await db.query(
      'SELECT COUNT(*) as count FROM dim_products WHERE category_id = $1',
      [id]
    );

    if (parseInt(productsCount.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì có ${productsCount.rows[0].count} sản phẩm đang sử dụng`
      });
    }

    // Check if has children (will be deleted by CASCADE, but warn user)
    const childrenCount = await db.query(
      'SELECT COUNT(*) as count FROM subdim_categories WHERE parent_id = $1',
      [id]
    );

    if (parseInt(childrenCount.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì có ${childrenCount.rows[0].count} danh mục con`
      });
    }

    // Delete collection
    await db.query('DELETE FROM subdim_categories WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi xóa danh mục'
    });
  }
};

module.exports = {
  getCollections,
  getCollectionTree,
  createCollection,
  getCollectionById,
  updateCollection,
  deleteCollection
};
