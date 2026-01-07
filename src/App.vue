<script setup lang="ts">
import { RouterView } from 'vue-router'
import ViewportFrame from '@/components/layout/ViewportFrame.vue'
import NavBar from '@/components/layout/NavBar.vue'
</script>

<template>
  <ViewportFrame>
    <NavBar />
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </ViewportFrame>
</template>
