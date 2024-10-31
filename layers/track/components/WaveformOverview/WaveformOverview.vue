<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'
import type { WaveformDataChannel } from 'waveform-data'
import WaveformData from 'waveform-data'

const { track } = defineProps<{ track?: Track }>()

const url = computedEager(() => track?.url)
const duration = computedEager(() => track?.format?.duration)

const waveformData = shallowRef<WaveformData>()
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

  canvasWidth ??= width
  const waveform = resampleWaveform(data, canvasWidth)
  const channel = waveform.channel(0)

  ctx.clearRect(0, 0, width, height)
  drawWaveform(ctx, channel, height, waveform.length)
}

function setupCanvasDimensions(
  elCanvas: HTMLCanvasElement,
  width: number | null = null,
  height: number | null = null
) {
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = (width ?? elCanvas.clientWidth) * dpr
  const canvasHeight = (height ?? elCanvas.clientHeight) * dpr

  elCanvas.width = canvasWidth
  elCanvas.height = canvasHeight

  const ctx = elCanvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }

  return { width: canvasWidth / dpr, height: canvasHeight / dpr, dpr }
}

function resampleWaveform(data: WaveformData, canvasWidth: number) {
  if (!canvasWidth) return data
  return data.resample({ width: canvasWidth })
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  channel: WaveformDataChannel,
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

  // set currentColor

  ctx.lineWidth = 1
  ctx.fillStyle = '#ccd9f1'
  ctx.fill()
  ctx.closePath()
}

const { getAudioContext } = useAudioContext()

async function setWaveformData(url: string) {
  if (!track?.format?.duration) return
  const canvas = unref(waveformCanvas)
  if (!canvas) return
  const context = await getAudioContext()
  const { clientWidth } = canvas
  const audioBuffer = await loadAudioBuffer(context, url)
  const pixelsPerSecond = clientWidth / audioBuffer.length
  const sampleRate = audioBuffer.sampleRate
  const s = calculateScaleFromPixelsPerSecond(pixelsPerSecond, sampleRate)
  const data = await loadWaveformData(context, audioBuffer, s)
  waveformData.value = data
  return data
}

const container = useTemplateRef<HTMLDivElement>('container')

const { width, height } = useElementSize(container)

watch(url, async (uri, prevUri) => {
  if (uri) {
    const data = await setWaveformData(uri)
    if (!data) return
    resampleWaveformData(data, width.value, height.value)
    drawMarker()
  } else if (prevUri) {
    const waveformCanvases = unref(waveformCanvas)!
    const markerCanvases = unref(markerCanvas)!
    const hoverCanvases = unref(hoverCanvas)!

    for (const canvas of [waveformCanvases, markerCanvases, hoverCanvases]) {
      clearCanvas(canvas)
    }

    waveformData.value = undefined
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
  async ([canvasWidth, canvasHeight]) => {
    const uri = unref(url)
    if (!uri) return
    const data = (waveformData.value ??= await setWaveformData(uri))
    if (!data) return
    resampleWaveformData(data, canvasWidth, canvasHeight)
    drawMarker()
  },
  {
    debounce: 80,
    rejectOnCancel: true
  }
)

useEventListener(container, 'pointerdown', (startEvent: PointerEvent) => {
  startEvent.preventDefault()

  if (container.value?.setPointerCapture) {
    container.value?.setPointerCapture(startEvent.pointerId)
  }

  const cleanupMove = useEventListener(container, 'pointermove', (event: PointerEvent) => {
    interacting.value = true
    pointermove(event)
  })

  useEventListener(container, ['pointerup', 'pointercancel'], () => {
    cleanupMove()
    interacting.value = false

    if (container.value?.releasePointerCapture) {
      container.value?.releasePointerCapture(startEvent.pointerId)
    }
  })
})

useEventListener(container, 'click', onClick)

const markerCanvas = useTemplateRef<HTMLCanvasElement>('markerCanvas')

watch(currentTime, drawMarker, { immediate: true })

const hoverCanvas = useTemplateRef<HTMLCanvasElement>('hoverCanvas')

function onMousemove({ clientX }: MouseEvent): void {
  const elContainer = unref(container)
  const length = unref(duration)
  if (!elContainer || !length) return
  const containerRect = elContainer.getBoundingClientRect()
  const left = clientX - containerRect.left
  const containerWidth = containerRect.width
  const time = (left / containerWidth) * length
  drawHoverCursor(time)
}

function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const { width, height } = setupCanvasDimensions(canvas)
  ctx.clearRect(0, 0, width, height)
}

useEventListener(container, 'mousemove', onMousemove)

useEventListener(container, ['mouseleave', 'pointermove'], () => {
  const elCanvas = unref(hoverCanvas)
  if (!elCanvas) return
  clearCanvas(elCanvas)
})

function drawHoverCursor(time: number) {
  const elCanvas = unref(hoverCanvas)
  const ctx = elCanvas?.getContext('2d')
  if (!elCanvas || !ctx) return

  const { width, height } = setupCanvasDimensions(elCanvas)
  const totalDuration = unref(duration)

  if (typeof totalDuration === 'undefined') {
    return
  }

  const x = (time / totalDuration) * width

  const offsetFromCenter = 1
  const h = height / 2 - offsetFromCenter
  const w = h * 1.5

  ctx.beginPath()
  ctx.moveTo(x - w / 2, 0)
  ctx.lineTo(x + w / 2, 0)
  ctx.lineTo(x, h)
  ctx.fillStyle = '#ccd9f1'
  ctx.strokeStyle = '#131313'
  ctx.stroke()

  ctx.fill()
  ctx.closePath()
}

function drawMarker() {
  const elCanvas = unref(markerCanvas)
  const totalDuration = unref(duration)

  if (!elCanvas || typeof totalDuration === 'undefined') {
    return
  }

  drawTriangle(elCanvas, totalDuration)
}

function drawTriangle(canvas: HTMLCanvasElement, length: number) {
  const ctx = canvas.getContext('2d')!

  const { width, height } = setupCanvasDimensions(canvas)

  const time = currentTime.value

  const x = (time / length) * width
  ctx.clearRect(0, 0, width, height)

  const offsetFromCenter = 1
  const h = height / 2 - offsetFromCenter
  const w = h * 1.5

  ctx.beginPath()
  ctx.moveTo(x - w / 2, 0)
  ctx.lineTo(x + w / 2, 0)
  ctx.lineTo(x, h)
  ctx.closePath()
  ctx.fillStyle = '#c53636'
  ctx.fill()
  ctx.strokeStyle = 'rgba(14,14,14,0.66)'

  ctx.stroke()
}
</script>

<template>
  <div
    ref="container"
    class="relative my-2 h-8 w-full overflow-clip  [color:blue] ">
    <canvas
      ref="hoverCanvas"
      class="absolute inset-0 size-full [color:inherit] " />
    <canvas
      ref="markerCanvas"
      class="absolute inset-0 size-full [color:inherit]" />
    <canvas
      ref="waveformCanvas"
      class="size-full [color:inherit]" />
  </div>
</template>
