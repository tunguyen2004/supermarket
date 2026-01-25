/**
 * ============================================================================
 *                    PRODUCT IMAGE SERVICE
 * ============================================================================
 * Quản lý ảnh sản phẩm (Product Images)
 * Sử dụng bảng: dim_products (image_url), product_images
 * 
 * Chức năng:
 * - Upload ảnh chính cho sản phẩm
 * - Upload nhiều ảnh cho sản phẩm
 * - Xóa ảnh sản phẩm
 * - Lấy danh sách ảnh của sản phẩm
 * - Đặt ảnh chính
 * ============================================================================
 */

const { pool, query } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { productDir } = require('../middleware/upload');

/**
 * @POST /api/products/:id/image
 * @description Upload ảnh chính cho sản phẩm
 * @param id - ID sản phẩm
 * @file image - File ảnh
 * @returns { message, image_url }
 */
const uploadMainImage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file ảnh'
            });
        }

        // Check product exists
        const checkResult = await query('SELECT id, image_url FROM dim_products WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Delete old image if exists
        const oldImageUrl = checkResult.rows[0].image_url;
        if (oldImageUrl) {
            const oldImagePath = path.join(productDir, path.basename(oldImageUrl));
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Generate image URL
        const imageUrl = `/uploads/products/${req.file.filename}`;

        // Update product
        await query('UPDATE dim_products SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [imageUrl, id]);

        res.json({
            success: true,
            message: 'Upload ảnh thành công',
            data: {
                image_url: imageUrl
            }
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Error uploading main image:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload ảnh',
            error: error.message
        });
    }
};

/**
 * @DELETE /api/products/:id/image
 * @description Xóa ảnh chính của sản phẩm
 * @param id - ID sản phẩm
 * @returns { message }
 */
const deleteMainImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Get current image
        const result = await query('SELECT image_url FROM dim_products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const imageUrl = result.rows[0].image_url;
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không có ảnh'
            });
        }

        // Delete file
        const imagePath = path.join(productDir, path.basename(imageUrl));
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Update database
        await query('UPDATE dim_products SET image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Xóa ảnh thành công'
        });
    } catch (error) {
        console.error('Error deleting main image:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa ảnh',
            error: error.message
        });
    }
};

/**
 * @POST /api/products/:id/images
 * @description Upload nhiều ảnh cho sản phẩm (gallery)
 * @param id - ID sản phẩm
 * @files images - Mảng file ảnh (max 5)
 * @returns { message, images }
 */
const uploadGalleryImages = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ít nhất 1 file ảnh'
            });
        }

        // Check product exists
        const checkResult = await client.query('SELECT id FROM dim_products WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            // Delete all uploaded files
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        await client.query('BEGIN');

        // Get current max sort_order
        const sortResult = await client.query(
            'SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM product_images WHERE product_id = $1',
            [id]
        );
        let sortOrder = sortResult.rows[0].max_sort;

        const insertedImages = [];
        for (const file of req.files) {
            sortOrder++;
            const imageUrl = `/uploads/products/${file.filename}`;
            
            const insertResult = await client.query(`
                INSERT INTO product_images (product_id, image_url, sort_order)
                VALUES ($1, $2, $3)
                RETURNING id, image_url, sort_order, is_primary
            `, [id, imageUrl, sortOrder]);

            insertedImages.push(insertResult.rows[0]);
        }

        // If no primary image, set first one as primary
        const primaryCheck = await client.query(
            'SELECT id FROM product_images WHERE product_id = $1 AND is_primary = true',
            [id]
        );
        if (primaryCheck.rows.length === 0 && insertedImages.length > 0) {
            await client.query(
                'UPDATE product_images SET is_primary = true WHERE id = $1',
                [insertedImages[0].id]
            );
            insertedImages[0].is_primary = true;
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Upload thành công ${insertedImages.length} ảnh`,
            data: {
                images: insertedImages
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        console.error('Error uploading gallery images:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload ảnh',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * @GET /api/products/:id/images
 * @description Lấy danh sách ảnh của sản phẩm
 * @param id - ID sản phẩm
 * @returns { main_image, gallery }
 */
const getProductImages = async (req, res) => {
    try {
        const { id } = req.params;

        // Get main image from dim_products
        const productResult = await query(
            'SELECT id, image_url FROM dim_products WHERE id = $1',
            [id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Get gallery images
        const galleryResult = await query(`
            SELECT id, image_url, alt_text, sort_order, is_primary, created_at
            FROM product_images
            WHERE product_id = $1
            ORDER BY is_primary DESC, sort_order ASC
        `, [id]);

        res.json({
            success: true,
            data: {
                main_image: productResult.rows[0].image_url,
                gallery: galleryResult.rows
            }
        });
    } catch (error) {
        console.error('Error getting product images:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách ảnh',
            error: error.message
        });
    }
};

/**
 * @DELETE /api/products/:id/images/:imageId
 * @description Xóa một ảnh trong gallery
 * @param id - ID sản phẩm
 * @param imageId - ID ảnh
 * @returns { message }
 */
const deleteGalleryImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        // Get image info
        const result = await query(
            'SELECT id, image_url, is_primary FROM product_images WHERE id = $1 AND product_id = $2',
            [imageId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ảnh'
            });
        }

        const image = result.rows[0];

        // Delete file
        const imagePath = path.join(productDir, path.basename(image.image_url));
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Delete from database
        await query('DELETE FROM product_images WHERE id = $1', [imageId]);

        // If was primary, set next image as primary
        if (image.is_primary) {
            await query(`
                UPDATE product_images 
                SET is_primary = true 
                WHERE product_id = $1 AND id = (
                    SELECT id FROM product_images WHERE product_id = $1 ORDER BY sort_order LIMIT 1
                )
            `, [id]);
        }

        res.json({
            success: true,
            message: 'Xóa ảnh thành công'
        });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa ảnh',
            error: error.message
        });
    }
};

/**
 * @PUT /api/products/:id/images/:imageId/primary
 * @description Đặt một ảnh làm ảnh chính trong gallery
 * @param id - ID sản phẩm
 * @param imageId - ID ảnh
 * @returns { message }
 */
const setPrimaryImage = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id, imageId } = req.params;

        // Check image exists
        const result = await client.query(
            'SELECT id FROM product_images WHERE id = $1 AND product_id = $2',
            [imageId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ảnh'
            });
        }

        await client.query('BEGIN');

        // Remove primary from all images of this product
        await client.query(
            'UPDATE product_images SET is_primary = false WHERE product_id = $1',
            [id]
        );

        // Set new primary
        await client.query(
            'UPDATE product_images SET is_primary = true WHERE id = $1',
            [imageId]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Đặt ảnh chính thành công'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error setting primary image:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đặt ảnh chính',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * @PUT /api/products/:id/images/reorder
 * @description Sắp xếp lại thứ tự ảnh
 * @param id - ID sản phẩm
 * @body { image_ids: [1, 3, 2] } - Thứ tự mới
 * @returns { message }
 */
const reorderImages = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { image_ids } = req.body;

        if (!image_ids || !Array.isArray(image_ids) || image_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách image_ids không hợp lệ'
            });
        }

        await client.query('BEGIN');

        for (let i = 0; i < image_ids.length; i++) {
            await client.query(
                'UPDATE product_images SET sort_order = $1 WHERE id = $2 AND product_id = $3',
                [i + 1, image_ids[i], id]
            );
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Sắp xếp ảnh thành công'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error reordering images:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi sắp xếp ảnh',
            error: error.message
        });
    } finally {
        client.release();
    }
};

module.exports = {
    uploadMainImage,
    deleteMainImage,
    uploadGalleryImages,
    getProductImages,
    deleteGalleryImage,
    setPrimaryImage,
    reorderImages
};
