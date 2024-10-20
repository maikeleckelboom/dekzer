<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'
import WaveformData from 'waveform-data'

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
  canvasWidth: number | null = null,
  canvasHeight: number | null = null
) {
  const elCanvas = unref(waveformCanvas)
  if (!elCanvas) return

  const ctx = elCanvas.getContext('2d')!
  const { width, height } = setupCanvasDimensions(elCanvas, canvasWidth, canvasHeight)

  const waveform = resampleWaveform(data, canvasWidth)
  const channel = waveform.channel(0)

  ctx.clearRect(0, 0, width, height)
  drawWaveform(ctx, channel, height, waveform.length)
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
  if(!canvasWidth) return data
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

const { getAudioContext } = useSharedAudioContext()

async function setWaveformData(url: string) {
  const context = await getAudioContext()
  const audioBuffer = await loadAudioBuffer(context, url)
  const data = await loadWaveformData(context, audioBuffer, 256)
  waveformData.value = data
  return data
}

const container = useTemplateRef<HTMLDivElement>('container')

const { width, height } = useElementSize(container)

watch(url, async (uri, prevUri) => {
  if (uri) {
    waveformData.value ??= await setWaveformData(uri)
    resampleWaveformData(unref(waveformData))
  } else if (prevUri) {
    const elCanvas = unref(waveformCanvas)!
    const ctx = elCanvas.getContext('2d')!
    ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)
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

watchDebounced(
  [width, height],
  async ([w, h]) => {
    const uri = unref(url)
    if (!uri) return
    waveformData.value ??= await setWaveformData(uri)
    resampleWaveformData(unref(waveformData), w, h)
  },
  {
    debounce: 100,
    rejectOnCancel: true
  }
)

useEventListener(container, 'pointerdown', (pdEvent: PointerEvent) => {
  const cleanupMove = useEventListener(container, 'pointermove', (e: PointerEvent) => {
    interacting.value = true
    pointermove(e)
  })
  useEventListener(container, ['pointerup', 'pointerleave'], () => {
    cleanupMove()
    interacting.value = false
  })
})

useEventListener(container, 'click', (e: PointerEvent) => {
  onClick(e)
})

const markerCanvas = useTemplateRef<HTMLCanvasElement>('markerCanvas')

watch([width, height], ([w, h]) => {
  const elCanvas = unref(markerCanvas)
  if (!elCanvas) return
  const ctx = elCanvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  elCanvas.width = w * dpr
  elCanvas.height = h * dpr
  ctx.scale(dpr, dpr)
})

watch(currentTime, drawMarker)

function drawMarker() {
  const elCanvas = unref(markerCanvas)
  if (!elCanvas) return
  const time = unref(currentTime)
  const length = unref(duration)
  drawTriangle(elCanvas, time, length)
}

function drawTriangle(canvas: HTMLCanvasElement, time: number, length: number) {
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas

  const x = (time / length) * width
  ctx.clearRect(0, 0, width, height)

  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x, height)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#00000000'
  ctx.stroke()

  const offsetFromCenter = 1
  const h = height / 2 - offsetFromCenter
  const w = h * 1.5

  ctx.beginPath()
  ctx.moveTo(x - w / 2, 0)
  ctx.lineTo(x + w / 2, 0)
  ctx.lineTo(x, h)
  ctx.closePath()

  ctx.fillStyle = '#cb1d1d'
  ctx.fill()
}

watch(
  () => track?.url,
  () => {
    drawMarker()
  }
)
</script>

<template>
  <div
    ref="container"
    class="relative my-2 h-8 w-full overflow-clip">
    <canvas
      ref="markerCanvas"
      class="absolute inset-0 size-full" />
    <canvas
      ref="waveformCanvas"
      class="size-full" />
  </div>
</template>
