<script setup lang="ts">
import { onMounted } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useUserStore } from '@/stores/use-user-store'

useSEO({
  title: 'Dashboard - Starter',
  description: 'Starter template overview.',
  keywords: ['dashboard', 'starter', 'template'],
})

const userStore = useUserStore()

onMounted(async () => {
  await userStore.fetchUsers()
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Dashboard</h1>

    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="48">
              <VIcon icon="ri-user-3-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Users</div>
              <div class="text-h5 font-weight-bold">{{ userStore.users.length }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" md="6">
        <VCard title="Recent Users">
          <VList lines="two">
            <VListItem
              v-for="user in userStore.users.slice(0, 5)"
              :key="user.id"
            >
              <template #prepend>
                <VAvatar color="primary" variant="tonal" size="36">
                  <VIcon icon="ri-user-3-line" size="18" />
                </VAvatar>
              </template>
              <VListItemTitle>{{ user.name }}</VListItemTitle>
              <VListItemSubtitle>{{ user.email }}</VListItemSubtitle>
            </VListItem>
            <VListItem v-if="userStore.users.length === 0" class="text-center text-medium-emphasis py-4">
              No users yet.
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'user-page' }">
              <VBtn variant="text" size="small">View all users</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
