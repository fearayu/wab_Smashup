import { defineStore } from 'pinia'
import { userApi } from '@/apis/user-api'
import type { CreateUserBody, UpdateUserBody, User } from '@/models'

export const useUserStore = defineStore('UserStore', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    isLoading.value = true
    error.value = null
    try {
      const res = await userApi.list()
      users.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function createUser(body: CreateUserBody) {
    const res = await userApi.create(body)
    users.value.unshift(res.data)
    return res.data
  }

  async function updateUser(id: string, body: UpdateUserBody) {
    const res = await userApi.update(id, body)
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = res.data
    return res.data
  }

  async function deleteUser(id: string) {
    await userApi.remove(id)
    users.value = users.value.filter(u => u.id !== id)
  }

  return { users, isLoading, error, fetchUsers, createUser, updateUser, deleteUser }
})
