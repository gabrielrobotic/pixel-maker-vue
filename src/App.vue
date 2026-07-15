<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppSidebar from "./components/AppSidebar.vue";
</script>

<template>
  <div class="flex h-screen flex-col">
    <AppHeader />

    <main class="flex flex-1 overflow-hidden">
      <AppSidebar />
      <section class="flex-1 bg-neutral-900"></section>
    </main>
  </div>
</template>

<style scoped></style>
