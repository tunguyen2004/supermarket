/**
 * ============================================================================
 *                    MODULE 7: INVENTORY SERVICE
 * ============================================================================
 * Quản lý tồn kho sản phẩm (Inventory Management)
 * Sử dụng bảng: fact_inventory_stocks, fact_inventory_transactions,
 *               dim_product_variants, dim_stores, subdim_transaction_types
 *
 * Chức năng:
 * - Xem danh sách tồn kho (có phân trang, lọc theo cửa hàng, trạng thái)
 * - Xem chi tiết tồn kho của sản phẩm
 * - Cập nhật số lượng tồn kho (điều chỉnh)
 * - Xem lịch sử xuất nhập kho
 * - Nhập kho (receive inventory)
 * - Chuyển kho (transfer stock)
 * - Trả hàng nhà cung cấp (return to supplier)
 * ============================================================================
 */

const { pool, query } = require("../config/database");
const { generateTransactionCode, getDateStr } = require("../utils/codeGenerator");

/**
 * @GET /api/inventories
 * @description Lấy danh sách tồn kho
 * @query { search, store_id, status, page, limit }
 * @returns { inventories: [...], pagination: {...} }
 */
const getInventories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const storeId = req.query.store_id;
    const status = req.query.status; // 'low', 'normal', 'high', 'out'

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Search by product code or name
    if (search) {
      conditions.push(
        `(p.code ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex} OR pv.sku ILIKE $${paramIndex})`,
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by store
    if (storeId) {
      conditions.push(`fis.store_id = $${paramIndex}`);
      params.push(storeId);
      paramIndex++;
    }

    // Filter by stock status
    if (status) {
      switch (status) {
        case "out":
          conditions.push("fis.quantity_on_hand = 0");
          break;
        case "low":
          conditions.push(
            "fis.quantity_on_hand > 0 AND fis.quantity_on_hand <= fis.min_stock_level",
          );
          break;
        case "normal":
          conditions.push(
            "fis.quantity_on_hand > fis.min_stock_level AND fis.quantity_on_hand < fis.max_stock_level",
          );
          break;
        case "high":
          conditions.push(
            "fis.quantity_on_hand >= fis.max_stock_level AND fis.max_stock_level > 0",
          );
          break;
      }
    }

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    // Count total
    const countQuery = `
            SELECT COUNT(*) as total
            FROM fact_inventory_stocks fis
            JOIN dim_product_variants pv ON fis.variant_id = pv.id
            JOIN dim_products p ON pv.product_id = p.id
            ${whereClause}
        `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get inventories
    const query = `
            SELECT 
                fis.store_id,
                fis.variant_id as id,
                p.code,
                p.name,
                pv.sku,
                pv.barcode,
                u.name as unit,
                s.name as location,
                s.code as store_code,
                fis.quantity_on_hand as stock,
                fis.quantity_reserved,
                fis.quantity_available,
                fis.min_stock_level,
                fis.max_stock_level,
                fis.last_updated,
                CASE 
                    WHEN fis.quantity_on_hand = 0 THEN 'out'
                    WHEN fis.quantity_on_hand <= fis.min_stock_level THEN 'low'
                    WHEN fis.max_stock_level > 0 AND fis.quantity_on_hand >= fis.max_stock_level THEN 'high'
                    ELSE 'normal'
                END as stock_status
            FROM fact_inventory_stocks fis
            JOIN dim_product_variants pv ON fis.variant_id = pv.id
            JOIN dim_products p ON pv.product_id = p.id
            JOIN dim_stores s ON fis.store_id = s.id
            JOIN subdim_units u ON p.unit_id = u.id
            ${whereClause}
            ORDER BY p.name ASC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

    const result = await pool.query(query, [...params, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách tồn kho",
      error: error.message,
    });
  }
};

/**
 * @GET /api/inventories/:variantId
 * @description Lấy chi tiết tồn kho của một sản phẩm
 * @param variantId - ID của product variant
 * @query { store_id } - Optional: lọc theo cửa hàng
 * @returns { variant_info, stock_by_store: [...] }
 */
const getInventoryById = async (req, res) => {
  try {
    const { variantId } = req.params;
    const storeId = req.query.store_id;

    // Get variant info
    const variantQuery = `
            SELECT 
                pv.id,
                p.code,
                p.name,
                pv.sku,
                pv.barcode,
                pv.cost_price,
                pv.selling_price,
                u.name as unit
            FROM dim_product_variants pv
            JOIN dim_products p ON pv.product_id = p.id
            JOIN subdim_units u ON p.unit_id = u.id
            WHERE pv.id = $1
        `;
    const variantResult = await pool.query(variantQuery, [variantId]);

    if (variantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Get stock by store
    let stockQuery = `
            SELECT 
                fis.store_id,
                s.name as store_name,
                s.code as store_code,
                fis.quantity_on_hand as stock,
                fis.quantity_reserved,
                fis.quantity_available,
                fis.min_stock_level,
                fis.max_stock_level,
                fis.last_updated
            FROM fact_inventory_stocks fis
            JOIN dim_stores s ON fis.store_id = s.id
            WHERE fis.variant_id = $1
        `;
    let stockParams = [variantId];

    if (storeId) {
      stockQuery += " AND fis.store_id = $2";
      stockParams.push(storeId);
    }

    stockQuery += " ORDER BY s.name ASC";

    const stockResult = await pool.query(stockQuery, stockParams);

    res.json({
      success: true,
      data: {
        variant_info: variantResult.rows[0],
        stock_by_store: stockResult.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory by id:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết tồn kho",
      error: error.message,
    });
  }
};

/**
 * @PUT /api/inventories/:variantId
 * @description Điều chỉnh số lượng tồn kho (manual adjustment)
 * @param variantId - ID của product variant
 * @body { store_id, quantity, adjustment_type: 'set' | 'add' | 'subtract', notes }
 * @returns { message, new_stock }
 */
const updateInventory = async (req, res) => {
  const client = await pool.connect();
  try {
    const { variantId } = req.params;
    const { store_id, quantity, adjustment_type, notes } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn cửa hàng",
      });
    }

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Số lượng là bắt buộc",
      });
    }

    if (!["set", "add", "subtract"].includes(adjustment_type)) {
      return res.status(400).json({
        success: false,
        message: "Loại điều chỉnh không hợp lệ (set, add, subtract)",
      });
    }

    await client.query("BEGIN");

    // Get current stock
    const currentStockQuery = `
            SELECT quantity_on_hand 
            FROM fact_inventory_stocks 
            WHERE store_id = $1 AND variant_id = $2
        `;
    const currentStockResult = await client.query(currentStockQuery, [
      store_id,
      variantId,
    ]);

    let currentStock = 0;
    let newStock = 0;
    let quantityChange = 0;
    let transactionTypeId;

    if (currentStockResult.rows.length > 0) {
      currentStock = parseFloat(currentStockResult.rows[0].quantity_on_hand);
    }

    // Calculate new stock
    switch (adjustment_type) {
      case "set":
        newStock = parseFloat(quantity);
        quantityChange = newStock - currentStock;
        break;
      case "add":
        newStock = currentStock + parseFloat(quantity);
        quantityChange = parseFloat(quantity);
        break;
      case "subtract":
        newStock = currentStock - parseFloat(quantity);
        quantityChange = -parseFloat(quantity);
        break;
    }

    if (newStock < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Số lượng tồn kho không thể âm",
      });
    }

    // Get transaction type for adjustment
    const typeQuery = `
            SELECT id FROM subdim_transaction_types 
            WHERE code = 'ADJUSTMENT'
        `;
    const typeResult = await client.query(typeQuery);

    if (typeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        success: false,
        message: "Không tìm thấy loại giao dịch điều chỉnh",
      });
    }
    transactionTypeId = typeResult.rows[0].id;

    // Update or insert stock
    if (currentStockResult.rows.length > 0) {
      await client.query(
        `
                UPDATE fact_inventory_stocks
                SET quantity_on_hand = $1, last_updated = CURRENT_TIMESTAMP
                WHERE store_id = $2 AND variant_id = $3
            `,
        [newStock, store_id, variantId],
      );
    } else {
      await client.query(
        `
                INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, last_updated)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            `,
        [store_id, variantId, newStock],
      );
    }

    // Ensure date exists in dim_time
    const today = new Date().toISOString().split("T")[0];
    await ensureDateExists(client, today);

    // Create transaction record
    const transactionCode = await generateTransactionCode(client, 'ADJ');
    await client.query(
      `
            INSERT INTO fact_inventory_transactions 
            (transaction_code, date_key, transaction_type_id, store_id, variant_id, 
             quantity_change, balance_before, balance_after, reference_type, created_by, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
      [
        transactionCode,
        today,
        transactionTypeId,
        store_id,
        variantId,
        quantityChange,
        currentStock,
        newStock,
        "ADJUSTMENT",
        userId,
        notes || "Điều chỉnh tồn kho",
      ],
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Điều chỉnh tồn kho thành công",
      data: {
        previous_stock: currentStock,
        new_stock: newStock,
        quantity_change: quantityChange,
        transaction_code: transactionCode,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi điều chỉnh tồn kho",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * @GET /api/inventories/:variantId/history
 * @description Lấy lịch sử xuất nhập kho của sản phẩm
 * @param variantId - ID của product variant
 * @query { store_id, from, to, page, limit }
 * @returns { history: [...], pagination: {...} }
 */
const getInventoryHistory = async (req, res) => {
  try {
    const { variantId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const storeId = req.query.store_id;
    const fromDate = req.query.from;
    const toDate = req.query.to;

    let conditions = ["fit.variant_id = $1"];
    let params = [variantId];
    let paramIndex = 2;

    if (storeId) {
      conditions.push(`fit.store_id = $${paramIndex}`);
      params.push(storeId);
      paramIndex++;
    }

    if (fromDate) {
      conditions.push(`fit.date_key >= $${paramIndex}`);
      params.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      conditions.push(`fit.date_key <= $${paramIndex}`);
      params.push(toDate);
      paramIndex++;
    }

    const whereClause = "WHERE " + conditions.join(" AND ");

    // Count total
    const countQuery = `
            SELECT COUNT(*) as total
            FROM fact_inventory_transactions fit
            ${whereClause}
        `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get history
    const query = `
            SELECT 
                fit.id,
                fit.transaction_code,
                fit.date_key,
                fit.created_at,
                stt.name as transaction_type,
                stt.code as transaction_type_code,
                s.name as store_name,
                fit.quantity_change,
                fit.balance_before,
                fit.balance_after,
                fit.reference_type,
                fit.reference_id,
                fit.unit_cost,
                fit.total_value,
                fit.notes,
                u.full_name as created_by_name
            FROM fact_inventory_transactions fit
            JOIN subdim_transaction_types stt ON fit.transaction_type_id = stt.id
            JOIN dim_stores s ON fit.store_id = s.id
            JOIN dim_users u ON fit.created_by = u.id
            ${whereClause}
            ORDER BY fit.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

    const result = await pool.query(query, [...params, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory history:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử xuất nhập kho",
      error: error.message,
    });
  }
};

/**
 * @POST /api/inventories/receive
 * @description Nhập kho sản phẩm
 * @body { store_id, items: [{ variant_id, quantity, unit_cost }], notes }
 * @returns { message, transaction_codes }
 */
const receiveInventory = async (req, res) => {
  const client = await pool.connect();
  try {
    const { store_id, items, notes } = req.body;
    const userId = req.user.id;

    // Validate
    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn cửa hàng nhập kho",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách sản phẩm nhập kho không hợp lệ",
      });
    }

    await client.query("BEGIN");

    // Get IMPORT transaction type
    const typeResult = await client.query(
      "SELECT id FROM subdim_transaction_types WHERE code = 'IMPORT'",
    );
    if (typeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        success: false,
        message: "Không tìm thấy loại giao dịch IMPORT",
      });
    }
    const transactionTypeId = typeResult.rows[0].id;

    const today = new Date().toISOString().split("T")[0];
    await ensureDateExists(client, today);

    const transactionCodes = [];

    for (const item of items) {
      const { variant_id, quantity, unit_cost } = item;

      if (!variant_id || !quantity || quantity <= 0) {
        continue;
      }

      // Get current stock
      const currentQuery = `
                SELECT quantity_on_hand FROM fact_inventory_stocks 
                WHERE store_id = $1 AND variant_id = $2
            `;
      const currentResult = await client.query(currentQuery, [
        store_id,
        variant_id,
      ]);
      const currentStock =
        currentResult.rows.length > 0
          ? parseFloat(currentResult.rows[0].quantity_on_hand)
          : 0;
      const newStock = currentStock + parseFloat(quantity);

      // Update or insert stock
      if (currentResult.rows.length > 0) {
        await client.query(
          `
                    UPDATE fact_inventory_stocks
                    SET quantity_on_hand = $1, last_updated = CURRENT_TIMESTAMP
                    WHERE store_id = $2 AND variant_id = $3
                `,
          [newStock, store_id, variant_id],
        );
      } else {
        await client.query(
          `
                    INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, last_updated)
                    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                `,
          [store_id, variant_id, newStock],
        );
      }

      // Create transaction
      const transactionCode = await generateTransactionCode(client, 'RCV');
      await client.query(
        `
                INSERT INTO fact_inventory_transactions 
                (transaction_code, date_key, transaction_type_id, store_id, variant_id, 
                 quantity_change, balance_before, balance_after, reference_type, unit_cost, created_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `,
        [
          transactionCode,
          today,
          transactionTypeId,
          store_id,
          variant_id,
          quantity,
          currentStock,
          newStock,
          "RECEIVE",
          unit_cost || 0,
          userId,
          notes || "Nhập kho",
        ],
      );

      transactionCodes.push(transactionCode);
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Nhập kho thành công ${transactionCodes.length} sản phẩm`,
      data: {
        transaction_codes: transactionCodes,
        items_count: transactionCodes.length,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error receiving inventory:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi nhập kho",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * @POST /api/inventories/transfer
 * @description Chuyển kho giữa các cửa hàng
 * @body { from_store_id, to_store_id, items: [{ variant_id, quantity }], notes }
 * @returns { message, transaction_codes }
 */
const transferStock = async (req, res) => {
  const client = await pool.connect();
  try {
    const { from_store_id, to_store_id, items, notes } = req.body;
    const userId = req.user.id;

    // Validate
    if (!from_store_id || !to_store_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn kho xuất và kho nhận",
      });
    }

    if (from_store_id === to_store_id) {
      return res.status(400).json({
        success: false,
        message: "Kho xuất và kho nhận không thể giống nhau",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách sản phẩm chuyển kho không hợp lệ",
      });
    }

    await client.query("BEGIN");

    // Get transaction types
    const transferOutResult = await client.query(
      "SELECT id FROM subdim_transaction_types WHERE code = 'TRANSFER_OUT'",
    );
    const transferInResult = await client.query(
      "SELECT id FROM subdim_transaction_types WHERE code = 'TRANSFER_IN'",
    );

    if (
      transferOutResult.rows.length === 0 ||
      transferInResult.rows.length === 0
    ) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        success: false,
        message: "Không tìm thấy loại giao dịch chuyển kho",
      });
    }

    const transferOutTypeId = transferOutResult.rows[0].id;
    const transferInTypeId = transferInResult.rows[0].id;

    const today = new Date().toISOString().split("T")[0];
    await ensureDateExists(client, today);

    const transactionCodes = [];

    for (const item of items) {
      const { variant_id, quantity } = item;

      if (!variant_id || !quantity || quantity <= 0) {
        continue;
      }

      // Check source stock
      const sourceQuery = `
                SELECT quantity_on_hand FROM fact_inventory_stocks 
                WHERE store_id = $1 AND variant_id = $2
            `;
      const sourceResult = await client.query(sourceQuery, [
        from_store_id,
        variant_id,
      ]);

      if (
        sourceResult.rows.length === 0 ||
        parseFloat(sourceResult.rows[0].quantity_on_hand) < quantity
      ) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Không đủ tồn kho để chuyển (Variant ID: ${variant_id})`,
        });
      }

      const sourceStock = parseFloat(sourceResult.rows[0].quantity_on_hand);
      const newSourceStock = sourceStock - quantity;

      // Get destination stock
      const destQuery = `
                SELECT quantity_on_hand FROM fact_inventory_stocks 
                WHERE store_id = $1 AND variant_id = $2
            `;
      const destResult = await client.query(destQuery, [
        to_store_id,
        variant_id,
      ]);
      const destStock =
        destResult.rows.length > 0
          ? parseFloat(destResult.rows[0].quantity_on_hand)
          : 0;
      const newDestStock = destStock + quantity;

      // Update source stock
      await client.query(
        `
                UPDATE fact_inventory_stocks
                SET quantity_on_hand = $1, last_updated = CURRENT_TIMESTAMP
                WHERE store_id = $2 AND variant_id = $3
            `,
        [newSourceStock, from_store_id, variant_id],
      );

      // Update or insert destination stock
      if (destResult.rows.length > 0) {
        await client.query(
          `
                    UPDATE fact_inventory_stocks
                    SET quantity_on_hand = $1, last_updated = CURRENT_TIMESTAMP
                    WHERE store_id = $2 AND variant_id = $3
                `,
          [newDestStock, to_store_id, variant_id],
        );
      } else {
        await client.query(
          `
                    INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, last_updated)
                    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                `,
          [to_store_id, variant_id, newDestStock],
        );
      }

      // Create transactions
      const transferCode = await generateTransactionCode(client, 'TRF');

      // Transfer OUT transaction
      await client.query(
        `
                INSERT INTO fact_inventory_transactions 
                (transaction_code, date_key, transaction_type_id, store_id, variant_id, 
                 quantity_change, balance_before, balance_after, reference_type, reference_id, created_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `,
        [
          transferCode + "-OUT",
          today,
          transferOutTypeId,
          from_store_id,
          variant_id,
          -quantity,
          sourceStock,
          newSourceStock,
          "TRANSFER",
          to_store_id,
          userId,
          notes || "Chuyển kho",
        ],
      );

      // Transfer IN transaction
      await client.query(
        `
                INSERT INTO fact_inventory_transactions 
                (transaction_code, date_key, transaction_type_id, store_id, variant_id, 
                 quantity_change, balance_before, balance_after, reference_type, reference_id, created_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `,
        [
          transferCode + "-IN",
          today,
          transferInTypeId,
          to_store_id,
          variant_id,
          quantity,
          destStock,
          newDestStock,
          "TRANSFER",
          from_store_id,
          userId,
          notes || "Chuyển kho",
        ],
      );

      transactionCodes.push(transferCode);
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Chuyển kho thành công ${transactionCodes.length} sản phẩm`,
      data: {
        transaction_codes: transactionCodes,
        items_count: transactionCodes.length,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error transferring stock:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi chuyển kho",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * @POST /api/inventories/return
 * @description Trả hàng nhà cung cấp
 * @body { store_id, items: [{ variant_id, quantity }], notes }
 * @returns { message, transaction_codes }
 */
const returnToSupplier = async (req, res) => {
  const client = await pool.connect();
  try {
    const { store_id, items, notes } = req.body;
    const userId = req.user.id;

    // Validate
    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn cửa hàng",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách sản phẩm trả hàng không hợp lệ",
      });
    }

    await client.query("BEGIN");

    // Get RETURN transaction type
    const typeResult = await client.query(
      "SELECT id FROM subdim_transaction_types WHERE code = 'RETURN'",
    );
    if (typeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        success: false,
        message: "Không tìm thấy loại giao dịch RETURN",
      });
    }
    const transactionTypeId = typeResult.rows[0].id;

    const today = new Date().toISOString().split("T")[0];
    await ensureDateExists(client, today);

    const transactionCodes = [];

    for (const item of items) {
      const { variant_id, quantity } = item;

      if (!variant_id || !quantity || quantity <= 0) {
        continue;
      }

      // Check current stock
      const currentQuery = `
                SELECT quantity_on_hand FROM fact_inventory_stocks 
                WHERE store_id = $1 AND variant_id = $2
            `;
      const currentResult = await client.query(currentQuery, [
        store_id,
        variant_id,
      ]);

      if (
        currentResult.rows.length === 0 ||
        parseFloat(currentResult.rows[0].quantity_on_hand) < quantity
      ) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Không đủ tồn kho để trả hàng (Variant ID: ${variant_id})`,
        });
      }

      const currentStock = parseFloat(currentResult.rows[0].quantity_on_hand);
      const newStock = currentStock - quantity;

      // Update stock
      await client.query(
        `
                UPDATE fact_inventory_stocks
                SET quantity_on_hand = $1, last_updated = CURRENT_TIMESTAMP
                WHERE store_id = $2 AND variant_id = $3
            `,
        [newStock, store_id, variant_id],
      );

      // Create transaction
      const transactionCode = await generateTransactionCode(client, 'RTN');
      await client.query(
        `
                INSERT INTO fact_inventory_transactions 
                (transaction_code, date_key, transaction_type_id, store_id, variant_id, 
                 quantity_change, balance_before, balance_after, reference_type, created_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `,
        [
          transactionCode,
          today,
          transactionTypeId,
          store_id,
          variant_id,
          -quantity,
          currentStock,
          newStock,
          "RETURN_OUT",
          userId,
          notes || "Trả hàng nhà cung cấp",
        ],
      );

      transactionCodes.push(transactionCode);
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Trả hàng thành công ${transactionCodes.length} sản phẩm`,
      data: {
        transaction_codes: transactionCodes,
        items_count: transactionCodes.length,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error returning to supplier:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi trả hàng nhà cung cấp",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * @GET /api/stores
 * @description Lấy danh sách cửa hàng/kho
 * @returns { stores: [...] }
 */
const getStores = async (req, res) => {
  try {
    const query = `
            SELECT 
                s.id,
                s.code,
                s.name,
                st.name as store_type,
                s.address,
                s.is_active
            FROM dim_stores s
            JOIN subdim_store_types st ON s.store_type_id = st.id
            WHERE s.is_active = true
            ORDER BY s.name ASC
        `;
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách cửa hàng",
      error: error.message,
    });
  }
};

/**
 * @GET /api/transaction-types
 * @description Lấy danh sách loại giao dịch kho
 * @returns { types: [...] }
 */
const getTransactionTypes = async (req, res) => {
  try {
    const query = `
            SELECT id, code, name, affects_stock
            FROM subdim_transaction_types
            ORDER BY id ASC
        `;
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching transaction types:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách loại giao dịch",
      error: error.message,
    });
  }
};

/**
 * Helper function to ensure date exists in dim_time
 */
async function ensureDateExists(client, dateStr) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const dayNames = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const checkQuery = "SELECT date_key FROM dim_time WHERE date_key = $1";
  const checkResult = await client.query(checkQuery, [dateStr]);

  if (checkResult.rows.length === 0) {
    await client.query(
      `
            INSERT INTO dim_time (date_key, day_of_week, day_name, week_of_year, month, month_name, quarter, year, is_weekend)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (date_key) DO NOTHING
        `,
      [
        dateStr,
        dayOfWeek,
        dayNames[dayOfWeek],
        Math.ceil(
          (date - new Date(date.getFullYear(), 0, 1)) /
            (7 * 24 * 60 * 60 * 1000),
        ),
        date.getMonth() + 1,
        monthNames[date.getMonth()],
        Math.ceil((date.getMonth() + 1) / 3),
        date.getFullYear(),
        dayOfWeek === 0 || dayOfWeek === 6,
      ],
    );
  }
}

/**
 * @GET /api/inventories/transactions
 * @description Lấy danh sách giao dịch kho (nhập, xuất, chuyển, ...)
 * @query { type, search, store_id, from, to, page, limit }
 * @returns { data: [...], pagination: {...} }
 */
const getInventoryTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type; // e.g. 'IMPORT' or 'IMPORT,TRANSFER_OUT'
    const searchTerm = req.query.search;
    const fromDate = req.query.from;
    const toDate = req.query.to;
    const storeId = req.query.store_id;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (type) {
      const types = type
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (types.length > 0) {
        const placeholders = types.map((_, i) => `$${paramIndex + i}`);
        conditions.push(`stt.code IN (${placeholders.join(", ")})`);
        params.push(...types);
        paramIndex += types.length;
      }
    }

    if (searchTerm) {
      conditions.push(
        `(fit.transaction_code ILIKE $${paramIndex} OR dp.name ILIKE $${paramIndex} OR dpv.variant_name ILIKE $${paramIndex} OR dpv.sku ILIKE $${paramIndex})`,
      );
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    if (storeId) {
      conditions.push(`fit.store_id = $${paramIndex}`);
      params.push(parseInt(storeId));
      paramIndex++;
    }

    if (fromDate) {
      conditions.push(`fit.date_key >= $${paramIndex}`);
      params.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      conditions.push(`fit.date_key <= $${paramIndex}`);
      params.push(toDate);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    // Count total
    const countQuery = `
            SELECT COUNT(*) as total
            FROM fact_inventory_transactions fit
            JOIN subdim_transaction_types stt ON fit.transaction_type_id = stt.id
            JOIN dim_product_variants dpv ON fit.variant_id = dpv.id
            JOIN dim_products dp ON dpv.product_id = dp.id
            ${whereClause}
        `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get data
    const dataQuery = `
            SELECT 
                fit.id,
                fit.transaction_code,
                fit.date_key,
                fit.created_at,
                stt.code as type_code,
                stt.name as type_name,
                s.id as store_id,
                s.name as store_name,
                dpv.id as variant_id,
                dpv.variant_name,
                dpv.sku as sku,
                dp.id as product_id,
                dp.name as product_name,
                dp.code as product_code,
                fit.quantity_change,
                fit.balance_before,
                fit.balance_after,
                fit.unit_cost,
                fit.total_value,
                fit.reference_type,
                fit.reference_id,
                fit.notes,
                u.full_name as created_by_name
            FROM fact_inventory_transactions fit
            JOIN subdim_transaction_types stt ON fit.transaction_type_id = stt.id
            JOIN dim_stores s ON fit.store_id = s.id
            JOIN dim_product_variants dpv ON fit.variant_id = dpv.id
            JOIN dim_products dp ON dpv.product_id = dp.id
            JOIN dim_users u ON fit.created_by = u.id
            ${whereClause}
            ORDER BY fit.created_at DESC, fit.id DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

    const result = await pool.query(dataQuery, [...params, limit, offset]);

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        ...row,
        quantity_change: parseFloat(row.quantity_change),
        unit_cost: parseFloat(row.unit_cost || 0),
        total_value: parseFloat(row.total_value || 0),
        balance_before: parseFloat(row.balance_before || 0),
        balance_after: parseFloat(row.balance_after || 0),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách giao dịch kho",
      error: error.message,
    });
  }
};

module.exports = {
  getInventories,
  getInventoryById,
  updateInventory,
  getInventoryHistory,
  getInventoryTransactions,
  receiveInventory,
  transferStock,
  returnToSupplier,
  getStores,
  getTransactionTypes,
  // Inventory Lookup
  searchProductsForLookup,
  getProductInventoryDetail,
};

/**
 * GET /api/inventory/lookup/search
 * Tìm kiếm sản phẩm để tra cứu tồn kho
 *
 * Query params:
 * - query: Tìm theo tên, SKU
 * - sort: Sắp xếp (name, price, stock)
 * - order: ASC/DESC
 * - limit: Số lượng (default: 50)
 * - offset: Vị trí bắt đầu
 * - store_id: Lọc theo cửa hàng
 */
async function searchProductsForLookup(req, res) {
  try {
    const {
      query = "",
      sort = "name",
      order = "ASC",
      limit = 50,
      offset = 0,
      store_id,
    } = req.query;

    // Validate sort column
    const validSorts = ["name", "price", "stock", "sku", "created_at"];
    const sortColumn = validSorts.includes(sort) ? sort : "name";
    const sortDir = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // Build sort mapping - sử dụng đúng tên cột trong schema
    const sortMap = {
      name: "p.name",
      price: "pv.selling_price",
      stock: "total_stock",
      sku: "pv.sku",
      created_at: "p.created_at",
    };

    // Build search condition
    let searchCondition = "";
    const params = [];
    let paramIndex = 0;

    if (query && query.trim()) {
      paramIndex++;
      const searchTerm = `%${query.trim().toLowerCase()}%`;
      searchCondition = `AND (LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.code) LIKE $${paramIndex} OR LOWER(pv.sku) LIKE $${paramIndex} OR LOWER(pv.barcode) LIKE $${paramIndex})`;
      params.push(searchTerm);
    }

    // Store filter
    let storeCondition = "";
    if (store_id) {
      paramIndex++;
      storeCondition = `AND fis.store_id = $${paramIndex}`;
      params.push(parseInt(store_id));
    }

    // Get products with inventory totals - sử dụng đúng schema
    const productsQuery = `
            SELECT 
                p.id as product_id,
                p.name,
                p.code,
                pv.sku,
                pv.barcode,
                p.is_active,
                pv.id as variant_id,
                pv.variant_name,
                pv.selling_price as price,
                COALESCE(SUM(fis.quantity_available), 0) as total_stock,
                COUNT(DISTINCT fis.store_id) as store_count,
                COALESCE(p.image_url, (SELECT image_url FROM dim_product_images WHERE product_id = p.id AND is_primary = true LIMIT 1)) as image_url
            FROM dim_products p
            INNER JOIN dim_product_variants pv ON p.id = pv.product_id
            LEFT JOIN fact_inventory_stocks fis ON pv.id = fis.variant_id ${storeCondition}
            WHERE p.is_active = true
            ${searchCondition}
            GROUP BY p.id, p.name, p.code, pv.sku, pv.barcode, p.is_active, pv.id, pv.variant_name, pv.selling_price
            ORDER BY ${sortMap[sortColumn]} ${sortDir}
            LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
        `;

    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(productsQuery, params);

    // Get total count for pagination
    const countParams = params.slice(0, paramIndex); // Exclude limit/offset
    const countQuery = `
            SELECT COUNT(DISTINCT (p.id, pv.id)) as total
            FROM dim_products p
            INNER JOIN dim_product_variants pv ON p.id = pv.product_id
            LEFT JOIN fact_inventory_stocks fis ON pv.id = fis.variant_id ${storeCondition}
            WHERE p.is_active = true
            ${searchCondition}
        `;

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || 0);

    return res.status(200).json({
      success: true,
      message: "Tìm kiếm sản phẩm thành công",
      data: result.rows.map((row) => ({
        product_id: row.product_id,
        variant_id: row.variant_id,
        name: row.name,
        variant_name: row.variant_name,
        sku: row.sku,
        barcode: row.barcode,
        price: parseFloat(row.price || 0),
        total_stock: parseInt(row.total_stock || 0),
        store_count: parseInt(row.store_count || 0),
        image_url: row.image_url,
        is_active: row.is_active,
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < total,
      },
    });
  } catch (error) {
    console.error("Search products for lookup error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm sản phẩm",
      error: error.message,
    });
  }
}

/**
 * GET /api/inventory/lookup/:productId
 * Chi tiết tồn kho sản phẩm theo từng chi nhánh/cửa hàng
 */
async function getProductInventoryDetail(req, res) {
  try {
    const { productId } = req.params;

    // Get product info
    const productResult = await pool.query(
      `
            SELECT 
                p.id,
                p.name,
                p.code,
                p.description,
                p.is_active,
                COALESCE(p.image_url, (SELECT image_url FROM dim_product_images WHERE product_id = p.id AND is_primary = true LIMIT 1)) as image_url
            FROM dim_products p
            LEFT JOIN dim_product_variants pv ON p.id = pv.product_id
            WHERE p.id = $1
            LIMIT 1
        `,
      [productId],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const product = productResult.rows[0];

    // Get variants with prices
    const variantsResult = await pool.query(
      `
            SELECT 
                v.id,
                v.variant_name,
                v.sku as variant_sku,
                v.selling_price,
                v.cost_price,
                COALESCE(SUM(fis.quantity_on_hand), 0) as total_stock
            FROM dim_product_variants v
            LEFT JOIN fact_inventory_stocks fis ON v.id = fis.variant_id
            WHERE v.product_id = $1
            GROUP BY v.id, v.variant_name, v.sku, v.selling_price, v.cost_price
            ORDER BY v.variant_name ASC
        `,
      [productId],
    );

    // Get inventory by store for each variant
    const inventoryResult = await pool.query(
      `
            SELECT 
                fis.variant_id,
                s.id as store_id,
                s.name as store_name,
                s.code as store_code,
                c.name as city,
                fis.quantity_available as stock,
                fis.quantity_reserved,
                fis.min_stock_level as reorder_point,
                fis.last_updated as updated_at
            FROM fact_inventory_stocks fis
            INNER JOIN dim_stores s ON fis.store_id = s.id
            INNER JOIN subdim_cities c ON s.city_id = c.id
            INNER JOIN dim_product_variants v ON fis.variant_id = v.id
            WHERE v.product_id = $1
            ORDER BY s.name ASC
        `,
      [productId],
    );

    // Organize inventory by store
    const storeInventoryMap = {};
    inventoryResult.rows.forEach((row) => {
      const storeKey = row.store_id;
      if (!storeInventoryMap[storeKey]) {
        storeInventoryMap[storeKey] = {
          store_id: row.store_id,
          store_name: row.store_name,
          store_code: row.store_code,
          city: row.city,
          variants: [],
        };
      }
      storeInventoryMap[storeKey].variants.push({
        variant_id: row.variant_id,
        stock: parseInt(row.stock || 0),
        reserved: parseInt(row.quantity_reserved || 0),
        reorder_point: parseInt(row.reorder_point || 0),
        updated_at: row.updated_at,
      });
    });

    // Calculate total stock
    const totalStock = variantsResult.rows.reduce(
      (sum, v) => sum + parseInt(v.total_stock || 0),
      0,
    );

    // Get default price from first variant
    const defaultPrice = variantsResult.rows[0]?.selling_price || 0;

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết tồn kho thành công",
      data: {
        product_id: product.id,
        name: product.name,
        code: product.code,
        description: product.description,
        is_active: product.is_active,
        imageUrl: product.image_url,
        price: parseFloat(defaultPrice),
        total_stock: totalStock,
        productDetailUrl: `/products/${product.id}`,
        variants: variantsResult.rows.map((v) => ({
          id: v.id,
          name: v.variant_name,
          sku: v.variant_sku,
          selling_price: parseFloat(v.selling_price || 0),
          cost_price: parseFloat(v.cost_price || 0),
          total_stock: parseInt(v.total_stock || 0),
        })),
        stores: Object.values(storeInventoryMap),
      },
    });
  } catch (error) {
    console.error("Get product inventory detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết tồn kho",
      error: error.message,
    });
  }
}
