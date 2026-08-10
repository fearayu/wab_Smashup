<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'
import { useVenueStore } from '@/stores/use-venue-store'
import { useCourtStore } from '@/stores/use-court-store'

const router = useRouter()
const authStore = useAuthStore()
const venueStore = useVenueStore()
const courtStore = useCourtStore()

const step = ref(1)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const venueForm = ref({
  name: '',
  slug: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  primary_color: '#1B5E20',
})

const courts = ref([{ name: 'Court A', type: 'standard' as const, hourly_rate: 250 }])

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 30)
}

watch(() => venueForm.value.name, (v) => {
  if (!venueForm.value.slug || venueForm.value.slug === slugify(v.slice(0, -1)))
    venueForm.value.slug = slugify(v)
})

function addCourt() {
  courts.value.push({ name: `Court ${String.fromCharCode(65 + courts.value.length)}`, type: 'standard', hourly_rate: 250 })
}

function removeCourt(idx: number) {
  courts.value.splice(idx, 1)
}

async function submitVenue() {
  error.value = null
  isSubmitting.value = true
  try {
    const venue = await venueStore.createVenue({
      name: venueForm.value.name,
      slug: venueForm.value.slug,
      description: venueForm.value.description || undefined,
      address: venueForm.value.address || undefined,
      phone: venueForm.value.phone || undefined,
      email: venueForm.value.email || undefined,
      primary_color: venueForm.value.primary_color,
    })
    for (const c of courts.value) {
      await courtStore.createCourt(venue.id, {
        name: c.name,
        type: c.type,
        hourly_rate: c.hourly_rate,
      })
    }
    step.value = 3
  }
  catch (e: any) {
    error.value = e.message
  }
  finally {
    isSubmitting.value = false
  }
}

function finish() {
  router.push('/dashboard')
}

onMounted(() => {
  if (!authStore.isAuthenticated)
    router.push('/login')
})
</script>

<template>
  <div class="onboarding-wrapper d-flex align-center justify-center pa-4">
    <VCard max-width="680" width="100%" class="pa-8 onboarding-card" elevation="0">
      <div class="text-center mb-8">
        <div class="logo-wrapper mb-4 mx-auto">
          <VIcon icon="ri-shuttle-line" size="40" color="white" />
        </div>
        <h1 class="text-h5 font-weight-bold text-primary mb-2">
          ยินดีต้อนรับสู่ Smashup
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          ตั้งค่าเว็บไซต์จองสนามของคุณใน 3 ขั้นตอนง่ายๆ
        </p>
      </div>

      <VStepper v-model="step" class="mb-6" flat>
        <VStepperHeader>
          <VStepperItem value="1" title="ข้อมูลสนาม" />
          <VDivider />
          <VStepperItem value="2" title="คอร์ท" />
          <VDivider />
          <VStepperItem value="3" title="เสร็จสิ้น" />
        </VStepperHeader>
      </VStepper>

      <VAlert
        v-if="error"
        type="error"
        class="mb-4"
        :text="error"
        closable
      />

      <!-- Step 1: Venue Info -->
      <div v-if="step === 1">
        <h2 class="text-h6 font-weight-bold mb-4 text-primary">
          ข้อมูลสนาม
        </h2>
        <VForm @submit.prevent="step = 2">
          <VTextField v-model="venueForm.name" label="ชื่อสนาม *" class="mb-4" required />
          <VTextField v-model="venueForm.slug" label="URL สนาม *" prefix="https://" suffix=".smashup.app" class="mb-4" hint="ใช้ตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น" required />
          <VTextField v-model="venueForm.description" label="คำอธิบาย" class="mb-4" />
          <VTextField v-model="venueForm.address" label="ที่อยู่" class="mb-4" />
          <VTextField v-model="venueForm.phone" label="เบอร์โทร" class="mb-4" />
          <VTextField v-model="venueForm.email" label="อีเมล" type="email" class="mb-4" />
          <VColorPicker v-model="venueForm.primary_color" label="สีธีม" class="mb-4" />
          <div class="d-flex justify-end">
            <VBtn color="primary" @click="step = 2">
              ถัดไป: เพิ่มคอร์ท
              <VIcon end icon="ri-arrow-right-line" />
            </VBtn>
          </div>
        </VForm>
      </div>

      <!-- Step 2: Courts -->
      <div v-if="step === 2">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold text-primary">
            คอร์ทและราคา
          </h2>
          <VBtn color="primary" variant="text" prepend-icon="ri-add-line" @click="addCourt">
            เพิ่มคอร์ท
          </VBtn>
        </div>

        <VRow v-for="(court, idx) in courts" :key="idx" class="mb-2" align="end">
          <VCol cols="12" sm="5">
            <VTextField v-model="court.name" label="Court Name" />
          </VCol>
          <VCol cols="6" sm="3">
            <VSelect v-model="court.type" :items="['standard', 'premium']" label="Type" />
          </VCol>
          <VCol cols="6" sm="3">
            <VTextField v-model.number="court.hourly_rate" label="Hourly Rate (฿)" type="number" />
          </VCol>
          <VCol cols="12" sm="1">
            <IconBtn v-if="courts.length > 1" color="error" @click="removeCourt(idx)">
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </VCol>
        </VRow>

        <div class="d-flex justify-space-between mt-6">
          <VBtn variant="text" @click="step = 1">
            กลับ
          </VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submitVenue">
            สร้างเว็บไซต์
          </VBtn>
        </div>
      </div>

      <!-- Step 3: Preview -->
      <div v-if="step === 3" class="text-center">
        <VIcon icon="ri-check-line" size="64" color="success" class="mb-4" />
        <h2 class="text-h5 font-weight-bold mb-2 text-primary">
          เว็บไซต์จองสนามของคุณพร้อมใช้งานแล้ว!
        </h2>
        <p class="text-body-1 mb-6">
          แชร์ลิงก์นี้กับผู้เล่นของคุณ:<br>
          <a :href="`https://${venueForm.slug}.smashup.app`" target="_blank" class="text-primary font-weight-bold">
            https://{{ venueForm.slug }}.smashup.app
          </a>
        </p>
        <VBtn color="primary" size="large" @click="finish">
          <VIcon icon="ri-dashboard-line" class="mr-2" />
          ไปที่แดชบอร์ด
        </VBtn>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.onboarding-wrapper {
  min-height: 100dvh;
  background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
}

.onboarding-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(27, 94, 32, 0.1);
}

.logo-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
}
</style>
