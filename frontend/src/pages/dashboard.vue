<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import { useVenueStore } from '@/stores/use-venue-store'
import { useBookingStore } from '@/stores/use-booking-store'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const venueStore = useVenueStore()
const bookingStore = useBookingStore()

const summary = computed(() => dashboardStore.summary)

const statCards = computed(() => [
  { title: "Today's Bookings", value: summary.value?.today_bookings ?? 0, icon: 'ri-calendar-check-line', color: 'primary' },
  { title: "Today's Revenue", value: `฿${(summary.value?.today_revenue ?? 0).toLocaleString()}`, icon: 'ri-money-cny-circle-line', color: 'success' },
  { title: 'Pending Verification', value: summary.value?.pending_verification ?? 0, icon: 'ri-time-line', color: 'warning' },
  { title: 'Occupancy Rate', value: `${Math.round((summary.value?.occupancy_rate ?? 0) * 100)}%`, icon: 'ri-bar-chart-line', color: 'info' },
])

const recentBookings = computed(() => bookingStore.bookings.slice(0, 5))

const venue = computed(() => venueStore.venues[0])

onMounted(() => {
  dashboardStore.fetchSummary()
  venueStore.fetchVenues()
  bookingStore.fetchBookings({ limit: 5, date_from: new Date().toISOString().slice(0, 10) })
})

watch(() => authStore.isAuthenticated, (v) => {
  if (!v) router.push('/login')
})
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <h1 class="text-h5 font-weight-bold">
              Dashboard
            </h1>
            <p class="text-body-2 text-medium-emphasis">
              Welcome back, {{ authStore.owner?.name }}
            </p>
          </div>
          <div v-if="venue" class="d-flex align-center gap-2">
            <VChip color="success" variant="tonal" size="small">
              Live
            </VChip>
            <span class="text-body-2">{{ venue.slug }}.smashup.app</span>
            <IconBtn @click="() => {}" />
          </div>
        </div>
      </VCol>
    </VRow>

    <!-- Stats -->
    <VRow class="mb-6">
      <VCol
        v-for="card in statCards"
        :key="card.title"
        cols="6"
        md="3"
      >
        <VCard class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <VIcon :icon="card.icon" :color="card.color" size="28" />
          </div>
          <div class="text-h5 font-weight-bold mb-1">
            {{ card.value }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ card.title }}
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Quick Actions -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard class="pa-4">
          <h3 class="text-h6 font-weight-bold mb-4">
            Quick Actions
          </h3>
          <div class="d-flex gap-3 flex-wrap">
            <VBtn color="primary" prepend-icon="ri-share-line" @click="() => {}" />
            <VBtn variant="outlined" prepend-icon="ri-calendar-line" to="/dashboard/bookings">
              View Bookings
            </VBtn>
            <VBtn variant="outlined" prepend-icon="ri-money-cny-circle-line" to="/dashboard/payments">
              Verify Payments
            </VBtn>
            <VBtn variant="outlined" prepend-icon="ri-settings-line" to="/dashboard/venues">
              Manage Venues
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Recent Bookings -->
    <VRow>
      <VCol cols="12" lg="8">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between pa-4">
            <span class="text-h6">Recent Bookings</span>
            <VBtn variant="text" color="primary" to="/dashboard/bookings">
              View All
            </VBtn>
          </VCardTitle>
          <VDivider />
          <VDataTable
            :items="recentBookings"
            :headers="[
              { title: 'Player', key: 'player_name' },
              { title: 'Court', key: 'court.name' },
              { title: 'Amount', key: 'total_amount' },
              { title: 'Status', key: 'status' },
            ]"
            :loading="bookingStore.isLoading"
          >
            <template #item.total_amount="{ item }">
              ฿{{ item.total_amount?.toLocaleString() }}
            </template>
            <template #item.status="{ item }">
              <VChip
                size="small"
                :color="item.status === 'confirmed' ? 'success' : item.status === 'pending' ? 'warning' : 'error'"
              >
                {{ item.status }}
              </VChip>
            </template>
            <template #no-data>
              <div class="text-center py-8 text-disabled">
                No bookings yet. Share your link to get started.
              </div>
            </template>
          </VDataTable>
        </VCard>
      </VCol>
      <VCol cols="12" lg="4">
        <VCard class="h-100 pa-4">
          <h3 class="text-h6 font-weight-bold mb-4">
            Peak Hours
          </h3>
          <div v-if="summary?.peak_hours?.length">
            <div
              v-for="ph in summary.peak_hours"
              :key="ph.hour"
              class="d-flex align-center mb-3"
            >
              <span class="text-body-2" style="width: 60px">{{ ph.hour }}</span>
              <VProgressLinear
                :model-value="Math.min(ph.bookings * 5, 100)"
                color="primary"
                height="12"
                rounded
                class="flex-grow-1"
              />
              <span class="text-caption ml-2" style="width: 24px">{{ ph.bookings }}</span>
            </div>
          </div>
          <div v-else class="text-center py-8 text-disabled">
            No data yet. Bookings will appear here.
          </div>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
