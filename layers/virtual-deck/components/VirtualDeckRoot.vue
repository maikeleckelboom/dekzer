<script lang="ts">

export interface VirtualDeckRootProps {
	currentTime: number
	duration: number
	pitch: number
	pitchRange: 8 | 16 | 50
}

export interface VirtualDeckRootContext {
	currentTime: Ref<number>
	duration: Ref<number>
	pitch: Ref<number>
	pitchRange: Ref<8 | 16 | 50>
	progress: ComputedRef<number>
	interacting: Ref<boolean>
	angle: Ref<number>
}

export const [injectVirtualDeckRootContext, provideVirtualDeckRootContext]
	= createContext<VirtualDeckRootContext>('VirtualDeckRoot')
</script>

<script lang="ts" setup>
import { VirtualDeck } from '#components'
import { clamp } from '@vueuse/core'

defineSlots<{ default: void }>()

const props  = defineProps<Partial<VirtualDeckRootProps>>()

const {
	duration,
	pitch,
	pitchRange
} = toRefs(props)

const currentTime = defineModel<number>('currentTime', {
	default: 0,
	required: false
})


const deck = useTemplateRef<InstanceType<typeof VirtualDeck>>('deck')

const { interacting, angle } = useVirtualDeck(deck, currentTime)

const progress = computed(() => {
	const currTime = toValue(currentTime) ?? 0
	const totalTime = toValue(duration) ?? 10
	return clamp(currTime / totalTime, 0, 1)
})

provideVirtualDeckRootContext({
	currentTime,
	duration,
	pitch,
	pitchRange,
	progress,
	interacting,
	angle
})
</script>

<template>
	<div
		ref="deck"
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
