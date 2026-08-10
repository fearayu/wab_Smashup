<script setup lang="ts">
import { useAlertDialogStore } from '@/stores/use-alert-dialog-store'

const alertDialogStore = useAlertDialogStore()
const { messageBody, isShowGlobalAlert } = storeToRefs(alertDialogStore)

function onCloseGlobalAlert() {
  alertDialogStore.hideAlert()
}
</script>

<template>
  <AlertDialog
    :is-dialog-visible="isShowGlobalAlert" :alert-msg="messageBody.message" :alert-title="messageBody.title"
    style="z-index: 9999;" @close="onCloseGlobalAlert"
  />
</template>
