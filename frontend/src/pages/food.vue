<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.owner?.role === 'admin')

const cart = ref<Record<string, number>>({})
const foodOrdered = ref(false)
const tableNumber = ref('A1')
const editMode = ref(false)

const foodCategories = [
  { name: 'เครื่องดื่ม', icon: 'ri-cup-line' },
  { name: 'ขนม/ของว่าง', icon: 'ri-cake-2-line' },
  { name: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
  { name: 'ส้มตำ/ยำ', icon: 'ri-bowl-line' },
  { name: 'ขนมหวาน', icon: 'ri-cake-3-line' },
]

const foodMenu = ref([
  { id: 'f1', name: 'น้ำเปล่า', price: 10, cat: 'เครื่องดื่ม', icon: 'ri-drop-line' },
  { id: 'f2', name: 'น้ำอัดลม', price: 20, cat: 'เครื่องดื่ม', icon: 'ri-drinks-line' },
  { id: 'f3', name: 'เกเตอเรด', price: 30, cat: 'เครื่องดื่ม', icon: 'ri-flashlight-line' },
  { id: 'f4', name: 'ชาเขียว', price: 35, cat: 'เครื่องดื่ม', icon: 'ri-goblet-line' },
  { id: 'f5', name: 'กาแฟเย็น', price: 40, cat: 'เครื่องดื่ม', icon: 'ri-coffee-line' },
  { id: 'f6', name: 'ชามะนาว', price: 30, cat: 'เครื่องดื่ม', icon: 'ri-goblet-line' },
  { id: 'f7', name: 'น้ำผลไม้ปั่น', price: 45, cat: 'เครื่องดื่ม', icon: 'ri-drinks-2-line' },
  { id: 'f8', name: 'มันฝรั่งทอด', price: 45, cat: 'ขนม/ของว่าง', icon: 'ri-restaurant-line' },
  { id: 'f9', name: 'นักเก็ตไก่', price: 55, cat: 'ขนม/ของว่าง', icon: 'ri-restaurant-2-line' },
  { id: 'f10', name: 'ไก่ทอด', price: 69, cat: 'ขนม/ของว่าง', icon: 'ri-bowl-line' },
  { id: 'f11', name: 'เฟรนช์ฟรายส์', price: 50, cat: 'ขนม/ของว่าง', icon: 'ri-restaurant-line' },
  { id: 'f12', name: 'หมูแดดเดียวทอด', price: 65, cat: 'ขนม/ของว่าง', icon: 'ri-restaurant-line' },
  { id: 'f13', name: 'ลูกชิ้นทอด', price: 40, cat: 'ขนม/ของว่าง', icon: 'ri-restaurant-2-line' },
  { id: 'f14', name: 'ข้าวผัดกระเพรา', price: 60, cat: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
  { id: 'f15', name: 'ข้าวไข่เจียว', price: 50, cat: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
  { id: 'f16', name: 'ผัดซีอิ๊ว', price: 55, cat: 'อาหารจานเดียว', icon: 'ri-restaurant-2-line' },
  { id: 'f17', name: 'ข้าวผัดปู', price: 75, cat: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
  { id: 'f18', name: 'ข้าวหมูกระเทียม', price: 60, cat: 'อาหารจานเดียว', icon: 'ri-bowl-line' },
  { id: 'f19', name: 'ผัดไทย', price: 60, cat: 'อาหารจานเดียว', icon: 'ri-restaurant-2-line' },
  { id: 'f20', name: 'ต้มยำกุ้ง', price: 85, cat: 'ส้มตำ/ยำ', icon: 'ri-bowl-line' },
  { id: 'f21', name: 'ส้มตำไทย', price: 50, cat: 'ส้มตำ/ยำ', icon: 'ri-bowl-line' },
  { id: 'f22', name: 'ส้มตำปูปลาร้า', price: 65, cat: 'ส้มตำ/ยำ', icon: 'ri-bowl-line' },
  { id: 'f23', name: 'ยำมาม่า', price: 55, cat: 'ส้มตำ/ยำ', icon: 'ri-restaurant-2-line' },
  { id: 'f24', name: 'ลาบหมู', price: 60, cat: 'ส้มตำ/ยำ', icon: 'ri-bowl-line' },
  { id: 'f25', name: 'ไอศครีม', price: 35, cat: 'ขนมหวาน', icon: 'ri-cake-3-line' },
  { id: 'f26', name: 'ขนมปังสังขยา', price: 40, cat: 'ขนมหวาน', icon: 'ri-cake-line' },
])

function addToCart(foodId: string) {
  cart.value[foodId] = (cart.value[foodId] || 0) + 1
}

function removeFromCart(foodId: string) {
  if (cart.value[foodId] > 0) cart.value[foodId]--
  if (cart.value[foodId] === 0) delete cart.value[foodId]
}

const cartTotal = computed(() => {
  return Object.entries(cart.value).reduce((sum, [id, qty]) => {
    const item = foodMenu.value.find(f => f.id === id)
    return sum + (item?.price || 0) * qty
  }, 0)
})

const cartItems = computed(() => {
  return Object.entries(cart.value).map(([id, qty]) => ({ ...foodMenu.value.find(f => f.id === id)!, qty }))
})

function submitOrder() {
  foodOrdered.value = true
  setTimeout(() => { foodOrdered.value = false; cart.value = {} }, 3000)
}
</script>

<template>
  <div class="page-wrapper">
    <!-- Header -->
    <VSheet class="page-hero pa-8 mb-6 rounded-lg">
      <div class="d-flex align-center gap-4">
        <div class="hero-icon">
          <VIcon icon="ri-restaurant-line" size="36" color="white" />
        </div>
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold text-white mb-1">สั่งอาหาร</h1>
          <p class="text-body-1 text-white opacity-80">สั่งอาหารและเครื่องดื่ม ส่งตรงถึงคอร์ท ไม่ต้องเดินมาเคาน์เตอร์</p>
        </div>
        <VBtn
          v-if="isAdmin"
          :icon="editMode ? 'ri-close-line' : 'ri-edit-line'"
          :color="editMode ? 'white' : undefined"
          :variant="editMode ? 'outlined' : 'flat'"
          size="large"
          @click="editMode = !editMode"
        >
          <VIcon :icon="editMode ? 'ri-close-line' : 'ri-edit-line'" class="mr-0 mr-sm-2" />
          <span class="d-none d-sm-inline">{{ editMode ? 'ปิดแก้ไข' : 'แก้ไข' }}</span>
        </VBtn>
      </div>
      <VChip v-if="editMode" color="warning" variant="flat" size="small" class="mt-3">
        <VIcon icon="ri-pencil-line" size="14" class="mr-1" /> โหมดแก้ไข — Admin เท่านั้น
      </VChip>
    </VSheet>

    <VRow>
      <VCol cols="12" lg="8">
        <VCard elevation="1" class="section-card mb-4">
          <VCardText class="pa-6">
            <!-- Location -->
            <div class="d-flex align-center gap-3 mb-4">
              <span class="text-body-2 font-weight-medium">📍 ส่งที่:</span>
              <VChip color="primary" variant="tonal" size="large">
                <VIcon icon="ri-shuttle-line" class="mr-2" /> คอร์ท {{ tableNumber }}
              </VChip>
            </div>

            <!-- Menu Grid -->
            <div v-for="cat in foodCategories" :key="cat.name" class="mb-6">
              <div class="d-flex align-center mb-3 category-header pa-2 rounded-lg">
                <div class="cat-icon mr-3">
                  <VIcon :icon="cat.icon" size="20" color="white" />
                </div>
                <span class="font-weight-bold">{{ cat.name }}</span>
              </div>
              <div class="food-grid">
                <div
                  v-for="(item, idx) in foodMenu.filter(f => f.cat === cat.name)"
                  :key="item.id"
                  class="food-card"
                  :class="{ 'food-editing': editMode }"
                >
                  <template v-if="editMode">
                    <div class="d-flex justify-end mb-2">
                      <VBtn icon size="x-small" color="error" variant="text" @click="foodMenu.splice(foodMenu.findIndex(f => f.id === item.id), 1)">
                        <VIcon icon="ri-delete-bin-line" size="14" />
                      </VBtn>
                    </div>
                    <div class="admin-grid-food">
                      <VTextField v-model="item.name" label="ชื่อ" variant="outlined" density="compact" hide-details />
                      <VTextField v-model.number="item.price" label="ราคา (฿)" type="number" variant="outlined" density="compact" hide-details />
                      <VSelect v-model="item.cat" :items="foodCategories.map(c => c.name)" label="หมวดหมู่" variant="outlined" density="compact" hide-details />
                    </div>
                  </template>
                  <template v-else>
                  <div class="d-flex align-center gap-3">
                    <div class="food-icon">
                      <VIcon :icon="item.icon" size="22" color="#1B5E20" />
                    </div>
                    <div class="flex-grow-1">
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ item.price }} ฿</div>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <VBtn
                        v-if="cart[item.id]"
                        icon="ri-subtract-line" size="x-small" variant="outlined"
                        @click="removeFromCart(item.id)"
                      />
                      <span v-if="cart[item.id]" class="font-weight-bold text-primary text-h6">{{ cart[item.id] }}</span>
                      <VBtn
                        icon="ri-add-line" size="x-small" color="primary" variant="flat"
                        @click="addToCart(item.id)"
                      />
                    </div>
                  </div>
                  </template>
                </div>
              </div>
            </div>
            <!-- Add new food item (edit mode) -->
            <div
              v-if="editMode"
              class="food-card food-add d-flex align-center justify-center py-3 mb-4"
              @click="foodMenu.push({ id: `f${Date.now()}`, name: 'เมนูใหม่', price: 50, cat: foodCategories[0].name, icon: 'ri-bowl-line' })"
            >
              <VIcon icon="ri-add-circle-line" size="28" color="#1B5E20" class="mr-2" />
              <span class="text-body-2 font-weight-medium text-primary">เพิ่มเมนู</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Cart Sidebar -->
      <VCol cols="12" lg="4">
        <VCard elevation="1" class="cart-card pa-4" style="position: sticky; top: 16px;">
          <div class="d-flex align-center gap-2 mb-4">
            <VIcon icon="ri-shopping-cart-2-line" size="24" color="primary" />
            <h3 class="text-h6 font-weight-bold text-primary">🛒 ตะกร้า</h3>
          </div>

          <div v-if="!Object.keys(cart).length" class="text-center py-8">
            <VIcon icon="ri-shopping-cart-line" size="48" color="#CBD5E1" class="mb-2" />
            <p class="text-body-2 text-medium-emphasis">ยังไม่มีรายการที่สั่ง</p>
            <p class="text-caption text-medium-emphasis">เลือกรายการจากเมนูด้านซ้าย</p>
          </div>

          <div v-else>
            <div v-for="ci in cartItems" :key="ci.id" class="cart-item d-flex justify-space-between align-center mb-2 pb-2">
              <div class="d-flex align-center gap-2">
                <span class="font-weight-bold text-primary">{{ ci.qty }}</span>
                <span class="text-body-2">×</span>
                <span class="text-body-2">{{ ci.name }}</span>
              </div>
              <div class="d-flex align-center gap-2">
                <span class="font-weight-medium">{{ ci.price * ci.qty }} ฿</span>
                <VBtn icon="ri-close-line" size="x-small" variant="text" color="grey" @click="delete cart[ci.id]" />
              </div>
            </div>
            <VDivider class="my-3" />
            <div class="d-flex justify-space-between mb-4">
              <span class="font-weight-bold">รวม</span>
              <span class="text-h5 font-weight-bold text-primary">{{ cartTotal }} ฿</span>
            </div>
            <VBtn block color="primary" size="large" elevation="2" :loading="foodOrdered" @click="submitOrder">
              <VIcon icon="ri-send-plane-line" class="mr-2" />
              {{ foodOrdered ? 'กำลังส่ง...' : 'สั่งอาหาร' }}
            </VBtn>
          </div>

          <!-- Order Success -->
          <VAlert v-if="foodOrdered" type="success" variant="tonal" class="mt-3" prominent>
            <VIcon icon="ri-check-double-line" class="mr-2" />
            สั่งอาหารเรียบร้อย! กำลังส่งไปที่คอร์ท {{ tableNumber }}
          </VAlert>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.page-wrapper { padding: 4px 0; }
.page-hero {
  background: linear-gradient(135deg, #C62828 0%, #B71C1C 100%);
  border-radius: 18px;
}
.hero-icon {
  width: 64px; height: 64px; border-radius: 16px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.section-card { border-radius: 18px; }
.cart-card { border-radius: 18px; border: 2px solid #E8F5E9; }

.category-header {
  background: linear-gradient(135deg, #E8F5E9, #F0FDF4);
}

.cat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #1B5E20, #2E7D32);
  display: flex; align-items: center; justify-content: center;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.food-card {
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px;
  transition: all 0.2s;
  background: white;
}
.food-card:hover { border-color: #1B5E20; background: #FAFFF8; }
.food-editing { border-style: dashed; border-color: #FFB400; background: #FFFDE7; }
.food-editing:hover { border-color: #FFB400; background: #FFFDE7; }
.food-add { border-style: dashed; border-color: #C8E6C9; background: #FAFFF8; cursor: pointer; }
.food-add:hover { border-color: #1B5E20; background: #E8F5E9; }
.admin-grid-food { display: grid; grid-template-columns: 1fr 110px 160px; gap: 8px; }

.food-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: #E8F5E9;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.cart-item {
  border-bottom: 1px solid #F1F5F9;
}
</style>
