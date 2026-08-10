<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'
import RoleBadge from '@/components/RoleBadge.vue'

const router = useRouter()
const authStore = useAuthStore()

const statCards = [
  { title: 'จองวันนี้', value: 24, icon: 'ri-calendar-check-line', color: '#1B5E20' },
  { title: 'รายได้วันนี้', value: '฿4,580', icon: 'ri-money-baht-circle-line', color: '#FF6F00' },
  { title: 'รอตรวจสอบ', value: 3, icon: 'ri-time-line', color: '#1565C0' },
  { title: 'อัตราการเข้าพัก', value: '78%', icon: 'ri-bar-chart-line', color: '#C62828' },
]

const recentBookings = [
  { player: 'คุณสมชาย', court: 'คอร์ท A', time: '18:00 - 19:00', amount: 200, status: 'confirmed' },
  { player: 'คุณวิชัย', court: 'คอร์ท B', time: '19:00 - 20:00', amount: 200, status: 'pending' },
  { player: 'น้องมิน', court: 'คอร์ท C', time: '17:00 - 18:00', amount: 250, status: 'confirmed' },
  { player: 'คุณฝน', court: 'คอร์ท A', time: '20:00 - 21:00', amount: 200, status: 'cancelled' },
  { player: 'พี่บอล', court: 'คอร์ท B', time: '16:00 - 17:00', amount: 180, status: 'confirmed' },
]

const quickActions = [
  { to: '/demo', icon: 'ri-calendar-line', title: 'ดู Demo จอง', color: 'primary' },
  { to: '/buffet', icon: 'ri-vip-crown-line', title: 'ตีบุฟเฟ่ต์', color: '#FF6F00' },
  { to: '/gang', icon: 'ri-group-line', title: 'ตีก๊วน', color: '#1565C0' },
  { to: '/food', icon: 'ri-restaurant-line', title: 'สั่งอาหาร', color: '#C62828' },
]
</script>

<template>
  <div class="page-wrapper">
    <!-- Hero -->
    <VSheet class="page-hero pa-8 mb-6 rounded-lg">
      <div class="d-flex align-center gap-4 flex-wrap">
        <div class="hero-icon">
          <VIcon icon="ri-dashboard-line" size="36" color="white" />
        </div>
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold text-white mb-1">แดชบอร์ด</h1>
          <p class="text-body-1 text-white opacity-80">
            สวัสดี, {{ authStore.owner?.name }}
          </p>
        </div>
        <div v-if="authStore.owner" class="d-flex align-center gap-2">
          <RoleBadge :role="authStore.owner.role" size="large" />
        </div>
      </div>
    </VSheet>

    <!-- Stats -->
    <VRow class="mb-6">
      <VCol v-for="card in statCards" :key="card.title" cols="6" md="3">
        <VCard class="stat-card pa-4" elevation="0">
          <div class="d-flex align-center gap-3 mb-3">
            <div class="stat-icon" :style="{ background: `${card.color}18` }">
              <VIcon :icon="card.icon" :color="card.color" size="24" />
            </div>
          </div>
          <div class="text-h4 font-weight-bold mb-1" :style="{ color: card.color }">
            {{ card.value }}
          </div>
          <div class="text-body-2 text-medium-emphasis">{{ card.title }}</div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Quick Actions -->
    <h2 class="text-h6 font-weight-bold mb-3 text-primary">⚡ ทางลัด</h2>
    <VRow class="mb-6">
      <VCol v-for="action in quickActions" :key="action.title" cols="6" md="3">
        <VCard :to="action.to" class="action-card pa-4 text-center" elevation="0">
          <VIcon :icon="action.icon" :color="action.color" size="28" class="mb-2" />
          <div class="font-weight-medium text-body-2">{{ action.title }}</div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Recent Bookings -->
    <h2 class="text-h6 font-weight-bold mb-3 text-primary">📋 การจองล่าสุด</h2>
    <VCard elevation="0" class="booking-card">
      <VTable>
        <thead>
          <tr>
            <th class="text-caption font-weight-bold">ผู้เล่น</th>
            <th class="text-caption font-weight-bold">คอร์ท</th>
            <th class="text-caption font-weight-bold">เวลา</th>
            <th class="text-caption font-weight-bold">ราคา</th>
            <th class="text-caption font-weight-bold text-center">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in recentBookings" :key="b.player + b.time">
            <td class="font-weight-medium">{{ b.player }}</td>
            <td class="text-body-2">{{ b.court }}</td>
            <td class="text-body-2">{{ b.time }}</td>
            <td>{{ b.amount }}฿</td>
            <td class="text-center">
              <VChip
                size="x-small"
                :color="b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'error'"
                variant="tonal"
              >
                {{ { confirmed: '✅ ยืนยัน', pending: '⏳ รอตรวจสอบ', cancelled: '❌ ยกเลิก' }[b.status] }}
              </VChip>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>

<style scoped>
.page-wrapper { padding: 4px 0; }
.page-hero {
  background: linear-gradient(135deg, #1B5E20 0%, #0D2818 100%);
  border-radius: 18px;
}
.hero-icon {
  width: 64px; height: 64px; border-radius: 16px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card {
  border-radius: 16px; border: 1px solid #E2E8F0;
  transition: all 0.2s;
}
.stat-card:hover { transform: translateY(-2px); border-color: #1B5E20; }
.stat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.action-card {
  border-radius: 14px; border: 1px solid #E2E8F0;
  transition: all 0.2s; cursor: pointer; text-decoration: none;
}
.action-card:hover { border-color: #1B5E20; transform: translateY(-2px); background: #E8F5E9; }
.booking-card { border-radius: 16px; border: 1px solid #E2E8F0; }
</style>
