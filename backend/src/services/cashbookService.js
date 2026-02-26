/**
 * ============================================================================
 *                    MODULE 14: CASHBOOK SERVICE (SỔ QUỸ)
 * ============================================================================
 * Quản lý giao dịch thu chi - Sổ quỹ (Fundbook)
 * Sử dụng bảng: fact_cashbook_transactions, subdim_cashbook_types, 
 *               subdim_payment_methods, fact_store_balances
 * 
 * Chức năng:
 * - Danh sách giao dịch (phiếu thu/chi)
 * - Tạo phiếu thu/chi
 * - Chi tiết giao dịch
 * - Sửa/xóa giao dịch
 * - Thống kê tồn quỹ
 * ============================================================================
 */

const db = require('../config/database');
const { generateCashbookCode } = require('../utils/codeGenerator');

/**
 * Helper: Đảm bảo ngày tồn tại trong dim_time
 */
async function ensureDateExists(client, dateStr) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const checkQuery = 'SELECT date_key FROM dim_time WHERE date_key = $1';
  const checkResult = await client.query(checkQuery, [dateStr]);

  if (checkResult.rows.length === 0) {
    await client.query(`
      INSERT INTO dim_time (date_key, day_of_week, day_name, week_of_year, month, month_name, quarter, year, is_weekend)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (date_key) DO NOTHING
    `, [
      dateStr,
      dayOfWeek,
      dayNames[dayOfWeek],
      Math.ceil((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
      date.getMonth() + 1,
      monthNames[date.getMonth()],
      Math.ceil((date.getMonth() + 1) / 3),
      date.getFullYear(),
      dayOfWeek === 0 || dayOfWeek === 6
    ]);
  }
}

/**
 * 1. Danh sách giao dịch - GET /api/transactions
 * Query: from, to, type (thu/chi), store_id, status, employee_id, page, limit
 */
const getTransactions = async (req, res) => {
  try {
    const {
      from,
      to,
      type,  // 'thu' hoặc 'chi'
      store_id,
      status,
      employee_id,
      payment_method,
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

    if (from) {
      whereClause += ` AND ct.date_key >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      whereClause += ` AND ct.date_key <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    if (type === 'thu') {
      whereClause += ' AND cbt.transaction_direction = 1';
    } else if (type === 'chi') {
      whereClause += ' AND cbt.transaction_direction = -1';
    }

    if (store_id) {
      whereClause += ` AND ct.store_id = $${paramIndex}`;
      params.push(store_id);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND ct.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (employee_id) {
      whereClause += ` AND ct.created_by = $${paramIndex}`;
      params.push(employee_id);
      paramIndex++;
    }

    if (payment_method) {
      whereClause += ` AND pm.code = $${paramIndex}`;
      params.push(payment_method);
      paramIndex++;
    }

    // Validate sortBy
    const allowedSortFields = ['created_at', 'date_key', 'amount', 'transaction_code'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM fact_cashbook_transactions ct
      JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
      LEFT JOIN subdim_payment_methods pm ON ct.payment_method_id = pm.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get transactions
    const query = `
      SELECT 
        ct.id,
        ct.transaction_code,
        ct.date_key,
        s.name as store_name,
        cbt.code as type_code,
        cbt.name as type_name,
        cbt.transaction_direction,
        CASE WHEN cbt.transaction_direction = 1 THEN 'thu' ELSE 'chi' END as transaction_type,
        pm.code as payment_method_code,
        pm.name as payment_method_name,
        ct.amount,
        ct.running_balance,
        ct.reference_type,
        ct.reference_id,
        ct.description,
        ct.recipient_name,
        ct.status,
        ct.created_at,
        u.full_name as created_by_name,
        ua.full_name as approved_by_name,
        ct.approved_at
      FROM fact_cashbook_transactions ct
      JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
      JOIN dim_stores s ON ct.store_id = s.id
      LEFT JOIN subdim_payment_methods pm ON ct.payment_method_id = pm.id
      JOIN dim_users u ON ct.created_by = u.id
      LEFT JOIN dim_users ua ON ct.approved_by = ua.id
      ${whereClause}
      ORDER BY ct.${sortField} ${sortOrder}
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
      message: 'Lấy danh sách giao dịch thành công'
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách giao dịch',
      error: error.message
    });
  }
};

/**
 * 2. Chi tiết giao dịch - GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        ct.*,
        s.name as store_name,
        s.code as store_code,
        cbt.code as type_code,
        cbt.name as type_name,
        cbt.transaction_direction,
        CASE WHEN cbt.transaction_direction = 1 THEN 'thu' ELSE 'chi' END as transaction_type,
        pm.code as payment_method_code,
        pm.name as payment_method_name,
        u.full_name as created_by_name,
        ua.full_name as approved_by_name
      FROM fact_cashbook_transactions ct
      JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
      JOIN dim_stores s ON ct.store_id = s.id
      LEFT JOIN subdim_payment_methods pm ON ct.payment_method_id = pm.id
      JOIN dim_users u ON ct.created_by = u.id
      LEFT JOIN dim_users ua ON ct.approved_by = ua.id
      WHERE ct.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Lấy thông tin giao dịch thành công'
    });

  } catch (error) {
    console.error('Get transaction by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin giao dịch',
      error: error.message
    });
  }
};

/**
 * 3. Tạo phiếu thu/chi - POST /api/transactions
 */
const createTransaction = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      store_id,
      cashbook_type,  // code của loại giao dịch
      payment_method, // code của phương thức thanh toán
      amount,
      date_key,       // Optional, mặc định là hôm nay
      reference_type,
      reference_id,
      description,
      recipient_name,
      recipient_phone,
      notes
    } = req.body;

    // Validate required fields
    if (!store_id || !cashbook_type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: store_id, cashbook_type, amount'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền phải lớn hơn 0'
      });
    }

    await client.query('BEGIN');

    // Get cashbook type
    const typeResult = await client.query(
      'SELECT id, transaction_direction FROM subdim_cashbook_types WHERE code = $1',
      [cashbook_type]
    );

    if (typeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Loại giao dịch không hợp lệ'
      });
    }

    const cashbookTypeId = typeResult.rows[0].id;
    const transactionDirection = typeResult.rows[0].transaction_direction;

    // Get payment method id if provided
    let paymentMethodId = null;
    if (payment_method) {
      const pmResult = await client.query(
        'SELECT id FROM subdim_payment_methods WHERE code = $1',
        [payment_method]
      );
      if (pmResult.rows.length > 0) {
        paymentMethodId = pmResult.rows[0].id;
      }
    }

    // Ensure date exists
    const transactionDate = date_key || new Date().toISOString().split('T')[0];
    await ensureDateExists(client, transactionDate);

    // Generate transaction code
    const codePrefix = transactionDirection === 1 ? 'PT' : 'PC'; // Phiếu thu / Phiếu chi
    const transactionCode = await generateCashbookCode(client, transactionDirection);

    // Insert transaction
    const insertQuery = `
      INSERT INTO fact_cashbook_transactions (
        transaction_code, date_key, store_id, cashbook_type_id, payment_method_id,
        amount, reference_type, reference_id, description, recipient_name, 
        recipient_phone, created_by, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `;

    const insertResult = await client.query(insertQuery, [
      transactionCode,
      transactionDate,
      store_id,
      cashbookTypeId,
      paymentMethodId,
      amount,
      reference_type || null,
      reference_id || null,
      description || null,
      recipient_name || null,
      recipient_phone || null,
      req.user.id,
      notes || null,
      'pending'
    ]);

    await client.query('COMMIT');

    // Get created transaction
    const resultQuery = `
      SELECT 
        ct.*,
        cbt.code as type_code,
        cbt.name as type_name,
        CASE WHEN cbt.transaction_direction = 1 THEN 'thu' ELSE 'chi' END as transaction_type,
        pm.name as payment_method_name,
        s.name as store_name
      FROM fact_cashbook_transactions ct
      JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
      JOIN dim_stores s ON ct.store_id = s.id
      LEFT JOIN subdim_payment_methods pm ON ct.payment_method_id = pm.id
      WHERE ct.id = $1
    `;
    const result = await db.query(resultQuery, [insertResult.rows[0].id]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: `Tạo ${transactionDirection === 1 ? 'phiếu thu' : 'phiếu chi'} thành công`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo giao dịch',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * 4. Cập nhật giao dịch - PUT /api/transactions/:id
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cashbook_type,
      payment_method,
      amount,
      date_key,
      description,
      recipient_name,
      recipient_phone,
      notes,
      status
    } = req.body;

    // Check transaction exists and is editable
    const existingResult = await db.query(
      'SELECT id, status FROM fact_cashbook_transactions WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Only pending transactions can be edited
    if (existingResult.rows[0].status !== 'pending' && status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể sửa giao dịch ở trạng thái chờ duyệt'
      });
    }

    // Get cashbook type id if provided
    let cashbookTypeId = null;
    if (cashbook_type) {
      const typeResult = await db.query(
        'SELECT id FROM subdim_cashbook_types WHERE code = $1',
        [cashbook_type]
      );
      if (typeResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Loại giao dịch không hợp lệ'
        });
      }
      cashbookTypeId = typeResult.rows[0].id;
    }

    // Get payment method id if provided
    let paymentMethodId = null;
    if (payment_method) {
      const pmResult = await db.query(
        'SELECT id FROM subdim_payment_methods WHERE code = $1',
        [payment_method]
      );
      if (pmResult.rows.length > 0) {
        paymentMethodId = pmResult.rows[0].id;
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    if (cashbookTypeId) {
      updateFields.push(`cashbook_type_id = $${paramIndex++}`);
      params.push(cashbookTypeId);
    }
    if (paymentMethodId !== null) {
      updateFields.push(`payment_method_id = $${paramIndex++}`);
      params.push(paymentMethodId);
    }
    if (amount !== undefined) {
      updateFields.push(`amount = $${paramIndex++}`);
      params.push(amount);
    }
    if (date_key) {
      updateFields.push(`date_key = $${paramIndex++}`);
      params.push(date_key);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (recipient_name !== undefined) {
      updateFields.push(`recipient_name = $${paramIndex++}`);
      params.push(recipient_name);
    }
    if (recipient_phone !== undefined) {
      updateFields.push(`recipient_phone = $${paramIndex++}`);
      params.push(recipient_phone);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
      
      // Set approved info
      if (status === 'approved' || status === 'rejected') {
        updateFields.push(`approved_by = $${paramIndex++}`);
        params.push(req.user.id);
        updateFields.push(`approved_at = NOW()`);
      }
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin cập nhật'
      });
    }

    params.push(id);
    const updateQuery = `
      UPDATE fact_cashbook_transactions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await db.query(updateQuery, params);

    // Get updated transaction
    const resultQuery = `
      SELECT 
        ct.*,
        cbt.code as type_code,
        cbt.name as type_name,
        CASE WHEN cbt.transaction_direction = 1 THEN 'thu' ELSE 'chi' END as transaction_type,
        pm.name as payment_method_name,
        s.name as store_name
      FROM fact_cashbook_transactions ct
      JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
      JOIN dim_stores s ON ct.store_id = s.id
      LEFT JOIN subdim_payment_methods pm ON ct.payment_method_id = pm.id
      WHERE ct.id = $1
    `;
    const result = await db.query(resultQuery, [id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật giao dịch thành công'
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật giao dịch',
      error: error.message
    });
  }
};

/**
 * 5. Xóa giao dịch - DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Check transaction exists
    const existingResult = await db.query(
      'SELECT id, transaction_code, status FROM fact_cashbook_transactions WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    const transaction = existingResult.rows[0];

    // Only pending transactions can be deleted, others are cancelled
    if (transaction.status === 'approved') {
      // Soft delete - mark as cancelled
      await db.query(
        `UPDATE fact_cashbook_transactions 
         SET status = 'cancelled', updated_at = NOW() 
         WHERE id = $1`,
        [id]
      );

      return res.json({
        success: true,
        message: `Đã hủy giao dịch ${transaction.transaction_code}`
      });
    }

    // Hard delete for pending transactions
    await db.query('DELETE FROM fact_cashbook_transactions WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Đã xóa giao dịch ${transaction.transaction_code}`
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa giao dịch',
      error: error.message
    });
  }
};

/**
 * 6. Thống kê tồn quỹ - GET /api/transactions/summary
 * Query: store_id, from, to
 */
const getTransactionSummary = async (req, res) => {
  try {
    const {
      store_id,
      from,
      to
    } = req.query;

    const today = new Date().toISOString().split('T')[0];
    const fromDate = from || today;
    const toDate = to || today;

    let params = [fromDate, toDate];
    let paramIndex = 3;
    let storeCondition = '';

    if (store_id) {
      storeCondition = ` AND ct.store_id = $${paramIndex}`;
      params.push(store_id);
    }

    // Get summary by store
    const summaryQuery = `
      SELECT 
        ct.store_id,
        s.name as store_name,
        SUM(CASE WHEN cbt.transaction_direction = 1 AND ct.status = 'approved' THEN ct.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN cbt.transaction_direction = -1 AND ct.status = 'approved' THEN ct.amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN cbt.transaction_direction = 1 AND ct.status = 'approved' THEN ct.amount 
                 WHEN cbt.transaction_direction = -1 AND ct.status = 'approved' THEN -ct.amount 
                 ELSE 0 END) as net_amount,
        COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN ct.status = 'pending' THEN 1 END) as pending_count,
        SUM(CASE WHEN ct.status = 'pending' THEN ct.amount ELSE 0 END) as pending_amount
      FROM fact_cashbook_transactions ct
      JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
      JOIN dim_stores s ON ct.store_id = s.id
      WHERE ct.date_key >= $1 AND ct.date_key <= $2
        ${storeCondition}
      GROUP BY ct.store_id, s.name
      ORDER BY s.name
    `;

    const summaryResult = await db.query(summaryQuery, params);

    // Get breakdown by type
    const breakdownQuery = `
      SELECT 
        cbt.code as type_code,
        cbt.name as type_name,
        cbt.transaction_direction,
        CASE WHEN cbt.transaction_direction = 1 THEN 'thu' ELSE 'chi' END as category,
        COUNT(*) as transaction_count,
        SUM(ct.amount) as total_amount
      FROM fact_cashbook_transactions ct
      JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
      WHERE ct.date_key >= $1 AND ct.date_key <= $2
        AND ct.status = 'approved'
        ${storeCondition}
      GROUP BY cbt.id, cbt.code, cbt.name, cbt.transaction_direction
      ORDER BY cbt.transaction_direction DESC, total_amount DESC
    `;

    const breakdownResult = await db.query(breakdownQuery, params);

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    summaryResult.rows.forEach(row => {
      totalIncome += parseFloat(row.total_income) || 0;
      totalExpense += parseFloat(row.total_expense) || 0;
    });

    res.json({
      success: true,
      data: {
        period: {
          from: fromDate,
          to: toDate
        },
        totals: {
          total_income: totalIncome,
          total_expense: totalExpense,
          net_amount: totalIncome - totalExpense
        },
        by_store: summaryResult.rows,
        by_type: breakdownResult.rows
      },
      message: 'Lấy thống kê sổ quỹ thành công'
    });

  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê sổ quỹ',
      error: error.message
    });
  }
};

/**
 * 7. Lấy danh sách loại giao dịch - GET /api/cashbook-types
 */
const getCashbookTypes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, code, name, transaction_direction,
              CASE WHEN transaction_direction = 1 THEN 'thu' ELSE 'chi' END as category,
              description
       FROM subdim_cashbook_types 
       ORDER BY transaction_direction DESC, name`
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách loại giao dịch thành công'
    });

  } catch (error) {
    console.error('Get cashbook types error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách loại giao dịch',
      error: error.message
    });
  }
};

/**
 * 8. Lấy danh sách phương thức thanh toán - GET /api/payment-methods
 */
const getPaymentMethods = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, code, name 
       FROM subdim_payment_methods 
       WHERE is_active = true
       ORDER BY id`
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'Lấy danh sách phương thức thanh toán thành công'
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phương thức thanh toán',
      error: error.message
    });
  }
};

/**
 * 9. Duyệt giao dịch - PATCH /api/transactions/:id/approve
 */
const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const existingResult = await db.query(
      'SELECT id, transaction_code, status FROM fact_cashbook_transactions WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    if (existingResult.rows[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể duyệt giao dịch ở trạng thái chờ duyệt'
      });
    }

    const newStatus = action === 'reject' ? 'rejected' : 'approved';

    await db.query(
      `UPDATE fact_cashbook_transactions 
       SET status = $1, approved_by = $2, approved_at = NOW(), updated_at = NOW()
       WHERE id = $3`,
      [newStatus, req.user.id, id]
    );

    res.json({
      success: true,
      message: `Đã ${action === 'reject' ? 'từ chối' : 'duyệt'} giao dịch ${existingResult.rows[0].transaction_code}`
    });

  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt giao dịch',
      error: error.message
    });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getCashbookTypes,
  getPaymentMethods,
  approveTransaction
};
