import { defineStore } from 'pinia'

interface AlertDialogMessage {
  title: string
  message: string
}

export const useAlertDialogStore = defineStore('AlertDialogStore', {
  state: () => ({
    isShowGlobalAlert: false,
    messageBody: {
      title: '',
      message: '',
    } as AlertDialogMessage,
  }),
  actions: {
    showAlert(title: string, message: string) {
      this.messageBody = { title, message }
      this.isShowGlobalAlert = true
    },
    hideAlert() {
      this.isShowGlobalAlert = false
    },
  },
})
