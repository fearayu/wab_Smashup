import { defineStore } from 'pinia'
import { paymentApi } from '@/apis/payment-api'
import type { Payment, VerifyPaymentBody } from '@/models'

export const usePaymentStore = defineStore('PaymentStore', () => {
  const payments = ref<Payment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPayments(status?: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await paymentApi.list({ status })
      payments.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function uploadSlip(bookingId: string, file: File) {
    const formData = new FormData()
    formData.append('slip', file)
    const res = await paymentApi.uploadSlip(bookingId, formData)
    return res.data
  }

  async function verifyPayment(id: string, body: VerifyPaymentBody) {
    const res = await paymentApi.verify(id, body)
    const idx = payments.value.findIndex(p => p.id === id)
    if (idx !== -1) payments.value[idx] = res.data
    return res.data
  }

  return { payments, isLoading, error, fetchPayments, uploadSlip, verifyPayment }
})
