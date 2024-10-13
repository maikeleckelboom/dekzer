<script lang="ts" setup>
defineSlots<{ default: void }>()

const inputRef = useTemplateRef<HTMLDivElement>('input')


</script>

<template>
	<div class="contents" ref="input">
		<slot />
	</div>
</template>
