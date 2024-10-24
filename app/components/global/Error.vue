<script generic="TError = unknown" lang="ts" setup>
import type { NuxtError } from '#app'

const props = defineProps<{
  error?: NuxtError<TError>
}>()

const emit = defineEmits<{
  refresh: []
}>()

const formattedError = computed(() => props.error)
</script>

<template>
  <div>
    <pre>{{ formattedError }}</pre>
  </div>
</template>
