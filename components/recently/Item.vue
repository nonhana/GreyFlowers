<script setup lang="ts">
import type { ActivityItem } from '~/types/activity'

defineProps<{
  item: ActivityItem
  index: number
}>()

const opacity = ref(0)
const top = ref('10px')

onMounted(() => {
  floatAnimation(opacity, top)
})

const detailDialogVisible = defineModel<boolean>()

function toggleDetailDialog() {
  detailDialogVisible.value = !detailDialogVisible.value
}
</script>

<template>
  <div class="hana-card p-5" :style="{ transition: `all 0.2s ${index * 0.1}s`, opacity, transform: `translateY(${top})` }">
    <header class="flex justify-between">
      <div class="flex items-center gap-2">
        <HanaAvatar :size="10" :avatar="hanaInfo.avatar" :username="hanaInfo.username" :site="hanaInfo.site" :show-info="false" />
        <div class="flex flex-col gap-1">
          <span class="font-bold text-black dark:text-hana-white">{{ hanaInfo.username }}</span>
          <span class="flex items-center space-x-1 text-sm text-text dark:text-hana-white-700">
            <Icon name="lucide:clock" size="14" />
            <time :datetime="item.publishedAt">{{ item.publishedAt }}</time>
          </span>
        </div>
      </div>
      <HanaTooltip content="查看原文">
        <HanaButton icon-button icon="lucide:external-link" @click="toggleDetailDialog" />
      </HanaTooltip>
    </header>
    <main class="my-5 text-black dark:text-hana-white">
      <p class="whitespace-pre-wrap leading-6">
        {{ item.content }}
      </p>
    </main>
    <footer class="flex items-center justify-between border-t border-primary pt-5 text-text dark:text-hana-white-700">
      <span class="flex items-center space-x-1">
        <Icon name="lucide:at-sign" size="14" />
        <span>{{ item.id }}</span>
      </span>
      <HanaTooltip content="点击评论">
        <HanaButton icon="lucide:message-circle" @click="toggleDetailDialog">
          {{ item.commentCount }}
        </HanaButton>
      </HanaTooltip>
    </footer>
  </div>

  <RecentlyDetailDialog v-model="detailDialogVisible" :item="item" />
</template>
