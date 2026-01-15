<template>
  <div class="orders-empty">
    <img v-if="icon" :src="icon" alt="empty" class="orders-empty-img" />
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
/* ...copy style từ NotData.vue cho .orders-empty... */
.orders-empty {
  position: absolute;
  left: 0;
  right: 0;
  top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.orders-empty-img {
  width: 72px;
  margin-bottom: 16px;
  opacity: 0.95;
}
.orders-empty-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: #222;
  text-align: center;
}
.orders-empty-desc {
  color: #888;
  margin-bottom: 18px;
  text-align: center;
}
.orders-empty-actions {
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 16px;
}
</style>
