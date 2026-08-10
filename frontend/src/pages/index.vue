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
  { icon: 'ri-rocket-line', title: 'Create in 5 Minutes', desc: 'No coding needed. Just enter your court info and go live.' },
  { icon: 'ri-calendar-check-line', title: 'Real-time Booking', desc: 'Players book 24/7. No more double-bookings or missed calls.' },
  { icon: 'ri-bank-card-line', title: 'Auto Payment Verification', desc: 'Upload slips, get verified automatically on Pro plans.' },
  { icon: 'ri-bar-chart-line', title: 'Owner Dashboard', desc: 'Track revenue, peak hours, and occupancy at a glance.' },
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
      <h1 class="text-h3 font-weight-bold mb-4">
        Your Badminton Court's<br>Booking Website in 5 Minutes
      </h1>
      <p class="text-body-1 mb-8 opacity-90 max-w-md mx-auto">
        Stop replying to LINE chats. Let players book and pay automatically — 24/7.
      </p>
      <div class="d-flex justify-center gap-3 flex-wrap">
        <VBtn
          size="large"
          color="white"
          variant="elevated"
          class="text-primary font-weight-bold"
          @click="goToDashboard"
        >
          Get Started Free
        </VBtn>
        <VBtn
          size="large"
          color="white"
          variant="outlined"
          to="/demo"
        >
          See Demo
        </VBtn>
      </div>
    </VSheet>

    <!-- Features -->
    <VContainer class="py-12">
      <h2 class="text-h4 font-weight-bold text-center mb-10">
        Why Court Owners Love Smashup
      </h2>
      <VRow justify="center">
        <VCol
          v-for="f in features"
          :key="f.title"
          cols="12"
          sm="6"
          md="3"
        >
          <VCard class="h-100 pa-6 text-center" flat>
            <VIcon :icon="f.icon" size="48" color="primary" class="mb-4" />
            <h3 class="text-h6 font-weight-bold mb-2">
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
    <VSheet class="py-12" color="grey-lighten-4">
      <VContainer>
        <h2 class="text-h4 font-weight-bold text-center mb-10">
          Simple Pricing
        </h2>
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

    <!-- Footer CTA -->
    <VContainer class="py-12 text-center">
      <h2 class="text-h4 font-weight-bold mb-4">
        Ready to get more bookings?
      </h2>
      <p class="text-body-1 text-medium-emphasis mb-6">
        Join hundreds of badminton court owners across Thailand.
      </p>
      <VBtn color="primary" size="large" @click="goToDashboard">
        Create Your Booking Site
      </VBtn>
    </VContainer>
  </div>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #030213 0%, #02010e 100%);
}
</style>
