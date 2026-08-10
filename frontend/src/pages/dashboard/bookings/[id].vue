<script setup lang="ts">
import { useBookingStore } from '@/stores/use-booking-store'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()

const { currentBooking, isLoading, error } = storeToRefs(bookingStore)

const bookingId = computed(() => (route.params as any).id as string)

const confirmDialog = ref(false)
const cancelDialog = ref(false)
const isSubmitting = ref(false)

function statusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    case 'completed': return 'info'
    default: return 'default'
  }
}

function paymentStatusColor(status?: string) {
  switch (status) {
    case 'verified': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'default'
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

async function confirmBooking() {
  isSubmitting.value = true
  try {
    await bookingStore.updateBookingStatus(bookingId.value, { status: 'confirmed' })
    confirmDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function cancelBooking() {
  isSubmitting.value = true
  try {
    await bookingStore.updateBookingStatus(bookingId.value, { status: 'cancelled' })
    cancelDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (bookingId.value)
    bookingStore.fetchBookingById(bookingId.value)
})
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12" class="d-flex align-center gap-4">
        <IconBtn @click="router.back()">
          <VIcon icon="ri-arrow-left-line" />
        </IconBtn>
        <h1 class="text-h5 font-weight-bold">
          Booking Detail
        </h1>
      </VCol>
    </VRow>

    <VAlert
      v-if="error"
      type="error"
      class="mb-4"
      :text="error"
      closable
    />

    <VProgressLinear
      v-if="isLoading && !currentBooking"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <template v-if="currentBooking">
      <VRow>
        <VCol cols="12" lg="8">
          <VCard class="mb-4">
            <VCardTitle class="pa-4 d-flex align-center justify-space-between">
              <span class="text-h6">Booking Info</span>
              <VChip size="small" :color="statusColor(currentBooking.status)" variant="tonal">
                {{ currentBooking.status }}
              </VChip>
            </VCardTitle>
            <VDivider />
            <VCardText class="pa-4">
              <VRow>
                <VCol cols="12" md="6">
                  <p class="text-caption text-medium-emphasis mb-1">Player Name</p>
                  <p class="text-body-1 font-weight-medium">{{ currentBooking.player_name }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-caption text-medium-emphasis mb-1">Phone</p>
                  <p class="text-body-1 font-weight-medium">{{ currentBooking.player_phone }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-caption text-medium-emphasis mb-1">Court</p>
                  <p class="text-body-1 font-weight-medium">{{ currentBooking.court?.name || '—' }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-caption text-medium-emphasis mb-1">Venue</p>
                  <p class="text-body-1 font-weight-medium">{{ currentBooking.venue?.name || '—' }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-caption text-medium-emphasis mb-1">Total Amount</p>
                  <p class="text-body-1 font-weight-medium">฿{{ currentBooking.total_amount?.toLocaleString() }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-caption text-medium-emphasis mb-1">Created</p>
                  <p class="text-body-1 font-weight-medium">{{ formatDate(currentBooking.created_at) }}</p>
                </VCol>
                <VCol v-if="currentBooking.notes" cols="12">
                  <p class="text-caption text-medium-emphasis mb-1">Notes</p>
                  <p class="text-body-1">{{ currentBooking.notes }}</p>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <VCard class="mb-4">
            <VCardTitle class="pa-4">
              <span class="text-h6">Time Slots</span>
            </VCardTitle>
            <VDivider />
            <VCardText class="pa-4">
              <div v-if="currentBooking.slots?.length" class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="slot in currentBooking.slots"
                  :key="slot.id"
                  color="primary"
                  variant="tonal"
                >
                  {{ slot.slot_time }}
                </VChip>
              </div>
              <div v-else class="text-body-2 text-medium-emphasis">
                No slot details available.
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" lg="4">
          <VCard class="mb-4">
            <VCardTitle class="pa-4">
              <span class="text-h6">Payment</span>
            </VCardTitle>
            <VDivider />
            <VCardText class="pa-4">
              <div v-if="currentBooking.payment">
                <p class="text-caption text-medium-emphasis mb-1">Status</p>
                <VChip
                  size="small"
                  :color="paymentStatusColor(currentBooking.payment.status)"
                  variant="tonal"
                  class="mb-3"
                >
                  {{ currentBooking.payment.status }}
                </VChip>
                <p class="text-caption text-medium-emphasis mb-1">Amount</p>
                <p class="text-body-1 font-weight-medium mb-3">
                  ฿{{ currentBooking.payment.amount?.toLocaleString() }}
                </p>
                <VImg
                  v-if="currentBooking.payment.slip_image_url"
                  :src="currentBooking.payment.slip_image_url"
                  max-height="300"
                  class="rounded"
                  cover
                />
              </div>
              <div v-else class="text-body-2 text-medium-emphasis">
                No payment record.
              </div>
            </VCardText>
          </VCard>

          <VCard>
            <VCardTitle class="pa-4">
              <span class="text-h6">Actions</span>
            </VCardTitle>
            <VDivider />
            <VCardText class="pa-4 d-flex flex-column gap-3">
              <VBtn
                v-if="currentBooking.status === 'pending'"
                color="success"
                prepend-icon="ri-check-line"
                @click="confirmDialog = true"
              >
                Confirm Booking
              </VBtn>
              <VBtn
                v-if="currentBooking.status !== 'cancelled' && currentBooking.status !== 'completed'"
                color="error"
                variant="outlined"
                prepend-icon="ri-close-line"
                @click="cancelDialog = true"
              >
                Cancel Booking
              </VBtn>
              <VBtn
                variant="text"
                prepend-icon="ri-arrow-left-line"
                to="/dashboard/bookings"
              >
                Back to Bookings
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>

    <VCard v-else-if="!isLoading" class="pa-8 text-center">
      <VIcon icon="ri-file-list-line" size="48" color="grey-lighten-1" class="mb-4" />
      <h3 class="text-h6 mb-2">Booking not found</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        The booking you are looking for does not exist.
      </p>
      <VBtn color="primary" to="/dashboard/bookings">
        Back to Bookings
      </VBtn>
    </VCard>

    <!-- Confirm Dialog -->
    <VDialog v-model="confirmDialog" max-width="400">
      <VCard title="Confirm Booking">
        <VCardText>
          Are you sure you want to confirm this booking?
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="confirmDialog = false">Cancel</VBtn>
          <VBtn color="success" :loading="isSubmitting" @click="confirmBooking">
            Confirm
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Cancel Dialog -->
    <VDialog v-model="cancelDialog" max-width="400">
      <VCard title="Cancel Booking">
        <VCardText>
          Are you sure you want to cancel this booking? This action cannot be undone.
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="cancelDialog = false">Cancel</VBtn>
          <VBtn color="error" :loading="isSubmitting" @click="cancelBooking">
            Cancel Booking
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
