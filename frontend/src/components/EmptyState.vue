<template>
  <div class="orders-empty">
    <img v-if="icon" :src="icon" alt="empty" class="orders-empty-img" />
    <div v-else class="orders-empty-placeholder">
      <i class="fa-regular fa-folder-open"></i>
    </div>
    <div class="orders-empty-title">{{ title }}</div>
    <div class="orders-empty-desc">{{ description }}</div>
    <div v-if="$slots.actions" class="orders-empty-actions">
      <slot name="actions"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  description: String,
});
</script>

<style scoped>
.orders-empty {
  position: absolute;
  left: 0;
  right: 0;
  top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.orders-empty-img {
  width: 80px;
  margin-bottom: 20px;
  opacity: 0.8;
  filter: saturate(0.8);
}
.orders-empty-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 2rem;
  color: #94a3b8;
}
.orders-empty-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1e293b;
  text-align: center;
}
.orders-empty-desc {
  color: #94a3b8;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
  max-width: 360px;
  line-height: 1.5;
}
.orders-empty-actions {
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 12px;
}
</style>
