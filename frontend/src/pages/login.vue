<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'

const router = useRouter()
const authStore = useAuthStore()

const isRegister = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  email: '',
  password: '',
  name: '',
  phone: '',
})

watch(() => authStore.isAuthenticated, (v) => {
  if (v)
    router.push('/dashboard')
})

async function submit() {
  error.value = null
  isLoading.value = true
  try {
    if (isRegister.value) {
      await authStore.register({
        email: form.value.email,
        password: form.value.password,
        name: form.value.name,
        phone: form.value.phone || undefined,
      })
    }
    else {
      await authStore.login({
        email: form.value.email,
        password: form.value.password,
      })
    }
  }
  catch (e: any) {
    error.value = e.message
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated)
    router.push('/dashboard')
})
</script>

<template>
  <div class="login-wrapper d-flex align-center justify-center pa-4">
    <VCard max-width="420" width="100%" class="pa-6" elevation="4">
      <div class="text-center mb-6">
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          Smashup
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ isRegister ? 'Create your account' : 'Sign in to your account' }}
        </p>
      </div>

      <VAlert
        v-if="error"
        type="error"
        class="mb-4"
        :text="error"
        closable
      />

      <VForm @submit.prevent="submit">
        <VTextField
          v-if="isRegister"
          v-model="form.name"
          label="Full Name"
          prepend-inner-icon="ri-user-line"
          class="mb-4"
          required
        />
        <VTextField
          v-model="form.email"
          label="Email"
          type="email"
          prepend-inner-icon="ri-mail-line"
          class="mb-4"
          required
        />
        <VTextField
          v-model="form.password"
          label="Password"
          type="password"
          prepend-inner-icon="ri-lock-line"
          class="mb-4"
          required
        />
        <VTextField
          v-if="isRegister"
          v-model="form.phone"
          label="Phone (optional)"
          prepend-inner-icon="ri-phone-line"
          class="mb-4"
        />

        <VBtn
          color="primary"
          block
          size="large"
          type="submit"
          :loading="isLoading"
          class="mb-4"
        >
          {{ isRegister ? 'Create Account' : 'Sign In' }}
        </VBtn>
      </VForm>

      <div class="text-center">
        <VBtn variant="text" @click="isRegister = !isRegister">
          {{ isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register" }}
        </VBtn>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100dvh;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
</style>
