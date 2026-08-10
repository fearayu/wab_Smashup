<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  tone?: 'surface' | 'subtle'
  elevation?: number
  divider?: boolean
}>(), {
  title: undefined,
  subtitle: undefined,
  padding: 'md',
  tone: 'surface',
  elevation: 1,
  divider: false,
})
</script>

<template>
  <VCard :elevation="props.elevation" class="ui-card" :class="`ui-card--${props.tone}`">
    <VCardItem v-if="props.title || props.subtitle">
      <VCardTitle class="ui-card__title">
        {{ props.title }}
      </VCardTitle>
      <VCardSubtitle v-if="props.subtitle" class="ui-card__subtitle">
        {{ props.subtitle }}
      </VCardSubtitle>
    </VCardItem>

    <VDivider v-if="props.divider" />

    <VCardText :class="`ui-card__content--${props.padding}`">
      <slot />
    </VCardText>

    <VCardActions v-if="$slots.actions" class="ui-card__actions">
      <slot name="actions" />
    </VCardActions>
  </VCard>
</template>

<style scoped lang="scss">
.ui-card {
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.ui-card--surface {
  border-color: var(--color-border);
  background-color: var(--color-surface);
}

.ui-card--subtle {
  border-color: var(--color-border);
  background-color: var(--color-surface-muted);
}

.ui-card__title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.ui-card__subtitle {
  color: var(--color-text-muted);
}

.ui-card__content--none {
  padding: 0;
}

.ui-card__content--sm {
  padding: var(--space-sm);
}

.ui-card__content--md {
  padding: var(--space-lg);
}

.ui-card__content--lg {
  padding: var(--space-xl);
}

.ui-card__actions {
  padding-block: 0 var(--space-lg);
  padding-inline: var(--space-lg);
}
</style>
