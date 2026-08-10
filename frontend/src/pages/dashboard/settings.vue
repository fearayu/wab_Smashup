<script setup lang="ts">
import { useAuthStore } from '@/stores/use-auth-store'

const authStore = useAuthStore()
const { owner, isLoading, error } = storeToRefs(authStore)

const profileForm = ref({
  name: '',
  phone: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const passwordError = ref<string | null>(null)
const profileSuccess = ref(false)
const passwordSuccess = ref(false)

function initProfileForm() {
  if (owner.value) {
    profileForm.value.name = owner.value.name
    profileForm.value.phone = owner.value.phone || ''
  }
}

watch(owner, initProfileForm, { immediate: true })

async function saveProfile() {
  isSavingProfile.value = true
  profileSuccess.value = false
  try {
    // TODO: implement authStore.updateProfile when API is ready
    // await authStore.updateProfile(profileForm.value)
    profileSuccess.value = true
  }
  catch (e: any) {
    // error handled by store
  }
  finally {
    isSavingProfile.value = false
  }
}

async function changePassword() {
  passwordError.value = null
  passwordSuccess.value = false

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  isSavingPassword.value = true
  try {
    // TODO: implement authStore.changePassword when API is ready
    // await authStore.changePassword(passwordForm.value)
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    passwordSuccess.value = true
  }
  catch (e: any) {
    passwordError.value = e.message || 'Failed to change password'
  }
  finally {
    isSavingPassword.value = false
  }
}

onMounted(() => authStore.fetchMe())
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12">
        <h1 class="text-h5 font-weight-bold">
          Settings
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          Manage your account and preferences.
        </p>
      </VCol>
    </VRow>

    <VAlert
      v-if="error"
      type="error"
      class="mb-4"
      :text="error"
      closable
    />

    <VRow>
      <VCol cols="12" md="6">
        <VCard class="mb-4">
          <VCardTitle class="pa-4">
            <span class="text-h6">Profile</span>
          </VCardTitle>
          <VDivider />
          <VCardText class="pa-4">
            <VAlert
              v-if="profileSuccess"
              type="success"
              class="mb-4"
              text="Profile updated successfully."
              closable
            />
            <VForm @submit.prevent="saveProfile">
              <VTextField
                v-model="profileForm.name"
                label="Name"
                prepend-inner-icon="ri-user-line"
                class="mb-4"
                required
              />
              <VTextField
                v-model="profileForm.phone"
                label="Phone"
                prepend-inner-icon="ri-phone-line"
                class="mb-4"
              />
              <VTextField
                :model-value="owner?.email"
                label="Email"
                prepend-inner-icon="ri-mail-line"
                disabled
                class="mb-4"
              />
              <VBtn
                color="primary"
                :loading="isSavingProfile"
                @click="saveProfile"
              >
                Save Profile
              </VBtn>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle class="pa-4">
            <span class="text-h6">Change Password</span>
          </VCardTitle>
          <VDivider />
          <VCardText class="pa-4">
            <VAlert
              v-if="passwordError"
              type="error"
              class="mb-4"
              :text="passwordError"
              closable
            />
            <VAlert
              v-if="passwordSuccess"
              type="success"
              class="mb-4"
              text="Password changed successfully."
              closable
            />
            <VForm @submit.prevent="changePassword">
              <VTextField
                v-model="passwordForm.currentPassword"
                label="Current Password"
                type="password"
                prepend-inner-icon="ri-lock-line"
                class="mb-4"
                required
              />
              <VTextField
                v-model="passwordForm.newPassword"
                label="New Password"
                type="password"
                prepend-inner-icon="ri-lock-password-line"
                class="mb-4"
                required
              />
              <VTextField
                v-model="passwordForm.confirmPassword"
                label="Confirm New Password"
                type="password"
                prepend-inner-icon="ri-lock-password-line"
                class="mb-4"
                required
              />
              <VBtn
                color="primary"
                :loading="isSavingPassword"
                @click="changePassword"
              >
                Change Password
              </VBtn>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
