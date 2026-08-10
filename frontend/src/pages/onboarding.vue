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
  primary_color: '#030213',
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
    <VCard max-width="680" width="100%" class="pa-6" elevation="4">
      <div class="text-center mb-6">
        <h1 class="text-h5 font-weight-bold text-primary mb-2">
          Welcome to Smashup
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          Let's set up your booking website in 3 quick steps
        </p>
      </div>

      <VStepper v-model="step" class="mb-6" flat>
        <VStepperHeader>
          <VStepperItem value="1" title="Venue" />
          <VDivider />
          <VStepperItem value="2" title="Courts" />
          <VDivider />
          <VStepperItem value="3" title="Preview" />
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
        <h2 class="text-h6 font-weight-bold mb-4">
          Venue Information
        </h2>
        <VForm @submit.prevent="step = 2">
          <VTextField v-model="venueForm.name" label="Venue Name *" class="mb-4" required />
          <VTextField v-model="venueForm.slug" label="Site URL Slug *" prefix="https://" suffix=".smashup.app" class="mb-4" hint="Lowercase letters, numbers, hyphens only" required />
          <VTextField v-model="venueForm.description" label="Description" class="mb-4" />
          <VTextField v-model="venueForm.address" label="Address" class="mb-4" />
          <VTextField v-model="venueForm.phone" label="Phone" class="mb-4" />
          <VTextField v-model="venueForm.email" label="Email" type="email" class="mb-4" />
          <VColorPicker v-model="venueForm.primary_color" label="Theme Color" class="mb-4" />
          <div class="d-flex justify-end">
            <VBtn color="primary" @click="step = 2">
              Next: Add Courts
              <VIcon end icon="ri-arrow-right-line" />
            </VBtn>
          </div>
        </VForm>
      </div>

      <!-- Step 2: Courts -->
      <div v-if="step === 2">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">
            Courts & Pricing
          </h2>
          <VBtn color="primary" variant="text" prepend-icon="ri-add-line" @click="addCourt">
            Add Court
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
            Back
          </VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submitVenue">
            Create Website
          </VBtn>
        </div>
      </div>

      <!-- Step 3: Preview -->
      <div v-if="step === 3" class="text-center">
        <VIcon icon="ri-check-line" size="64" color="success" class="mb-4" />
        <h2 class="text-h5 font-weight-bold mb-2">
          Your booking website is ready!
        </h2>
        <p class="text-body-1 mb-6">
          Share this link with your players:<br>
          <a :href="`https://${venueForm.slug}.smashup.app`" target="_blank" class="text-primary font-weight-bold">
            https://{{ venueForm.slug }}.smashup.app
          </a>
        </p>
        <VBtn color="primary" size="large" @click="finish">
          Go to Dashboard
        </VBtn>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.onboarding-wrapper {
  min-height: 100dvh;
  background: #f8fafc;
}
</style>
