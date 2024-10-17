<script lang="ts" setup>
const { wide = false, disabled = false, active } = defineProps<{
	wide?: boolean
	disabled?: boolean
	active?: boolean
}>()

type ButtonVariant = 'wide' | 'narrow'

const variant = computed<ButtonVariant>(() => (wide ? 'wide' : 'narrow'))
</script>

<template>
	<button
		:aria-disabled="disabled"
		:class="
			cn(
				'grid place-items-center w-fit rounded-sm',
				'py-2.5 text-xs font-semibold tracking-wide',
				'bg-secondary text-secondary-foreground border',
				'hover:bg-secondary-foreground hover:text-secondary',
				'disabled:opacity-60 disabled:pointer-events-none',
				'aria-disabled:opacity-60 aria-disabled:pointer-events-none',
				'active:bg-secondary-foreground/70 active:text-secondary',
				'transition-all duration-75',
				wide ? 'px-6' : 'px-3',
				active && 'bg-sky-800 text-foreground',
			)
		"
		:data-wide="wide">
		<slot />
	</button>
</template>

<style scoped></style>
