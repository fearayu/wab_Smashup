import { defineStore } from 'pinia'
import { authApi } from '@/apis/auth-api'
import type { LoginBody, Owner, RegisterBody } from '@/models'

export const useAuthStore = defineStore('AuthStore', () => {
  const owner = ref<Owner | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const _initialized = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!owner.value)

  async function login(body: LoginBody) {
    isLoading.value = true
    error.value = null
    try {
      const res = await authApi.login(body)
      token.value = res.data.token
      owner.value = res.data.owner
      localStorage.setItem('smashup_token', res.data.token)
      return res.data
    }
    catch (e: any) {
      error.value = e.message
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  async function register(body: RegisterBody) {
    isLoading.value = true
    error.value = null
    try {
      const res = await authApi.register(body)
      token.value = res.data.token
      owner.value = res.data.owner
      localStorage.setItem('smashup_token', res.data.token)
      return res.data
    }
    catch (e: any) {
      error.value = e.message
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      owner.value = res.data
    }
    catch (e: any) {
      logout()
    }
  }

  function logout() {
    owner.value = null
    token.value = null
    localStorage.removeItem('smashup_token')
  }

  function init() {
    const stored = localStorage.getItem('smashup_token')
    if (stored) {
      token.value = stored
      fetchMe()
    }
  }

  return {
    owner,
    token,
    isLoading,
    error,
    isAuthenticated,
    _initialized,
    login,
    register,
    fetchMe,
    logout,
    init,
  }
})
