<script lang="ts" setup>

</script>

<template>
	<div :class="cn(
		'grid place-items-center',
		'size-[calc(100%-1.325rem)] bg-foreground rounded-full',
		'after:size-5 after:absolute after:bg-muted-foreground after:rounded-full after:z-30 after:pointer-events-none',
		'after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2',
		$attrs.class ?? '',
	)"
			 data-name="platter">
		<slot />
	</div>
</template>