<script lang="ts" setup>
defineSlots<{ default: void }>()
</script>

<template>
	<div :class="cn(
		'grid place-items-center',
		'size-[calc(100%-14px)] md:size-[calc(100%-22px)] bg-foreground rounded-full z-0',
		'after:size-4 md:after:size-5 after:absolute after:bg-muted-foreground after:rounded-full after:pointer-events-none',
		'after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:z-30 ',
		$attrs.class ?? '')" data-name="platter">
		<slot />
	</div>
</template>