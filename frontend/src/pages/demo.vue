<script setup lang="ts">
import { useBookingStore } from '@/stores/use-booking-store'
import { useSlotStore } from '@/stores/use-slot-store'

const router = useRouter()
const bookingStore = useBookingStore()
const slotStore = useSlotStore()

// Mock demo venue
const demoVenue = {
  id: 'demo-venue-001',
  name: 'สนามแบดมินตัน สมพร',
  address: 'ถนนพหลโยธิน ซอย 5, กรุงเทพฯ',
  phone: '081-234-5678',
  courts: [
    { id: 'court-a', name: 'คอร์ท A', price: 250 },
    { id: 'court-b', name: 'คอร์ท B', price: 250 },
    { id: 'court-c', name: 'คอร์ท C (Premium)', price: 350 },
    { id: 'court-d', name: 'คอร์ท D (Premium)', price: 350 },
  ],
}

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedCourt = ref(demoVenue.courts[0].id)
const selectedSlot = ref<string | null>(null)
const isBooking = ref(false)
const showSuccess = ref(false)

// Generate mock slots for demo
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

// Randomly mark some slots as booked for realism
const bookedSlots = computed(() => {
  const slots = new Set<string>()
  // Mark ~40% of slots as booked randomly
  timeSlots.forEach((slot, idx) => {
    if (Math.random() < 0.4) {
      slots.add(`${selectedCourt.value}-${slot.time}`)
    }
  })
  return slots
})

function isSlotAvailable(courtId: string, time: string) {
  return !bookedSlots.value.has(`${courtId}-${time}`)
}

function getSlotPrice() {
  const court = demoVenue.courts.find(c => c.id === selectedCourt.value)
  return court?.price || 250
}

async function bookSlot() {
  if (!selectedSlot.value) return
  
  isBooking.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    showSuccess.value = true
  } catch (e) {
    console.error('Booking failed', e)
  } finally {
    isBooking.value = false
  }
}

function resetBooking() {
  selectedSlot.value = null
  showSuccess.value = false
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<template>
  <div class="demo-wrapper">
    <!-- Header -->
    <VSheet color="primary" class="hero-section py-12 px-4 text-center">
      <div class="max-w-2xl mx-auto">
        <VChip color="accent" class="mb-4 font-weight-bold" size="large">
          <VIcon icon="ri-flashlight-line" class="mr-2" />
          DEMO MODE — ทดลองจองได้จริง!
        </VChip>
        <h1 class="text-h3 font-weight-bold text-white mb-4">
          จองสนามแบดมินตัน<br>ในไม่กี่คลิก
        </h1>
        <p class="text-h6 text-white opacity-90">
          ระบบนี้คือตัวอย่างที่ลูกค้าของคุณจะเห็น<br>
          เมื่อคุณสร้างเว็บไซต์ด้วย Smashup
        </p>
      </div>
    </VSheet>

    <VContainer class="py-8">
      <VRow justify="center">
        <VCol cols="12" md="8">
          <!-- Venue Info Card -->
          <VCard class="mb-6 venue-card" elevation="2">
            <VCardItem>
              <template #prepend>
                <div class="venue-icon-wrapper">
                  <VIcon icon="ri-shuttle-line" size="32" color="white" />
                </div>
              </template>
              <VCardTitle class="text-h5 font-weight-bold text-primary">
                {{ demoVenue.name }}
              </VCardTitle>
              <VCardSubtitle>
                <VIcon icon="ri-map-pin-line" size="16" class="mr-1" />
                {{ demoVenue.address }}
              </VCardSubtitle>
            </VCardItem>
            <VCardText>
              <div class="d-flex gap-4 flex-wrap">
                <VChip color="success" variant="tonal" size="small">
                  <VIcon icon="ri-check-line" class="mr-1" />
                  4 คอร์ท
                </VChip>
                <VChip color="info" variant="tonal" size="small">
                  <VIcon icon="ri-time-line" class="mr-1" />
                  08:00 - 21:00
                </VChip>
                <VChip color="warning" variant="tonal" size="small">
                  <VIcon icon="ri-money-baht-circle-line" class="mr-1" />
                  250 - 350 บาท/ชม.
                </VChip>
              </div>
            </VCardText>
          </VCard>

          <!-- Booking Form -->
          <VCard class="booking-card" elevation="2">
            <VCardTitle class="text-h6 font-weight-bold text-primary pa-6 pb-2">
              เลือกวันและเวลา
            </VCardTitle>
            
            <VCardText v-if="!showSuccess">
              <!-- Date Picker -->
              <div class="mb-4">
                <label class="text-body-2 font-weight-medium text-medium-emphasis mb-2 d-block">
                  เลือกวันที่
                </label>
                <VTextField
                  v-model="selectedDate"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="max-w-xs"
                />
                <p class="text-caption text-medium-emphasis mt-1">
                  {{ formatDate(selectedDate) }}
                </p>
              </div>

              <!-- Court Selection -->
              <div class="mb-4">
                <label class="text-body-2 font-weight-medium text-medium-emphasis mb-2 d-block">
                  เลือกคอร์ท
                </label>
                <VBtnToggle
                  v-model="selectedCourt"
                  mandatory
                  class="court-toggle"
                >
                  <VBtn
                    v-for="court in demoVenue.courts"
                    :key="court.id"
                    :value="court.id"
                    variant="outlined"
                    class="court-btn"
                  >
                    <div class="text-center">
                      <div class="font-weight-bold">{{ court.name }}</div>
                      <div class="text-caption">{{ court.price }} บาท/ชม.</div>
                    </div>
                  </VBtn>
                </VBtnToggle>
              </div>

              <!-- Time Slots -->
              <div class="mb-4">
                <label class="text-body-2 font-weight-medium text-medium-emphasis mb-2 d-block">
                  เลือกเวลา
                </label>
                <div class="d-flex gap-2 flex-wrap">
                  <VBtn
                    v-for="slot in timeSlots"
                    :key="slot.time"
                    :disabled="!isSlotAvailable(selectedCourt, slot.time)"
                    :color="selectedSlot === slot.time ? 'primary' : undefined"
                    :variant="selectedSlot === slot.time ? 'flat' : 'outlined'"
                    size="small"
                    class="slot-btn"
                    @click="selectedSlot = slot.time"
                  >
                    <div class="text-center">
                      <div class="font-weight-medium">{{ slot.label }}</div>
                      <VChip
                        v-if="slot.peak"
                        color="warning"
                        size="x-small"
                        class="mt-1"
                      >
                        Peak
                      </VChip>
                    </div>
                  </VBtn>
                </div>
                <p class="text-caption text-medium-emphasis mt-2">
                  <VIcon icon="ri-information-line" size="14" />
                  ช่วงเวลาที่มีสีเทาคือถูกจองแล้ว
                </p>
              </div>

              <!-- Price Summary -->
              <VDivider class="my-4" />
              
              <div v-if="selectedSlot" class="price-summary mb-4">
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-h6 font-weight-bold text-primary">
                      สรุปการจอง
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ demoVenue.courts.find(c => c.id === selectedCourt)?.name }} • {{ selectedSlot }}
                    </div>
                  </div>
                  <div class="text-h4 font-weight-bold text-primary">
                    {{ getSlotPrice() }} ฿
                  </div>
                </div>
              </div>

              <!-- Book Button -->
              <VBtn
                block
                color="primary"
                size="large"
                :disabled="!selectedSlot || isBooking"
                :loading="isBooking"
                elevation="2"
                @click="bookSlot"
              >
                <VIcon icon="ri-calendar-check-line" class="mr-2" />
                จองคอร์ทเลย
              </VBtn>
            </VCardText>

            <!-- Success State -->
            <VCardText v-else class="text-center py-8">
              <VIcon icon="ri-check-double-line" size="64" color="success" class="mb-4" />
              <h3 class="text-h5 font-weight-bold text-primary mb-2">
                จองสำเร็จ!
              </h3>
              <p class="text-body-1 mb-6">
                คุณได้จอง {{ demoVenue.courts.find(c => c.id === selectedCourt)?.name }}<br>
                วันที่ {{ formatDate(selectedDate) }} เวลา {{ selectedSlot }}
              </p>
              <VCard class="payment-card mb-6 mx-auto max-w-sm" color="surface" variant="outlined">
                <VCardText class="text-center">
                  <div class="text-caption text-medium-emphasis mb-2">ชำระเงินผ่านพร้อมเพย์</div>
                  <div class="text-h6 font-weight-bold text-primary mb-2">
                    {{ getSlotPrice() }} บาท
                  </div>
                  <VIcon icon="ri-qr-code-line" size="120" color="primary" class="mb-2" />
                  <div class="text-caption text-medium-emphasis">
                    สแกน QR Code เพื่อชำระเงิน<br>
                    ระบบจะตรวจสอบสลิปอัตโนมัติ
                  </div>
                </VCardText>
              </VCard>
              <div class="d-flex gap-3 justify-center">
                <VBtn color="primary" variant="outlined" @click="resetBooking">
                  <VIcon icon="ri-arrow-left-line" class="mr-2" />
                  จองเพิ่ม
                </VBtn>
                <VBtn color="accent" to="/login">
                  <VIcon icon="ri-rocket-line" class="mr-2" />
                  สร้างเว็บไซต์ของฉัน
                </VBtn>
              </div>
            </VCardText>
          </VCard>

          <!-- Features -->
          <VRow class="mt-6">
            <VCol cols="12" sm="4">
              <div class="text-center">
                <VIcon icon="ri-calendar-check-line" size="40" color="primary" class="mb-2" />
                <div class="font-weight-bold text-primary">จองเรียลไทม์</div>
                <div class="text-caption text-medium-emphasis">เห็นคอร์ทว่างทันที</div>
              </div>
            </VCol>
            <VCol cols="12" sm="4">
              <div class="text-center">
                <VIcon icon="ri-shield-check-line" size="40" color="primary" class="mb-2" />
                <div class="font-weight-bold text-primary">ป้องกันคิวชน</div>
                <div class="text-caption text-medium-emphasis">ระบบล็อกคิวอัตโนมัติ</div>
              </div>
            </VCol>
            <VCol cols="12" sm="4">
              <div class="text-center">
                <VIcon icon="ri-smartphone-line" size="40" color="primary" class="mb-2" />
                <div class="font-weight-bold text-primary">ใช้งานง่าย</div>
                <div class="text-caption text-medium-emphasis">บนมือถือและคอมพิวเตอร์</div>
              </div>
            </VCol>
          </VRow>
        </VCol>
      </VRow>
    </VContainer>

    <!-- CTA Footer -->
    <VSheet color="primary" class="py-8 px-4 text-center mt-8">
      <div class="max-w-xl mx-auto">
        <h2 class="text-h5 font-weight-bold text-white mb-4">
          อยากมีเว็บไซต์จองสนามแบบนี้?
        </h2>
        <p class="text-body-1 text-white opacity-90 mb-6">
          สร้างฟรีใน 5 นาที ไม่ต้องเขียนโค้ด
        </p>
        <VBtn
          color="accent"
          size="large"
          variant="elevated"
          class="text-white font-weight-bold px-8"
          to="/login"
        >
          <VIcon icon="ri-add-circle-line" class="mr-2" />
          เริ่มสร้างเว็บไซต์ฟรี
        </VBtn>
      </div>
    </VSheet>
  </div>
</template>

<style scoped>
.demo-wrapper {
  min-height: 100dvh;
  background: #F8FAFC;
}

.hero-section {
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #1B5E20 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 111, 0, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.venue-card {
  border-radius: 16px;
  border: 2px solid #E8F5E9;
}

.venue-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-card {
  border-radius: 16px;
}

.court-toggle {
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.court-btn {
  min-width: 140px;
  max-width: calc(50% - 5px);
  height: auto !important;
  padding: 16px 12px !important;
  border-radius: 12px !important;
  flex: 0 1 auto;
}

.court-btn.v-btn--active {
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%) !important;
  color: white !important;
}

.slot-btn {
  min-width: 110px;
  height: auto !important;
  padding: 10px 14px !important;
  border-radius: 10px !important;
  position: relative;
}

.slot-btn .v-chip {
  margin-top: 4px !important;
}

.slot-btn.v-btn--disabled {
  opacity: 0.4;
  background: #EEEEEE !important;
}

.price-summary {
  background: linear-gradient(135deg, #E8F5E9 0%, #F0F7F0 100%);
  padding: 16px;
  border-radius: 12px;
}

.payment-card {
  border-radius: 12px;
  border: 2px dashed #1B5E20;
}

.max-w-xs {
  max-width: 200px;
}

.max-w-sm {
  max-width: 300px;
}
</style>