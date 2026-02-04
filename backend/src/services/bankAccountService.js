/**
 * Bank Account Service
 * @module services/bankAccountService
 * @description Quản lý tài khoản ngân hàng cho thanh toán QR
 */

const { pool, query } = require('../config/database');

/**
 * Get all bank accounts with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} List of bank accounts with pagination
 */
async function getAllBankAccounts(options = {}) {
  const {
    page = 1,
    limit = 20,
    store_id,
    is_active,
    search
  } = options;

  const offset = (page - 1) * limit;
  const params = [];
  let paramIndex = 1;

  let whereClause = 'WHERE 1=1';

  if (store_id) {
    whereClause += ` AND (ba.store_id = $${paramIndex} OR ba.store_id IS NULL)`;
    params.push(store_id);
    paramIndex++;
  }

  if (is_active !== undefined) {
    whereClause += ` AND ba.is_active = $${paramIndex}`;
    params.push(is_active);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (
      ba.account_name ILIKE $${paramIndex} OR 
      ba.account_number ILIKE $${paramIndex} OR
      ba.bank_name ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM dim_bank_accounts ba
    ${whereClause}
  `;

  // Data query
  const dataQuery = `
    SELECT 
      ba.id,
      ba.account_name,
      ba.account_number,
      ba.bank_name,
      ba.bank_code,
      ba.branch,
      ba.store_id,
      s.name as store_name,
      ba.is_default,
      ba.is_active,
      ba.notes,
      ba.created_at,
      ba.updated_at,
      u.full_name as created_by_name
    FROM dim_bank_accounts ba
    LEFT JOIN dim_stores s ON ba.store_id = s.id
    LEFT JOIN dim_users u ON ba.created_by = u.id
    ${whereClause}
    ORDER BY ba.is_default DESC, ba.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, params.slice(0, paramIndex - 1)),
    pool.query(dataQuery, params)
  ]);

  const total = parseInt(countResult.rows[0].total);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get bank account by ID
 * @param {number} id - Bank account ID
 * @returns {Promise<Object|null>} Bank account details
 */
async function getBankAccountById(id) {
  const query = `
    SELECT 
      ba.id,
      ba.account_name,
      ba.account_number,
      ba.bank_name,
      ba.bank_code,
      ba.branch,
      ba.store_id,
      s.name as store_name,
      ba.is_default,
      ba.is_active,
      ba.notes,
      ba.created_by,
      ba.created_at,
      ba.updated_at,
      u.full_name as created_by_name
    FROM dim_bank_accounts ba
    LEFT JOIN dim_stores s ON ba.store_id = s.id
    LEFT JOIN dim_users u ON ba.created_by = u.id
    WHERE ba.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Create new bank account
 * @param {Object} data - Bank account data
 * @param {number} userId - Creator user ID
 * @returns {Promise<Object>} Created bank account
 */
async function createBankAccount(data, userId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      account_name,
      account_number,
      bank_name,
      bank_code,
      branch,
      store_id,
      is_default = false,
      notes
    } = data;

    // If this is set as default, unset other defaults
    if (is_default) {
      const updateQuery = store_id
        ? 'UPDATE dim_bank_accounts SET is_default = FALSE WHERE store_id = $1 OR store_id IS NULL'
        : 'UPDATE dim_bank_accounts SET is_default = FALSE WHERE store_id IS NULL';
      
      if (store_id) {
        await client.query(updateQuery, [store_id]);
      } else {
        await client.query(updateQuery);
      }
    }

    const query = `
      INSERT INTO dim_bank_accounts (
        account_name, account_number, bank_name, bank_code, branch,
        store_id, is_default, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await client.query(query, [
      account_name,
      account_number,
      bank_name,
      bank_code,
      branch || null,
      store_id || null,
      is_default,
      notes || null,
      userId
    ]);

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update bank account
 * @param {number} id - Bank account ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object|null>} Updated bank account
 */
async function updateBankAccount(id, data) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      account_name,
      account_number,
      bank_name,
      bank_code,
      branch,
      store_id,
      is_default,
      is_active,
      notes
    } = data;

    // Check if exists
    const existing = await client.query(
      'SELECT * FROM dim_bank_accounts WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // If setting as default, unset other defaults
    if (is_default === true) {
      const currentStoreId = store_id !== undefined ? store_id : existing.rows[0].store_id;
      const updateQuery = currentStoreId
        ? 'UPDATE dim_bank_accounts SET is_default = FALSE WHERE (store_id = $1 OR store_id IS NULL) AND id != $2'
        : 'UPDATE dim_bank_accounts SET is_default = FALSE WHERE store_id IS NULL AND id != $1';
      
      if (currentStoreId) {
        await client.query(updateQuery, [currentStoreId, id]);
      } else {
        await client.query(updateQuery, [id]);
      }
    }

    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (account_name !== undefined) {
      fields.push(`account_name = $${paramIndex++}`);
      params.push(account_name);
    }
    if (account_number !== undefined) {
      fields.push(`account_number = $${paramIndex++}`);
      params.push(account_number);
    }
    if (bank_name !== undefined) {
      fields.push(`bank_name = $${paramIndex++}`);
      params.push(bank_name);
    }
    if (bank_code !== undefined) {
      fields.push(`bank_code = $${paramIndex++}`);
      params.push(bank_code);
    }
    if (branch !== undefined) {
      fields.push(`branch = $${paramIndex++}`);
      params.push(branch);
    }
    if (store_id !== undefined) {
      fields.push(`store_id = $${paramIndex++}`);
      params.push(store_id || null);
    }
    if (is_default !== undefined) {
      fields.push(`is_default = $${paramIndex++}`);
      params.push(is_default);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }

    if (fields.length === 0) {
      await client.query('ROLLBACK');
      return existing.rows[0];
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE dim_bank_accounts 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(query, params);
    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete bank account (soft delete by setting is_active = false)
 * @param {number} id - Bank account ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteBankAccount(id) {
  const query = `
    UPDATE dim_bank_accounts 
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows.length > 0;
}

/**
 * Hard delete bank account
 * @param {number} id - Bank account ID
 * @returns {Promise<boolean>} Success status
 */
async function hardDeleteBankAccount(id) {
  const query = 'DELETE FROM dim_bank_accounts WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  return result.rows.length > 0;
}

/**
 * Generate VietQR payment URL
 * @param {number} accountId - Bank account ID
 * @param {Object} options - Payment options
 * @returns {Promise<Object>} QR data with URL
 */
async function generatePaymentQR(accountId, options = {}) {
  const { amount, description, order_code } = options;


  // Get amount for ordercode 
  
  // Get bank account
  const account = await getBankAccountById(accountId);
  if (!account) {
    throw new Error('Bank account not found');
  }

  if (!account.is_active) {
    throw new Error('Bank account is inactive');
  }

  // VietQR format - SỬ DỤNG BIN CODE, KHÔNG PHẢI SHORT CODE
  // https://img.vietqr.io/image/{BIN}-{account_number}-compact.png?amount={amount}&addInfo={description}
  const baseUrl = 'https://img.vietqr.io/image';
  
  // Chuyển bank_code (VD: MBB) sang BIN (VD: 970422)
  const bankBin = getBankBin(account.bank_code);
  
  // Build QR URL với BIN code
  let qrUrl = `${baseUrl}/${bankBin}-${account.account_number}-compact.png`;
  
  const queryParams = [];
  
  // Determine amount and description
  let amount_f = amount;
  let info = description;
  
  // If order_code is provided and amount is missing, query subtotal from fact_orders
  if (order_code && !amount_f) {
    try {
      const orderQuery = `
        SELECT subtotal
        FROM fact_orders 
        WHERE order_code = $1
      `;
      const orderResult = await pool.query(orderQuery, [order_code]);
      
      if (orderResult.rows.length > 0) {
        amount_f = orderResult.rows[0].subtotal;
      }
    } catch (error) {
      console.error(`Error fetching order data for ${order_code}:`, error);
    }
  }
  
  // If description is null, set to "Thanh toan + order_code"
  if (!info && order_code) {
    info = `Thanh toan don hang ${order_code}`;
  }
  
  if (amount_f) {
    queryParams.push(`amount=${amount_f}`);
  }
  
  // Build description/addInfo
  if (info) {
    queryParams.push(`addInfo=${encodeURIComponent(info)}`);
  }
  
  if (queryParams.length > 0) {
    qrUrl += '?' + queryParams.join('&');
  }

  // Also generate raw QR data for custom rendering
  const qrData = {
    bank_bin: bankBin,
    bank_code: account.bank_code,
    bank_name: account.bank_name,
    account_number: account.account_number,
    account_name: account.account_name,
    amount: amount_f || null,
    description: info || null,
    qr_url: qrUrl,
    // EMVCo QR format for NAPAS
    napas_qr: generateNapasQR(account, amount_f, info)
  };

  return qrData;
}

/**
 * Generate NAPAS EMVCo QR string
 * @private
 */
function generateNapasQR(account, amount, info) {
  // Simplified NAPAS QR format
  // Full implementation would follow EMVCo specification
  const data = {
    version: '01',
    mode: '12', // Dynamic QR
    merchant_account: account.account_number,
    bank_bin: getBankBin(account.bank_code),
    amount: amount || '',
    description: info || ''
  };
  
  // Return formatted string (simplified)
  return `NAPAS|${data.bank_bin}|${data.merchant_account}|${data.amount}|${data.description}`;
}

/**
 * Get bank BIN by bank code
 * @private
 */
function getBankBin(bankCode) {
  // Danh sách đầy đủ ngân hàng Việt Nam - VietQR Free API
  // Nguồn: https://api.vietqr.io/v2/banks
  const bankBins = {
    // Ngân hàng thương mại cổ phần
    'VCB': '970436',   // Vietcombank
    'TCB': '970407',   // Techcombank
    'ACB': '970416',   // ACB
    'VTB': '970415',   // Vietinbank (CTG)
    'BID': '970418',   // BIDV
    'MBB': '970422',   // MB Bank
    'VPB': '970432',   // VPBank
    'TPB': '970423',   // TPBank
    'STB': '970403',   // Sacombank
    'SCB': '970429',   // SCB
    'SHB': '970443',   // SHB
    'MSB': '970426',   // MSB (Maritime Bank)
    'HDB': '970437',   // HDBank
    'OCB': '970448',   // OCB
    'LPB': '970449',   // LienVietPostBank
    'SEA': '970440',   // SeABank
    'NAB': '970428',   // Nam A Bank
    'EIB': '970431',   // Eximbank
    'VIB': '970441',   // VIB
    'ABB': '970425',   // ABBank
    
    // Ngân hàng bổ sung
    'AGRI': '970405',  // Agribank
    'BAB': '970409',   // BacABank
    'CAKE': '546034',  // CAKE by VPBank
    'CBB': '970444',   // CBBank
    'CIMB': '422589',  // CIMB Bank
    'COOPBANK': '970446', // Co-opBank
    'DBS': '796500',   // DBS Bank
    'DOB': '970406',   // DongABank
    'GPB': '970408',   // GPBank
    'HSBC': '458761',  // HSBC
    'IBKVN': '970455', // IBK - Industrial Bank of Korea
    'IVB': '970434',   // IndovinaBank
    'KLB': '970452',   // KienLongBank
    'KBank': '668888', // KBank (Kasikornbank)
    'MAFC': '977777',  // MAFC
    'NCB': '970419',   // NCB (Quoc Dan)
    'NHB': '801011',   // Nonghyup Bank
    'PBVN': '970439',  // PublicBank Vietnam
    'PGB': '970430',   // PGBank
    'PVCB': '970412',  // PVcomBank
    'SCVN': '970410',  // Standard Chartered VN
    'SGICB': '970400', // SaigonBank (SGB)
    'SHBVN': '970424', // Shinhan Bank VN
    'TIMO': '963388',  // Timo by BanViet
    'UOB': '970458',   // UOB Vietnam
    'UBANK': '546035', // Ubank by VPBank
    'VAB': '970427',   // VietABank
    'VBB': '970433',   // Viet Capital Bank (BanViet)
    'VCCB': '970454',  // Viet Credit
    'VIETBANK': '970433', // VietBank
    'VNPTMONEY': '971011', // VNPT Money
    'VRB': '970421',   // VRB
    'VTLMONEY': '971005', // Viettel Money
    'WOO': '970457'    // Woori Bank VN

  };
  
  return bankBins[bankCode.toUpperCase()] || bankCode;
}

/**
 * Get default bank account for a store
 * @param {number} storeId - Store ID (optional)
 * @returns {Promise<Object|null>} Default bank account
 */
async function getDefaultBankAccount(storeId = null) {
  let query;
  let params;

  if (storeId) {
    query = `
      SELECT * FROM dim_bank_accounts 
      WHERE is_active = TRUE 
        AND is_default = TRUE 
        AND (store_id = $1 OR store_id IS NULL)
      ORDER BY store_id DESC NULLS LAST
      LIMIT 1
    `;
    params = [storeId];
  } else {
    query = `
      SELECT * FROM dim_bank_accounts 
      WHERE is_active = TRUE 
        AND is_default = TRUE 
        AND store_id IS NULL
      LIMIT 1
    `;
    params = [];
  }

  const result = await pool.query(query, params);
  return result.rows[0] || null;
}

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  hardDeleteBankAccount,
  generatePaymentQR,
  getDefaultBankAccount
};
