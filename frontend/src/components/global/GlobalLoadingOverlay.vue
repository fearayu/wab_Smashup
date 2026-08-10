<script setup lang="ts">
import { useLoadingOverlayStore } from '@/stores/use-loading-overlay-store'

const loadingOverlayStore = useLoadingOverlayStore()
const { message, isShowLoading } = storeToRefs(loadingOverlayStore)
</script>

<template>
  <VDialog v-model="isShowLoading" persistent width="300">
    <VCard color="primary" width="300">
      <VCardText class="pt-3 text-white">
        {{ message }}
        <VProgressLinear indeterminate class="mt-4" color="#fff" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
