<template>
  <div class="page-container">
    <div class="page-header">
      <el-page-header @back="goBack" content="Tạo vận đơn mới"></el-page-header>
    </div>
    <div class="form-container">
      <el-card>
        <el-form :model="form" label-position="top" ref="shipmentForm">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Mã đơn hàng liên quan" prop="orderCode">
                <el-select v-model="form.orderCode" placeholder="Chọn đơn hàng" filterable>
                  <el-option label="DH1235 - Phạm Mỹ Duyên" value="DH1235"></el-option>
                  <el-option label="DH1234 - Trần Văn An" value="DH1234"></el-option>
                  <el-option label="DH1233 - Nguyễn Thị Bình" value="DH1233"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
               <el-form-item label="Đối tác giao hàng" prop="carrier">
                <el-select v-model="form.carrier" placeholder="Chọn đối tác">
                  <el-option label="Giao hàng tiết kiệm" value="GHTK"></el-option>
                  <el-option label="Viettel Post" value="Viettel Post"></el-option>
                  <el-option label="VNPost" value="VNPost"></el-option>
                  <el-option label="Khác" value="Other"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Mã vận đơn (do đối tác cung cấp)" prop="shipmentCode">
            <el-input v-model="form.shipmentCode" placeholder="Nhập mã vận đơn..."></el-input>
          </el-form-item>

          <el-form-item label="Phí vận chuyển (dự kiến)" prop="shippingFee">
            <el-input-number v-model="form.shippingFee" :min="0" :step="1000"></el-input-number>
          </el-form-item>

          <el-form-item label="Ghi chú">
            <el-input type="textarea" v-model="form.notes" :rows="3"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit">Tạo vận đơn</el-button>
            <el-button @click="goBack">Hủy</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const form = ref({
  orderCode: '',
  carrier: '',
  shipmentCode: '',
  shippingFee: 0,
  notes: '',
});

const goBack = () => {
  router.back();
};

const handleSubmit = () => {
  console.log('Form submitted:', form.value);
  ElMessage.success('Tạo vận đơn thành công!');
  // In a real app, you would send data to a server here.
  // Then navigate back to the shipments list.
  router.push({ name: 'Shipments' });
};
</script>

<style scoped>
.page-container {
  padding: 24px 32px;
}
.page-header {
  margin-bottom: 24px;
}
.form-container {
  max-width: 800px;
}
.el-select {
  width: 100%;
}
</style>
