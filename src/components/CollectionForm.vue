<template>
  <el-dialog
    :model-value="visible"
    :title="isEditMode ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'"
    width="500px"
    @close="closeDialog"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <el-form-item label="Tên danh mục" prop="name">
        <el-input v-model="form.name" placeholder="Nhập tên danh mục"></el-input>
      </el-form-item>
      <el-form-item label="Mã danh mục" prop="code">
        <el-input v-model="form.code" placeholder="Nhập mã danh mục (e.g., DM001)"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">Hủy</el-button>
        <el-button type="primary" @click="submitForm">Lưu</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: Boolean,
  collection: Object,
});

const emit = defineEmits(['close', 'submit']);

const formRef = ref(null);
const form = ref({ name: '', code: '' });
const isEditMode = ref(false);

const rules = {
  name: [{ required: true, message: 'Tên danh mục không được để trống', trigger: 'blur' }],
  code: [{ required: true, message: 'Mã danh mục không được để trống', trigger: 'blur' }],
};

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    if (props.collection) {
      isEditMode.value = true;
      form.value = { ...props.collection };
    } else {
      isEditMode.value = false;
      form.value = { name: '', code: '' };
    }
  } else {
    formRef.value?.resetFields();
  }
});

const closeDialog = () => {
  emit('close');
};

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', form.value);
    }
  });
};
</script>
