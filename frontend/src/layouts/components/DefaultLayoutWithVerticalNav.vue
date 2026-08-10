<script lang="ts" setup>
import { themeConfig } from '@themeConfig'
import NavBarI18n from '@core/components/I18n.vue'
import { VerticalNavLayout } from '@layouts'
import allNavItems from '@/navigation/vertical'
import { useAuthStore } from '@/stores/use-auth-store'
import RoleBadge from '@/components/RoleBadge.vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'

// @layouts plugin

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// Filter nav items based on auth state
const navItems = computed(() => {
  return allNavItems.filter(item => {
    // Auth-required items hidden when not logged in
    if ((item as any).auth && !authStore.isAuthenticated) return false
    // Guest-only items hidden when logged in
    if ((item as any).guest && authStore.isAuthenticated) return false
    // Admin-only items hidden when not admin
    if ((item as any).admin && authStore.owner?.role !== 'admin') return false
    return true
  })
})

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
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n2 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <VSpacer />

        <div
          v-if="authStore.isAuthenticated && authStore.owner"
          class="d-flex align-center gap-2 me-3"
        >
          <span class="text-body-2 text-medium-emphasis d-none d-sm-inline">{{ authStore.owner.name }}</span>
          <RoleBadge :role="authStore.owner.role" size="small" />
          <VDivider vertical class="mx-1" />
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
      </div>
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

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
