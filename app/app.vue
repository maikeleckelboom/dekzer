<script setup lang="ts">
import {ConfigProvider} from 'radix-vue'

function reportError(error: unknown) {
	console.error(error)
}
</script>

<template>
	<NuxtErrorBoundary @error="reportError">
    <ConfigProvider>
      <NuxtLayout>
        <NuxtPage />
        <NuxtRouteAnnouncer />
        <NuxtLoadingIndicator />
      </NuxtLayout>
    </ConfigProvider>
	</NuxtErrorBoundary>
</template>
