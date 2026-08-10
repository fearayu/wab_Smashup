<script setup lang="ts">
import type { Owner } from '@/models/owner'

const props = defineProps<{
  role: 'admin' | 'member' | 'user'
  size?: 'small' | 'medium' | 'large'
}>()

const roleConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  admin: { label: 'แอดมิน', icon: 'ri-vip-crown-line', color: '#B71C1C', bg: '#FFEBEE' },
  member: { label: 'เจ้าของสนาม', icon: 'ri-shield-user-line', color: '#1B5E20', bg: '#E8F5E9' },
  user: { label: 'ผู้เล่น', icon: 'ri-user-line', color: '#1565C0', bg: '#E3F2FD' },
}

const config = computed(() => roleConfig[props.role] ?? roleConfig.user)
</script>

<template>
  <VChip
    :color="config.color"
    :variant="size === 'large' ? 'flat' : 'tonal'"
    :size="size || 'small'"
    class="font-weight-bold"
    :class="{ 'px-2': size !== 'large' }"
  >
    <VIcon :icon="config.icon" size="14" class="mr-1" />
    {{ config.label }}
  </VChip>
</template>
