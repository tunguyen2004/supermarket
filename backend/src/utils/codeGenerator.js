/**
 * Code Generator - Sinh mã tuần tự theo pattern: PREFIX-YYYYMMDD-NNNNN
 * Pattern thống nhất cho toàn bộ hệ thống:
 *   - Đơn hàng POS:    POS-20260226-00001
 *   - Xuất kho (POS):   EXP-20260226-00001
 *   - Nhập kho:         IMP-20260226-00001
 *   - Điều chỉnh:       ADJ-20260226-00001
 *   - Nhận hàng:        RCV-20260226-00001
 *   - Chuyển kho:       TRF-20260226-00001
 *   - Trả NCC:          RTN-20260226-00001
 *   - Trả hàng (KH):    RET-20260226-00001
 *   - Hàng hỏng:        DMG-20260226-00001
 *   - Vận đơn:          SHP-20260226-00001
 *   - Phiếu thu:        PT-20260226-00001
 *   - Phiếu chi:        PC-20260226-00001
 *   - Đơn nháp:         DRAFT-20260226-001
 *   - Khách hàng:       KH-202602-00001
 *   - Nhà cung cấp:     NCC-202602-00001
 */

/**
 * Lấy chuỗi ngày YYYYMMDD từ Date object
 * @param {Date} [date] - Ngày cần format (mặc định: hôm nay)
 * @returns {string} VD: "20260226"
 */
function getDateStr(date = new Date()) {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * Sinh mã tuần tự từ DB
 * Pattern: PREFIX-YYYYMMDD-NNNNN
 * 
 * @param {Object} client - pg client (trong transaction)
 * @param {string} prefix - Tiền tố (VD: 'EXP', 'IMP', 'ADJ', 'SHP', 'PT')
 * @param {string} table - Tên bảng để đếm
 * @param {string} codeColumn - Tên cột chứa mã
 * @param {string} [dateStr] - Ngày YYYYMMDD (mặc định: hôm nay)
 * @param {number} [padLength=5] - Độ dài phần số (mặc định: 5)
 * @returns {Promise<string>} VD: "EXP-20260226-00001"
 */
async function generateSequentialCode(client, prefix, table, codeColumn, dateStr = null, padLength = 5) {
  if (!dateStr) {
    dateStr = getDateStr();
  }
  
  const pattern = `${prefix}-${dateStr}-%`;
  const result = await client.query(
    `SELECT COUNT(*) + 1 as next_num FROM ${table} WHERE ${codeColumn} LIKE $1`,
    [pattern]
  );
  
  const nextNum = String(result.rows[0].next_num).padStart(padLength, '0');
  return `${prefix}-${dateStr}-${nextNum}`;
}

/**
 * Sinh mã giao dịch kho (inventory transaction)
 * @param {Object} client - pg client
 * @param {string} prefix - 'EXP'|'IMP'|'ADJ'|'RCV'|'TRF'|'RTN'|'RET'|'DMG'
 * @param {string} [dateStr] - YYYYMMDD
 * @returns {Promise<string>}
 */
async function generateTransactionCode(client, prefix, dateStr = null) {
  return generateSequentialCode(client, prefix, 'fact_inventory_transactions', 'transaction_code', dateStr);
}

/**
 * Sinh mã vận đơn
 * @param {Object} client - pg client
 * @param {string} [dateStr] - YYYYMMDD
 * @returns {Promise<string>}
 */
async function generateShipmentCode(client, dateStr = null) {
  return generateSequentialCode(client, 'SHP', 'fact_shipments', 'shipment_code', dateStr);
}

/**
 * Sinh mã phiếu thu/chi
 * @param {Object} client - pg client
 * @param {string} direction - 'thu'|'chi' → 'PT'|'PC'
 * @param {string} [dateStr] - YYYYMMDD
 * @returns {Promise<string>}
 */
async function generateCashbookCode(client, direction, dateStr = null) {
  const prefix = direction === 'thu' || direction === 1 ? 'PT' : 'PC';
  return generateSequentialCode(client, prefix, 'fact_cashbook_transactions', 'transaction_code', dateStr);
}

module.exports = {
  getDateStr,
  generateSequentialCode,
  generateTransactionCode,
  generateShipmentCode,
  generateCashbookCode,
};
