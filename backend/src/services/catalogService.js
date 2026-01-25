/**
 * ============================================================================
 *                    MODULE 6: CATALOG SERVICE
 * ============================================================================
 * Quản lý bảng giá sản phẩm (Price List)
 * Sử dụng bảng: dim_product_variants, dim_products
 * 
 * Chức năng:
 * - Xem danh sách giá sản phẩm (có phân trang, tìm kiếm)
 * - Xem chi tiết giá sản phẩm
 * - Cập nhật giá sản phẩm
 * ============================================================================
 */

const { pool, query } = require('../config/database');

/**
 * @GET /api/catalogs
 * @description Lấy danh sách bảng giá sản phẩm
 * @query { search, page, limit }
 * @returns { catalogs: [...], pagination: {...} }
 */
const getCatalogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Build search condition
        let searchCondition = '';
        let searchParams = [];
        let paramIndex = 1;

        if (search) {
            searchCondition = `
                WHERE (p.code ILIKE $${paramIndex} 
                    OR p.name ILIKE $${paramIndex}
                    OR pv.sku ILIKE $${paramIndex}
                    OR pv.barcode ILIKE $${paramIndex})
            `;
            searchParams.push(`%${search}%`);
            paramIndex++;
        }

        // Count total records
        const countQuery = `
            SELECT COUNT(DISTINCT pv.id) as total
            FROM dim_product_variants pv
            JOIN dim_products p ON pv.product_id = p.id
            ${searchCondition}
        `;
        const countResult = await pool.query(countQuery, searchParams);
        const total = parseInt(countResult.rows[0].total);

        // Get catalogs with pagination
        const query = `
            SELECT 
                pv.id,
                p.code,
                p.name,
                pv.sku,
                pv.barcode,
                pv.cost_price,
                pv.selling_price as price,
                u.name as unit,
                pv.is_active,
                pv.created_at,
                p.id as product_id
            FROM dim_product_variants pv
            JOIN dim_products p ON pv.product_id = p.id
            JOIN subdim_units u ON p.unit_id = u.id
            ${searchCondition}
            ORDER BY p.name ASC, pv.sku ASC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const result = await pool.query(query, [...searchParams, limit, offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching catalogs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách bảng giá',
            error: error.message
        });
    }
};

/**
 * @GET /api/catalogs/:id
 * @description Lấy chi tiết bảng giá sản phẩm
 * @param id - ID của product variant
 * @returns { id, code, name, sku, barcode, cost_price, price, unit, is_active }
 */
const getCatalogById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                pv.id,
                p.code,
                p.name,
                pv.sku,
                pv.barcode,
                pv.cost_price,
                pv.selling_price as price,
                u.name as unit,
                u.id as unit_id,
                pv.is_active,
                pv.created_at,
                p.id as product_id,
                p.description
            FROM dim_product_variants pv
            JOIN dim_products p ON pv.product_id = p.id
            JOIN subdim_units u ON p.unit_id = u.id
            WHERE pv.id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching catalog by id:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết bảng giá',
            error: error.message
        });
    }
};

/**
 * @PUT /api/catalogs/:id
 * @description Cập nhật giá sản phẩm
 * @param id - ID của product variant
 * @body { cost_price, selling_price, is_active }
 * @returns { message, data }
 */
const updateCatalog = async (req, res) => {
    try {
        const { id } = req.params;
        const { cost_price, selling_price, is_active } = req.body;

        // Validate required fields
        if (selling_price === undefined || selling_price === null) {
            return res.status(400).json({
                success: false,
                message: 'Giá bán là bắt buộc'
            });
        }

        if (selling_price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá bán không được âm'
            });
        }

        if (cost_price !== undefined && cost_price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá vốn không được âm'
            });
        }

        // Check if variant exists
        const checkQuery = 'SELECT id FROM dim_product_variants WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Update variant price
        const updateQuery = `
            UPDATE dim_product_variants
            SET 
                cost_price = COALESCE($1, cost_price),
                selling_price = $2,
                is_active = COALESCE($3, is_active)
            WHERE id = $4
            RETURNING id, sku, cost_price, selling_price as price, is_active
        `;

        const result = await pool.query(updateQuery, [
            cost_price,
            selling_price,
            is_active,
            id
        ]);

        res.json({
            success: true,
            message: 'Cập nhật giá thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating catalog:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật giá',
            error: error.message
        });
    }
};

/**
 * @PATCH /api/catalogs/bulk-update
 * @description Cập nhật giá hàng loạt
 * @body { variant_ids: [number], price_change_type: 'fixed' | 'percent', price_change_value: number }
 * @returns { updated_count, message }
 */
const bulkUpdateCatalogs = async (req, res) => {
    const client = await pool.connect();
    try {
        const { variant_ids, price_change_type, price_change_value } = req.body;

        // Validate input
        if (!variant_ids || !Array.isArray(variant_ids) || variant_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách sản phẩm không hợp lệ'
            });
        }

        if (!price_change_type || !['fixed', 'percent'].includes(price_change_type)) {
            return res.status(400).json({
                success: false,
                message: 'Loại thay đổi giá không hợp lệ (fixed hoặc percent)'
            });
        }

        if (price_change_value === undefined || price_change_value === null) {
            return res.status(400).json({
                success: false,
                message: 'Giá trị thay đổi là bắt buộc'
            });
        }

        await client.query('BEGIN');

        let updateQuery;
        if (price_change_type === 'fixed') {
            // Set fixed price for all variants
            updateQuery = `
                UPDATE dim_product_variants
                SET selling_price = $1
                WHERE id = ANY($2) AND selling_price IS NOT NULL
            `;
            await client.query(updateQuery, [price_change_value, variant_ids]);
        } else {
            // Increase/decrease by percentage
            updateQuery = `
                UPDATE dim_product_variants
                SET selling_price = selling_price * (1 + $1 / 100.0)
                WHERE id = ANY($2) AND selling_price IS NOT NULL
            `;
            await client.query(updateQuery, [price_change_value, variant_ids]);
        }

        // Count updated records
        const countQuery = `
            SELECT COUNT(*) as count 
            FROM dim_product_variants 
            WHERE id = ANY($1)
        `;
        const countResult = await client.query(countQuery, [variant_ids]);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Cập nhật giá hàng loạt thành công',
            updated_count: parseInt(countResult.rows[0].count)
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk updating catalogs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật giá hàng loạt',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * @GET /api/catalogs/export
 * @description Xuất bảng giá ra file CSV
 * @returns File CSV
 */
const exportCatalogs = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.code as "Mã SP",
                p.name as "Tên sản phẩm",
                pv.sku as "SKU",
                pv.barcode as "Barcode",
                pv.cost_price as "Giá vốn",
                pv.selling_price as "Giá bán",
                u.name as "Đơn vị",
                CASE WHEN pv.is_active THEN 'Đang bán' ELSE 'Ngừng bán' END as "Trạng thái"
            FROM dim_product_variants pv
            JOIN dim_products p ON pv.product_id = p.id
            JOIN subdim_units u ON p.unit_id = u.id
            ORDER BY p.name ASC
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không có dữ liệu để xuất'
            });
        }

        // Generate CSV content
        const headers = Object.keys(result.rows[0]).join(',');
        const rows = result.rows.map(row => {
            return Object.values(row).map(value => {
                if (value === null || value === undefined) return '';
                // Escape quotes and wrap in quotes if contains comma
                const strValue = String(value);
                if (strValue.includes(',') || strValue.includes('"')) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            }).join(',');
        });

        const csvContent = [headers, ...rows].join('\n');

        // Add BOM for UTF-8 encoding
        const bom = '\uFEFF';
        const csvWithBom = bom + csvContent;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=bang_gia_san_pham.csv');
        res.send(csvWithBom);
    } catch (error) {
        console.error('Error exporting catalogs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xuất bảng giá',
            error: error.message
        });
    }
};

module.exports = {
    getCatalogs,
    getCatalogById,
    updateCatalog,
    bulkUpdateCatalogs,
    exportCatalogs
};
