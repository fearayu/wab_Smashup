<script setup lang="ts">
const props = withDefaults(defineProps<{
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger' | 'neutral'
  size?: 'sm' | 'md'
  pill?: boolean
}>(), {
  tone: 'neutral',
  size: 'md',
  pill: false,
})

const toneToColor = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  info: 'info',
  danger: 'error',
  neutral: 'default',
} as const

const sizeToVuetify = {
  sm: 'small',
  md: 'default',
} as const
</script>

<template>
  <VChip
    class="ui-badge"
    :class="[{ 'ui-badge--pill': props.pill }, `ui-badge--${props.tone}`]"
    :color="toneToColor[props.tone]"
    :size="sizeToVuetify[props.size]"
    variant="tonal"
    label
  >
    <slot />
  </VChip>
</template>

<style scoped lang="scss">
.ui-badge {
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.ui-badge--pill {
  border-radius: var(--radius-pill);
}

.ui-badge--neutral {
  color: var(--color-text);
}
</style>
