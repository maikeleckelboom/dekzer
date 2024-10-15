<script lang="ts">
import type { ComputedRef } from '@vue/reactivity'

export interface VirtualDeckRootProps {
	currentTime: number
	duration: number
	bpm: number
	pitch: number
	pitchRange: 8 | 16 | 50
}

export interface VirtualDeckRootEmits {
	'update:currentTime': [payload: number],
	'update:angle': [payload: number],
	'update:progress': [payload: number],
	'interacting': [payload: boolean]
}

export interface VirtualDeckRootContext {
	currentTime: Ref<number | undefined>
	duration: Readonly<Ref<number | undefined>>
	pitch: ComputedRef<number>
	pitchRange: ComputedRef<8 | 16 | 50>
	interacting: ComputedRef<boolean>
	progress: ComputedRef<number>
	bpm: ComputedRef<number>
	angle: Ref<number>
}

export const [injectVirtualDeckRootContext, provideVirtualDeckRootContext]
	= createContext<VirtualDeckRootContext>('VirtualDeckRoot')
</script>

<script lang="ts" setup>
import { clamp } from '@vueuse/core'

defineSlots<{ default: void }>()

const props = defineProps<Partial<VirtualDeckRootProps>>()

const emits = defineEmits<VirtualDeckRootEmits>()

const currentTime = useVModel(props, 'currentTime', emits)

const pitch = computedEager(() => props.pitch)
const pitchRange = computedEager(() => props.pitchRange)
const bpm = computedEager(() => props.bpm)
const duration = computedEager(() => props.duration)

const root = useTemplateRef<HTMLElement>('root')

const { interacting, angle } = useVirtualDeck(root, currentTime)

const progress = computed(() => {
	const currTime = toValue(currentTime) ?? 0
	const totalTime = toValue(duration) ?? 10
	return clamp(currTime / totalTime, 0, 1)
})

provideVirtualDeckRootContext({
	currentTime,
	duration,
	bpm,
	pitch,
	pitchRange,
	progress,
	interacting,
	angle
})
</script>

<template>
	<div
		ref="root"
		:aria-disabled="!duration"
		:class="
			cn(
				'grid place-items-center relative overflow-clip m-auto',
				'bg-muted border border-background/80 rounded-full',
				'size-36 md:size-48 aspect-square touch-none select-none',
				'aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:grayscale',
				'disabled:pointer-events-none disabled:opacity-50 disabled:grayscale',
				$attrs.class ?? '',
			)
		">
		<slot />
	</div>
</template>
