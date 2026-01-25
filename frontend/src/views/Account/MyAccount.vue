<template>
  <div class="profile-page">
    <!-- Header kiểu "thẻ thành viên siêu thị" -->
    <div class="profile-card">
      <div class="profile-top">
        <div class="left">
          <div class="avatar-wrapper">
            <el-avatar :size="84" :src="fullAvatarUrl" class="avatar" />
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :http-request="uploadAvatarHandler"
              accept="image/*"
            >
              <el-tooltip content="Đổi ảnh đại diện" placement="top">
                <el-button
                  type="primary"
                  circle
                  size="small"
                  :icon="Camera"
                  class="avatar-edit-btn"
                />
              </el-tooltip>
            </el-upload>
          </div>

          <div class="info">
            <div class="name-row">
              <h2 class="profile-name">{{ user.name || "Thành viên" }}</h2>
              <el-tag
                class="status-tag"
                :type="user.active ? 'success' : 'danger'"
                effect="light"
              >
                {{ user.active ? "Đang hoạt động" : "Đã khóa" }}
              </el-tag>
            </div>

            <div class="meta-row">
              <el-tag class="role-tag" type="info" effect="light">
                {{ user.role || "Khách hàng" }}
              </el-tag>

              <div class="meta-item">
                <span class="meta-label">Email:</span>
                <span class="meta-value">{{ user.email }}</span>
              </div>
            </div>

            <div class="member-badge">
              <div class="badge-title">THẺ THÀNH VIÊN</div>
              <div class="badge-sub">
                Mã: <b>#{{ user.id ?? "—" }}</b>
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

        <el-descriptions :column="1" border class="desc">
          <el-descriptions-item label="Số điện thoại">
            {{ user.phone || "—" }}
          </el-descriptions-item>
          <el-descriptions-item label="Ngày sinh">
            {{ user.birthday || "—" }}
          </el-descriptions-item>
          <el-descriptions-item label="Giới tính">
            <span v-if="user.gender === 'male'">Nam</span>
            <span v-else-if="user.gender === 'female'">Nữ</span>
            <span v-else-if="user.gender === 'other'">Khác</span>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item label="Địa chỉ">
            {{ user.address || "—" }}
          </el-descriptions-item>
          <el-descriptions-item label="Ngày tạo tài khoản">
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
      class="nice-dialog"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="Tên">
          <el-input v-model="editForm.full_name" placeholder="Nhập họ tên" />
        </el-form-item>
        <el-form-item label="Số điện thoại">
          <el-input v-model="editForm.phone" placeholder="Nhập số điện thoại" />
        </el-form-item>
        <el-form-item label="Ngày sinh">
          <el-date-picker
            v-model="editForm.date_of_birth"
            type="date"
            placeholder="Chọn ngày sinh"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Giới tính">
          <el-select
            v-model="editForm.gender"
            placeholder="Chọn giới tính"
            style="width: 100%"
          >
            <el-option label="Nam" value="male" />
            <el-option label="Nữ" value="female" />
            <el-option label="Khác" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Địa chỉ">
          <el-input v-model="editForm.address" placeholder="Nhập địa chỉ" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editMode = false">Hủy</el-button>
        <el-button type="primary" @click="saveProfile">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Dialog đổi mật khẩu -->
    <el-dialog
      v-model="showChangePassword"
      title="Đổi mật khẩu"
      width="420px"
      class="nice-dialog"
    >
      <el-form :model="passwordForm" label-width="150px">
        <el-form-item label="Mật khẩu hiện tại">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="Mật khẩu mới">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="Nhập lại mật khẩu">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showChangePassword = false">Hủy</el-button>
        <el-button type="primary" @click="handleChangePassword"
          >Đổi mật khẩu</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { Edit, Lock, SwitchButton, Camera } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus"; // ✅ thêm ElMessageBox
import { useRouter } from "vue-router";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} from "@/services/userService";
import authService from "@/services/authService";

const router = useRouter();

const user = reactive({
  id: null,
  name: "",
  email: "",
  phone: "",
  birthday: "",
  gender: "",
  address: "",
  avatarUrl: "",
  role: "",
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
  return `http://localhost:5000${user.avatarUrl}`;
});

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
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
    user.role = data.role_name;
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
    ElMessage.success("Đổi mật khẩu thành công!");

    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  } catch (error) {
    console.error("Change password error:", error);
    ElMessage.error(
      "Đổi mật khẩu thất bại: " +
        (error.response?.data?.message || "Lỗi không xác định"),
    );
  }
}

async function uploadAvatarHandler(option) {
  try {
    const formData = new FormData();
    formData.append("avatar", option.file);

    const response = await uploadAvatar(formData);
    const data = response.data.data;

    user.avatarUrl = data.avatar_url;
    ElMessage.success("Cập nhật ảnh đại diện thành công!");
  } catch (error) {
    console.error("Upload avatar error:", error);
    ElMessage.error(
      "Upload ảnh thất bại: " +
        (error.response?.data?.message || "Lỗi không xác định"),
    );
  }
}

/** ✅ Thêm alert xác nhận đăng xuất */
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc chắn muốn đăng xuất không?",
      "Xác nhận đăng xuất",
      {
        confirmButtonText: "Đăng xuất",
        cancelButtonText: "Hủy",
        type: "warning",
        autofocus: false,
      },
    );

    await authService.logout();
    ElMessage.success("Đã đăng xuất!");
    router.push("/login");
  } catch (err) {
    // cancel -> không làm gì
    if (err === "cancel" || err === "close") return;

    console.error("Logout error", err);
    // Force logout client side regardless
    localStorage.clear();
    router.push("/login");
  }
}

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
/* Nền kiểu "siêu thị": sạch, tươi, nhẹ */
.profile-page {
  min-height: calc(100vh - 40px);
  padding: 24px 14px;
  background: radial-gradient(
      1200px 500px at 20% 0%,
      #eafff1 0%,
      transparent 60%
    ),
    radial-gradient(900px 450px at 90% 10%, #fff3d6 0%, transparent 55%),
    #f6f7fb;
  font-family: "Inter", Arial, sans-serif;
}

/* Card chính */
.profile-card {
  max-width: 760px;
  margin: 0 auto;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfffc 100%);
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.08);
  padding: 22px 22px 18px;
  border: 1px solid rgba(16, 185, 129, 0.12);
}

/* Header */
.profile-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.left {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* Avatar */
.avatar-wrapper {
  position: relative;
  width: 84px;
  height: 84px;
  flex: 0 0 84px;
}
.avatar {
  border: 3px solid rgba(16, 185, 129, 0.28);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.18);
}
.avatar-edit-btn {
  position: absolute;
  bottom: -6px;
  right: -8px;
  z-index: 10;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}

/* Info */
.info {
  flex: 1;
  min-width: 0;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.profile-name {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.status-tag {
  border-radius: 999px;
}

/* Meta */
.meta-row {
  display: flex;
  gap: 10px 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 8px;
}
.role-tag {
  border-radius: 999px;
}
.meta-item {
  font-size: 0.92rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta-label {
  color: #64748b;
  margin-right: 6px;
}
.meta-value {
  font-weight: 600;
}

/* "Thẻ thành viên" */
.member-badge {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.12),
    rgba(245, 158, 11, 0.1)
  );
  border: 1px dashed rgba(16, 185, 129, 0.25);
}
.badge-title {
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  color: #0f766e;
}
.badge-sub {
  margin-top: 4px;
  font-size: 0.95rem;
  color: #0f172a;
}

.divider {
  margin: 16px 0;
}

/* Section title */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
}
.section-title .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
}

/* Descriptions */
.desc :deep(.el-descriptions__header) {
  margin-bottom: 0;
}
.desc :deep(.el-descriptions__label) {
  font-weight: 700;
  color: #334155;
  background: #f8fafc;
}
.desc :deep(.el-descriptions__content) {
  color: #0f172a;
  font-weight: 600;
}

/* Actions */
.profile-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Dialog đẹp hơn nhẹ */
.nice-dialog :deep(.el-dialog) {
  border-radius: 16px;
}
</style>
