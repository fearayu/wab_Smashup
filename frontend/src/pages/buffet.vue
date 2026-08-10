<script setup lang="ts">
const selectedPackage = ref<string | null>(null)
const playerCount = ref(2)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showSuccess = ref(false)
const isBooking = ref(false)

const buffetPackages = [
  { id: 'morning', name: 'Buffet เช้า', time: '08:00 - 12:00', price: 199, desc: 'เล่นไม่อั้น 4 ชั่วโมง', icon: 'ri-sun-line', color: '#FFB400', perks: ['เล่นได้ทุกคอร์ท', 'น้ำดื่มฟรี', 'เปลี่ยนคู่เล่นได้ตลอด'] },
  { id: 'noon', name: 'Buffet กลางวัน', time: '12:00 - 16:00', price: 249, desc: 'เล่นไม่อั้น 4 ชั่วโมง', icon: 'ri-sun-foggy-line', color: '#FF6F00', perks: ['เล่นได้ทุกคอร์ท', 'น้ำดื่ม + ขนมฟรี', 'เปลี่ยนคู่เล่นได้ตลอด', 'รวมค่าลูกขนไก่ 1 หลอด'] },
  { id: 'evening', name: 'Buffet เย็น', time: '16:00 - 21:00', price: 299, desc: 'เล่นไม่อั้น 5 ชั่วโมง', icon: 'ri-moon-line', color: '#1B5E20', perks: ['เล่นได้ทุกคอร์ท', 'น้ำดื่ม + ขนมฟรี', 'เปลี่ยนคู่เล่นได้ตลอด', 'รวมค่าลูกขนไก่ 2 หลอด', 'อาหารว่าง 1 ชุด'] },
]

const selected = computed(() => buffetPackages.find(p => p.id === selectedPackage.value))

function getTotal() {
  if (!selected.value) return 0
  return selected.value.price * playerCount.value
}

async function bookBuffet() {
  isBooking.value = true
  await new Promise(r => setTimeout(r, 1200))
  showSuccess.value = true
  isBooking.value = false
}

function reset() {
  selectedPackage.value = null
  playerCount.value = 2
  showSuccess.value = false
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <VSheet class="page-hero pa-8 mb-6 rounded-lg">
      <div class="d-flex align-center gap-4">
        <div class="hero-icon">
          <VIcon icon="ri-vip-crown-line" size="36" color="white" />
        </div>
        <div>
          <h1 class="text-h4 font-weight-bold text-white mb-1">ตีบุฟเฟ่ต์</h1>
          <p class="text-body-1 text-white opacity-80">เหมาจ่ายราคาเดียว เล่นไม่อั้นในเวลาที่กำหนด</p>
        </div>
      </div>
    </VSheet>

    <VRow>
      <VCol cols="12" lg="8">
        <VCard v-if="!showSuccess" elevation="1" class="section-card">
          <VCardText class="pa-6">
            <div class="d-flex gap-4 mb-6 flex-wrap">
              <div>
                <label class="text-body-2 font-weight-medium mb-2 d-block">📅 วันที่</label>
                <VTextField v-model="selectedDate" type="date" variant="outlined" density="comfortable" hide-details class="max-w-xs" />
                <div class="text-caption mt-1 text-medium-emphasis">{{ formatDate(selectedDate) }}</div>
              </div>
              <div>
                <label class="text-body-2 font-weight-medium mb-2 d-block">👥 จำนวนผู้เล่น</label>
                <div class="d-flex align-center gap-3">
                  <VBtn icon="ri-subtract-line" size="small" variant="outlined" @click="playerCount = Math.max(1, playerCount - 1)" />
                  <span class="text-h5 font-weight-bold text-primary">{{ playerCount }}</span>
                  <VBtn icon="ri-add-line" size="small" variant="outlined" @click="playerCount = Math.min(10, playerCount + 1)" />
                  <span class="text-caption text-medium-emphasis">คน</span>
                </div>
              </div>
            </div>

            <label class="text-body-2 font-weight-medium mb-3 d-block">📦 เลือกแพ็กเกจ</label>
            <div class="package-grid">
              <div
                v-for="pkg in buffetPackages" :key="pkg.id"
                class="package-card"
                :class="{ 'package-selected': selectedPackage === pkg.id }"
                @click="selectedPackage = pkg.id"
              >
                <div class="package-badge" :class="{ 'd-block': selectedPackage === pkg.id }">เลือกแล้ว 🔥</div>
                <VIcon :icon="pkg.icon" :color="pkg.color" size="48" class="mb-3" />
                <div class="text-h6 font-weight-bold mb-1">{{ pkg.name }}</div>
                <div class="text-caption text-medium-emphasis mb-2">{{ pkg.time }}</div>
                <div class="text-h3 font-weight-bold mb-3" :style="{ color: pkg.color }">
                  {{ pkg.price }} <span class="text-caption">฿/คน</span>
                </div>
                <div class="text-body-2 mb-3 text-medium-emphasis">{{ pkg.desc }}</div>
                <div class="perks">
                  <div v-for="perk in pkg.perks" :key="perk" class="perk-item">
                    <VIcon icon="ri-check-line" :color="pkg.color" size="14" class="mr-1" /> {{ perk }}
                  </div>
                </div>
              </div>
            </div>

            <VDivider class="my-6" />
            <div v-if="selected" class="summary-bar pa-4 rounded-lg mb-4">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold">{{ selected.name }}</div>
                  <div class="text-body-2 text-medium-emphasis">{{ playerCount }} คน × {{ selected.price }} ฿</div>
                </div>
                <div class="text-h4 font-weight-bold text-primary">{{ getTotal() }} ฿</div>
              </div>
            </div>
            <VBtn block color="primary" size="large" :disabled="!selectedPackage" :loading="isBooking" elevation="2" @click="bookBuffet">
              <VIcon icon="ri-vip-crown-line" class="mr-2" /> จอง Buffet เลย
            </VBtn>
          </VCardText>
        </VCard>

        <!-- Success -->
        <VCard v-else elevation="1" class="section-card text-center py-10">
          <VIcon icon="ri-check-double-line" size="80" color="success" class="mb-4" />
          <h3 class="text-h4 font-weight-bold text-primary mb-2">จอง Buffet สำเร็จ! 🎉</h3>
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ selected?.name }} • {{ playerCount }} คน • {{ formatDate(selectedDate) }}
          </p>
          <div class="d-flex gap-3 justify-center">
            <VBtn variant="outlined" color="primary" size="large" @click="reset">
              <VIcon icon="ri-add-line" class="mr-2" /> จองเพิ่ม
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <!-- Sidebar Info -->
      <VCol cols="12" lg="4">
        <VCard elevation="0" class="info-card pa-4 mb-4">
          <h3 class="text-h6 font-weight-bold mb-3 text-primary">🎯 ทำไมต้อง Buffet?</h3>
          <VList density="compact" class="bg-transparent pa-0">
            <VListItem class="px-0">
              <template #prepend><VIcon icon="ri-money-baht-circle-line" color="#1B5E20" class="mr-3" /></template>
              <VListItemTitle class="text-body-2">ประหยัดกว่าจองเป็นชั่วโมง</VListItemTitle>
            </VListItem>
            <VListItem class="px-0">
              <template #prepend><VIcon icon="ri-time-line" color="#FF6F00" class="mr-3" /></template>
              <VListItemTitle class="text-body-2">เล่นได้นาน ไม่ต้องกังวลเวลา</VListItemTitle>
            </VListItem>
            <VListItem class="px-0">
              <template #prepend><VIcon icon="ri-user-heart-line" color="#1565C0" class="mr-3" /></template>
              <VListItemTitle class="text-body-2">เปลี่ยนคู่เล่นได้ตลอด</VListItemTitle>
            </VListItem>
            <VListItem class="px-0">
              <template #prepend><VIcon icon="ri-gift-line" color="#C62828" class="mr-3" /></template>
              <VListItemTitle class="text-body-2">รวมน้ำ+ขนม+ลูกขนไก่</VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.page-wrapper { padding: 4px 0; }
.page-hero {
  background: linear-gradient(135deg, #FF6F00 0%, #E65100 100%);
  border-radius: 18px;
}

.hero-icon {
  width: 64px; height: 64px; border-radius: 16px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.section-card { border-radius: 18px; }
.info-card { border-radius: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; }

.package-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }

.package-card {
  border: 2px solid #E2E8F0; border-radius: 18px; padding: 24px 20px;
  text-align: center; cursor: pointer; transition: all 0.3s ease; position: relative;
}
.package-card:hover { border-color: #FF6F00; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(255,111,0,0.12); }
.package-selected { border-color: #FF6F00; background: linear-gradient(135deg, #FFF3E0, #FFF8E1); box-shadow: 0 6px 24px rgba(255,111,0,0.2); }

.package-badge { display: none; position: absolute; top: -12px; right: 16px; background: #FF6F00; color: white; padding: 3px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }

.perks { text-align: left; }
.perk-item { font-size: 13px; color: #475569; margin-bottom: 3px; }

.summary-bar { background: linear-gradient(135deg, #FFF3E0, #FFF8E1); border: 1px solid #FF6F00; }
.max-w-xs { max-width: 200px; }
</style>
