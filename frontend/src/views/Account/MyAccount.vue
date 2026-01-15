<template>
  <div class="profile-page">
    <div class="profile-header">
      <el-avatar :size="80" :src="user.avatarUrl" />
      <div class="profile-info">
        <h2 class="profile-name">{{ user.name }}</h2>
        <div class="profile-role">{{ user.role }}</div>
        <el-tag type="success" v-if="user.active">Đang hoạt động</el-tag>
        <el-tag type="danger" v-else>Đã khóa</el-tag>
      </div>
      <el-button type="primary" @click="editMode = true" :icon="Edit"
        >Chỉnh sửa</el-button
      >
    </div>

    <el-divider />

    <div class="profile-details">
      <el-descriptions title="Thông tin cá nhân" :column="1" border>
        <el-descriptions-item label="Email">{{
          user.email
        }}</el-descriptions-item>
        <el-descriptions-item label="Số điện thoại">{{
          user.phone
        }}</el-descriptions-item>
        <el-descriptions-item label="Ngày sinh">{{
          user.birthday
        }}</el-descriptions-item>
        <el-descriptions-item label="Địa chỉ">{{
          user.address
        }}</el-descriptions-item>
        <el-descriptions-item label="Ngày tạo tài khoản">{{
          user.createdAt
        }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider />

    <div class="profile-actions">
      <el-button type="warning" @click="showChangePassword = true" :icon="Lock"
        >Đổi mật khẩu</el-button
      >
      <el-button type="danger" @click="logout" :icon="SwitchButton"
        >Đăng xuất</el-button
      >
    </div>

    <!-- Dialog chỉnh sửa thông tin -->
    <el-dialog
      v-model="editMode"
      title="Chỉnh sửa thông tin cá nhân"
      width="400px"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="Tên">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="Số điện thoại">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="Ngày sinh">
          <el-date-picker
            v-model="editForm.birthday"
            type="date"
            placeholder="Chọn ngày sinh"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Địa chỉ">
          <el-input v-model="editForm.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editMode = false">Hủy</el-button>
        <el-button type="primary" @click="saveProfile">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Dialog đổi mật khẩu -->
    <el-dialog v-model="showChangePassword" title="Đổi mật khẩu" width="400px">
      <el-form :model="passwordForm" label-width="120px">
        <el-form-item label="Mật khẩu hiện tại">
          <el-input v-model="passwordForm.oldPassword" type="password" />
        </el-form-item>
        <el-form-item label="Mật khẩu mới">
          <el-input v-model="passwordForm.newPassword" type="password" />
        </el-form-item>
        <el-form-item label="Nhập lại mật khẩu mới">
          <el-input v-model="passwordForm.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">Hủy</el-button>
        <el-button type="primary" @click="changePassword"
          >Đổi mật khẩu</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Edit, Lock, SwitchButton } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const user = reactive({
  name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "0987654321",
  birthday: "1990-01-01",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  avatarUrl: "https://i.pravatar.cc/150?u=nguyenvana",
  role: "Quản trị viên",
  active: true,
  createdAt: "2023-01-15",
});

const editMode = ref(false);
const showChangePassword = ref(false);

const editForm = reactive({ ...user });
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

function saveProfile() {
  Object.assign(user, editForm);
  editMode.value = false;
  ElMessage.success("Cập nhật thông tin thành công!");
}

function changePassword() {
  if (
    !passwordForm.oldPassword ||
    !passwordForm.newPassword ||
    passwordForm.newPassword !== passwordForm.confirmPassword
  ) {
    ElMessage.error("Vui lòng nhập đúng thông tin mật khẩu!");
    return;
  }
  showChangePassword.value = false;
  ElMessage.success("Đổi mật khẩu thành công!");
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
}

function logout() {
  ElMessage.success("Đã đăng xuất!");
  // Thực hiện chuyển hướng về trang đăng nhập nếu cần
}
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin: 32px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 32px 24px;
  font-family: "Inter", Arial, sans-serif;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}
.profile-info {
  flex: 1;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #111827;
}
.profile-role {
  font-size: 1rem;
  color: #6366f1;
  margin-bottom: 8px;
}
.profile-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  justify-content: flex-end;
}
.profile-details {
  margin-top: 16px;
}
</style>
