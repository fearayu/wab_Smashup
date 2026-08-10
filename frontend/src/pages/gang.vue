<script setup lang="ts">
const showCreate = ref(false)
const newGang = ref({ name: '', date: '', time: '18:00', level: 'กลาง', maxPlayers: 8 })

const upcomingGangs = [
  { id: 'g1', name: 'ก๊วนตีมันส์ Friday', host: 'พี่โจ้', players: 4, max: 8, level: 'กลาง', time: 'ศุกร์ 18:00', court: 'คอร์ท A+B', joined: false },
  { id: 'g2', name: 'ก๊วน Weekend Warrior', host: 'น้องมิน', players: 6, max: 12, level: 'สูง', time: 'เสาร์ 14:00', court: 'คอร์ท C+D', joined: true },
  { id: 'g3', name: 'ก๊วนสายชิล', host: 'พี่บอล', players: 2, max: 4, level: 'เริ่มต้น', time: 'พุธ 10:00', court: 'คอร์ท A', joined: false },
  { id: 'g4', name: 'ก๊วนคืนวันอังคาร', host: 'คุณฝน', players: 5, max: 8, level: 'กลาง', time: 'อังคาร 19:00', court: 'คอร์ท B+C', joined: false },
  { id: 'g5', name: 'ก๊วนตีเช้าวันอาทิตย์', host: 'พี่เอก', players: 3, max: 6, level: 'สูง', time: 'อาทิตย์ 09:00', court: 'คอร์ท A', joined: false },
]

const myGangs = computed(() => upcomingGangs.filter(g => g.joined))

function joinGang(gang: typeof upcomingGangs[0]) {
  if (gang.players < gang.max) {
    gang.players++
    gang.joined = true
  }
}

function leaveGang(gang: typeof upcomingGangs[0]) {
  gang.players--
  gang.joined = false
}

function createGang() {
  upcomingGangs.unshift({
    id: `g${Date.now()}`,
    name: newGang.value.name || 'ก๊วนใหม่',
    host: 'ฉัน',
    players: 1,
    max: newGang.value.maxPlayers,
    level: newGang.value.level,
    time: `${newGang.value.date || 'TBD'} ${newGang.value.time}`,
    court: 'รอจัดสรร',
    joined: true,
  })
  showCreate.value = false
  newGang.value = { name: '', date: '', time: '18:00', level: 'กลาง', maxPlayers: 8 }
}
</script>

<template>
  <div class="page-wrapper">
    <!-- Header -->
    <VSheet class="page-hero pa-8 mb-6 rounded-lg">
      <div class="d-flex align-center gap-4">
        <div class="hero-icon">
          <VIcon icon="ri-group-line" size="36" color="white" />
        </div>
        <div>
          <h1 class="text-h4 font-weight-bold text-white mb-1">ตีก๊วน</h1>
          <p class="text-body-1 text-white opacity-80">จัดกลุ่ม จับคู่ แชร์ค่าคอร์ท — ตีสนุกกว่าเล่นคนเดียว</p>
        </div>
      </div>
    </VSheet>

    <VRow>
      <VCol cols="12" lg="8">
        <!-- Create Gang -->
        <VCard v-if="showCreate" elevation="1" class="section-card mb-4 pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-bold text-primary">สร้างก๊วนใหม่</h3>
            <VBtn icon="ri-close-line" variant="text" size="small" @click="showCreate = false" />
          </div>
          <VRow>
            <VCol cols="12" sm="6">
              <VTextField v-model="newGang.name" label="ชื่อก๊วน" variant="outlined" density="comfortable" class="mb-3" />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField v-model="newGang.date" label="วันที่" type="date" variant="outlined" density="comfortable" class="mb-3" />
            </VCol>
            <VCol cols="6" sm="4">
              <VTextField v-model="newGang.time" label="เวลา" type="time" variant="outlined" density="comfortable" class="mb-3" />
            </VCol>
            <VCol cols="6" sm="4">
              <VSelect v-model="newGang.level" :items="['เริ่มต้น', 'กลาง', 'สูง']" label="ระดับ" variant="outlined" density="comfortable" class="mb-3" />
            </VCol>
            <VCol cols="6" sm="4">
              <VTextField v-model.number="newGang.maxPlayers" label="จำนวนคน" type="number" variant="outlined" density="comfortable" class="mb-3" />
            </VCol>
          </VRow>
          <VBtn color="primary" block @click="createGang">
            <VIcon icon="ri-add-circle-line" class="mr-2" /> สร้างก๊วน
          </VBtn>
        </VCard>

        <!-- My Gangs -->
        <VCard v-if="myGangs.length" elevation="1" class="section-card mb-4">
          <VCardTitle class="pa-4 pb-0 d-flex align-center gap-2">
            <VIcon icon="ri-heart-line" color="#C62828" /> <span class="text-h6 font-weight-bold">ก๊วนของฉัน</span>
          </VCardTitle>
          <VCardText>
            <VCard v-for="gang in myGangs" :key="gang.id" variant="outlined" class="gang-card mb-3">
              <VCardItem>
                <template #prepend>
                  <div class="gang-avatar" style="background: linear-gradient(135deg, #1565C0, #42A5F5)">{{ gang.host.charAt(0) }}</div>
                </template>
                <VCardTitle class="text-body-1 font-weight-bold">{{ gang.name }}</VCardTitle>
                <VCardSubtitle>
                  <VIcon icon="ri-time-line" size="12" class="mr-1" /> {{ gang.time }} <span class="mx-1">•</span> {{ gang.court }}
                </VCardSubtitle>
                <template #append>
                  <VChip color="primary" size="small" variant="tonal">{{ gang.players }}/{{ gang.max }}</VChip>
                </template>
              </VCardItem>
              <VCardText>
                <div class="d-flex align-center gap-3">
                  <VProgressLinear :model-value="(gang.players / gang.max) * 100" color="primary" height="6" rounded class="flex-grow-1" />
                  <span class="text-caption">{{ gang.max - gang.players }} ที่นั่ง</span>
                </div>
                <div class="d-flex justify-end mt-3">
                  <VBtn size="small" variant="outlined" color="error" @click="leaveGang(gang)">
                    <VIcon icon="ri-logout-box-line" class="mr-1" /> ออกจากก๊วน
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </VCardText>
        </VCard>

        <!-- Available Gangs -->
        <VCard elevation="1" class="section-card">
          <VCardTitle class="pa-4 pb-0">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center gap-2">
                <VIcon icon="ri-search-line" color="primary" /> <span class="text-h6 font-weight-bold">ก๊วนที่กำลังเปิดรับ</span>
              </div>
              <VBtn color="primary" variant="tonal" size="small" @click="showCreate = true">
                <VIcon icon="ri-add-line" class="mr-1" /> สร้างก๊วน
              </VBtn>
            </div>
          </VCardTitle>
          <VCardText class="pa-4">
            <VCard
              v-for="gang in upcomingGangs.filter(g => !g.joined)"
              :key="gang.id" variant="outlined"
              class="gang-card mb-3"
            >
              <VCardItem>
                <template #prepend>
                  <div class="gang-avatar" :style="{ background: gang.level === 'สูง' ? 'linear-gradient(135deg, #FF6F00, #FF9800)' : gang.level === 'กลาง' ? 'linear-gradient(135deg, #FFB400, #FFC107)' : 'linear-gradient(135deg, #1B5E20, #43A047)' }">
                    {{ gang.host.charAt(0) }}
                  </div>
                </template>
                <VCardTitle class="text-body-1 font-weight-bold">{{ gang.name }}</VCardTitle>
                <VCardSubtitle>
                  <VIcon icon="ri-user-line" size="12" class="mr-1" /> {{ gang.host }}
                  <span class="mx-1">•</span>
                  <VIcon icon="ri-time-line" size="12" class="mr-1" /> {{ gang.time }}
                  <span class="mx-1">•</span> {{ gang.court }}
                </VCardSubtitle>
                <template #append>
                  <div class="text-center">
                    <div class="text-h6 font-weight-bold text-primary">{{ gang.players }}/{{ gang.max }}</div>
                    <div class="text-caption text-medium-emphasis">ที่ว่าง</div>
                  </div>
                </template>
              </VCardItem>
              <VCardText>
                <div class="d-flex align-center gap-3">
                  <VProgressLinear :model-value="(gang.players / gang.max) * 100" :color="gang.level === 'สูง' ? 'warning' : gang.level === 'กลาง' ? 'accent' : 'primary'" height="6" rounded class="flex-grow-1" />
                  <span class="text-caption text-medium-emphasis">{{ gang.max - gang.players }} ที่นั่ง</span>
                </div>
                <div class="d-flex justify-space-between align-center mt-3">
                  <VChip size="small" :color="gang.level === 'สูง' ? 'warning' : gang.level === 'กลาง' ? 'accent' : 'primary'" variant="tonal">
                    {{ { 'เริ่มต้น': '🟢 เริ่มต้น', 'กลาง': '🟡 กลาง', 'สูง': '🔴 สูง' }[gang.level] }}
                  </VChip>
                  <VBtn color="primary" size="small" variant="outlined" @click="joinGang(gang)">
                    <VIcon icon="ri-user-add-line" class="mr-1" /> เข้าร่วม
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Sidebar -->
      <VCol cols="12" lg="4">
        <VCard elevation="0" class="info-card pa-4 mb-4">
          <h3 class="text-h6 font-weight-bold mb-3 text-primary">👥 ข้อดีของการตีก๊วน</h3>
          <VList density="compact" class="bg-transparent pa-0">
            <VListItem class="px-0"><template #prepend><VIcon icon="ri-money-baht-circle-line" color="#1B5E20" class="mr-3" /></template><VListItemTitle class="text-body-2">แชร์ค่าคอร์ท ประหยัดกว่า 50%</VListItemTitle></VListItem>
            <VListItem class="px-0"><template #prepend><VIcon icon="ri-user-heart-line" color="#FF6F00" class="mr-3" /></template><VListItemTitle class="text-body-2">เจอเพื่อนใหม่ ระดับใกล้เคียงกัน</VListItemTitle></VListItem>
            <VListItem class="px-0"><template #prepend><VIcon icon="ri-swap-line" color="#1565C0" class="mr-3" /></template><VListItemTitle class="text-body-2">เปลี่ยนคู่เล่นได้ ไม่อิ่มตัว</VListItemTitle></VListItem>
            <VListItem class="px-0"><template #prepend><VIcon icon="ri-trophy-line" color="#C62828" class="mr-3" /></template><VListItemTitle class="text-body-2">จัดแข่งเล็กๆ ในก๊วนได้</VListItemTitle></VListItem>
          </VList>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.page-wrapper { padding: 4px 0; }
.page-hero {
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
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
.gang-card { border-radius: 14px; transition: all 0.2s; }
.gang-card:hover { border-color: #1565C0; }
.gang-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
</style>
