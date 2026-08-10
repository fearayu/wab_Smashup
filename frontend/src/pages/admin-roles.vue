<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'
import { authApi } from '@/apis/auth-api'
import RoleBadge from '@/components/RoleBadge.vue'
import type { Owner } from '@/models/owner'

const authStore = useAuthStore()
const owners = ref<Owner[]>([])
const isLoading = ref(false)
const updatingId = ref<string | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')

async function fetchOwners() {
  isLoading.value = true
  try {
    const res = await authApi.listOwners()
    owners.value = res.data
  } catch (e: any) {
    snackbarText.value = 'โหลดข้อมูลไม่สำเร็จ: ' + e.message
    snackbar.value = true
  } finally {
    isLoading.value = false
  }
}

async function updateRole(ownerId: string, role: 'admin' | 'member' | 'user') {
  updatingId.value = ownerId
  try {
    const res = await authApi.updateRole(ownerId, { role })
    const idx = owners.value.findIndex(o => o.id === ownerId)
    if (idx !== -1) owners.value[idx] = res.data
    snackbarText.value = `เปลี่ยนยศเป็น ${roleLabel(role)} สำเร็จ!`
    snackbar.value = true
  } catch (e: any) {
    snackbarText.value = 'เปลี่ยนยศไม่สำเร็จ: ' + e.message
    snackbar.value = true
  } finally {
    updatingId.value = null
  }
}

function roleLabel(role: string) {
  return { admin: '👑 แอดมิน', member: '🛡️ เจ้าของสนาม', user: '👤 ผู้เล่น' }[role] || role
}

onMounted(fetchOwners)
</script>

<template>
  <div class="page-wrapper">
    <VSheet class="page-hero pa-8 mb-6 rounded-lg">
      <div class="d-flex align-center gap-4">
        <div class="hero-icon">
          <VIcon icon="ri-admin-line" size="36" color="white" />
        </div>
        <div>
          <h1 class="text-h4 font-weight-bold text-white mb-1">จัดการยศผู้ใช้</h1>
          <p class="text-body-1 text-white opacity-80">กำหนดสิทธิ์ของแต่ละบัญชี — Admin, Member, User</p>
        </div>
      </div>
    </VSheet>

    <VCard elevation="1" class="section-card">
      <VCardText class="pa-4">
        <VTable v-if="!isLoading">
          <thead>
            <tr>
              <th class="text-body-2 font-weight-bold">ชื่อ</th>
              <th class="text-body-2 font-weight-bold">อีเมล</th>
              <th class="text-body-2 font-weight-bold">แผน</th>
              <th class="text-body-2 font-weight-bold">ยศปัจจุบัน</th>
              <th class="text-body-2 font-weight-bold text-center">เปลี่ยนยศ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="owner in owners" :key="owner.id">
              <td class="font-weight-medium">{{ owner.name }}</td>
              <td class="text-caption text-medium-emphasis">{{ owner.email }}</td>
              <td>
                <VChip size="x-small" :color="owner.plan === 'pro' ? 'warning' : 'default'">
                  {{ owner.plan }}
                </VChip>
              </td>
              <td><RoleBadge :role="owner.role" /></td>
              <td>
                <div class="d-flex justify-center gap-2">
                  <VBtn
                    size="x-small"
                    :variant="owner.role === 'admin' ? 'flat' : 'outlined'"
                    :color="owner.role === 'admin' ? 'error' : 'default'"
                    :disabled="owner.role === 'admin' || updatingId === owner.id || owner.id === authStore.owner?.id"
                    @click="updateRole(owner.id, 'admin')"
                  >
                    👑 Admin
                  </VBtn>
                  <VBtn
                    size="x-small"
                    :variant="owner.role === 'member' ? 'flat' : 'outlined'"
                    color="primary"
                    :disabled="owner.role === 'member' || updatingId === owner.id || owner.id === authStore.owner?.id"
                    @click="updateRole(owner.id, 'member')"
                  >
                    🛡️ Member
                  </VBtn>
                  <VBtn
                    size="x-small"
                    :variant="owner.role === 'user' ? 'flat' : 'outlined'"
                    color="secondary"
                    :disabled="owner.role === 'user' || updatingId === owner.id || owner.id === authStore.owner?.id"
                    @click="updateRole(owner.id, 'user')"
                  >
                    👤 User
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
        <div v-else class="text-center py-4">
          <VProgressCircular indeterminate color="primary" />
        </div>
      </VCardText>
    </VCard>

    <VSnackbar v-model="snackbar" timeout="3000" color="primary">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.page-wrapper { padding: 4px 0; }
.page-hero { background: linear-gradient(135deg, #B71C1C, #7F0000); border-radius: 18px; }
.hero-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-card { border-radius: 18px; }
</style>
