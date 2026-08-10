<script setup lang="ts">
import { useVenueStore } from '@/stores/use-venue-store'
import type { CreateVenueBody, UpdateVenueBody, Venue } from '@/models'

const venueStore = useVenueStore()
const { venues, isLoading, error } = storeToRefs(venueStore)

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingVenue = ref<Venue | null>(null)
const deletingVenue = ref<Venue | null>(null)

const form = ref<CreateVenueBody & UpdateVenueBody>({
  name: '',
  slug: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  primary_color: '#030213',
})

function openCreate() {
  editingVenue.value = null
  form.value = { name: '', slug: '', description: '', address: '', phone: '', email: '', primary_color: '#030213' }
  dialog.value = true
}

function openEdit(venue: Venue) {
  editingVenue.value = venue
  form.value = {
    name: venue.name,
    slug: venue.slug,
    description: venue.description ?? '',
    address: venue.address ?? '',
    phone: venue.phone ?? '',
    email: venue.email ?? '',
    primary_color: venue.primary_color ?? '#030213',
  }
  dialog.value = true
}

function openDelete(venue: Venue) {
  deletingVenue.value = venue
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingVenue.value)
      await venueStore.updateVenue(editingVenue.value.id, form.value)
    else
      await venueStore.createVenue(form.value as CreateVenueBody)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingVenue.value) return
  isSubmitting.value = true
  try {
    await venueStore.deleteVenue(deletingVenue.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(() => venueStore.fetchVenues())
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12" class="d-flex align-center justify-space-between">
        <h1 class="text-h5 font-weight-bold">
          Venues
        </h1>
        <VBtn color="primary" prepend-icon="ri-add-line" @click="openCreate">
          Add Venue
        </VBtn>
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
      <VCol
        v-for="venue in venues"
        :key="venue.id"
        cols="12"
        md="6"
        lg="4"
      >
        <VCard class="h-100">
          <VCardTitle class="d-flex align-center justify-space-between pa-4">
            <span class="text-h6">{{ venue.name }}</span>
            <VChip size="small" :color="venue.is_active ? 'success' : 'error'" variant="tonal">
              {{ venue.is_active ? 'Active' : 'Inactive' }}
            </VChip>
          </VCardTitle>
          <VCardText>
            <p class="text-body-2 text-medium-emphasis mb-2">
              {{ venue.description || 'No description' }}
            </p>
            <p class="text-caption mb-1">
              <VIcon icon="ri-map-pin-line" size="16" class="mr-1" />
              {{ venue.address || 'No address' }}
            </p>
            <p class="text-caption mb-1">
              <VIcon icon="ri-phone-line" size="16" class="mr-1" />
              {{ venue.phone || 'No phone' }}
            </p>
            <p class="text-caption">
              <VIcon icon="ri-global-line" size="16" class="mr-1" />
              {{ venue.slug }}.smashup.app
            </p>
          </VCardText>
          <VCardActions class="pa-4">
            <VBtn variant="text" color="primary" :to="`/dashboard/venues/${venue.id}`">
              Manage
            </VBtn>
            <VSpacer />
            <IconBtn @click="openEdit(venue)">
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
            <IconBtn color="error" @click="openDelete(venue)">
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </VCardActions>
        </VCard>
      </VCol>
      <VCol v-if="!venues.length && !isLoading" cols="12">
        <VCard class="pa-8 text-center">
          <VIcon icon="ri-store-line" size="48" color="grey-lighten-1" class="mb-4" />
          <h3 class="text-h6 mb-2">
            No venues yet
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Create your first venue to start accepting bookings.
          </p>
          <VBtn color="primary" @click="openCreate">
            Create Venue
          </VBtn>
        </VCard>
      </VCol>
    </VRow>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="560" persistent>
      <VCard :title="editingVenue ? 'Edit Venue' : 'Add Venue'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VTextField v-model="form.name" label="Venue Name *" class="mb-4" required />
            <VTextField v-model="form.slug" label="Slug *" class="mb-4" required />
            <VTextField v-model="form.description" label="Description" class="mb-4" />
            <VTextField v-model="form.address" label="Address" class="mb-4" />
            <VTextField v-model="form.phone" label="Phone" class="mb-4" />
            <VTextField v-model="form.email" label="Email" type="email" class="mb-4" />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submit">
            {{ editingVenue ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Venue">
        <VCardText>
          Are you sure you want to delete <strong>{{ deletingVenue?.name }}</strong>? This will deactivate the venue.
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
