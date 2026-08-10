<script setup lang="ts">
import { useCourtStore } from '@/stores/use-court-store'
import { useVenueStore } from '@/stores/use-venue-store'
import type { Court, CreateCourtBody, UpdateCourtBody } from '@/models'

const courtStore = useCourtStore()
const venueStore = useVenueStore()

const { courts, isLoading, error } = storeToRefs(courtStore)
const { venues } = storeToRefs(venueStore)

const selectedVenueId = ref<string | null>(null)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Hourly Rate', key: 'hourly_rate' },
  { title: 'Active', key: 'is_active' },
  { title: 'Actions', key: 'action', sortable: false, align: 'end' as const },
]

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingCourt = ref<Court | null>(null)
const deletingCourt = ref<Court | null>(null)

const form = ref<CreateCourtBody & UpdateCourtBody>({
  name: '',
  type: 'standard',
  hourly_rate: 0,
})

function openCreate() {
  editingCourt.value = null
  form.value = { name: '', type: 'standard', hourly_rate: 0 }
  dialog.value = true
}

function openEdit(court: Court) {
  editingCourt.value = court
  form.value = {
    name: court.name,
    type: court.type,
    hourly_rate: court.hourly_rate,
  }
  dialog.value = true
}

function openDelete(court: Court) {
  deletingCourt.value = court
  deleteDialog.value = true
}

async function submit() {
  if (!selectedVenueId.value) return
  isSubmitting.value = true
  try {
    if (editingCourt.value)
      await courtStore.updateCourt(editingCourt.value.id, form.value)
    else
      await courtStore.createCourt(selectedVenueId.value, form.value as CreateCourtBody)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingCourt.value) return
  isSubmitting.value = true
  try {
    await courtStore.deleteCourt(deletingCourt.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function loadCourts() {
  if (selectedVenueId.value)
    courtStore.fetchCourts(selectedVenueId.value)
}

watch(selectedVenueId, loadCourts)

onMounted(() => {
  venueStore.fetchVenues().then(() => {
    if (venues.value.length && !selectedVenueId.value)
      selectedVenueId.value = venues.value[0].id
  })
})
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12" class="d-flex align-center justify-space-between flex-wrap gap-4">
        <h1 class="text-h5 font-weight-bold">
          Courts
        </h1>
        <div class="d-flex align-center gap-3">
          <VSelect
            v-model="selectedVenueId"
            :items="venues"
            item-title="name"
            item-value="id"
            label="Venue"
            density="compact"
            style="min-width: 200px"
            hide-details
          />
          <VBtn
            color="primary"
            prepend-icon="ri-add-line"
            :disabled="!selectedVenueId"
            @click="openCreate"
          >
            Add Court
          </VBtn>
        </div>
      </VCol>
    </VRow>

    <VAlert
      v-if="error"
      type="error"
      class="mb-4"
      :text="error"
      closable
    />

    <VCard>
      <VDataTable
        :headers="headers"
        :items="courts"
        :loading="isLoading"
        hover
      >
        <template #item.type="{ item }">
          <VChip size="small" :color="item.type === 'premium' ? 'primary' : 'default'" variant="tonal">
            {{ item.type }}
          </VChip>
        </template>

        <template #item.hourly_rate="{ item }">
          ฿{{ item.hourly_rate?.toLocaleString() }}
        </template>

        <template #item.is_active="{ item }">
          <VChip size="small" :color="item.is_active ? 'success' : 'error'" variant="tonal">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </VChip>
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
            <template v-if="!selectedVenueId">
              Select a venue to view courts.
            </template>
            <template v-else>
              No courts yet for this venue. Click "Add Court" to create one.
            </template>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="480" persistent>
      <VCard :title="editingCourt ? 'Edit Court' : 'Add Court'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VTextField v-model="form.name" label="Court Name *" class="mb-4" required />
            <VSelect
              v-model="form.type"
              :items="['standard', 'premium']"
              label="Type *"
              class="mb-4"
              required
            />
            <VTextField
              v-model.number="form.hourly_rate"
              label="Hourly Rate (฿) *"
              type="number"
              class="mb-4"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submit">
            {{ editingCourt ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Court">
        <VCardText>
          Are you sure you want to delete <strong>{{ deletingCourt?.name }}</strong>?
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">Cancel</VBtn>
          <VBtn color="error" :loading="isSubmitting" @click="confirmDelete">
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
