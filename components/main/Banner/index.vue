<script setup lang="ts">
const colorMode = useColorMode()

const imgSrc = computed(() => colorMode.value === 'dark' ? '/images/banner.webp' : '/images/ende_nea.webp')

function scrollToHead() {
  window.scrollTo({
    top: 732,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="relative h-[732px] w-full">
    <ClientOnly>
      <NuxtImg class="size-full object-cover" :src="imgSrc" alt="ende_nea" />
    </ClientOnly>
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
