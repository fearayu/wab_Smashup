import { defineStore } from 'pinia'

export const useLoadingOverlayStore = defineStore('LoadingOverlayStore', {
  state: () => ({
    isShowLoading: false,
    message: 'Loading...',
  }),
  actions: {
    showLoading(text = 'Loading...') {
      this.message = text
      this.isShowLoading = true
    },
    hideLoading() {
      this.isShowLoading = false
    },
  },
})
