<script setup lang="ts">
const route = useRoute()
const { fullPath } = toRefs(route)
const isHome = computed(() => fullPath.value === '/')
</script>

<template>
  <div class="min-h-screen font-noto">
    <transition name="banner">
      <MainBanner v-if="isHome" />
    </transition>
    <header class="sticky top-0 z-50 w-full">
      <MainHeader />
    </header>
    <main class="relative">
      <div class="mx-auto p-8 md:max-w-[90%] xl:max-w-[70%]">
        <slot />
      </div>
    </main>
    <footer class="bg-white">
      <MainFooter />
    </footer>
  </div>
</template>

<style scoped>
.banner-enter-from,
.banner-leave-to {
  height: 0;
  opacity: 0;
}

.banner-enter-active,
.banner-leave-active {
  transition: all 0.5s ease;
}

.banner-enter-to {
  height: 732px;
  opacity: 1;
}
</style>
