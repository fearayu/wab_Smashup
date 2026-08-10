<script setup lang="ts">
import { usePaymentStore } from '@/stores/use-payment-store'
import type { Payment } from '@/models'

const paymentStore = usePaymentStore()
const { payments, isLoading, error } = storeToRefs(paymentStore)

const statusFilter = ref<string | null>(null)

const statusItems = [
  { title: 'All', value: null },
  { title: 'Pending', value: 'pending' },
  { title: 'Verified', value: 'verified' },
  { title: 'Rejected', value: 'rejected' },
]

const headers = [
  { title: 'Slip', key: 'slip_image_url', sortable: false },
  { title: 'Booking', key: 'booking.player_name' },
  { title: 'Court', key: 'booking.court.name' },
  { title: 'Amount', key: 'booking.total_amount' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'action', sortable: false, align: 'end' as const },
]

const verifyDialog = ref(false)
const rejectDialog = ref(false)
const isSubmitting = ref(false)
const selectedPayment = ref<Payment | null>(null)
const rejectReason = ref('')

function statusColor(status: string) {
  switch (status) {
    case 'verified': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'default'
  }
}

function openVerify(payment: Payment) {
  selectedPayment.value = payment
  verifyDialog.value = true
}

function openReject(payment: Payment) {
  selectedPayment.value = payment
  rejectReason.value = ''
  rejectDialog.value = true
}

async function confirmVerify() {
  if (!selectedPayment.value) return
  isSubmitting.value = true
  try {
    await paymentStore.verifyPayment(selectedPayment.value.id, { status: 'verified' })
    verifyDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmReject() {
  if (!selectedPayment.value) return
  isSubmitting.value = true
  try {
    await paymentStore.verifyPayment(selectedPayment.value.id, { status: 'rejected', reason: rejectReason.value })
    rejectDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function applyFilter() {
  paymentStore.fetchPayments(statusFilter.value || undefined)
}

watch(statusFilter, applyFilter)

onMounted(() => paymentStore.fetchPayments())
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12" class="d-flex align-center justify-space-between flex-wrap gap-4">
        <h1 class="text-h5 font-weight-bold">
          Payment Verification
        </h1>
        <VSelect
          v-model="statusFilter"
          :items="statusItems"
          label="Status"
          density="compact"
          style="min-width: 160px"
          hide-details
          clearable
        />
      </VCol>
    </VRow>

    <VAlert
      v-if="error"
      type="error"
      class="mb-4"
      :text="error"
      closable
    />

    <VCard>
      <VDataTable
        :headers="headers"
        :items="payments"
        :loading="isLoading"
        hover
      >
        <template #item.slip_image_url="{ item }">
          <VImg
            v-if="item.slip_image_url"
            :src="item.slip_image_url"
            width="80"
            height="60"
            class="rounded my-2"
            cover
          />
          <span v-else class="text-caption text-medium-emphasis">No slip</span>
        </template>

        <template #item.booking.player_name="{ item }">
          <div class="text-body-2 font-weight-medium">{{ item.booking?.player_name || '—' }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.booking?.player_phone || '' }}</div>
        </template>

        <template #item.booking.court.name="{ item }">
          {{ item.booking?.court?.name || '—' }}
        </template>

        <template #item.booking.total_amount="{ item }">
          ฿{{ item.booking?.total_amount?.toLocaleString() || '0' }}
        </template>

        <template #item.status="{ item }">
          <VChip size="small" :color="statusColor(item.status)" variant="tonal">
            {{ item.status }}
          </VChip>
        </template>

        <template #item.action="{ item }">
          <template v-if="item.status === 'pending'">
            <IconBtn color="success" @click="openVerify(item)">
              <VTooltip activator="parent" location="top">Verify</VTooltip>
              <VIcon icon="ri-check-line" />
            </IconBtn>
            <IconBtn color="error" @click="openReject(item)">
              <VTooltip activator="parent" location="top">Reject</VTooltip>
              <VIcon icon="ri-close-line" />
            </IconBtn>
          </template>
          <span v-else class="text-caption text-medium-emphasis">—</span>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            No payments to verify. Adjust filters or check back later.
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Verify Dialog -->
    <VDialog v-model="verifyDialog" max-width="400">
      <VCard title="Verify Payment">
        <VCardText>
          Are you sure you want to verify this payment?
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="verifyDialog = false">Cancel</VBtn>
          <VBtn color="success" :loading="isSubmitting" @click="confirmVerify">
            Verify
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Reject Dialog -->
    <VDialog v-model="rejectDialog" max-width="480" persistent>
      <VCard title="Reject Payment">
        <VCardText>
          <p class="mb-4">
            Reject payment for <strong>{{ selectedPayment?.booking?.player_name }}</strong>?
          </p>
          <VTextField
            v-model="rejectReason"
            label="Reason (optional)"
            placeholder="e.g., Amount mismatch, unclear slip"
          />
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="rejectDialog = false">Cancel</VBtn>
          <VBtn color="error" :loading="isSubmitting" :disabled="!rejectReason" @click="confirmReject">
            Reject
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
