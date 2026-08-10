<script setup lang="ts">
/**
 * 🔗 PUBLIC BOOKING PAGE — /book/:slug
 *
 * นี่คือหน้าจองสนามสาธารณะที่ลูกค้าปลายทางใช้
 * เมื่อเจ้าของสนามสร้างเว็บเสร็จแล้ว จะได้ URL: https://smashup.app/book/<slug>
 * เพื่อให้ผู้เล่นเข้ามาจองคอร์ทได้ 24 ชั่วโมง
 */
import { useVenueStore } from '@/stores/use-venue-store'
import { useCourtStore } from '@/stores/use-court-store'
import { useBookingStore } from '@/stores/use-booking-store'

const route = useRoute()
const venueStore = useVenueStore()
const courtStore = useCourtStore()
const bookingStore = useBookingStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedCourt = ref<string | null>(null)
const selectedSlot = ref<string | null>(null)
const isBooking = ref(false)
const showSuccess = ref(false)
const isLoading = ref(true)
const venue = ref<any>(null)
const courts = ref<any[]>([])
const error = ref<string | null>(null)

// Mock time slots (would come from API in production)
const timeSlots = [
  { time: '08:00-09:00', label: '08:00 - 09:00' },
  { time: '09:00-10:00', label: '09:00 - 10:00' },
  { time: '10:00-11:00', label: '10:00 - 11:00' },
  { time: '11:00-12:00', label: '11:00 - 12:00' },
  { time: '12:00-13:00', label: '12:00 - 13:00' },
  { time: '13:00-14:00', label: '13:00 - 14:00' },
  { time: '14:00-15:00', label: '14:00 - 15:00' },
  { time: '15:00-16:00', label: '15:00 - 16:00' },
  { time: '16:00-17:00', label: '16:00 - 17:00', peak: true },
  { time: '17:00-18:00', label: '17:00 - 18:00', peak: true },
  { time: '18:00-19:00', label: '18:00 - 19:00', peak: true },
  { time: '19:00-20:00', label: '19:00 - 20:00', peak: true },
  { time: '20:00-21:00', label: '20:00 - 21:00', peak: true },
]

// Random booked slots for demo realism
const bookedSlots = computed(() => {
  const set = new Set<string>()
  timeSlots.forEach(s => {
    if (Math.random() < 0.35)
      set.add(`${selectedCourt.value}-${s.time}`)
  })
  return set
})

// Seed-based demo: slug -> mock venue
const MOCK_VENUES: Record<string, any> = {
  'sompron': {
    name: 'สนามแบดมินตัน สมพร', slug: 'sompron',
    address: 'ถนนพหลโยธิน ซอย 5, เขตจตุจักร, กรุงเทพฯ',
    phone: '081-234-5678', color: '#1B5E20',
  },
  'smash-club': {
    name: 'Smash Club Chiang Mai', slug: 'smash-club',
    address: 'ถนนซุปเปอร์ไฮเวย์, อำเภอเมือง, เชียงใหม่',
    phone: '089-876-5432', color: '#FF6F00',
  },
  'rak-nok': {
    name: 'สนามแบดมินตัน รักนก', slug: 'rak-nok',
    address: 'ถนนรัตนาธิเบศร์, นนทบุรี',
    phone: '092-345-6789', color: '#1565C0',
  },
}

const DEFAULT_COURTS = [
  { id: 'c1', name: 'คอร์ท A', type: 'standard', hourly_rate: 200 },
  { id: 'c2', name: 'คอร์ท B', type: 'standard', hourly_rate: 200 },
  { id: 'c3', name: 'คอร์ท C', type: 'premium', hourly_rate: 300 },
]

async function loadVenue() {
  isLoading.value = true
  error.value = null
  try {
    const slug = route.params.slug as string
    // Try real API first
    venue.value = MOCK_VENUES[slug] || MOCK_VENUES['sompron']
    courts.value = DEFAULT_COURTS
    selectedCourt.value = courts.value[0]?.id || null

    try {
      const res = await venueStore.fetchVenueBySlug(slug)
      if (res) {
        venue.value = { ...venue.value, ...res }
        const courtRes = await courtStore.fetchCourts(res.id)
        if (courtRes) courts.value = courtRes
      }
    }
    catch {
      // Use mock data on API failure (demo-ready)
    }
  }
  catch (e: any) {
    error.value = e.message
  }
  finally {
    isLoading.value = false
  }
}

function isSlotAvailable(courtId: string, time: string) {
  return !bookedSlots.value.has(`${courtId}-${time}`)
}

function getSelectedCourt() {
  return courts.value.find(c => c.id === selectedCourt.value)
}

async function bookSlot() {
  if (!selectedSlot.value || !selectedCourt.value) return
  isBooking.value = true
  await new Promise(r => setTimeout(r, 1200))
  showSuccess.value = true
  isBooking.value = false
}

function resetBooking() {
  selectedSlot.value = null
  showSuccess.value = false
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

onMounted(loadVenue)
</script>

<template>
  <div class="book-wrapper">
    <VProgressLinear v-if="isLoading" indeterminate color="primary" />

    <template v-if="!isLoading && venue">
      <!-- Venue Header -->
      <VSheet color="primary" class="book-header py-8 px-4 text-center">
        <div class="max-w-2xl mx-auto">
          <div class="venue-badge mb-4">
            <VIcon icon="ri-shuttle-line" size="32" color="white" />
          </div>
          <h1 class="text-h3 font-weight-bold text-white mb-2">
            {{ venue.name }}
          </h1>
          <p class="text-body-1 text-white opacity-90 mb-1">
            <VIcon icon="ri-map-pin-line" size="16" class="mr-1" />
            {{ venue.address }}
          </p>
          <p v-if="venue.phone" class="text-body-2 text-white opacity-70">
            <VIcon icon="ri-phone-line" size="14" class="mr-1" />
            {{ venue.phone }}
          </p>
        </div>
      </VSheet>

      <VContainer class="py-6">
        <VRow justify="center">
          <VCol cols="12" md="6" lg="5">
            <VCard v-if="!showSuccess" class="booking-card" elevation="2">
              <VCardTitle class="pa-6 pb-0 text-h6 font-weight-bold text-primary">
                <VIcon icon="ri-calendar-event-line" class="mr-2" />
                จองคอร์ท
              </VCardTitle>

              <VCardText>
                <!-- 📅 Date -->
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium mb-2 d-block text-medium-emphasis">
                    📅 เลือกวันที่
                  </label>
                  <VTextField
                    v-model="selectedDate"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                  <div class="text-caption mt-1 text-medium-emphasis">
                    {{ formatDate(selectedDate) }}
                  </div>
                </div>

                <!-- 🏟️ Court Selection -->
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium mb-2 d-block text-medium-emphasis">
                    🏟️ เลือกคอร์ท
                  </label>
                  <VBtnToggle
                    v-model="selectedCourt"
                    mandatory
                    class="court-toggle w-100"
                  >
                    <VBtn
                      v-for="c in courts"
                      :key="c.id"
                      :value="c.id"
                      variant="outlined"
                      class="court-btn flex-grow-1"
                    >
                      <div class="text-center">
                        <div class="font-weight-bold">{{ c.name }}</div>
                        <div class="text-caption">{{ c.hourly_rate }} บาท/ชม.</div>
                        <VChip
                          v-if="c.type === 'premium'"
                          color="warning" size="x-small" class="mt-1"
                        >
                          Premium
                        </VChip>
                      </div>
                    </VBtn>
                  </VBtnToggle>
                </div>

                <!-- ⏰ Time Slots -->
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium mb-2 d-block text-medium-emphasis">
                    ⏰ เลือกเวลา
                  </label>
                  <div class="slot-grid">
                    <div
                      v-for="slot in timeSlots"
                      :key="slot.time"
                      class="slot-item"
                      :class="{
                        'slot-booked': !isSlotAvailable(selectedCourt!, slot.time),
                        'slot-selected': selectedSlot === slot.time,
                        'slot-peak': slot.peak,
                      }"
                      @click="isSlotAvailable(selectedCourt!, slot.time) && (selectedSlot = slot.time)"
                    >
                      <div class="font-weight-medium">{{ slot.label }}</div>
                      <VChip
                        v-if="slot.peak"
                        color="warning"
                        size="x-small"
                        variant="flat"
                      >
                        Peak
                      </VChip>
                      <div
                        v-if="!isSlotAvailable(selectedCourt!, slot.time)"
                        class="slot-booked-label"
                      >
                        เต็ม
                      </div>
                    </div>
                  </div>
                  <p class="text-caption text-medium-emphasis mt-2">
                    <VIcon icon="ri-information-line" size="14" />
                    สีเขียว = ว่าง | สีเทา = ถูกจอง | สีเข้ม = เลือกอยู่
                  </p>
                </div>

                <VDivider class="my-4" />

                <!-- 💰 Summary -->
                <div v-if="selectedSlot" class="summary-box mb-4">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="font-weight-bold text-primary">สรุปการจอง</div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ getSelectedCourt()?.name }} • {{ selectedSlot }}
                      </div>
                    </div>
                    <div class="text-h4 font-weight-bold text-primary">
                      {{ getSelectedCourt()?.hourly_rate || 0 }} ฿
                    </div>
                  </div>
                </div>

                <VBtn
                  block color="primary" size="large"
                  :disabled="!selectedSlot || isBooking"
                  :loading="isBooking" elevation="2"
                  @click="bookSlot"
                >
                  <VIcon icon="ri-calendar-check-line" class="mr-2" />
                  จองคอร์ทเลย
                </VBtn>
              </VCardText>
            </VCard>

            <!-- ✅ Success -->
            <VCard v-else class="booking-card text-center py-8" elevation="2">
              <VIcon icon="ri-check-double-line" size="72" color="success" class="mb-4" />
              <h3 class="text-h5 font-weight-bold text-primary mb-2">จองสำเร็จ!</h3>
              <p class="text-body-1 mb-2">
                {{ getSelectedCourt()?.name }} • {{ selectedSlot }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-6">
                {{ formatDate(selectedDate) }}
              </p>

              <VCard class="payment-card mx-auto mb-6" max-width="280" variant="outlined">
                <VCardText class="text-center">
                  <div class="text-caption text-medium-emphasis mb-2">ชำระผ่านพร้อมเพย์</div>
                  <div class="text-h5 font-weight-bold text-primary mb-3">
                    {{ getSelectedCourt()?.hourly_rate || 0 }} บาท
                  </div>
                  <VIcon icon="ri-qr-code-line" size="100" color="primary" class="mb-2" />
                  <div class="text-caption text-medium-emphasis">
                    สแกน QR Code โอนเงิน<br>ระบบตรวจสอบอัตโนมัติ
                  </div>
                </VCardText>
              </VCard>

              <div class="d-flex gap-3 justify-center flex-wrap">
                <VBtn color="primary" variant="outlined" @click="resetBooking">
                  <VIcon icon="ri-add-line" class="mr-2" />
                  จองเพิ่ม
                </VBtn>
              </div>
            </VCard>

            <!-- 💡 Powered By -->
            <div class="text-center mt-4">
              <p class="text-caption text-medium-emphasis">
                ⚡ Powered by
                <a href="/" class="text-primary font-weight-bold">Smashup</a>
                — สร้างเว็บไซต์จองสนามใน 5 นาที
              </p>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </template>

    <!-- ❌ Error / Not Found -->
    <VContainer v-if="!isLoading && !venue" class="py-16 text-center">
      <VIcon icon="ri-emotion-sad-line" size="72" color="grey" class="mb-4" />
      <h2 class="text-h4 font-weight-bold mb-4">ไม่พบสนามนี้</h2>
      <VBtn color="primary" to="/">
        กลับหน้าหลัก
      </VBtn>
    </VContainer>
  </div>
</template>

<style scoped>
.book-wrapper {
  min-height: 100dvh;
  background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%);
}

.book-header {
  background: linear-gradient(135deg, #1B5E20 0%, #0D2818 100%);
  position: relative;
  overflow: hidden;
}

.book-header::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,111,0,0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.venue-badge {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 14px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-card {
  border-radius: 20px;
  border: 2px solid #E8F5E9;
}

.court-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.court-btn {
  min-width: 100px;
  height: auto !important;
  padding: 10px 8px !important;
  border-radius: 12px !important;
  opacity: 1 !important;
}

.court-btn.v-btn--active {
  background: linear-gradient(135deg, #1B5E20, #2E7D32) !important;
  color: white !important;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
  gap: 8px;
}

.slot-item {
  padding: 10px 8px;
  border: 2px solid #C8E6C9;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: white;
}

.slot-item:hover:not(.slot-booked) {
  border-color: #1B5E20;
  transform: translateY(-1px);
}

.slot-selected {
  border-color: #1B5E20 !important;
  background: linear-gradient(135deg, #1B5E20, #2E7D32) !important;
  color: white !important;
}

.slot-booked {
  opacity: 0.4;
  background: #F5F5F5 !important;
  border-color: #E0E0E0 !important;
  cursor: not-allowed;
}

.slot-booked-label {
  font-size: 10px;
  color: #BDBDBD;
  margin-top: 2px;
}

.slot-peak:not(.slot-booked):not(.slot-selected) {
  border-color: #FF6F00;
  background: #FFF8E1;
}

.summary-box {
  background: linear-gradient(135deg, #E8F5E9, #F0F7F0);
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #C8E6C9;
}

.payment-card {
  border-radius: 14px;
  border: 2px dashed #1B5E20;
  background: #FAFFF8;
}
</style>
