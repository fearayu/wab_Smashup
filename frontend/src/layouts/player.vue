<script setup lang="ts">
import { useSiteConfigStore } from '@/stores/use-site-config-store'

const siteStore = useSiteConfigStore()
const venue = computed(() => siteStore.publicSite?.venue)

const primaryColor = computed(() => venue.value?.primary_color ?? '#1B5E20')
</script>

<template>
  <div class="player-layout">
    <VAppBar
      flat
      :color="primaryColor"
      density="comfortable"
    >
      <VAppBarTitle class="text-white font-weight-bold">
        {{ venue?.name ?? 'Smashup' }}
      </VAppBarTitle>
    </VAppBar>

    <VMain class="player-main">
      <RouterView />
    </VMain>

    <VFooter class="player-footer text-caption text-center py-4">
      <span>Powered by Smashup — Badminton court booking made easy</span>
    </VFooter>
  </div>
</template>

<style scoped>
.player-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.player-main {
  flex: 1;
  padding: 16px;
  background: #f8fafc;
}
.player-footer {
  background: #fff;
  border-top: 1px solid #e2e8f0;
}
</style>
