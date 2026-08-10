<script setup lang="ts">
import { useBookingStore } from '@/stores/use-booking-store'

const bookingStore = useBookingStore()
const { bookings, isLoading, error } = storeToRefs(bookingStore)

const router = useRouter()

const statusFilter = ref<string | null>(null)
const dateFilter = ref<string>('')

const statusItems = [
  { title: 'All', value: null },
  { title: 'Pending', value: 'pending' },
  { title: 'Confirmed', value: 'confirmed' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'Completed', value: 'completed' },
]

const headers = [
  { title: 'Player', key: 'player_name' },
  { title: 'Court', key: 'court.name' },
  { title: 'Amount', key: 'total_amount' },
  { title: 'Status', key: 'status' },
  { title: 'Date', key: 'created_at' },
]

function statusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    case 'completed': return 'info'
    default: return 'default'
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function applyFilters() {
  const filters: Record<string, any> = {}
  if (statusFilter.value) filters.status = statusFilter.value
  if (dateFilter.value) {
    filters.date_from = dateFilter.value
    filters.date_to = dateFilter.value
  }
  bookingStore.fetchBookings(filters)
}

function goToDetail(item: any) {
  router.push(`/dashboard/bookings/${item.id}`)
}

watch([statusFilter, dateFilter], applyFilters, { immediate: false })

onMounted(() => bookingStore.fetchBookings())
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12" class="d-flex align-center justify-space-between flex-wrap gap-4">
        <h1 class="text-h5 font-weight-bold">
          Bookings
        </h1>
      </VCol>
    </VRow>

    <VRow class="mb-4">
      <VCol cols="12" md="4">
        <VSelect
          v-model="statusFilter"
          :items="statusItems"
          label="Status"
          density="compact"
          hide-details
          clearable
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="dateFilter"
          label="Date"
          type="date"
          density="compact"
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
        :items="bookings"
        :loading="isLoading"
        hover
        @click:row="(_: any, { item }: any) => goToDetail(item)"
      >
        <template #item.total_amount="{ item }">
          ฿{{ item.total_amount?.toLocaleString() }}
        </template>

        <template #item.status="{ item }">
          <VChip size="small" :color="statusColor(item.status)" variant="tonal">
            {{ item.status }}
          </VChip>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            No bookings found. Adjust filters or wait for new bookings.
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>
