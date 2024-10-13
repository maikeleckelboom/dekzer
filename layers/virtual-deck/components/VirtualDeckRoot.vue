<script lang="ts" setup>
defineSlots<{ default: void }>()
</script>

<template>
	<div
		:class="
			cn(
				'grid place-items-center relative overflow-clip m-auto',
				'bg-muted border border-background/80 rounded-full',
				'size-48 aspect-square touch-none select-none',
				'aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:grayscale',
				'disabled:pointer-events-none disabled:opacity-50 disabled:grayscale',
				$attrs.class ?? '',
			)
		">
		<slot />
	</div>
</template>
