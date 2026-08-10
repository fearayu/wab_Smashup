import { defineStore } from 'pinia'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  message: string
  type: NotificationType
}

export const useNotificationStore = defineStore('NotificationStore', {
  state: () => ({
    isShowMessage: false,
    messageBody: {
      message: '',
      type: 'success',
    } as Notification,
  }),
  actions: {
    showNotification(message: string, type: NotificationType = 'success') {
      this.messageBody = { message, type }
      this.isShowMessage = true
    },
    hideNotification() {
      this.isShowMessage = false
    },
  },
})
