<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'
import WaveformData from 'waveform-data'

const { track } = defineProps<{ track?: Track }>()

const url = computedEager(() => track?.url)
const duration = computedEager(() => track?.format?.duration)

const waveformData = shallowRef<WaveformData | null>(null)
const waveformCanvas = useTemplateRef<HTMLCanvasElement>('waveformCanvas')

function resampleWaveformData(
  data: WaveformData,
  width: number | null = null,
  height: number | null = null
) {
  const elCanvas = unref(waveformCanvas)
  if (!elCanvas) return

  const ctx = elCanvas.getContext('2d')

  width ??= elCanvas.clientWidth
  height ??= elCanvas.clientHeight

  const dpr = window.devicePixelRatio || 1
  elCanvas.width = width * dpr
  elCanvas.height = height * dpr
  ctx.scale(dpr, dpr)

  const waveform = data.resample({
    width: elCanvas.width / dpr
  })

  const channel = waveform.channel(0)

  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)
  ctx.beginPath()

  const { length } = waveform.toJSON()

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

function clearCanvas() {
  waveformData.value = null
  const elCanvas = unref(waveformCanvas)
  if (!elCanvas) return
  const ctx = elCanvas.getContext('2d')
  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)
}

const { getAudioContext } = useSharedAudioContext()

async function setWaveformData(url: string) {
  const context = await getAudioContext()
  const audioBuffer = await loadAudioBuffer(context, url)
  const data = await loadWaveformData(context, audioBuffer, 700)
  waveformData.value = data
  return data
}

watch(url, async (uri) => {
  if (uri) {
    const data = await setWaveformData(uri)
    resampleWaveformData(data)
  } else {
    clearCanvas()
  }
})

const container = useTemplateRef<HTMLDivElement>('container')
const { width, height } = useElementSize(container)

watch([width, height], async ([w, _h]) => {
  const uri = unref(url)
  if (!uri) return
  let data = unref(waveformData)
  if (!data) {
    data = await setWaveformData(uri)
  }
  resampleWaveformData(data, w)
})

const currentTime = defineModel<number>('currentTime', {
  type: Number,
  default: 0
})

const interacting = defineModel<boolean>('interacting', {
  type: Boolean,
  default: false
})

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
  const containerWidth = elContainer.clientWidth
  const left = (time / length) * containerWidth
  const leftPercent = (left / containerWidth) * 100
  return `${leftPercent}%`
}

function pointermove({ clientX }: PointerEvent): void {
  const elContainer = unref(container)
  const length = unref(duration)
  if (!elContainer || !length) return
  const containerRect = elContainer.getBoundingClientRect()
  const left = clientX - containerRect.left
  const containerWidth = containerRect.width
  currentTime.value = (left / containerWidth) * length
}

function pointerup(): void {
  interacting.value = false
}

function pointerdown(e: PointerEvent): void {
  interacting.value = true
  pointermove(e)
}

useEventListener(container, 'pointermove', pointermove)
useEventListener(container, 'pointerup', pointerup)
useEventListener(container, 'pointerdown', pointerdown)
useEventListener(container, 'pointerleave', pointerup)


const markerStyle = computed(() => ({
  left: leftPercentFromTime(unref(currentTime))
}))
</script>

<template>
  <div
    ref="container"
    class="relative h-12 w-full overflow-clip border-t px-1 py-2">
    <WaveformOverviewMarker
      v-if="isDefined(duration)"
      :style="markerStyle" />
    <canvas
      ref="waveformCanvas"
      class="size-full" />
  </div>
</template>
