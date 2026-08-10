<script setup lang="ts">
/**
 * 🍽️ BUFFET BADMINTON — /buffet
 * ตีบุฟเฟ่ต์: เหมาจ่ายราคาเดียว เล่นไม่อั้นในช่วงเวลาที่กำหนด
 */
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
  // Premium courts add 50฿ per person
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

// Gangs mock data
const upcomingGangs = [
  { id: 'g1', name: 'ก๊วนตีมันส์ Friday', host: 'พี่โจ้', players: 4, max: 8, level: 'กลาง', time: 'ศุกร์ 18:00', court: 'คอร์ท A+B' },
  { id: 'g2', name: 'ก๊วน Weekend Warrior', host: 'น้องมิน', players: 6, max: 12, level: 'สูง', time: 'เสาร์ 14:00', court: 'คอร์ท C+D' },
  { id: 'g3', name: 'ก๊วนสายชิล', host: 'พี่บอล', players: 2, max: 4, level: 'เริ่มต้น', time: 'พุธ 10:00', court: 'คอร์ท A' },
]

// Food mock data
const foodCategories = [
  { name: 'เครื่องดื่ม', icon: 'ri-cup-line' },
  { name: 'ขนม/ของว่าง', icon: 'ri-cake-2-line' },
  { name: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
]

const foodMenu = [
  { id: 'f1', name: 'น้ำเปล่า', price: 10, cat: 'เครื่องดื่ม', icon: 'ri-drop-line' },
  { id: 'f2', name: 'น้ำอัดลม', price: 20, cat: 'เครื่องดื่ม', icon: 'ri-drinks-line' },
  { id: 'f3', name: 'เกเตอเรด', price: 30, cat: 'เครื่องดื่ม', icon: 'ri-flashlight-line' },
  { id: 'f4', name: 'ชาเขียว', price: 35, cat: 'เครื่องดื่ม', icon: 'ri-goblet-line' },
  { id: 'f5', name: 'มันฝรั่งทอด', price: 45, cat: 'ขนม/ของว่าง', icon: 'ri-restaurant-line' },
  { id: 'f6', name: 'นักเก็ตไก่', price: 55, cat: 'ขนม/ของว่าง', icon: 'ri-restaurant-2-line' },
  { id: 'f7', name: 'ข้าวผัดกระเพรา', price: 60, cat: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
  { id: 'f8', name: 'ข้าวไข่เจียว', price: 50, cat: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
]

const activeTab = ref<'buffet' | 'gang' | 'food'>('buffet')
const cart = ref<Record<string, number>>({})
const foodOrdered = ref(false)

function addToCart(foodId: string) {
  cart.value[foodId] = (cart.value[foodId] || 0) + 1
}

function removeFromCart(foodId: string) {
  if (cart.value[foodId] > 0) cart.value[foodId]--
  if (cart.value[foodId] === 0) delete cart.value[foodId]
}

const cartTotal = computed(() => {
  return Object.entries(cart.value).reduce((sum, [id, qty]) => {
    const item = foodMenu.find(f => f.id === id)
    return sum + (item?.price || 0) * qty
  }, 0)
})

const cartItems = computed(() => {
  return Object.entries(cart.value).map(([id, qty]) => ({ ...foodMenu.find(f => f.id === id)!, qty }))
})

function submitOrder() {
  foodOrdered.value = true
  setTimeout(() => {
    foodOrdered.value = false
    cart.value = {}
  }, 3000)
}
</script>

<template>
  <div class="buffet-wrapper">
    <!-- Header -->
    <VSheet color="primary" class="py-10 px-4 text-center">
      <h1 class="text-h3 font-weight-bold text-white mb-2">
        🏸 ฟีเจอร์ครบ จบในที่เดียว
      </h1>
      <p class="text-body-1 text-white opacity-90">
        ตีบุฟเฟ่ต์ • ตีก๊วน • สั่งอาหาร — ทุกอย่างที่สนามของคุณต้องการ
      </p>
    </VSheet>

    <!-- Tab Selector -->
    <VContainer class="py-6">
      <VCard class="tab-card" elevation="1">
        <div class="d-flex">
          <div
            v-for="tab in [
              { key: 'buffet' as const, label: '🍽️ ตีบุฟเฟ่ต์', desc: 'เหมาจ่าย เล่นไม่อั้น' },
              { key: 'gang' as const, label: '👥 ตีก๊วน', desc: 'จัดกลุ่ม จับคู่' },
              { key: 'food' as const, label: '🍔 สั่งอาหาร', desc: 'เมนูส่งตรงถึงคอร์ท' },
            ]"
            :key="tab.key"
            class="tab-item flex-1-1"
            :class="{ 'tab-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <div class="tab-label">{{ tab.label }}</div>
            <div class="tab-desc">{{ tab.desc }}</div>
          </div>
        </div>
      </VCard>
    </VContainer>

    <!-- =========================== -->
    <!-- 🍽️ BUFFET SECTION           -->
    <!-- =========================== -->
    <VContainer v-if="activeTab === 'buffet'">
      <VRow justify="center">
        <VCol cols="12" md="8" lg="6">
          <VCard v-if="!showSuccess" elevation="2" class="section-card">
            <VCardTitle class="pa-6 pb-0">
              <div class="d-flex align-center gap-3">
                <div class="section-icon" style="background: linear-gradient(135deg, #FF6F00, #FFB400)">
                  <VIcon icon="ri-vip-crown-line" size="28" color="white" />
                </div>
                <div>
                  <div class="text-h6 font-weight-bold">เลือกแพ็กเกจ Buffet</div>
                  <div class="text-caption text-medium-emphasis">เหมาจ่าย เล่นไม่อั้นในเวลาที่กำหนด</div>
                </div>
              </div>
            </VCardTitle>

            <VCardText class="pa-6">
              <!-- 📅 Date -->
              <div class="mb-4">
                <label class="text-body-2 font-weight-medium mb-2 d-block">📅 วันที่</label>
                <VTextField
                  v-model="selectedDate" type="date" variant="outlined" density="comfortable" hide-details class="max-w-xs"
                />
                <div class="text-caption mt-1 text-medium-emphasis">{{ formatDate(selectedDate) }}</div>
              </div>

              <!-- 👥 Player Count -->
              <div class="mb-4">
                <label class="text-body-2 font-weight-medium mb-2 d-block">👥 จำนวนผู้เล่น</label>
                <div class="d-flex align-center gap-3">
                  <VBtn icon="ri-subtract-line" size="small" variant="outlined" @click="playerCount = Math.max(1, playerCount - 1)" />
                  <span class="text-h5 font-weight-bold text-primary">{{ playerCount }}</span>
                  <VBtn icon="ri-add-line" size="small" variant="outlined" @click="playerCount = Math.min(10, playerCount + 1)" />
                  <span class="text-caption text-medium-emphasis">คน</span>
                </div>
              </div>

              <!-- Packages -->
              <label class="text-body-2 font-weight-medium mb-3 d-block">📦 เลือกแพ็กเกจ</label>
              <div class="package-grid">
                <div
                  v-for="pkg in buffetPackages"
                  :key="pkg.id"
                  class="package-card"
                  :class="{ 'package-selected': selectedPackage === pkg.id }"
                  @click="selectedPackage = pkg.id"
                >
                  <div class="package-badge">HIT! 🔥</div>
                  <VIcon :icon="pkg.icon" :color="pkg.color" size="40" class="mb-2" />
                  <div class="text-h6 font-weight-bold mb-1">{{ pkg.name }}</div>
                  <div class="text-caption text-medium-emphasis mb-2">{{ pkg.time }}</div>
                  <div class="text-h4 font-weight-bold mb-3" :style="{ color: pkg.color }">
                    {{ pkg.price }} ฿
                    <span class="text-caption text-medium-emphasis">/คน</span>
                  </div>
                  <div class="text-body-2 mb-3 text-medium-emphasis">{{ pkg.desc }}</div>
                  <div class="perks-list">
                    <div v-for="perk in pkg.perks" :key="perk" class="perk-item">
                      <VIcon icon="ri-check-line" :color="pkg.color" size="14" class="mr-1" />
                      {{ perk }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <VDivider class="my-6" />
              <div v-if="selected" class="summary-bar pa-4 rounded-lg mb-4">
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="font-weight-bold text-primary">{{ selected.name }}</div>
                    <div class="text-body-2 text-medium-emphasis">{{ playerCount }} คน × {{ selected.price }} ฿</div>
                  </div>
                  <div class="text-h4 font-weight-bold text-primary">{{ getTotal() }} ฿</div>
                </div>
              </div>

              <VBtn
                block color="primary" size="large"
                :disabled="!selectedPackage"
                :loading="isBooking" elevation="2"
                @click="bookBuffet"
              >
                <VIcon icon="ri-vip-crown-line" class="mr-2" />
                จอง Buffet เลย
              </VBtn>
            </VCardText>
          </VCard>

          <!-- ✅ Success -->
          <VCard v-else elevation="2" class="section-card text-center py-8">
            <VIcon icon="ri-check-double-line" size="72" color="success" class="mb-4" />
            <h3 class="text-h5 font-weight-bold text-primary mb-2">จอง Buffet สำเร็จ!</h3>
            <p class="text-body-1 text-medium-emphasis mb-6">
              {{ selected?.name }} • {{ playerCount }} คน • {{ formatDate(selectedDate) }}
            </p>
            <div class="d-flex gap-3 justify-center">
              <VBtn variant="outlined" color="primary" @click="reset">
                <VIcon icon="ri-add-line" class="mr-2" /> จองเพิ่ม
              </VBtn>
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>

    <!-- =========================== -->
    <!-- 👥 GANG SECTION             -->
    <!-- =========================== -->
    <VContainer v-if="activeTab === 'gang'">
      <VRow justify="center">
        <VCol cols="12" md="8" lg="6">
          <VCard elevation="2" class="section-card">
            <VCardTitle class="pa-6 pb-0">
              <div class="d-flex align-center gap-3">
                <div class="section-icon" style="background: linear-gradient(135deg, #1B5E20, #2E7D32)">
                  <VIcon icon="ri-group-line" size="28" color="white" />
                </div>
                <div>
                  <div class="text-h6 font-weight-bold">ก๊วนที่กำลังเปิดรับ</div>
                  <div class="text-caption text-medium-emphasis">ร่วมก๊วน แชร์ค่าคอร์ท ตีสนุกกว่า</div>
                </div>
              </div>
            </VCardTitle>

            <VCardText class="pa-6">
              <!-- Create Gang CTA -->
              <VBtn block color="accent" variant="tonal" size="large" class="mb-6" elevation="0">
                <VIcon icon="ri-add-circle-line" class="mr-2" />
                สร้างก๊วนใหม่
              </VBtn>

              <!-- Gang List -->
              <div class="gang-list">
                <VCard
                  v-for="gang in upcomingGangs"
                  :key="gang.id"
                  variant="outlined"
                  class="gang-card mb-3"
                >
                  <VCardItem>
                    <template #prepend>
                      <div class="gang-avatar" :style="{ background: gang.level === 'สูง' ? '#FF6F00' : gang.level === 'กลาง' ? '#FFB400' : '#1B5E20' }">
                        {{ gang.host.charAt(0) }}
                      </div>
                    </template>

                    <VCardTitle class="text-body-1 font-weight-bold">{{ gang.name }}</VCardTitle>
                    <VCardSubtitle>
                      <VIcon icon="ri-user-line" size="12" class="mr-1" /> {{ gang.host }}
                      <span class="mx-1">•</span>
                      <VIcon icon="ri-time-line" size="12" class="mr-1" /> {{ gang.time }}
                      <span class="mx-1">•</span>
                      {{ gang.court }}
                    </VCardSubtitle>

                    <template #append>
                      <div class="text-center">
                        <div class="text-h6 font-weight-bold text-primary">
                          {{ gang.players }}/{{ gang.max }}
                        </div>
                        <div class="text-caption text-medium-emphasis">ที่ว่าง</div>
                      </div>
                    </template>
                  </VCardItem>

                  <VCardText>
                    <div class="d-flex align-center gap-3">
                      <div class="flex-grow-1">
                        <VProgressLinear
                          :model-value="(gang.players / gang.max) * 100"
                          :color="gang.level === 'สูง' ? 'warning' : gang.level === 'กลาง' ? 'accent' : 'primary'"
                          height="6"
                          rounded
                        />
                      </div>
                      <span class="text-caption text-medium-emphasis">
                        {{ gang.max - gang.players }} ที่นั่ง
                      </span>
                    </div>
                    <div class="d-flex justify-space-between align-center mt-3">
                      <VChip size="small" :color="gang.level === 'สูง' ? 'warning' : gang.level === 'กลาง' ? 'accent' : 'primary'" variant="tonal">
                        {{ gang.level === 'เริ่มต้น' ? '🟢 เริ่มต้น' : gang.level === 'กลาง' ? '🟡 กลาง' : '🔴 สูง' }}
                      </VChip>
                      <VBtn color="primary" size="small" variant="outlined">
                        เข้าร่วม
                      </VBtn>
                    </div>
                  </VCardText>
                </VCard>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>

    <!-- =========================== -->
    <!-- 🍔 FOOD SECTION             -->
    <!-- =========================== -->
    <VContainer v-if="activeTab === 'food'">
      <VRow justify="center">
        <VCol cols="12" md="8" lg="6">
          <VCard elevation="2" class="section-card">
            <VCardTitle class="pa-6 pb-0">
              <div class="d-flex align-center gap-3">
                <div class="section-icon" style="background: linear-gradient(135deg, #FF6F00, #FF4C51)">
                  <VIcon icon="ri-restaurant-line" size="28" color="white" />
                </div>
                <div>
                  <div class="text-h6 font-weight-bold">สั่งอาหารส่งถึงคอร์ท</div>
                  <div class="text-caption text-medium-emphasis">สั่งเลย ไม่ต้องเดินมาที่เคาน์เตอร์</div>
                </div>
              </div>
            </VCardTitle>

            <VCardText class="pa-6">
              <!-- Menu Grid -->
              <div v-for="cat in foodCategories" :key="cat.name" class="mb-4">
                <div class="d-flex align-center mb-3">
                  <VIcon :icon="cat.icon" size="20" color="primary" class="mr-2" />
                  <span class="font-weight-bold text-primary">{{ cat.name }}</span>
                </div>
                <div class="food-grid">
                  <div
                    v-for="item in foodMenu.filter(f => f.cat === cat.name)"
                    :key="item.id"
                    class="food-card"
                  >
                    <div class="d-flex align-center gap-3">
                      <div class="food-icon">
                        <VIcon :icon="item.icon" size="24" color="primary" />
                      </div>
                      <div class="flex-grow-1">
                        <div class="font-weight-medium">{{ item.name }}</div>
                        <div class="text-caption text-medium-emphasis">{{ item.price }} ฿</div>
                      </div>
                      <div class="d-flex align-center gap-2">
                        <VBtn
                          v-if="cart[item.id]"
                          icon="ri-subtract-line"
                          size="x-small"
                          variant="outlined"
                          @click="removeFromCart(item.id)"
                        />
                        <span v-if="cart[item.id]" class="font-weight-bold text-primary">{{ cart[item.id] }}</span>
                        <VBtn
                          icon="ri-add-line"
                          size="x-small"
                          color="primary"
                          variant="flat"
                          @click="addToCart(item.id)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cart Summary -->
              <VDivider class="my-4" />
              <div v-if="Object.keys(cart).length" class="cart-summary pa-4 rounded-lg mb-4">
                <div class="font-weight-bold text-primary mb-2">🛒 รายการที่สั่ง</div>
                <div v-for="ci in cartItems" :key="ci.id" class="d-flex justify-space-between mb-1">
                  <span class="text-body-2">{{ ci.qty }}× {{ ci.name }}</span>
                  <span class="text-body-2 font-weight-medium">{{ ci.price * ci.qty }} ฿</span>
                </div>
                <VDivider class="my-2" />
                <div class="d-flex justify-space-between">
                  <span class="font-weight-bold">รวม</span>
                  <span class="text-h6 font-weight-bold text-primary">{{ cartTotal }} ฿</span>
                </div>
              </div>

              <VBtn
                block color="primary" size="large" elevation="2"
                :disabled="!Object.keys(cart).length"
                :loading="foodOrdered"
                @click="submitOrder"
              >
                <VIcon icon="ri-send-plane-line" class="mr-2" />
                {{ foodOrdered ? 'กำลังส่งออเดอร์...' : 'สั่งอาหาร' }}
              </VBtn>
            </VCardText>
          </VCard>

          <!-- Order Confirmed Toast -->
          <div v-if="foodOrdered" class="text-center mt-4">
            <VChip color="success" size="large">
              <VIcon icon="ri-check-line" class="mr-2" />
              สั่งอาหารเรียบร้อย! กำลังส่งไปที่ครัว...
            </VChip>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<style scoped>
.buffet-wrapper {
  min-height: 100dvh;
  background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
}

.tab-card {
  border-radius: 16px;
  overflow: hidden;
}

.tab-item {
  padding: 16px;
  text-align: center;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}
.tab-item:hover { background: #F1F5F9; }
.tab-active { border-bottom-color: #1B5E20; background: #E8F5E9; }

.tab-label { font-weight: 700; font-size: 14px; }
.tab-desc { font-size: 11px; color: #64748B; margin-top: 2px; }

.section-card { border-radius: 20px; }
.section-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* Buffet */
.package-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.package-card {
  border: 2px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.package-card:hover { border-color: #1B5E20; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(27,94,32,0.1); }
.package-selected { border-color: #1B5E20; background: linear-gradient(135deg, #E8F5E9, #F0FDF4); box-shadow: 0 4px 20px rgba(27,94,32,0.15); }
.package-badge { display: none; }
.package-selected .package-badge { display: block; position: absolute; top: -12px; right: 12px; background: #FF6F00; color: white; padding: 2px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.perk-item { font-size: 12px; color: #475569; margin-bottom: 2px; text-align: left; }

.summary-bar { background: linear-gradient(135deg, #E8F5E9, #F0FDF4); border: 1px solid #1B5E20; }

/* Gang */
.gang-card { border-radius: 14px; transition: all 0.2s; }
.gang-card:hover { border-color: #1B5E20; }
.gang-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }

/* Food */
.food-grid { display: grid; gap: 8px; }
.food-card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; transition: all 0.2s; }
.food-card:hover { border-color: #1B5E20; background: #FAFFF8; }
.food-icon { width: 40px; height: 40px; border-radius: 10px; background: #E8F5E9; display: flex; align-items: center; justify-content: center; }
.cart-summary { background: #F8FAFC; border: 1px solid #CBD5E1; }

.max-w-xs { max-width: 200px; }
</style>
