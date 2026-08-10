<script setup lang="ts">
import { computed } from 'vue'
import UiCard from './UiCard.vue'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  helper?: string
  trend?: 'up' | 'down' | 'flat'
  delta?: string
}>(), {
  helper: undefined,
  trend: 'flat',
  delta: undefined,
})

const trendIcon = computed(() => {
  if (props.trend === 'up')
    return 'ri-arrow-up-line'
  if (props.trend === 'down')
    return 'ri-arrow-down-line'
  return 'ri-subtract-line'
})

const trendColor = computed(() => {
  if (props.trend === 'up')
    return 'success'
  if (props.trend === 'down')
    return 'error'
  return 'secondary'
})
</script>

<template>
  <UiCard padding="lg" class="ui-stat-card">
    <div class="ui-stat-card__header">
      <span class="ui-stat-card__label">{{ props.label }}</span>
      <VChip v-if="props.delta" :color="trendColor" size="small" variant="tonal" label>
        <VIcon :icon="trendIcon" size="16" />
        <span class="ui-stat-card__delta">{{ props.delta }}</span>
      </VChip>
    </div>
    <div class="ui-stat-card__value">
      {{ props.value }}
    </div>
    <div v-if="props.helper" class="ui-stat-card__helper">
      {{ props.helper }}
    </div>
  </UiCard>
</template>

<style scoped lang="scss">
.ui-stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.ui-stat-card__label {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ui-stat-card__value {
  font-size: var(--text-3xl);
  font-weight: 600;
  margin-block-start: var(--space-md);
}

.ui-stat-card__helper {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-block-start: var(--space-xs);
}

.ui-stat-card__delta {
  margin-inline-start: 6px;
}
</style>
