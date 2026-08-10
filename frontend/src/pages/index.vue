<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'

const router = useRouter()
const authStore = useAuthStore()

function goToDashboard() {
  if (authStore.isAuthenticated)
    router.push('/dashboard')
  else
    router.push('/login')
}

const features = [
  { icon: 'ri-shuttle-line', title: 'สร้างใน 5 นาที', desc: 'ไม่ต้องเขียนโค้ด แค่กรอกข้อมูลสนามแล้วเปิดใช้งานทันที' },
  { icon: 'ri-calendar-check-line', title: 'จองเรียลไทม์', desc: 'ผู้เล่นจองได้ตลอด 24 ชั่วโมง ไม่ต้องรับสายหรือตอบแชท' },
  { icon: 'ri-bank-card-line', title: 'ตรวจสอบการชำระเงิน', desc: 'อัปโหลดสลิป ระบบตรวจสอบอัตโนมัติ สำหรับแผน Pro' },
  { icon: 'ri-bar-chart-line', title: 'แดชบอร์ดเจ้าของสนาม', desc: 'ติดตามรายได้ ช่วงเวลายอดนิยม และอัตราการเข้าพัก' },
]

const pricing = [
  { name: 'Free', price: '฿0', period: '/14 days', features: ['1 venue', '2 courts', 'Manual payment verification', 'Basic booking site'] },
  { name: 'Pro', price: '฿590', period: '/month', features: ['Unlimited venues', 'Unlimited courts', 'Auto slip verification', 'Custom branding', 'Priority support'], popular: true },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <VSheet color="primary" class="hero-section text-white py-16 px-4 text-center">
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <VIcon icon="ri-shuttle-line" size="64" class="text-accent mb-4" />
        </div>
        <h1 class="text-h2 font-weight-bold mb-4">
          ระบบจองสนามแบดมินตัน<br>อัจฉริยะ
        </h1>
        <p class="text-h6 mb-8 opacity-90">
          สร้างเว็บไซต์จองสนามของคุณใน 5 นาที<br>
          ไม่ต้องเขียนโค้ด ผู้เล่นจองและชำระเงินได้เองตลอด 24 ชั่วโมง
        </p>
        <div class="d-flex justify-center gap-3 flex-wrap">
          <VBtn
            size="large"
            color="accent"
            variant="elevated"
            class="text-white font-weight-bold px-8"
            @click="goToDashboard"
          >
            <VIcon icon="ri-rocket-line" class="mr-2" />
            เริ่มต้นใช้งานฟรี
          </VBtn>
          <VBtn
            size="large"
            color="white"
            variant="outlined"
            to="/demo"
            class="px-6"
          >
            <VIcon icon="ri-eye-line" class="mr-2" />
            ดูตัวอย่าง
          </VBtn>
        </div>
      </div>
    </VSheet>

    <!-- Features -->
    <VContainer class="py-12">
      <h2 class="text-h4 font-weight-bold text-center mb-2 text-primary">
        ทำไมเจ้าของสนามถึงเลือก Smashup?
      </h2>
      <p class="text-center text-medium-emphasis mb-10">
        ระบบครบวงจร ตอบโจทย์ทุกความต้องการของสนามแบดมินตัน
      </p>
      <VRow justify="center">
        <VCol
          v-for="f in features"
          :key="f.title"
          cols="12"
          sm="6"
          md="3"
        >
          <VCard class="h-100 pa-6 text-center feature-card" flat>
            <div class="feature-icon-wrapper mb-4 mx-auto">
              <VIcon :icon="f.icon" size="40" color="white" />
            </div>
            <h3 class="text-h6 font-weight-bold mb-2 text-primary">
              {{ f.title }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              {{ f.desc }}
            </p>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>

    <!-- Pricing -->
    <VSheet class="py-12" color="surface">
      <VContainer>
        <h2 class="text-h4 font-weight-bold text-center mb-2 text-primary">
          แผนค่าบริการ
        </h2>
        <p class="text-center text-medium-emphasis mb-10">
          เลือกแผนที่เหมาะกับสนามของคุณ
        </p>
        <VRow justify="center">
          <VCol
            v-for="p in pricing"
            :key="p.name"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard
              class="h-100 pa-6"
              :elevation="p.popular ? 4 : 1"
              :color="p.popular ? 'primary' : undefined"
              :variant="p.popular ? 'flat' : 'elevated'"
            >
              <div
                v-if="p.popular"
                class="text-caption font-weight-bold text-uppercase mb-2 text-white"
              >
                Most Popular
              </div>
              <h3
                class="text-h5 font-weight-bold mb-2"
                :class="p.popular ? 'text-white' : ''"
              >
                {{ p.name }}
              </h3>
              <div class="d-flex align-baseline mb-6">
                <span
                  class="text-h3 font-weight-bold"
                  :class="p.popular ? 'text-white' : 'text-primary'"
                >
                  {{ p.price }}
                </span>
                <span
                  class="text-body-2 ml-1"
                  :class="p.popular ? 'text-white' : 'text-medium-emphasis'"
                >
                  {{ p.period }}
                </span>
              </div>
              <VList density="compact" class="bg-transparent pa-0 mb-6">
                <VListItem
                  v-for="feat in p.features"
                  :key="feat"
                  class="px-0"
                >
                  <template #prepend>
                    <VIcon
                      icon="ri-check-line"
                      size="18"
                      :color="p.popular ? 'white' : 'primary'"
                      class="mr-2"
                    />
                  </template>
                  <span :class="p.popular ? 'text-white' : ''">{{ feat }}</span>
                </VListItem>
              </VList>
              <VBtn
                block
                :color="p.popular ? 'white' : 'primary'"
                :variant="p.popular ? 'elevated' : 'flat'"
                :class="p.popular ? 'text-primary' : ''"
                @click="goToDashboard"
              >
                {{ p.popular ? 'Start Pro Trial' : 'Start Free' }}
              </VBtn>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>

    <!-- Stats Section -->
    <VContainer class="py-12">
      <VRow justify="center" class="text-center">
        <VCol cols="6" md="3">
          <div class="stat-item">
            <div class="text-h2 font-weight-bold text-primary">500+</div>
            <div class="text-body-2 text-medium-emphasis">สนามที่ใช้งาน</div>
          </div>
        </VCol>
        <VCol cols="6" md="3">
          <div class="stat-item">
            <div class="text-h2 font-weight-bold text-primary">10,000+</div>
            <div class="text-body-2 text-medium-emphasis">การจองต่อเดือน</div>
          </div>
        </VCol>
        <VCol cols="6" md="3">
          <div class="stat-item">
            <div class="text-h2 font-weight-bold text-primary">50,000+</div>
            <div class="text-body-2 text-medium-emphasis">ผู้เล่นลงทะเบียน</div>
          </div>
        </VCol>
        <VCol cols="6" md="3">
          <div class="stat-item">
            <div class="text-h2 font-weight-bold text-primary">4.9</div>
            <div class="text-body-2 text-medium-emphasis">คะแนนความพึงพอใจ</div>
          </div>
        </VCol>
      </VRow>
    </VContainer>

    <!-- Footer CTA -->
    <VSheet color="primary" class="py-16 px-4 text-center">
      <div class="max-w-xl mx-auto">
        <VIcon icon="ri-shuttle-line" size="48" class="text-accent mb-4" />
        <h2 class="text-h4 font-weight-bold mb-4 text-white">
          พร้อมเพิ่มยอดจองให้สนามของคุณ?
        </h2>
        <p class="text-body-1 text-white opacity-90 mb-6">
          ร่วมกับเจ้าของสนามแบดมินตันกว่าร้อยแห่งทั่วประเทศไทย
        </p>
        <VBtn
          color="accent"
          size="large"
          variant="elevated"
          class="text-white font-weight-bold px-8"
          @click="goToDashboard"
        >
          <VIcon icon="ri-add-circle-line" class="mr-2" />
          สร้างเว็บไซต์จองสนาม
        </VBtn>
      </div>
    </VSheet>
  </div>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #1B5E20 0%, #124d18 50%, #0D2818 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 111, 0, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(27, 94, 32, 0.12);
}

.feature-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1);
}

.stat-item {
  padding: 1.5rem;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  background: #E8F5E9;
  border-color: #1B5E20;
}
</style>
