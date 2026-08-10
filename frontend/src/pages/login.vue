<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

import miscMaskDark from '@images/misc/misc-mask-dark.png'
import miscMaskLight from '@images/misc/misc-mask-light.png'
import tree1 from '@images/misc/tree1.png'
import tree3 from '@images/misc/tree3.png'

import { VForm } from 'vuetify/components'

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const router = useRouter()
const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

const isProcessing = ref(false)
const refLoginForm = ref<VForm>()
const isPasswordVisible = ref(false)
const email = ref('')
const password = ref('')

async function onClickLogin() {
  const isFormValid = await refLoginForm?.value?.validate()
  if (!isFormValid?.valid)
    return
  // TODO: implement login
  router.push('/')
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-sm-4 pa-md-7 pa-0" min-width="500">
      <VCardText>
        <div class="d-flex align-center gap-x-3 justify-center mb-6">
          <VNodeRenderer :nodes="themeConfig.app.logo" />

          <h1 class="auth-title">
            {{ themeConfig.app.title.toLocaleUpperCase() }}
          </h1>
        </div>
        <p class="mb-0 text-center">
          Standard System
        </p>
      </VCardText>

      <VCardText>
        <VForm ref="refLoginForm" @submit.prevent="onClickLogin">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="email"
                autofocus
                label="Email"
                type="email"
                :rules="[requiredValidator, emailValidator]"
                placeholder="your@email.com"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="password"
                label="Password"
                placeholder="············"
                :rules="[requiredValidator]"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />

              <div class="d-flex align-center flex-wrap justify-space-between my-5 gap-4" />

              <VBtn block type="submit" :loading="isProcessing">
                Login
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <div class="d-flex gap-x-2 auth-footer-start-tree">
      <img class="d-none d-md-block" :src="tree3" :height="120" :width="67">
      <img
        class="d-none d-md-block align-self-end"
        :src="tree3"
        :height="70"
        :width="40"
      >
    </div>

    <img
      :src="tree1"
      class="auth-footer-end-tree d-none d-md-block"
      :width="97"
      :height="210"
    >

    <!-- bg img -->
    <img
      class="auth-footer-mask d-none d-md-block"
      :src="authThemeMask"
      height="172"
    >

    <!-- Snackbar Message -->
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
