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
    <VCard max-width="420" width="100%" class="pa-8 login-card" elevation="0">
      <div class="text-center mb-8">
        <div class="logo-wrapper mb-4 mx-auto">
          <VIcon icon="ri-shuttle-line" size="48" color="white" />
        </div>
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          Smashup
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ isRegister ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ' }}
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
          class="mb-4 mt-2"
          elevation="2"
        >
          <VIcon :icon="isRegister ? 'ri-user-add-line' : 'ri-login-box-line'" class="mr-2" />
          {{ isRegister ? 'สร้างบัญชี' : 'เข้าสู่ระบบ' }}
        </VBtn>
      </VForm>

      <VDivider class="my-4" />

      <div class="text-center">
        <VBtn
          variant="text"
          color="primary"
          @click="isRegister = !isRegister"
          class="text-none"
        >
          {{ isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก' }}
        </VBtn>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100dvh;
  background: linear-gradient(135deg, #1B5E20 0%, #0D2818 100%);
  position: relative;
  overflow: hidden;
}

.login-wrapper::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 111, 0, 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.login-wrapper::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(27, 94, 32, 0.3) 0%, transparent 70%);
  border-radius: 50%;
}

.login-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.logo-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
}
</style>
