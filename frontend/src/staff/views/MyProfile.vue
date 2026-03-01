<template>
  <div class="staff-profile-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fa-solid fa-user-circle"></i> Thông tin cá nhân
      </h1>
    </div>

    <!-- Profile Card -->
    <div class="profile-card">
      <div class="profile-top">
        <div class="left">
          <div class="avatar-wrapper">
            <el-avatar :size="90" :src="fullAvatarUrl" class="avatar" />
            <el-upload
              class="avatar-overlay"
              :show-file-list="false"
              :http-request="uploadAvatarHandler"
              accept="image/*"
            >
              <div class="avatar-overlay-inner">
                <i class="fa-solid fa-camera"></i>
                <span>Đổi ảnh</span>
              </div>
            </el-upload>
          </div>

          <div class="info">
            <div class="name-row">
              <h2 class="profile-name">{{ user.name || "Nhân viên" }}</h2>
              <el-tag
                class="status-tag"
                :type="user.active ? 'success' : 'danger'"
                effect="light"
              >
                {{ user.active ? "Đang hoạt động" : "Đã khóa" }}
              </el-tag>
            </div>

            <div class="meta-row">
              <el-tag class="role-tag" type="primary" effect="light">
                <i class="fa-solid fa-user-tie"></i> Nhân viên
              </el-tag>

              <div class="meta-item">
                <i class="fa-solid fa-envelope"></i>
                <span class="meta-value">{{ user.email }}</span>
              </div>
            </div>

            <div class="member-badge">
              <div class="badge-title">MÃ NHÂN VIÊN</div>
              <div class="badge-sub">
                <b>#{{ user.id ?? "—" }}</b>
              </div>
            </div>
          </div>
        </div>

        <div class="right">
          <el-button
            type="primary"
            size="default"
            @click="openEditDialog"
            :icon="Edit"
          >
            Chỉnh sửa
          </el-button>
        </div>
      </div>

      <el-divider class="divider" />

      <!-- Thông tin cá nhân -->
      <div class="profile-details">
        <div class="section-title">
          <span class="dot"></span>
          <span>Thông tin cá nhân</span>
        </div>

        <el-descriptions :column="isMobile ? 1 : 2" border class="desc">
          <el-descriptions-item label="Số điện thoại">
            <i class="fa-solid fa-phone"></i>
            {{ user.phone || "—" }}
          </el-descriptions-item>
          <el-descriptions-item label="Ngày sinh">
            <i class="fa-solid fa-cake-candles"></i>
            {{ formatDate(user.birthday) || "—" }}
          </el-descriptions-item>
          <el-descriptions-item label="Giới tính">
            <i class="fa-solid fa-venus-mars"></i>
            <span v-if="user.gender === 'male'">Nam</span>
            <span v-else-if="user.gender === 'female'">Nữ</span>
            <span v-else-if="user.gender === 'other'">Khác</span>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item label="Địa chỉ" :span="isMobile ? 1 : 2">
            <i class="fa-solid fa-location-dot"></i>
            {{ user.address || "—" }}
          </el-descriptions-item>
          <el-descriptions-item label="Ngày vào làm" :span="isMobile ? 1 : 2">
            <i class="fa-solid fa-calendar-check"></i>
            {{ formatDate(user.createdAt) || "—" }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider class="divider" />

      <!-- Actions -->
      <div class="profile-actions">
        <el-button
          type="warning"
          plain
          @click="showChangePassword = true"
          :icon="Lock"
        >
          Đổi mật khẩu
        </el-button>

        <el-button type="danger" @click="handleLogout" :icon="SwitchButton">
          Đăng xuất
        </el-button>
      </div>
    </div>

    <!-- Dialog chỉnh sửa thông tin -->
    <el-dialog
      v-model="editMode"
      title="Chỉnh sửa thông tin cá nhân"
      width="420px"
      :fullscreen="isMobile"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        label-width="120px"
        label-position="top"
        ref="editFormRef"
      >
        <el-form-item label="Họ tên" required>
          <el-input
            v-model="editForm.full_name"
            placeholder="Nhập họ tên"
            :disabled="saving"
          />
        </el-form-item>
        <el-form-item label="Số điện thoại">
          <el-input
            v-model="editForm.phone"
            placeholder="Nhập số điện thoại (10-11 số)"
            maxlength="11"
            :disabled="saving"
          />
        </el-form-item>
        <el-form-item label="Ngày sinh">
          <el-date-picker
            v-model="editForm.date_of_birth"
            type="date"
            placeholder="Chọn ngày sinh"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled="saving"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="Giới tính">
          <el-select
            v-model="editForm.gender"
            placeholder="Chọn giới tính"
            style="width: 100%"
            :disabled="saving"
          >
            <el-option label="Nam" value="male" />
            <el-option label="Nữ" value="female" />
            <el-option label="Khác" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Địa chỉ">
          <el-input
            v-model="editForm.address"
            placeholder="Nhập địa chỉ"
            type="textarea"
            :rows="2"
            :disabled="saving"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editMode = false" :disabled="saving">Hủy</el-button>
        <el-button type="primary" @click="saveProfile" :loading="saving">
          Lưu
        </el-button>
      </template>
    </el-dialog>

    <!-- Dialog đổi mật khẩu -->
    <el-dialog
      v-model="showChangePassword"
      title="Đổi mật khẩu"
      width="420px"
      :fullscreen="isMobile"
    >
      <el-form :model="passwordForm" label-width="150px" label-position="top">
        <el-form-item label="Mật khẩu hiện tại">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="Nhập mật khẩu hiện tại"
          />
        </el-form-item>
        <el-form-item label="Mật khẩu mới">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="Nhập mật khẩu mới"
          />
        </el-form-item>
        <el-form-item label="Nhập lại mật khẩu">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="Nhập lại mật khẩu mới"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showChangePassword = false">Hủy</el-button>
        <el-button type="primary" @click="handleChangePassword">
          Đổi mật khẩu
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { Edit, Lock, SwitchButton } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} from "@/services/userService";
import authService from "@/services/authService";
import { getApiUrl } from "@/config/apiUrl";

const router = useRouter();
const isMobile = ref(window.innerWidth < 768);
const saving = ref(false);
const editFormRef = ref(null);

window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth < 768;
});

const user = reactive({
  id: null,
  name: "",
  email: "",
  phone: "",
  birthday: "",
  gender: "",
  address: "",
  avatarUrl: "",
  active: false,
  createdAt: "",
});

const editMode = ref(false);
const showChangePassword = ref(false);

const editForm = reactive({
  full_name: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address: "",
});

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const fullAvatarUrl = computed(() => {
  if (!user.avatarUrl)
    return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
  if (user.avatarUrl.startsWith("http")) return user.avatarUrl;
  return `${getApiUrl()}${user.avatarUrl}`;
});

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function disabledDate(date) {
  // Không cho chọn ngày trong tương lai
  return date > new Date();
}

async function fetchProfile() {
  try {
    const response = await getProfile();
    const data = response.data.data;

    user.id = data.id;
    user.name = data.full_name;
    user.email = data.email;
    user.phone = data.phone;
    user.birthday = data.date_of_birth;
    user.gender = data.gender;
    user.address = data.address;
    user.avatarUrl = data.avatar_url;
    user.active = data.is_active;
    user.createdAt = data.created_at;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    ElMessage.error("Không thể tải thông tin cá nhân");
  }
}

function openEditDialog() {
  editForm.full_name = user.name;
  editForm.phone = user.phone;
  editForm.date_of_birth = user.birthday;
  editForm.gender = user.gender;
  editForm.address = user.address;
  editMode.value = true;
}

async function saveProfile() {
  // Validation
  if (!editForm.full_name || editForm.full_name.trim().length < 2) {
    ElMessage.error("Họ tên phải có ít nhất 2 ký tự");
    return;
  }

  if (editForm.phone && !/^[0-9]{10,11}$/.test(editForm.phone)) {
    ElMessage.error("Số điện thoại phải có 10-11 chữ số");
    return;
  }

  saving.value = true;

  try {
    const payload = {
      full_name: editForm.full_name,
      phone: editForm.phone,
      date_of_birth: editForm.date_of_birth,
      gender: editForm.gender,
      address: editForm.address,
    };

    const response = await updateProfile(payload);
    const data = response.data.data;

    user.name = data.full_name;
    user.phone = data.phone;
    user.birthday = data.date_of_birth;
    user.gender = data.gender;
    user.address = data.address;
    user.avatarUrl = data.avatar_url;

    editMode.value = false;
    ElMessage.success("Cập nhật thông tin thành công!");
  } catch (error) {
    console.error("Update profile error:", error);
    ElMessage.error(
      "Cập nhật thất bại: " +
        (error.response?.data?.message || "Lỗi không xác định"),
    );
  } finally {
    saving.value = false;
  }
}

async function handleChangePassword() {
  if (
    !passwordForm.oldPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    ElMessage.error("Vui lòng nhập đầy đủ thông tin!");
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error("Mật khẩu mới không khớp!");
    return;
  }

  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    });

    showChangePassword.value = false;
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
    ElMessage.success("Đổi mật khẩu thành công!");
  } catch (error) {
    console.error("Change password error:", error);
    ElMessage.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
  }
}

async function uploadAvatarHandler(options) {
  const { file } = options;

  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await uploadAvatar(formData);
    const data = response.data.data;

    user.avatarUrl = data.avatar_url;
    ElMessage.success("Cập nhật ảnh đại diện thành công!");
  } catch (error) {
    console.error("Upload avatar error:", error);
    ElMessage.error("Tải ảnh thất bại!");
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc chắn muốn đăng xuất?",
      "Xác nhận đăng xuất",
      {
        confirmButtonText: "Đăng xuất",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );

    authService.logout();
    router.push("/login");
    ElMessage.success("Đăng xuất thành công!");
  } catch (e) {
    // User cancelled
  }
}

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.staff-profile-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title i {
  color: #3b82f6;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.left {
  display: flex;
  gap: 20px;
  flex: 1;
}

.avatar-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-wrapper .avatar {
  width: 100%;
  height: 100%;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  cursor: pointer;
}

.avatar-overlay :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  border-radius: 50%;
}

.avatar-overlay-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: white;
  font-size: 11px;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-overlay-inner i {
  font-size: 18px;
  color: white;
}

.avatar-wrapper:hover .avatar-overlay-inner {
  opacity: 1;
}

.info {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.profile-name {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.role-tag {
  font-weight: 500;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
}

.meta-value {
  color: #374151;
}

.member-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  margin-top: 8px;
  display: inline-block;
}

.badge-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  opacity: 0.9;
}

.badge-sub {
  font-size: 14px;
  margin-top: 2px;
}

.divider {
  margin: 20px 0;
}

.profile-details {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.dot {
  width: 4px;
  height: 16px;
  background: #3b82f6;
  border-radius: 2px;
}

.desc :deep(.el-descriptions__label) {
  font-weight: 500;
  color: #6b7280;
}

.desc :deep(.el-descriptions__content) {
  color: #1f2937;
}

.desc i {
  margin-right: 6px;
  color: #9ca3af;
}

.profile-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .staff-profile-page {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .profile-card {
    padding: 16px;
  }

  .left {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info {
    width: 100%;
  }

  .name-row,
  .meta-row {
    justify-content: center;
  }

  .profile-actions {
    flex-direction: column;
  }

  .profile-actions .el-button {
    width: 100%;
  }
}
</style>
