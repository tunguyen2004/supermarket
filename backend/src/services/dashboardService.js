const db = require('../config/database');

/**
 * ============================================================================
 *                    DASHBOARD SERVICE
 * ============================================================================
 * Service xử lý các API cho trang Dashboard/Reports
 */

/**
 * GET /api/dashboard/overview
 * Lấy số liệu tổng quan cho trang Home Dashboard
 * 
 * Response:
 * - totalOrders: Tổng số đơn hàng
 * - totalProducts: Tổng số sản phẩm đang active
 * - totalCustomers: Tổng số khách hàng
 * - recentOrders: 5 đơn hàng gần nhất
 */
const getOverview = async (req, res) => {
  try {
    // 1. Đếm tổng số đơn hàng
    const ordersResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM fact_orders 
      WHERE status != 'cancelled'
    `);
    const totalOrders = parseInt(ordersResult.rows[0]?.total || 0);

    // 2. Đếm tổng số sản phẩm đang active
    const productsResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM dim_products 
      WHERE is_active = true
    `);
    const totalProducts = parseInt(productsResult.rows[0]?.total || 0);

    // 3. Đếm tổng số khách hàng
    const customersResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM dim_customers
    `);
    const totalCustomers = parseInt(customersResult.rows[0]?.total || 0);


    // 5. Lấy 5 đơn hàng gần nhất
    const recentOrdersResult = await db.query(`
      SELECT 
        o.id,
        o.order_code as code,
        COALESCE(c.full_name, 'Khách lẻ') as "customerName",
        o.date_key as "createdAt",
        o.status,
        o.final_amount as "totalAmount"
      FROM fact_orders o
      LEFT JOIN dim_customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalCustomers,
        recentOrders: recentOrdersResult.rows
      },
      message: 'Dashboard overview retrieved successfully'
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu dashboard',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard/stats
 * Lấy số liệu thống kê cho trang Reports (có so sánh với kỳ trước)
 * 
 * Query params:
 * - from: Ngày bắt đầu (YYYY-MM-DD)
 * - to: Ngày kết thúc (YYYY-MM-DD)
 */
const getStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Default: 30 ngày gần nhất
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate - 30 * 24 * 60 * 60 * 1000);
    
    // Tính khoảng thời gian kỳ trước để so sánh
    const periodLength = (endDate - startDate) / (24 * 60 * 60 * 1000);
    const prevEndDate = new Date(startDate - 1);
    const prevStartDate = new Date(prevEndDate - periodLength * 24 * 60 * 60 * 1000);

    // Format dates cho SQL
    const formatDate = (d) => d.toISOString().split('T')[0];

    // 1. Thống kê kỳ hiện tại
    const currentStats = await db.query(`
      SELECT 
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        CASE WHEN COUNT(*) > 0 
          THEN COALESCE(SUM(final_amount), 0) / COUNT(*) 
          ELSE 0 
        END as avg_order_value
      FROM fact_orders 
      WHERE date_key BETWEEN $1 AND $2
        AND status = 'completed'
        AND payment_status = 'paid'
    `, [formatDate(startDate), formatDate(endDate)]);

    // 2. Thống kê kỳ trước
    const prevStats = await db.query(`
      SELECT 
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        CASE WHEN COUNT(*) > 0 
          THEN COALESCE(SUM(final_amount), 0) / COUNT(*) 
          ELSE 0 
        END as avg_order_value
      FROM fact_orders 
      WHERE date_key BETWEEN $1 AND $2
        AND status = 'completed'
        AND payment_status = 'paid'
    `, [formatDate(prevStartDate), formatDate(prevEndDate)]);

    // 3. Đếm khách hàng mới trong kỳ hiện tại
    const newCustomersResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM dim_customers 
      WHERE created_at BETWEEN $1 AND $2
    `, [formatDate(startDate), formatDate(endDate) + ' 23:59:59']);

    // 4. Đếm khách hàng mới kỳ trước
    const prevNewCustomersResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM dim_customers 
      WHERE created_at BETWEEN $1 AND $2
    `, [formatDate(prevStartDate), formatDate(prevEndDate) + ' 23:59:59']);

    // Lấy giá trị
    const current = currentStats.rows[0];
    const prev = prevStats.rows[0];
    const newCustomers = parseInt(newCustomersResult.rows[0]?.total || 0);
    const prevNewCustomers = parseInt(prevNewCustomersResult.rows[0]?.total || 0);

    // Tính % thay đổi
    const calcChange = (current, prev) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Number((((current - prev) / prev) * 100).toFixed(1));
    };

    const totalRevenue = parseFloat(current.total_revenue || 0);
    const totalOrders = parseInt(current.total_orders || 0);
    const avgOrderValue = parseFloat(current.avg_order_value || 0);

    const prevTotalRevenue = parseFloat(prev.total_revenue || 0);
    const prevTotalOrders = parseInt(prev.total_orders || 0);
    const prevAvgOrderValue = parseFloat(prev.avg_order_value || 0);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        revenueChange: calcChange(totalRevenue, prevTotalRevenue),
        totalOrders,
        ordersChange: calcChange(totalOrders, prevTotalOrders),
        avgOrderValue: Math.round(avgOrderValue),
        avgOrderChange: calcChange(avgOrderValue, prevAvgOrderValue),
        newCustomers,
        customersChange: calcChange(newCustomers, prevNewCustomers),
        period: {
          from: formatDate(startDate),
          to: formatDate(endDate)
        }
      },
      message: 'Dashboard stats retrieved successfully'
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard/revenue-chart
 * Lấy dữ liệu cho biểu đồ doanh thu
 * 
 * Query params:
 * - from: Ngày bắt đầu
 * - to: Ngày kết thúc
 * - groupBy: day | week | month (default: day)
 */
const getRevenueChart = async (req, res) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate - 30 * 24 * 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().split('T')[0];

    let groupExpression, labelFormat;
    
    switch (groupBy) {
      case 'week':
        groupExpression = `DATE_TRUNC('week', date_key)`;
        labelFormat = `TO_CHAR(DATE_TRUNC('week', date_key), 'DD/MM')`;
        break;
      case 'month':
        groupExpression = `DATE_TRUNC('month', date_key)`;
        labelFormat = `TO_CHAR(DATE_TRUNC('month', date_key), 'MM/YYYY')`;
        break;
      default: // day
        groupExpression = `date_key`;
        labelFormat = `TO_CHAR(date_key, 'DD/MM')`;
    }

    const result = await db.query(`
      SELECT 
        ${labelFormat} as label,
        ${groupExpression} as date_group,
        COALESCE(SUM(final_amount), 0) as revenue
      FROM fact_orders 
      WHERE date_key BETWEEN $1 AND $2
        AND status = 'completed'
        AND payment_status = 'paid'
      GROUP BY ${groupExpression}
      ORDER BY date_group ASC
    `, [formatDate(startDate), formatDate(endDate)]);

    const labels = result.rows.map(r => r.label);
    const data = result.rows.map(r => parseFloat(r.revenue));

    return res.status(200).json({
      success: true,
      data: {
        labels,
        datasets: [
          {
            label: 'Doanh thu',
            data
          }
        ]
      },
      message: 'Revenue chart data retrieved successfully'
    });

  } catch (error) {
    console.error('Revenue chart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu biểu đồ doanh thu',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard/top-products
 * Lấy top sản phẩm bán chạy
 * 
 * Query params:
 * - limit: Số lượng sản phẩm (default: 5)
 * - from, to: Khoảng thời gian
 */
const getTopProducts = async (req, res) => {
  try {
    const { limit = 5, from, to } = req.query;
    
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate - 30 * 24 * 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().split('T')[0];

    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        SUM(oi.quantity) as quantity
      FROM fact_order_items oi
      JOIN fact_orders o ON oi.order_id = o.id
      JOIN dim_product_variants pv ON oi.variant_id = pv.id
      JOIN dim_products p ON pv.product_id = p.id
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY quantity DESC
      LIMIT $3
    `, [formatDate(startDate), formatDate(endDate), parseInt(limit)]);

    return res.status(200).json({
      success: true,
      data: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        quantity: parseInt(r.quantity)
      })),
      message: 'Top products retrieved successfully'
    });

  } catch (error) {
    console.error('Top products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy top sản phẩm',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard/sales-channels
 * Phân loại doanh thu theo kênh bán hàng
 */
const getSalesChannels = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate - 30 * 24 * 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().split('T')[0];

    // Giả định payment_method hoặc có thêm trường sales_channel
    // Tạm thời dùng payment_method để demo
    const result = await db.query(`
      SELECT 
        COALESCE(payment_method, 'Tại cửa hàng') as channel,
        COALESCE(SUM(final_amount), 0) as revenue,
        COUNT(*) as order_count
      FROM fact_orders 
      WHERE date_key BETWEEN $1 AND $2
        AND status = 'completed'
        AND payment_status = 'paid'
      GROUP BY payment_method
      ORDER BY revenue DESC
    `, [formatDate(startDate), formatDate(endDate)]);

    // Tính tổng doanh thu để tính phần trăm
    const totalRevenue = result.rows.reduce((sum, r) => sum + parseFloat(r.revenue), 0);

    const data = result.rows.map(r => ({
      channel: r.channel || 'Tại cửa hàng',
      revenue: parseFloat(r.revenue),
      percentage: totalRevenue > 0 
        ? Math.round((parseFloat(r.revenue) / totalRevenue) * 100) 
        : 0
    }));

    // Nếu không có dữ liệu, trả về mock data
    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        data: [
          { channel: 'Tại cửa hàng', percentage: 45, revenue: 0 },
          { channel: 'Giao hàng', percentage: 25, revenue: 0 },
          { channel: 'ShopeeFood', percentage: 20, revenue: 0 },
          { channel: 'GrabMart', percentage: 10, revenue: 0 }
        ],
        message: 'Sales channels retrieved successfully (no data)'
      });
    }

    return res.status(200).json({
      success: true,
      data,
      message: 'Sales channels retrieved successfully'
    });

  } catch (error) {
    console.error('Sales channels error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu kênh bán hàng',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard/top-customers
 * Top khách hàng chi tiêu nhiều nhất
 */
const getTopCustomers = async (req, res) => {
  try {
    const { limit = 5, from, to } = req.query;
    
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate - 30 * 24 * 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().split('T')[0];

    const result = await db.query(`
      SELECT 
        c.id,
        c.full_name as name,
        COALESCE(SUM(o.final_amount), 0) as "totalSpent",
        '' as "avatarUrl"
      FROM dim_customers c
      JOIN fact_orders o ON c.id = o.customer_id
      WHERE o.date_key BETWEEN $1 AND $2
        AND o.status = 'completed'
        AND o.payment_status = 'paid'
      GROUP BY c.id, c.full_name
      ORDER BY "totalSpent" DESC
      LIMIT $3
    `, [formatDate(startDate), formatDate(endDate), parseInt(limit)]);

    return res.status(200).json({
      success: true,
      data: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        totalSpent: parseFloat(r.totalSpent),
        avatarUrl: r.avatarUrl || ''
      })),
      message: 'Top customers retrieved successfully'
    });

  } catch (error) {
    console.error('Top customers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy top khách hàng',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard/low-stock
 * Danh sách sản phẩm sắp hết hàng
 */
const getLowStock = async (req, res) => {
  try {
    const { threshold = 20, limit = 10 } = req.query;

    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        COALESCE(SUM(fis.quantity_on_hand), 0) as stock,
        '' as "imageUrl"
      FROM dim_products p
      LEFT JOIN dim_product_variants pv ON p.id = pv.product_id
      LEFT JOIN fact_inventory_stocks fis ON pv.id = fis.variant_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name
      HAVING COALESCE(SUM(fis.quantity_on_hand), 0) <= $1
      ORDER BY stock ASC
      LIMIT $2
    `, [parseInt(threshold), parseInt(limit)]);

    return res.status(200).json({
      success: true,
      data: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        stock: parseInt(r.stock),
        imageUrl: r.imageUrl || ''
      })),
      message: 'Low stock products retrieved successfully'
    });

  } catch (error) {
    console.error('Low stock error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm sắp hết hàng',
      error: error.message
    });
  }
};

module.exports = {
  getOverview,
  getStats,
  getRevenueChart,
  getTopProducts,
  getSalesChannels,
  getTopCustomers,
  getLowStock
};
