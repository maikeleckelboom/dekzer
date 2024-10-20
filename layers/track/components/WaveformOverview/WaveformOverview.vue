<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'
import WaveformData from 'waveform-data'
import { clamp } from '@vueuse/core'

const { track } = defineProps<{ track?: Track }>()

const url = computedEager(() => track?.url)
const duration = computedEager(() => track?.format?.duration)

const waveformData = shallowRef<WaveformData | null>(null)
const waveformCanvas = useTemplateRef<HTMLCanvasElement>('waveformCanvas')

const currentTime = defineModel<number>('currentTime', {
  type: Number,
  default: 0
})

const interacting = defineModel<boolean>('interacting', {
  type: Boolean,
  default: false
})

function resampleWaveformData(
  data: WaveformData,
  width: number | null = null,
  height: number | null = null
) {
  const elCanvas = unref(waveformCanvas)
  if (!elCanvas) return

  const ctx = elCanvas.getContext('2d')
  const {
    width: canvasWidth,
    height: canvasHeight,
    dpr
  } = setupCanvasDimensions(elCanvas, width, height)

  if (!ctx) return

  const waveform = resampleWaveform(data, canvasWidth)
  const channel = waveform.channel(0)

  clearCanvas(ctx, canvasWidth, canvasHeight)
  drawWaveform(ctx, channel, canvasHeight, waveform.length)
}

function setupCanvasDimensions(
  elCanvas: HTMLCanvasElement,
  width: number | null,
  height: number | null
) {
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = (width ?? elCanvas.clientWidth) * dpr
  const canvasHeight = (height ?? elCanvas.clientHeight) * dpr

  elCanvas.width = canvasWidth
  elCanvas.height = canvasHeight

  const ctx = elCanvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)

  return { width: canvasWidth / dpr, height: canvasHeight / dpr, dpr }
}

function resampleWaveform(data: WaveformData, canvasWidth: number) {
  return data.resample({ width: canvasWidth })
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  channel: WaveformChannel,
  height: number,
  length: number
) {
  ctx.beginPath()

  loopForward(length, (x) => {
    const max = channel.max_sample(x)
    ctx.lineTo(x + 0.5, scaleY(max, height) + 0.5)
  })

  loopBackward(length, (x) => {
    const min = channel.min_sample(x)
    ctx.lineTo(x + 0.5, scaleY(min, height) + 0.5)
  })

  ctx.lineWidth = 1
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.closePath()
}

function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)
}

const { getAudioContext } = useSharedAudioContext()

async function setWaveformData(url: string) {
  const context = await getAudioContext()
  const audioBuffer = await loadAudioBuffer(context, url)
  const data = await loadWaveformData(context, audioBuffer, 1080)
  waveformData.value = data
  return data
}

const container = useTemplateRef<HTMLDivElement>('container')

const { width, height } = useElementSize(container)

watchDebounced(
  [width, height],
  async ([w, h]) => {
    const uri = unref(url)
    if (!uri) return
    waveformData.value ??= await setWaveformData(uri)
    resampleWaveformData(unref(waveformData), w, h)
  },
  {
    debounce: 80,
    rejectOnCancel: true
  }
)

watch(url, async (uri, prevUri) => {
  if (uri) {
    waveformData.value ??= await setWaveformData(uri)
    resampleWaveformData(unref(waveformData))
  } else if (prevUri) {
    const elCanvas = unref(waveformCanvas)!
    const ctx = elCanvas.getContext('2d')!
    clearCanvas(ctx, elCanvas.width, elCanvas.height)
    waveformData.value = null
  }
})

function pointermove({ clientX }: PointerEvent): void {
  const elContainer = unref(container)
  const length = unref(duration)
  if (!elContainer || !length) return
  const containerRect = elContainer.getBoundingClientRect()
  const left = clientX - containerRect.left
  const containerWidth = containerRect.width
  currentTime.value = (left / containerWidth) * length
}

function onClick({ clientX }: PointerEvent): void {
  const elContainer = unref(container)
  const length = unref(duration)
  if (!elContainer || !length) return
  interacting.value = true
  const containerRect = elContainer.getBoundingClientRect()
  const left = clientX - containerRect.left
  const containerWidth = containerRect.width
  const targetTime = (left / containerWidth) * length
  requestAnimationFrame(() => {
    currentTime.value = targetTime
    interacting.value = false
  })
}

function leftPercentFromTime(time: number): string {
  const elContainer = unref(container)
  const length = unref(duration)
  if (!length || !elContainer) return '0%'
  const containerRect = elContainer.getBoundingClientRect()
  const containerWidth = containerRect.width
  return `${clamp((time / length) * containerWidth, 0, containerWidth)}px`
}

let cleanupEnd: (() => void) | null = null

useEventListener(container, 'pointerdown', (pdEvent: PointerEvent) => {
  const cleanupMove = useEventListener(container, 'pointermove', (e: PointerEvent) => {
    interacting.value = true
    pointermove(e)
  })
  cleanupEnd = useEventListener(container, ['pointerup', 'pointerleave'], () => {
    cleanupMove()
    if (cleanupEnd) {
      cleanupEnd()
      cleanupEnd = null
    }
    interacting.value = false
  })
})

useEventListener(container, 'click', (e: PointerEvent) => {
  onClick(e)
})

const markerStyle = computed(() => ({
  left: leftPercentFromTime(unref(currentTime))
}))
</script>

<template>
  <div
    ref="container"
    class="relative h-12 w-full overflow-clip border-t py-2">
    <WaveformOverviewMarker
      v-if="isDefined(duration)"
      :style="markerStyle" />
    <canvas
      ref="waveformCanvas"
      class="size-full" />
  </div>
</template>
