<script setup lang="ts">
interface Props {
  items: any[]
  totalItems: number
  headers: any[]
  itemsPerPage: number
  page: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<Emits>()

const PAGE_LIMIT_LIST = [10, 20, 50, 100]

interface Emits {
  (e: 'update:options', options: any): void
}

function updateOptions(options: any) {
  emit('update:options', options)
}

const perPage = ref(props.itemsPerPage)
</script>

<template>
  <VDataTableServer
    v-model:items-per-page="perPage"
    :items-per-page-options="PAGE_LIMIT_LIST"
    fixed-header
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="isLoading"
    class="text-no-wrap base-table"
    @update:options="updateOptions"
  >
    <template v-for="header in headers" #[`item.${header.key}`]="{ item }">
      <slot :name="`item.${header.key}`" :item="item">
        {{ item[header.key] }}
      </slot>
    </template>
  </VDataTableServer>
</template>

<style lang="scss" scoped>
.base-table {
  max-block-size: 80vh;
}
</style>
