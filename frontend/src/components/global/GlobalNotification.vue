<script setup lang="ts">
import { useNotificationStore } from '@/stores/use-notification-store'

const notificationStore = useNotificationStore()
const { isShowMessage, messageBody } = storeToRefs(notificationStore)
</script>

<template>
  <VSnackbar v-model="isShowMessage" location="bottom center" :color="messageBody.type">
    {{ messageBody.message }}
  </VSnackbar>
</template>
