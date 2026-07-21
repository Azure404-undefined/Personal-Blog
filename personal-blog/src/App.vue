<script setup lang="ts">
import AppLayout from '@/layout/AppLayout.vue';
</script>

<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  color: #303133;
}
</style>
