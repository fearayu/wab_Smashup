<script setup lang="ts">
const props = withDefaults(defineProps<{
  tone?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  loading?: boolean
  disabled?: boolean
  prependIcon?: string
  appendIcon?: string
}>(), {
  tone: 'primary',
  size: 'md',
  block: false,
  loading: false,
  disabled: false,
  prependIcon: undefined,
  appendIcon: undefined,
})

const toneToVariant = {
  primary: 'flat',
  secondary: 'tonal',
  ghost: 'text',
  outline: 'outlined',
  success: 'flat',
  danger: 'flat',
} as const

const toneToColor = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'default',
  outline: 'primary',
  success: 'success',
  danger: 'error',
} as const

const sizeToVuetify = {
  sm: 'small',
  md: 'default',
  lg: 'large',
} as const
</script>

<template>
  <VBtn
    class="ui-button"
    :class="`ui-button--${props.tone}`"
    :color="toneToColor[props.tone]"
    :variant="toneToVariant[props.tone]"
    :size="sizeToVuetify[props.size]"
    :block="props.block"
    :loading="props.loading"
    :disabled="props.disabled"
    :prepend-icon="props.prependIcon"
    :append-icon="props.appendIcon"
  >
    <slot />
  </VBtn>
</template>

<style scoped lang="scss">
.ui-button {
  border-radius: var(--radius-md);
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
}

.ui-button--ghost {
  color: var(--color-text);
}

.ui-button--outline {
  border-color: var(--color-border);
}
</style>
