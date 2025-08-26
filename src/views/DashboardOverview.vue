<!-- src/views/DashboardOverview.vue -->
<template>
  <div class="dashboard-overview">
    <div class="welcome-banner">
      <img
        src="https://img.icons8.com/color/96/000000/shop.png"
        alt="MiniMart"
      />
      <div>
        <h1>Chào mừng bạn đến với <span class="brand">MiniMart</span>!</h1>
        <p>
          Quản lý cửa hàng dễ dàng, hiệu quả và hiện đại.<br />
          Dưới đây là tổng quan hoạt động nổi bật hôm nay.
        </p>
      </div>
    </div>
    <div class="stats">
      <div class="stat-card">
        <span class="stat-icon orders"></span>
        <h3>Tổng số đơn hàng</h3>
        <p>120</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon products"></span>
        <h3>Tổng số sản phẩm</h3>
        <p>58</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon customers"></span>
        <h3>Tổng số khách hàng</h3>
        <p>34</p>
      </div>
    </div>
    <div class="recent-orders">
      <h3>Đơn hàng gần đây</h3>
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#DH001</td>
            <td>Nguyễn Văn A</td>
            <td>2024-06-01</td>
            <td><span class="status success">Hoàn tất</span></td>
            <td>1.200.000₫</td>
          </tr>
          <tr>
            <td>#DH002</td>
            <td>Trần Thị B</td>
            <td>2024-06-02</td>
            <td><span class="status pending">Đang xử lý</span></td>
            <td>850.000₫</td>
          </tr>
          <tr>
            <td>#DH003</td>
            <td>Lê Văn C</td>
            <td>2024-06-03</td>
            <td><span class="status cancel">Đã huỷ</span></td>
            <td>0₫</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardOverview",
  mounted() {
    console.log("DashboardOverview component loaded");
  },
};
</script>

<style scoped>
.dashboard-overview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  background: #f7f7f9;
  animation: fadeIn 1s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.welcome-banner {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #2196f3 0%, #21cbf3 100%);
  color: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  margin-bottom: 28px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
  gap: 24px;
}
.welcome-banner img {
  width: 72px;
  height: 72px;
  margin-right: 18px;
}
.welcome-banner .brand {
  color: #ffe082;
  font-weight: bold;
  letter-spacing: 1px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 10px;
  margin-bottom: 32px;
}
.stat-card {
  background: #fff;
  padding: 24px 20px 20px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.07);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.stat-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 6px 24px rgba(33, 150, 243, 0.13);
}
.stat-icon {
  display: inline-block;
  width: 38px;
  height: 38px;
  margin-bottom: 10px;
  background-size: contain;
  background-repeat: no-repeat;
}
.stat-icon.orders {
  background-image: url("https://img.icons8.com/color/48/000000/purchase-order.png");
}
.stat-icon.products {
  background-image: url("https://img.icons8.com/color/48/000000/product.png");
}
.stat-icon.customers {
  background-image: url("https://img.icons8.com/color/48/000000/user-group-man-man.png");
}
.stat-card h3 {
  margin: 0 0 8px;
  color: #2196f3;
  font-size: 1.1rem;
}
.stat-card p {
  font-size: 2.2rem;
  color: #222;
  margin: 0;
  font-weight: 700;
  letter-spacing: 1px;
}
.recent-orders {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.07);
  padding: 24px;
  margin-top: 12px;
}
.recent-orders h3 {
  margin-bottom: 16px;
  color: #2196f3;
}
.recent-orders table {
  width: 100%;
  border-collapse: collapse;
  background: #fafbfc;
  border-radius: 8px;
  overflow: hidden;
}
.recent-orders th,
.recent-orders td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}
.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.97rem;
  font-weight: 500;
  color: #fff;
  display: inline-block;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.07);
}
.status.success {
  background: #43a047;
}
.status.pending {
  background: #fbc02d;
  color: #222;
}
.status.cancel {
  background: #e53935;
}
</style>
