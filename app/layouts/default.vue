<script lang="ts" setup>
useHead({
	titleTemplate: '%s | App'
})
</script>

<template>
	<div class="max-w-7xl overflow-x-clip">
		<slot />
	</div>
</template>
