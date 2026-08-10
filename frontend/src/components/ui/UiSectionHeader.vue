<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  align?: 'start' | 'center'
}>(), {
  subtitle: undefined,
  align: 'start',
})
</script>

<template>
  <div class="ui-section" :class="`ui-section--${props.align}`">
    <div class="ui-section__content">
      <div class="ui-section__title">
        {{ props.title }}
      </div>
      <div v-if="props.subtitle" class="ui-section__subtitle">
        {{ props.subtitle }}
      </div>
    </div>
    <div v-if="$slots.actions" class="ui-section__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.ui-section--center {
  flex-direction: column;
  text-align: center;
}

.ui-section__title {
  font-size: var(--text-xl);
  font-weight: 600;
}

.ui-section__subtitle {
  color: var(--color-text-muted);
  margin-block-start: var(--space-xs);
}

.ui-section__actions {
  display: flex;
  gap: var(--space-sm);
}
</style>
