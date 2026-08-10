<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'

const authStore = useAuthStore()
const router = useRouter()

const quickLinks = [
  { to: '/demo', icon: 'ri-calendar-check-line', title: 'จองคอร์ท', desc: 'เลือกวัน เลือกคอร์ท จองได้ทันที', color: '#1B5E20' },
  { to: '/features', icon: 'ri-vip-crown-line', title: 'ตีบุฟเฟ่ต์', desc: 'เหมาจ่าย 199-299฿ เล่นไม่อั้น', color: '#FF6F00' },
  { to: '/features', icon: 'ri-group-line', title: 'ตีก๊วน', desc: 'จัดกลุ่ม แชร์ค่าคอร์ท', color: '#1565C0' },
  { to: '/features', icon: 'ri-restaurant-line', title: 'สั่งอาหาร', desc: 'เมนูส่งตรงถึงคอร์ท', color: '#C62828' },
]

const stats = [
  { icon: 'ri-building-line', value: '500+', label: 'สนามที่ใช้งาน', color: '#1B5E20' },
  { icon: 'ri-calendar-2-line', value: '10,000+', label: 'จองต่อเดือน', color: '#FF6F00' },
  { icon: 'ri-user-heart-line', value: '50,000+', label: 'ผู้เล่น', color: '#1565C0' },
  { icon: 'ri-star-line', value: '4.9', label: 'คะแนน', color: '#C62828' },
]

const recentActivity = [
  { icon: 'ri-calendar-check-line', text: 'คอร์ท A ถูกจอง • 18:00-19:00 • โดยคุณสมชาย', time: '5 นาทีที่แล้ว', color: '#1B5E20' },
  { icon: 'ri-vip-crown-line', text: 'Buffet เย็น ถูกจอง • 2 คน • โดยคุณวิชัย', time: '15 นาทีที่แล้ว', color: '#FF6F00' },
  { icon: 'ri-group-line', text: 'ก๊วนตีมันส์ Friday • มีผู้เข้าร่วมใหม่ 1 คน', time: '30 นาทีที่แล้ว', color: '#1565C0' },
  { icon: 'ri-restaurant-line', text: 'ออเดอร์อาหาร • ข้าวกระเพรา 2 จาน • คอร์ท C', time: '1 ชั่วโมงที่แล้ว', color: '#C62828' },
]

function goToDashboard() {
  if (authStore.isAuthenticated) router.push('/dashboard')
  else router.push('/login')
}
</script>

<template>
  <div class="home-wrapper">
    <!-- Welcome Banner -->
    <VSheet class="welcome-banner pa-8 rounded-lg mb-6">
      <VRow align="center">
        <VCol cols="12" md="7">
          <div class="mb-2">
            <VChip color="accent" size="small" class="font-weight-bold">
              ยินดีต้อนรับกลับมา! 👋
            </VChip>
          </div>
          <h1 class="text-h3 font-weight-bold text-white mb-2">
            สนามแบดมินตันของคุณ
          </h1>
          <p class="text-body-1 text-white opacity-90 mb-4 max-w-md">
            จัดการทุกอย่างในที่เดียว — จองคอร์ท ตีบุฟเฟ่ต์ จัดก๊วน และสั่งอาหาร
          </p>
          <div class="d-flex gap-3">
            <VBtn color="accent" size="large" variant="elevated" class="font-weight-bold" @click="goToDashboard">
              <VIcon icon="ri-rocket-line" class="mr-2" /> เริ่มต้นใช้งานฟรี
            </VBtn>
            <VBtn color="white" variant="outlined" size="large" to="/demo">
              <VIcon icon="ri-eye-line" class="mr-2" /> ลอง Demo
            </VBtn>
          </div>
        </VCol>
        <VCol cols="12" md="5" class="text-center d-none d-md-block">
          <div class="banner-illustration">
            <div class="shuttlecock-large">🏸</div>
            <div class="floating-circles">
              <div class="circle c1" />
              <div class="circle c2" />
              <div class="circle c3" />
            </div>
          </div>
        </VCol>
      </VRow>
    </VSheet>

    <!-- Quick Links -->
    <h2 class="text-h5 font-weight-bold mb-4 text-primary">
      ⚡ เริ่มต้นใช้งาน
    </h2>
    <VRow class="mb-8">
      <VCol
        v-for="link in quickLinks"
        :key="link.title"
        cols="6"
        md="3"
      >
        <VCard
          :to="link.to"
          class="quick-card h-100 text-center pa-4"
          elevation="1"
        >
          <div
            class="quick-icon mb-3 mx-auto"
            :style="{ background: `linear-gradient(135deg, ${link.color}, ${link.color}DD)` }"
          >
            <VIcon :icon="link.icon" size="28" color="white" />
          </div>
          <div class="font-weight-bold mb-1">{{ link.title }}</div>
          <div class="text-caption text-medium-emphasis">{{ link.desc }}</div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Stats -->
    <VRow class="mb-8">
      <VCol
        v-for="stat in stats"
        :key="stat.label"
        cols="6"
        md="3"
      >
        <VCard class="stat-card pa-4 text-center" elevation="0">
          <VIcon :icon="stat.icon" size="32" :color="stat.color" class="mb-2" />
          <div class="text-h4 font-weight-bold" :style="{ color: stat.color }">
            {{ stat.value }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Recent Activity -->
    <h2 class="text-h5 font-weight-bold mb-4 text-primary">
      🔔 กิจกรรมล่าสุด
    </h2>
    <VCard elevation="0" class="activity-card pa-4 mb-6">
      <VList density="compact" class="bg-transparent pa-0">
        <VListItem
          v-for="(act, i) in recentActivity"
          :key="i"
          class="px-0"
        >
          <template #prepend>
            <div class="activity-dot" :style="{ background: act.color }">
              <VIcon :icon="act.icon" size="14" color="white" />
            </div>
          </template>
          <VListItemTitle class="text-body-2">
            {{ act.text }}
          </VListItemTitle>
          <VListItemSubtitle class="text-caption">
            {{ act.time }}
          </VListItemSubtitle>
        </VListItem>
      </VList>
    </VCard>
  </div>
</template>

<style scoped>
.home-wrapper {
  padding: 4px 0;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, #1B5E20 0%, #0D2818 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,111,0,0.1) 0%, transparent 60%);
  border-radius: 50%;
}

.banner-illustration {
  position: relative;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shuttlecock-large {
  font-size: 80px;
  animation: float 3s ease-in-out infinite;
}

.floating-circles .circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}
.c1 { width: 60px; height: 60px; background: rgba(255,255,255,0.15); top: 10px; right: 40px; animation: float 4s ease-in-out infinite; }
.c2 { width: 40px; height: 40px; background: rgba(255,111,0,0.2); bottom: 20px; right: 80px; animation: float 3.5s ease-in-out infinite 0.5s; }
.c3 { width: 80px; height: 80px; background: rgba(255,255,255,0.08); top: 30px; left: 20px; animation: float 5s ease-in-out infinite 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Quick Links */
.quick-card {
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
}

.quick-card:hover {
  border-color: #1B5E20;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(27,94,32,0.1);
}

.quick-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.quick-card:hover .quick-icon {
  transform: scale(1.1);
}

/* Stats */
.stat-card {
  border-radius: 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #E8F5E9;
  border-color: #1B5E20;
  transform: translateY(-2px);
}

/* Activity */
.activity-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
}

.activity-dot {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
