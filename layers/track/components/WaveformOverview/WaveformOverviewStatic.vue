<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'
import WaveformData from 'waveform-data'
import { clamp } from '@vueuse/core'

const { track } = defineProps<{ track?: Track }>()

const { getAudioContext } = useSharedAudioContext()
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
    width: elCanvas.width / dpr // Use logical width for resampling
  })

  const channel = waveform.channel(0)

  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)

  ctx.beginPath()

  loopForward(
    (x) => {
      const max = channel.max_sample(x)
      ctx.lineTo(x + 0.5, scaleY(max, elCanvas.height) + 0.5)
    },
    clamp(Math.floor(width), 0, elCanvas.width - 1)
  )

  loopBackward(
    (x) => {
      const min = channel.min_sample(x)
      ctx.lineTo(x + 0.5, scaleY(min, elCanvas.height) + 0.5)
    },
    clamp(Math.floor(width), 0, elCanvas.width - 1)
  )

  ctx.lineWidth = 3
  ctx.fillStyle = '#dae2ef'
  ctx.fill()
  ctx.closePath()
}

function clearCanvas() {
  waveformData.value = null
  const elCanvas = unref(waveformCanvas)
  if (elCanvas) {
    const ctx = elCanvas.getContext('2d')
    ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)
  }
}

async function setWaveformData(url: string) {
  const context = await getAudioContext()
  const audioBuffer = await loadAudioBuffer(context, url)
  const data = await loadWaveformData(context, audioBuffer, 700)
  waveformData.value = data
  return data
}

watch(
  () => track?.url,
  async (url) => {
    console.log('track.url', url)
    if (url) {
      const data = await setWaveformData(url)
      resampleWaveformData(data)
      console.log('resampled waveform data', data)
    }
  }
)

whenever(waveformData, resampleWaveformData)

// const parentElement = useParentElement()
const container = useTemplateRef<HTMLDivElement>('containerRef')
const { width, height } = useElementSize(container)

watch(width, async (w) => {
  if (!track?.url) return
  if (!unref(waveformData)) {
    await setWaveformData(track.url)
  }
  resampleWaveformData(unref(waveformData), w)
})

const currentTime = defineModel<number>('currentTime', {
  type: Number,
  default: 0
})

function leftPercentFromTime(time: number) {
  if (!track?.format.duration || !container.value) return 0
  const containerWidth = container.value.clientWidth
  const left = (time / track.format.duration) * containerWidth
  const leftPercent = (left / containerWidth) * 100
  return `${leftPercent}%`
}
</script>

<template>
  <div
    ref="containerRef"
    class="relative h-10 w-full overflow-clip border-t p-1">
    <div
      :style="{
        left: leftPercentFromTime(currentTime)
      }"
      class="absolute left-0 top-[6px] h-[24px] w-[20px] -translate-x-1/2 -translate-y-1/2 rotate-180 text-red-500">
      <svg
        fill="currentColor"
        viewBox="0 2 24 20"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M24 22h-24l12-20z" />
      </svg>
    </div>
    <canvas
      ref="waveformCanvas"
      class="h-full w-full" />
  </div>
</template>

<style scoped></style>
