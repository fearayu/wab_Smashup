<script lang="ts" setup>
import { themeConfig } from '@themeConfig'
import NavBarI18n from '@core/components/I18n.vue'
import { HorizontalNavLayout } from '@layouts'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import navItems from '@/navigation/horizontal'
import { useAuthStore } from '@/stores/use-auth-store'
import RoleBadge from '@/components/RoleBadge.vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'

const authStore = useAuthStore()
const router = useRouter()

// Filter nav items based on auth state
const filteredNavItems = computed(() => {
  if (authStore.isAuthenticated) return navItems
  // Not logged in: only show Home
  return navItems.filter(item => item.title === 'หน้าหลัก')
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)

// watching if the fallback state is active and the refLoadingIndicator component is available
watch([isFallbackStateActive, refLoadingIndicator], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()

  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION
</script>

<template>
  <HorizontalNavLayout :nav-items="filteredNavItems">
    <!-- 👉 navbar -->
    <template #navbar>
      <RouterLink
        to="/"
        class="d-flex align-center gap-x-3 text-decoration-none"
      >
        <div class="nav-logo-icon">🏸</div>
        <h1 class="text-h6 font-weight-bold text-primary">
          Smashup
        </h1>
      </RouterLink>
      <VSpacer />

      <!-- Auth controls -->
      <div
        v-if="authStore.isAuthenticated && authStore.owner"
        class="d-flex align-center gap-2 me-3"
      >
        <span class="text-body-2 text-medium-emphasis d-none d-sm-inline">{{ authStore.owner.name }}</span>
        <RoleBadge :role="authStore.owner.role" size="small" />
        <VBtn
          icon="ri-logout-box-line"
          size="small"
          variant="text"
          color="error"
          @click="handleLogout"
        />
      </div>
      <VBtn
        v-else
        variant="text"
        size="small"
        to="/login"
        class="me-2"
      >
        <VIcon icon="ri-login-box-line" class="mr-1" /> เข้าสู่ระบบ
      </VBtn>

      <NavBarI18n
        v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
        :languages="themeConfig.app.i18n.langConfig"
      />

      <NavbarThemeSwitcher />
    </template>

    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- 👉 Pages -->
    <RouterView v-slot="{ Component }">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </HorizontalNavLayout>
</template>

<style scoped>
.nav-logo-icon {
  font-size: 28px;
}
</style>
