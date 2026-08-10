<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isRegister = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

const form = ref({
  email: '',
  password: '',
  name: '',
  phone: '',
})

watch(() => authStore.isAuthenticated, (v) => {
  if (v) {
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
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
    } else {
      await authStore.login({
        email: form.value.email,
        password: form.value.password,
      })
    }
    // Router redirect handled by watcher above
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

const isValid = computed(() => {
  if (isRegister.value) {
    return form.value.email && form.value.password.length >= 8 && form.value.name.trim()
  }
  return form.value.email && form.value.password
})

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<template>
  <div class="login-wrapper d-flex align-center justify-center pa-4">
    <VCard max-width="440" width="100%" class="pa-8 login-card" elevation="0">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="logo-wrapper mb-4 mx-auto">
          <div class="shuttlecock-icon">🏸</div>
        </div>
        <h1 class="text-h4 font-weight-bold text-primary mb-1">
          Smashup
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ isRegister ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบจัดการสนามแบดมินตัน' }}
        </p>
      </div>

      <!-- Error -->
      <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </VAlert>

      <!-- Form -->
      <VForm @submit.prevent="submit">
        <VTextField
          v-if="isRegister"
          v-model="form.name"
          label="ชื่อ-นามสกุล"
          prepend-inner-icon="ri-user-line"
          variant="outlined"
          density="comfortable"
          class="mb-4 login-field"
          required
          color="primary"
          base-color="primary"
        />
        <VTextField
          v-model="form.email"
          label="อีเมล"
          type="email"
          prepend-inner-icon="ri-mail-line"
          variant="outlined"
          density="comfortable"
          class="mb-4 login-field"
          required
          color="primary"
          base-color="primary"
        />
        <VTextField
          v-model="form.password"
          label="รหัสผ่าน"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="ri-lock-line"
          variant="outlined"
          density="comfortable"
          class="mb-1 login-field"
          required
          color="primary"
          base-color="primary"
          :hint="isRegister ? 'อย่างน้อย 8 ตัวอักษร' : ''"
          persistent-hint
        >
          <template #append-inner>
            <VBtn
              :icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
              size="x-small"
              variant="text"
              @click="showPassword = !showPassword"
            />
          </template>
        </VTextField>

        <VTextField
          v-if="isRegister"
          v-model="form.phone"
          label="เบอร์โทรศัพท์ (ไม่บังคับ)"
          prepend-inner-icon="ri-phone-line"
          variant="outlined"
          density="comfortable"
          class="mb-4 login-field"
          color="primary"
          base-color="primary"
        />

        <VBtn
          color="primary"
          block
          size="large"
          type="submit"
          :loading="isLoading"
          :disabled="!isValid"
          class="mb-4 mt-2 login-btn"
          elevation="3"
        >
          <VIcon :icon="isRegister ? 'ri-user-add-line' : 'ri-login-box-line'" class="mr-2" />
          {{ isRegister ? 'สร้างบัญชี' : 'เข้าสู่ระบบ' }}
        </VBtn>
      </VForm>

      <VDivider class="my-4">
        <span class="text-caption text-medium-emphasis px-2">หรือ</span>
      </VDivider>

      <div class="text-center">
        <VBtn
          variant="text"
          color="primary"
          size="small"
          @click="isRegister = !isRegister; error = null"
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
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 111, 0, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 8s ease-in-out infinite;
}

.login-wrapper::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -15%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(27, 94, 32, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 10s ease-in-out infinite 2s;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.login-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(27, 94, 32, 0.1);
}

/* Fix Vuetify text field default red colors */
.login-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.6;
  color: rgb(var(--v-theme-primary));
}

.login-field :deep(.v-field) {
  color: #1E293B;
}

.login-field :deep(.v-label) {
  color: #475569;
}

.login-field :deep(.v-field__append-inner .v-icon),
.login-field :deep(.v-field__prepend-inner .v-icon) {
  color: #64748B;
  opacity: 1;
}

/* Fix hint text */
.login-field :deep(.v-messages__message) {
  color: #64748B;
}

/* Fix button */
.login-btn :deep(.v-btn__overlay) {
  opacity: 0;
}

.logo-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(27, 94, 32, 0.3);
}

.shuttlecock-icon {
  font-size: 42px;
  animation: shuttle-float 2s ease-in-out infinite;
}

@keyframes shuttle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
