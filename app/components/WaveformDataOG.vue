<script lang="ts" setup>
import WaveformData, { type JsonWaveformData } from 'waveform-data'
import type { Track } from '~~/layers/track/types'

const emit = defineEmits<{
	(ev: 'focus-within', focused: boolean): void
}>()

const { track, audioElement } = defineProps<{ track: Track; audioElement: HTMLAudioElement }>()

const playing = defineModel<boolean>('playing', {
	required: true,
	type: Boolean
})

const currentTime = defineModel<number>('currentTime', {
	required: true,
	type: Number
})



const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const scaleY = (amplitude, height, bits: 8 | 16 = 8) => {
	const range = 1 << bits
	const offset = 1 << (bits - 1)
	return height - ((amplitude + offset) * height) / range
}

const canvasContainer = useTemplateRef<HTMLDivElement>('canvasContainer')

function drawWaveform() {
	const elCanvas = canvas.value
	if (!elCanvas) return

	const loopForward = (fn: (x: number) => void) => {
		for (let x = 0; x < elCanvas.width; x++) fn(x)
	}

	const loopBackward = (fn: (x: number) => void) => {
		for (let x = elCanvas.width - 1; x >= 0; x--) fn(x)
	}

	const waveformData = WaveformData.create(data.value)
	const waveform = waveformData.resample({ width: elCanvas.width })
	const channel = waveform.channel(0)

	const ctx = elCanvas.getContext('2d')

	ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)

	ctx.beginPath()
	loopForward((x) => {
		ctx.lineTo(x + 0.5, scaleY(channel.max_sample(x), elCanvas.height) + 0.5, waveform.bits)
	})
	loopBackward((x) => {
		ctx.lineTo(x + 0.5, scaleY(channel.min_sample(x), elCanvas.height) + 0.5, waveform.bits)
	})

	ctx.fillStyle = '#fff'
	ctx.fill()
	ctx.closePath()
}

const { width: canvasW, height: canvasH } = useElementSize(canvasContainer)

watch([canvasW, canvasH], ([w, h]) => {
	const elCanvas = canvas.value
	if (!elCanvas) return
	elCanvas.width = w
	elCanvas.height = h
	nextTick(drawWaveform)
})

onUpdated(drawWaveform)
onMounted(drawWaveform)

function windowToCanvas(canvas: HTMLCanvasElement, x: number, y: number) {
	const rect = canvas.getBoundingClientRect()
	const scaleX = canvas.width / rect.width
	const scaleY = canvas.height / rect.height

	return {
		x: (x - rect.left) * scaleX,
		y: (y - rect.top) * scaleY
	}
}

const canvasCursor = useTemplateRef<HTMLCanvasElement>('canvasCursor')
const cursorTime = ref<number>(0)

function drawCursorCanvas(elCanvas: HTMLCanvasElement, offsetX: number) {
	const ctx = elCanvas.getContext('2d')

	//

	const fillFromXToEnd = (offsetX: number) => {
		ctx.fillStyle = 'rgba(0,0,0,.175)'
		ctx.fillRect(offsetX + 1, 0, elCanvas.width - offsetX, elCanvas.height)
	}

	const fillToX = (offsetX: number) => {
		ctx.fillStyle = 'rgba(255,255,255,.05)'
		ctx.fillRect(0, 0, offsetX, elCanvas.height)
	}

	const setCursorAtX = (offsetX: number) => {
		ctx.strokeStyle = '#000'
		ctx.strokeRect(offsetX, 0, 1, elCanvas.height)
	}

	const fillRest = (offsetX: number) => {}

	const clearCanvas = () => {
		ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)
	}

	requestAnimationFrame(() => {
		// todo: only animate changes; don't clear and redraw everything
		clearCanvas()
		fillToX(offsetX)
		setCursorAtX(offsetX)
		fillFromXToEnd(offsetX)
		fillRest(offsetX)
		cursorTime.value = (offsetX / elCanvas.width) * track.duration
	})
}
const hovering = ref<boolean>(false)
useEventListener(canvasCursor, 'mouseenter', ({ clientX, clientY }: MouseEvent) => {
	const elCanvas = canvasCursor.value as HTMLCanvasElement
	const { x } = windowToCanvas(elCanvas, clientX, clientY)
	drawCursorCanvas(elCanvas, x)
	hovering.value = true
})

useEventListener(canvasCursor, 'mouseleave', (_event: MouseEvent) => {
	const elCanvas = canvasCursor.value as HTMLCanvasElement
	const ctx = elCanvas.getContext('2d')
	requestAnimationFrame(() => {
		ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)
	})

	cursorTime.value = 0
	hovering.value = false
})

useEventListener(canvasCursor, 'mousemove', ({ clientX, clientY }: MouseEvent) => {
	const elCanvas = canvasCursor.value as HTMLCanvasElement
	const { x } = windowToCanvas(elCanvas, clientX, clientY)
	drawCursorCanvas(elCanvas, x)
})

useEventListener(canvasCursor, 'mousedown', ({ clientX, clientY, target }: MouseEvent) => {
	const elCanvas = target as HTMLCanvasElement
	const { x } = windowToCanvas(elCanvas, clientX, clientY)
	currentTime.value = (x / elCanvas.width) * track.duration
})

const currentTimeOverlay = useTemplateRef<HTMLCanvasElement>('currentTimeOverlay')

function drawCurrentTimeOverlay(time: number) {
	const elCanvas = currentTimeOverlay.value
	if (!elCanvas) return

	const ctx = elCanvas.getContext('2d')
	ctx.fillStyle = 'rgba(84,158,255,0.35)'

	// TODO: Optimize performance by using a transform instead of width
	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform

	const { width, height } = elCanvas
	const w = (time / track.duration) * width
	ctx.clearRect(0, 0, width, height)
	ctx.fillRect(0, 0, w, height)
}

const continuousCurrentTime = ref<number>(0)

const raf = useRafFn(() => (continuousCurrentTime.value = audioElement?.currentTime ?? 0), {
	immediate: false,
	fpsLimit: undefined
})

watch(playing, (isPlaying) => (isPlaying ? raf.resume() : raf.pause()), { immediate: true, flush: 'pre' })

watch(continuousCurrentTime, drawCurrentTimeOverlay)

watch(
	currentTime,
	(time) => {
		continuousCurrentTime.value = time
	},
	{ immediate: true, flush: 'sync' }
)

const focused = ref<boolean>(false)

function setFocus(_: FocusEvent) {
	focused.value = true
}

function unsetFocus(_: FocusEvent) {
	focused.value = false
}

watch(focused, (v) => emit('focus-within', v))

function onkeydown(event: KeyboardEvent) {
	const SpaceKey = ' '
	if (event.key === SpaceKey) {
		event.preventDefault()
	}
}

const CANVAS_WIDTH = 1280 as const
const CANVAS_HEIGHT = 48 as const

async function onWaveformDone(data: JsonWaveformData) {
	console.log('Waveform data received', data)
}
</script>

<template>
	<div
		ref="canvasContainer"
		:style="{ height: `${CANVAS_HEIGHT}px` }"
		class="relative max-w-fit overflow-clip"
		tabindex="0"
		@blur="unsetFocus"
		@focus="setFocus"
		@focusin="setFocus"
		@focusout="unsetFocus"
		@keydown="onkeydown">
		<canvas ref="canvas" :height="CANVAS_HEIGHT" :width="CANVAS_WIDTH" class="size-full" />
		<canvas
			ref="currentTimeOverlay"
			:height="CANVAS_HEIGHT"
			:width="CANVAS_WIDTH"
			class="absolute inset-0 size-full" />
		<canvas
			ref="canvasCursor"
			:height="CANVAS_HEIGHT"
			:width="CANVAS_WIDTH"
			class="absolute inset-0 size-full" />
	</div>
</template>
