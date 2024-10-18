<script setup lang="ts">
import { ConfigProvider } from 'radix-vue'
import { Toaster } from '~~/layers/ui/components/toast'

function reportError(error: unknown) {
  console.error(error)
}
</script>

<template>
  <NuxtErrorBoundary @error="reportError">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <ConfigProvider>
      <NuxtLayout>
        <NuxtPage />
        <Toaster />
      </NuxtLayout>
    </ConfigProvider>
  </NuxtErrorBoundary>
</template>
