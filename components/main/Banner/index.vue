<script setup lang="ts">
const colorMode = useColorMode()
const isDark = ref(false)

onMounted(() => isDark.value = colorMode.value === 'dark')
watch(colorMode, () => isDark.value = colorMode.value === 'dark')

function scrollToHead() {
  window.scrollTo({
    top: 732,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="relative h-[732px] w-full">
    <transition name="page">
      <NuxtImg v-if="isDark" class="absolute inset-0 size-full object-cover" src="/images/banner.webp" alt="banner" />
      <NuxtImg v-else class="absolute inset-0 size-full object-cover" src="/images/ende_nea.webp" alt="ende_nea" />
    </transition>
    <div class="absolute left-0 top-0 grid size-full">
      <div class="flex items-center justify-center">
        <MainBannerLogo />
      </div>
    </div>
    <div class="absolute bottom-0 left-0 flex h-40 w-full cursor-pointer items-center justify-center bg-gradient-to-b from-[#00000000] to-[#00000066] opacity-0 duration-300 hover:opacity-100" @click="scrollToHead">
      <Icon name="lucide:circle-arrow-down" class="animate-bounce text-gray-200" size="64" />
    </div>
  </div>
</template>
