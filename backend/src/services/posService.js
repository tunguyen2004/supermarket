const db = require("../config/database");

/**
 * ============================================================================
 *                    POS SERVICE - THANH TOÁN TẠI QUẦY
 * ============================================================================
 * Service xử lý các API cho hệ thống POS (Point of Sale)
 *
 * Endpoints:
 * - POST /api/pos/checkout - Xử lý thanh toán
 * - GET /api/pos/products/search - Tìm sản phẩm nhanh
 * - GET /api/pos/products/:id/price - Lấy giá SP theo store
 * - POST /api/pos/orders/draft - Lưu đơn tạm
 * - GET /api/pos/orders/drafts - DS đơn tạm
 * - DELETE /api/pos/orders/draft/:id - Xóa đơn tạm
 * - GET /api/pos/orders/:id/receipt - In hóa đơn POS
 * - POST /api/pos/discounts/validate - Kiểm tra mã giảm giá
 */

/**
 * POST /api/pos/checkout
 * Xử lý thanh toán đơn hàng POS
 *
 * Body:
 * - store_id: ID cửa hàng
 * - customer_id: ID khách hàng (nullable)
 * - items: Danh sách sản phẩm
 * - subtotal: Tổng tiền trước giảm giá
 * - discount_amount: Số tiền giảm giá
 * - discount_code: Mã giảm giá (nullable)
 * - payment_method: cash/card/bank/momo/zalopay/vnpay
 * - amount_received: Số tiền khách đưa
 * - change: Tiền thừa
 * - notes: Ghi chú
 */
const checkout = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const {
      store_id,
      customer_id,
      items,
      subtotal,
      discount_amount = 0,
      discount_code,
      discount_id,
      payment_method = "cash",
      amount_received,
      change = 0,
      notes,
    } = req.body;

    const userId = req.user?.id;

    // Validate required fields
    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn cửa hàng",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng thêm sản phẩm vào đơn hàng",
      });
    }

    await client.query("BEGIN");

    // Generate order code
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const orderCountResult = await client.query(
      `
      SELECT COUNT(*) + 1 as next_num
      FROM fact_orders
      WHERE date_key = $1
    `,
      [today.toISOString().split("T")[0]],
    );
    const orderNumber = String(orderCountResult.rows[0].next_num).padStart(
      5,
      "0",
    );
    const orderCode = `POS-${dateStr}-${orderNumber}`;

    // Calculate totals
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Get product/variant info
      const variantResult = await client.query(
        `
        SELECT 
          v.id as variant_id,
          v.product_id,
          p.name as product_name,
          v.variant_name,
          v.selling_price,
          v.cost_price,
          COALESCE(fi.quantity_available, 0) as stock
        FROM dim_product_variants v
        JOIN dim_products p ON v.product_id = p.id
        LEFT JOIN fact_inventory_stocks fi ON v.id = fi.variant_id AND fi.store_id = $2
        WHERE v.id = $1
      `,
        [item.variant_id, store_id],
      );

      if (variantResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Không tìm thấy sản phẩm với variant_id: ${item.variant_id}`,
        });
      }

      const variant = variantResult.rows[0];

      // Check stock
      if (variant.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${variant.product_name}" không đủ tồn kho (Còn: ${variant.stock})`,
        });
      }

      const unitPrice = item.unit_price || variant.selling_price;
      const itemSubtotal = unitPrice * item.quantity;
      const itemDiscount = item.discount_amount || 0;
      const itemTotal = itemSubtotal - itemDiscount;

      calculatedSubtotal += itemSubtotal;

      orderItems.push({
        variant_id: item.variant_id,
        product_id: variant.product_id,
        product_name: variant.product_name,
        variant_name: variant.variant_name,
        quantity: item.quantity,
        unit_price: unitPrice,
        cost_price: variant.cost_price || 0,
        subtotal: itemSubtotal,
        discount_amount: itemDiscount,
        tax_amount: 0,
        total: itemTotal,
      });
    }

    // Calculate final amount
    const finalSubtotal = subtotal || calculatedSubtotal;
    const finalAmount = finalSubtotal - discount_amount;
    const taxAmount = 0; // Configure if needed

    // Create order
    const orderResult = await client.query(
      `
      INSERT INTO fact_orders (
        order_code, date_key, store_id, customer_id,
        subtotal, discount_amount, tax_amount, shipping_fee,
        final_amount, payment_method, payment_status,
        status, internal_note, created_by
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, 'paid',
        'completed', $11, $12
      )
      RETURNING id, order_code
    `,
      [
        orderCode,
        today.toISOString().split("T")[0],
        store_id,
        customer_id || null,
        finalSubtotal,
        discount_amount,
        taxAmount,
        0, // shipping_fee
        finalAmount,
        payment_method,
        notes || null,
        userId,
      ],
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `
        INSERT INTO fact_order_items (
          order_id, variant_id, quantity, unit_price, discount_per_item
        ) VALUES ($1, $2, $3, $4, $5)
      `,
        [
          orderId,
          item.variant_id,
          item.quantity,
          item.unit_price,
          item.discount_amount || 0,
        ],
      );

      // Update inventory
      await client.query(
        `
        UPDATE fact_inventory_stocks
        SET quantity_on_hand = quantity_on_hand - $1,
            last_updated = NOW()
        WHERE variant_id = $2 AND store_id = $3
      `,
        [item.quantity, item.variant_id, store_id],
      );

      // Record inventory transaction
      // Get current stock for balance_before
      const stockResult = await client.query(
        `SELECT quantity_on_hand FROM fact_inventory_stocks 
         WHERE variant_id = $1 AND store_id = $2`,
        [item.variant_id, store_id],
      );
      const balanceAfter = stockResult.rows[0]?.quantity_on_hand || 0;
      const balanceBefore =
        parseFloat(balanceAfter) + parseFloat(item.quantity);

      // Generate transaction code
      const txCode = `POS-${orderCode}-${item.variant_id}`;

      await client.query(
        `
        INSERT INTO fact_inventory_transactions (
          transaction_code, variant_id, store_id, date_key, transaction_type_id,
          quantity_change, balance_before, balance_after,
          reference_type, reference_id, unit_cost, notes, created_by
        ) VALUES (
          $1, $2, $3, $4,
          (SELECT id FROM subdim_transaction_types WHERE code = 'EXPORT' LIMIT 1),
          $5, $6, $7,
          'order', $8, $9, 'Bán hàng POS', $10
        )
      `,
        [
          txCode,
          item.variant_id,
          store_id,
          today.toISOString().split("T")[0],
          -item.quantity,
          balanceBefore,
          balanceAfter,
          orderId,
          item.unit_price,
          userId,
        ],
      );
    }

    // Record discount usage if applicable
    if (discount_id) {
      await client.query(
        `
        INSERT INTO fact_discount_usages (
          discount_id, order_id, customer_id, discount_amount
        ) VALUES ($1, $2, $3, $4)
      `,
        [discount_id, orderId, customer_id, discount_amount],
      );
    }

    // Update customer lifetime value if customer is specified
    if (customer_id) {
      await client.query(
        `
        UPDATE dim_customers
        SET total_lifetime_value = total_lifetime_value + $1
        WHERE id = $2
      `,
        [finalAmount, customer_id],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Thanh toán thành công",
      data: {
        order_id: orderId,
        order_code: orderCode,
        final_amount: finalAmount,
        payment_method: payment_method,
        amount_received: amount_received,
        change: change,
        receipt_url: `/api/pos/orders/${orderId}/receipt`,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POS checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý thanh toán",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/pos/products/search
 * Tìm kiếm sản phẩm nhanh cho POS (barcode, SKU, tên)
 *
 * Query params:
 * - q: Từ khóa tìm kiếm
 * - store_id: ID cửa hàng (để lấy giá và tồn kho)
 * - limit: Số lượng kết quả (default: 20)
 */
const searchProducts = async (req, res) => {
  try {
    const { q = "", store_id, limit = 20 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const searchTerm = q.trim();

    // Check if search is barcode (numeric only)
    const isBarcode = /^\d+$/.test(searchTerm);

    let result;
    if (isBarcode) {
      // Exact barcode match
      result = await db.query(
        `
        SELECT 
          p.id as product_id,
          p.name as product_name,
          v.sku,
          v.barcode,
          v.id as variant_id,
          v.variant_name,
          v.selling_price as price,
          COALESCE(fi.quantity_available, 0) as stock,
          (SELECT image_url FROM dim_product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
        FROM dim_products p
        INNER JOIN dim_product_variants v ON p.id = v.product_id
        LEFT JOIN fact_inventory_stocks fi ON v.id = fi.variant_id AND fi.store_id = $2
        WHERE p.is_active = true
          AND v.barcode = $1
        LIMIT $3
      `,
        [searchTerm, store_id || 1, parseInt(limit)],
      );
    } else {
      // Full-text search
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      result = await db.query(
        `
        SELECT 
          p.id as product_id,
          p.name as product_name,
          v.sku,
          v.barcode,
          v.id as variant_id,
          v.variant_name,
          v.selling_price as price,
          COALESCE(fi.quantity_available, 0) as stock,
          (SELECT image_url FROM dim_product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
        FROM dim_products p
        INNER JOIN dim_product_variants v ON p.id = v.product_id
        LEFT JOIN fact_inventory_stocks fi ON v.id = fi.variant_id AND fi.store_id = $2
        WHERE p.is_active = true
          AND (
            LOWER(p.name) LIKE $1 
            OR LOWER(p.code) LIKE $1
            OR LOWER(v.variant_name) LIKE $1
            OR LOWER(v.sku) LIKE $1
          )
        ORDER BY 
          CASE WHEN LOWER(p.name) LIKE $1 THEN 0 ELSE 1 END,
          p.name ASC
        LIMIT $3
      `,
        [searchPattern, store_id || 1, parseInt(limit)],
      );
    }

    return res.status(200).json({
      success: true,
      message: "Tìm kiếm sản phẩm thành công",
      data: result.rows.map((row) => ({
        product_id: row.product_id,
        variant_id: row.variant_id,
        name: row.variant_name
          ? `${row.product_name} - ${row.variant_name}`
          : row.product_name,
        sku: row.sku,
        barcode: row.barcode,
        price: parseFloat(row.price || 0),
        stock: parseInt(row.stock || 0),
        image: row.image,
      })),
    });
  } catch (error) {
    console.error("POS search products error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm sản phẩm",
      error: error.message,
    });
  }
};

/**
 * GET /api/pos/products/:variantId/price
 * Lấy giá sản phẩm theo store và thông tin tồn kho
 */
const getProductPrice = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { store_id } = req.query;

    const result = await db.query(
      `
      SELECT 
        v.id as variant_id,
        p.id as product_id,
        p.name as product_name,
        v.variant_name,
        v.selling_price as price,
        v.cost_price,
        COALESCE(fi.quantity_available, 0) as stock,
        COALESCE(fi.quantity_reserved, 0) as reserved
      FROM dim_product_variants v
      JOIN dim_products p ON v.product_id = p.id
      LEFT JOIN fact_inventory_stocks fi ON v.id = fi.variant_id AND fi.store_id = $2
      WHERE v.id = $1
    `,
      [variantId, store_id || 1],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const product = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        variant_id: product.variant_id,
        product_id: product.product_id,
        name: product.variant_name
          ? `${product.product_name} - ${product.variant_name}`
          : product.product_name,
        price: parseFloat(product.price || 0),
        stock: parseInt(product.stock || 0),
        reserved: parseInt(product.reserved || 0),
        available:
          parseInt(product.stock || 0) - parseInt(product.reserved || 0),
      },
    });
  } catch (error) {
    console.error("Get product price error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy giá sản phẩm",
      error: error.message,
    });
  }
};

/**
 * POST /api/pos/orders/draft
 * Lưu đơn hàng tạm (chưa thanh toán)
 */
const saveDraft = async (req, res) => {
  try {
    const {
      store_id,
      customer_id,
      items,
      subtotal,
      discount_amount = 0,
      discount_code,
      notes,
      name, // Tên đơn tạm (vd: "Bàn 1", "Khách A")
    } = req.body;

    const userId = req.user?.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng thêm sản phẩm vào đơn hàng",
      });
    }

    // Generate draft code
    const today = new Date();
    const draftCountResult = await db.query(
      `
      SELECT COUNT(*) + 1 as next_num
      FROM fact_orders
      WHERE date_key = $1 AND status = 'draft'
    `,
      [today.toISOString().split("T")[0]],
    );
    const draftNumber = String(draftCountResult.rows[0].next_num).padStart(
      3,
      "0",
    );
    const draftCode = `DRAFT-${draftNumber}`;

    // Create draft order
    const result = await db.query(
      `
      INSERT INTO fact_orders (
        order_code, date_key, store_id, customer_id,
        subtotal, discount_amount, final_amount,
        payment_method, payment_status, status,
        internal_note, created_by
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        'cash', 'pending', 'draft',
        $8, $9
      )
      RETURNING id, order_code
    `,
      [
        draftCode,
        today.toISOString().split("T")[0],
        store_id || 1,
        customer_id || null,
        subtotal || 0,
        discount_amount,
        (subtotal || 0) - discount_amount,
        notes || (name ? `Đơn tạm: ${name}` : null),
        userId,
      ],
    );

    const orderId = result.rows[0].id;

    // Insert items
    for (const item of items) {
      await db.query(
        `
        INSERT INTO fact_order_items (
          order_id, variant_id, quantity, unit_price, discount_per_item
        ) VALUES ($1, $2, $3, $4, $5)
      `,
        [
          orderId,
          item.variant_id,
          item.quantity,
          item.unit_price || 0,
          item.discount_amount || 0,
        ],
      );
    }

    return res.status(201).json({
      success: true,
      message: "Lưu đơn tạm thành công",
      data: {
        draft_id: orderId,
        draft_code: draftCode,
      },
    });
  } catch (error) {
    console.error("Save draft error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lưu đơn tạm",
      error: error.message,
    });
  }
};

/**
 * GET /api/pos/orders/drafts
 * Danh sách đơn hàng tạm (chưa thanh toán)
 */
const getDrafts = async (req, res) => {
  try {
    const { store_id } = req.query;
    const userId = req.user?.id;

    let storeFilter = "";
    const params = [];
    let paramIndex = 0;

    if (store_id) {
      paramIndex++;
      storeFilter = `AND o.store_id = $${paramIndex}`;
      params.push(parseInt(store_id));
    }

    const result = await db.query(
      `
      SELECT 
        o.id,
        o.order_code as code,
        o.created_at,
        o.subtotal,
        o.discount_amount,
        o.final_amount,
        COALESCE(c.full_name, 'Khách lẻ') as customer_name,
        COUNT(oi.id) as item_count,
        s.full_name as created_by_name
      FROM fact_orders o
      LEFT JOIN dim_customers c ON o.customer_id = c.id
      LEFT JOIN dim_users s ON o.created_by = s.id
      LEFT JOIN fact_order_items oi ON o.id = oi.order_id
      WHERE o.status = 'draft'
        ${storeFilter}
      GROUP BY o.id, o.order_code, o.created_at, o.subtotal, 
               o.discount_amount, o.final_amount,
               c.full_name, s.full_name
      ORDER BY o.created_at DESC
    `,
      params,
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn tạm thành công",
      data: result.rows.map((row) => ({
        id: row.id,
        code: row.code,
        created_at: row.created_at,
        customer_name: row.customer_name,
        item_count: parseInt(row.item_count),
        subtotal: parseFloat(row.subtotal || 0),
        discount_amount: parseFloat(row.discount_amount || 0),
        final_amount: parseFloat(row.final_amount || 0),
        notes: "", // Return empty notes since column doesn't exist
        created_by: row.created_by_name,
      })),
    });
  } catch (error) {
    console.error("Get drafts error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn tạm",
      error: error.message,
    });
  }
};

/**
 * GET /api/pos/orders/drafts/:id
 * Chi tiết đơn hàng tạm
 */
const getDraftById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get draft order
    const orderResult = await db.query(
      `
      SELECT 
        o.id,
        o.order_code as code,
        o.store_id,
        o.customer_id,
        o.created_at,
        o.subtotal,
        o.discount_amount,
        o.final_amount,
        o.internal_note,
        COALESCE(c.full_name, 'Khách lẻ') as customer_name,
        c.phone as customer_phone
      FROM fact_orders o
      LEFT JOIN dim_customers c ON o.customer_id = c.id
      WHERE o.id = $1 AND o.status = 'draft'
    `,
      [id],
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn tạm",
      });
    }

    const order = orderResult.rows[0];

    // Get items
    const itemsResult = await db.query(
      `
      SELECT 
        oi.id,
        oi.variant_id,
        oi.quantity,
        oi.unit_price,
        oi.discount_amount,
        oi.total,
        p.name as product_name,
        v.variant_name,
        v.sku,
        (SELECT image_url FROM dim_product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM fact_order_items oi
      JOIN dim_product_variants v ON oi.variant_id = v.id
      JOIN dim_products p ON v.product_id = p.id
      WHERE oi.order_id = $1
    `,
      [id],
    );

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        code: order.code,
        store_id: order.store_id,
        customer_id: order.customer_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        created_at: order.created_at,
        subtotal: parseFloat(order.subtotal || 0),
        discount_amount: parseFloat(order.discount_amount || 0),
        final_amount: parseFloat(order.final_amount || 0),
        notes: order.internal_note,
        items: itemsResult.rows.map((item) => ({
          id: item.id,
          variant_id: item.variant_id,
          name: item.variant_name
            ? `${item.product_name} - ${item.variant_name}`
            : item.product_name,
          sku: item.sku,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price || 0),
          discount_amount: parseFloat(item.discount_amount || 0),
          total: parseFloat(item.total || 0),
          image: item.image,
        })),
      },
    });
  } catch (error) {
    console.error("Get draft by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết đơn tạm",
      error: error.message,
    });
  }
};

/**
 * PUT /api/pos/orders/draft/:id
 * Cập nhật đơn hàng tạm (thêm/xóa/sửa items, cập nhật thông tin)
 *
 * Body:
 * - customer_id: ID khách hàng (nullable)
 * - items: Danh sách sản phẩm mới (sẽ thay thế toàn bộ)
 * - discount_amount: Số tiền giảm giá
 * - discount_id: ID mã giảm giá
 * - notes: Ghi chú
 */
const updateDraft = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { id } = req.params;
    const { customer_id, items = [], discount_amount = 0, notes } = req.body;

    await client.query("BEGIN");

    // Check if draft exists
    const checkResult = await client.query(
      `
      SELECT id, store_id FROM fact_orders WHERE id = $1 AND status = 'draft'
    `,
      [id],
    );

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn tạm",
      });
    }

    const storeId = checkResult.rows[0].store_id;

    // Calculate new subtotal
    let subtotal = 0;
    for (const item of items) {
      const itemTotal = (item.unit_price || 0) * (item.quantity || 0);
      subtotal += itemTotal;
    }

    const finalAmount = subtotal - discount_amount;

    // Update order info
    await client.query(
      `
      UPDATE fact_orders
      SET customer_id = $1,
          subtotal = $2,
          discount_amount = $3,
          final_amount = $4,
          internal_note = $5
      WHERE id = $6
    `,
      [
        customer_id || null,
        subtotal,
        discount_amount,
        finalAmount,
        notes || null,
        id,
      ],
    );

    // Delete existing items
    await client.query(
      `
      DELETE FROM fact_order_items WHERE order_id = $1
    `,
      [id],
    );

    // Insert new items
    for (const item of items) {
      await client.query(
        `
        INSERT INTO fact_order_items (
          order_id, variant_id, quantity, unit_price, discount_per_item
        ) VALUES ($1, $2, $3, $4, $5)
      `,
        [
          id,
          item.variant_id,
          item.quantity,
          item.unit_price || 0,
          item.discount_amount || 0,
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Cập nhật đơn tạm thành công",
      data: {
        draft_id: parseInt(id),
        subtotal,
        discount_amount,
        final_amount: finalAmount,
        item_count: items.length,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update draft error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật đơn tạm",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * DELETE /api/pos/orders/draft/:id
 * Xóa đơn hàng tạm
 */
const deleteDraft = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // Check if draft exists
    const checkResult = await client.query(
      `
      SELECT id FROM fact_orders WHERE id = $1 AND status = 'draft'
    `,
      [id],
    );

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn tạm",
      });
    }

    // Delete items first
    await client.query(
      `
      DELETE FROM fact_order_items WHERE order_id = $1
    `,
      [id],
    );

    // Delete order
    await client.query(
      `
      DELETE FROM fact_orders WHERE id = $1
    `,
      [id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Xóa đơn tạm thành công",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete draft error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đơn tạm",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/pos/orders/:id/receipt
 * Lấy dữ liệu hóa đơn POS để in
 */
const getReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order
    const orderResult = await db.query(
      `
      SELECT 
        o.id,
        o.order_code as code,
        o.date_key,
        o.created_at,
        o.store_id,
        s.name as store_name,
        s.address as store_address,
        s.phone as store_phone,
        o.customer_id,
        COALESCE(c.full_name, 'Khách lẻ') as customer_name,
        c.phone as customer_phone,
        o.subtotal,
        o.discount_amount,
        o.tax_amount,
        o.final_amount,
        o.payment_method,
        o.internal_note,
        st.full_name as cashier_name
      FROM fact_orders o
      LEFT JOIN dim_stores s ON o.store_id = s.id
      LEFT JOIN dim_customers c ON o.customer_id = c.id
      LEFT JOIN dim_users st ON o.created_by = st.id
      WHERE o.id = $1
    `,
      [id],
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const order = orderResult.rows[0];

    // Get items
    const itemsResult = await db.query(
      `
      SELECT 
        oi.id,
        p.name as product_name,
        v.variant_name,
        oi.quantity,
        oi.unit_price,
        oi.discount_amount,
        oi.total
      FROM fact_order_items oi
      JOIN dim_product_variants v ON oi.variant_id = v.id
      JOIN dim_products p ON v.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `,
      [id],
    );

    // Format payment method
    const paymentMethodNames = {
      cash: "Tiền mặt",
      card: "Thẻ",
      bank: "Chuyển khoản",
      momo: "Ví MoMo",
      zalopay: "ZaloPay",
      vnpay: "VNPay",
    };

    return res.status(200).json({
      success: true,
      message: "Lấy hóa đơn thành công",
      data: {
        receipt: {
          order_id: order.id,
          order_code: order.code,
          date: order.created_at,
          store: {
            name: order.store_name,
            address: order.store_address,
            phone: order.store_phone,
          },
          customer: {
            name: order.customer_name,
            phone: order.customer_phone,
          },
          cashier: order.cashier_name,
          items: itemsResult.rows.map((item, index) => ({
            stt: index + 1,
            name: item.variant_name
              ? `${item.product_name} - ${item.variant_name}`
              : item.product_name,
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price || 0),
            discount: parseFloat(item.discount_amount || 0),
            total: parseFloat(item.total || 0),
          })),
          totals: {
            subtotal: parseFloat(order.subtotal || 0),
            discount: parseFloat(order.discount_amount || 0),
            tax: parseFloat(order.tax_amount || 0),
            total: parseFloat(order.final_amount || 0),
          },
          payment: {
            method:
              paymentMethodNames[order.payment_method] || order.payment_method,
            amount_received: parseFloat(order.final_amount || 0),
            change: 0,
          },
          notes: order.internal_note,
        },
      },
    });
  } catch (error) {
    console.error("Get receipt error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy hóa đơn",
      error: error.message,
    });
  }
};

/**
 * POST /api/pos/discounts/validate
 * Kiểm tra mã giảm giá cho đơn hàng POS
 * (Wrapper cho discountService.validateDiscount với context POS)
 */
const validateDiscountCode = async (req, res) => {
  try {
    const { code, order_amount, customer_id } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã giảm giá",
      });
    }

    // Get discount by code
    const discountResult = await db.query(
      `
      SELECT 
        d.id,
        d.code,
        d.name,
        dt.code as type_code,
        dt.name as type_name,
        d.value,
        d.min_order_amount,
        d.max_discount_amount,
        d.max_uses,
        d.max_uses_per_customer,
        d.start_date,
        d.end_date,
        d.is_active,
        (SELECT COUNT(*) FROM fact_discount_usages WHERE discount_id = d.id) as used_count
      FROM dim_discounts d
      JOIN subdim_discount_types dt ON d.discount_type_id = dt.id
      WHERE LOWER(d.code) = LOWER($1)
    `,
      [code],
    );

    if (discountResult.rows.length === 0) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: "Mã giảm giá không tồn tại",
      });
    }

    const discount = discountResult.rows[0];
    const today = new Date();

    // Check if active
    if (!discount.is_active) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: "Mã giảm giá đã ngừng hoạt động",
      });
    }

    // Check date range
    if (discount.start_date && new Date(discount.start_date) > today) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: "Mã giảm giá chưa bắt đầu",
      });
    }

    if (discount.end_date && new Date(discount.end_date) < today) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: "Mã giảm giá đã hết hạn",
      });
    }

    // Check max uses
    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: "Mã giảm giá đã hết lượt sử dụng",
      });
    }

    // Check per-customer limit
    if (customer_id && discount.max_uses_per_customer) {
      const customerUsageResult = await db.query(
        `
        SELECT COUNT(*) as count
        FROM fact_discount_usages
        WHERE discount_id = $1 AND customer_id = $2
      `,
        [discount.id, customer_id],
      );

      if (
        parseInt(customerUsageResult.rows[0].count) >=
        discount.max_uses_per_customer
      ) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: "Bạn đã sử dụng hết lượt cho mã này",
        });
      }
    }

    // Check min order amount
    if (discount.min_order_amount && order_amount < discount.min_order_amount) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: `Đơn hàng tối thiểu ${discount.min_order_amount.toLocaleString("vi-VN")}đ`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type_code === "PERCENTAGE") {
      discountAmount = (order_amount * discount.value) / 100;
      if (
        discount.max_discount_amount &&
        discountAmount > discount.max_discount_amount
      ) {
        discountAmount = discount.max_discount_amount;
      }
    } else if (discount.type_code === "FIXED_AMOUNT") {
      discountAmount = discount.value;
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Mã giảm giá hợp lệ",
      data: {
        discount_id: discount.id,
        code: discount.code,
        name: discount.name,
        type: discount.type_code,
        value: parseFloat(discount.value),
        discount_amount: discountAmount,
        max_discount_amount: discount.max_discount_amount
          ? parseFloat(discount.max_discount_amount)
          : null,
      },
    });
  } catch (error) {
    console.error("Validate discount code error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra mã giảm giá",
      error: error.message,
    });
  }
};

/**
 * GET /api/pos/payment-methods
 * Danh sách phương thức thanh toán
 */
const getPaymentMethods = async (req, res) => {
  try {
    const methods = [
      { id: "cash", name: "Tiền mặt", icon: "fa-money-bill", enabled: true },
      { id: "card", name: "Thẻ", icon: "fa-credit-card", enabled: true },
      {
        id: "bank",
        name: "Chuyển khoản",
        icon: "fa-building-columns",
        enabled: true,
      },
      { id: "momo", name: "MoMo", icon: "fa-mobile", enabled: true },
      { id: "zalopay", name: "ZaloPay", icon: "fa-wallet", enabled: true },
      { id: "vnpay", name: "VNPay", icon: "fa-qrcode", enabled: true },
    ];

    return res.status(200).json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách phương thức thanh toán",
      error: error.message,
    });
  }
};

/**
 * POST /api/pos/orders/draft/create-empty
 * Tạo đơn hàng nháp trống khi khởi tạo POS
 */
const createEmptyDraft = async (req, res) => {
  try {
    const { store_id } = req.body;
    const userId = req.user?.id || 1; // Fallback to user ID 1 if not available

    // Generate draft code
    const today = new Date();
    const draftCountResult = await db.query(
      `
      SELECT COUNT(*) + 1 as next_num
      FROM fact_orders
      WHERE date_key = $1 AND status = 'draft'
    `,
      [today.toISOString().split("T")[0]],
    );
    const draftNumber = String(draftCountResult.rows[0].next_num).padStart(
      3,
      "0",
    );
    const draftCode = `DRAFT-${draftNumber}`;

    // Create empty draft order
    const result = await db.query(
      `
      INSERT INTO fact_orders (
        order_code, date_key, store_id, 
        subtotal, discount_amount, final_amount,
        payment_method, payment_status, status,
        created_by
      ) VALUES (
        $1, $2, $3,
        0, 0, 0,
        'cash', 'pending', 'draft',
        $4
      )
      RETURNING id, order_code, created_at
    `,
      [draftCode, today.toISOString().split("T")[0], store_id || 1, userId],
    );

    const order = result.rows[0];

    return res.status(201).json({
      success: true,
      message: "Tạo đơn nháp mới thành công",
      data: {
        id: order.id,
        code: order.order_code,
        created_at: order.created_at,
        customer_name: "Khách lẻ",
        item_count: 0,
        subtotal: 0,
        discount_amount: 0,
        final_amount: 0,
        notes: "",
        items: [],
      },
    });
  } catch (error) {
    console.error("Create empty draft error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn nháp mới",
      error: error.message,
    });
  }
};

module.exports = {
  checkout,
  searchProducts,
  getProductPrice,
  saveDraft,
  getDrafts,
  getDraftById,
  updateDraft,
  deleteDraft,
  getReceipt,
  validateDiscountCode,
  getPaymentMethods,
  createEmptyDraft,
};
