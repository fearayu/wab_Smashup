<script setup lang="ts">
import { useUserStore } from '@/stores/use-user-store'
import type { CreateUserBody, UpdateUserBody, User } from '@/models'

const userStore = useUserStore()
const { users, isLoading, error } = storeToRefs(userStore)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Created At', key: 'createdAt' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

// Dialog state
const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingUser = ref<User | null>(null)
const deletingUser = ref<User | null>(null)

const form = ref<CreateUserBody & UpdateUserBody>({ name: '', email: '' })

function openCreate() {
  editingUser.value = null
  form.value = { name: '', email: '' }
  dialog.value = true
}

function openEdit(user: User) {
  editingUser.value = user
  form.value = { name: user.name, email: user.email }
  dialog.value = true
}

function openDelete(user: User) {
  deletingUser.value = user
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingUser.value)
      await userStore.updateUser(editingUser.value.id, form.value)
    else
      await userStore.createUser(form.value as CreateUserBody)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingUser.value) return
  isSubmitting.value = true
  try {
    await userStore.deleteUser(deletingUser.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

onMounted(() => userStore.fetchUsers())
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">Users Management</span>
        <VBtn
          color="primary"
          prepend-icon="ri-user-add-line"
          @click="openCreate"
        >
          Add User
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VDataTable
        :headers="headers"
        :items="users"
        :loading="isLoading"
        hover
      >
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">Edit</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">Delete</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            No users yet. Click "Add User" to create one.
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="480" persistent>
      <VCard :title="editingUser ? 'Edit User' : 'Add User'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VTextField
              v-model="form.name"
              label="Name"
              prepend-inner-icon="ri-user-line"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.email"
              label="Email"
              type="email"
              prepend-inner-icon="ri-mail-line"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingUser ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete User">
        <VCardText>
          Are you sure you want to delete <strong>{{ deletingUser?.name }}</strong>? This action cannot be undone.
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">Cancel</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
