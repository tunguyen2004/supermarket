<template>
  <span
    class="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap"
  >
    {{ text }}
  </span>
</template>

<script setup>
defineProps({ text: String });
</script>
