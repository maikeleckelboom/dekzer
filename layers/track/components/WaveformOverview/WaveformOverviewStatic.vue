<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'
import WaveformData from 'waveform-data'
import { clamp } from '@vueuse/core'

const { track } = defineProps<{ track?: Track }>()

const { getAudioContext } = useSharedAudioContext()
const waveformData = shallowRef<WaveformData | null>(null)

whenever(
  () => track?.url,
  async (url) => {
    console.log('loading waveform data', url)
    const context = await getAudioContext()
    const audioBuffer = await loadAudioBuffer(context, url)
    waveformData.value = await loadWaveformData(context, audioBuffer, 1080)
    console.log('waveform data loaded', waveformData.value)
  }
)

const waveformCanvas = useTemplateRef<HTMLCanvasElement>('waveformCanvas')

function resampleWaveformData(data: WaveformData, width: number | null = null) {
  const elCanvas = unref(waveformCanvas)
  if (!elCanvas) return
  const ctx = elCanvas.getContext('2d')

  width ??= elCanvas.width
  const height = elCanvas.height

  // Set canvas resolution (consider high DPI screens)
  const dpr = window.devicePixelRatio || 1
  elCanvas.width = width * dpr
  elCanvas.height = height * dpr
  ctx.scale(dpr, dpr)

  const waveform = data.resample({
    width: elCanvas.width / dpr  // Resample to logical width
  })

  const channel = waveform.channel(0)

  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height)

  ctx.beginPath()

  loopForward((x) => {
    const max = channel.max_sample(x)
    ctx.lineTo(x + 0.5, scaleY(max, elCanvas.height) + 0.5)
  }, Math.floor(width))

  loopBackward((x) => {
    const min = channel.min_sample(x)
    ctx.lineTo(x + 0.5, scaleY(min, elCanvas.height) + 0.5)
  }, Math.floor(width))

  // Make the lines thicker and add stroke for better visibility
  ctx.lineWidth = 3
  // ctx.strokeStyle = '#0074d9'  // A sharp stroke color
  // ctx.stroke()


  // ctx.fillStyle = '#72abff'    // Optional: Keep the fill for aesthetic reasons
  ctx.fillStyle = '#dae2ef'    // Optional: Change the fill color to match the design
  ctx.fill()

  ctx.closePath()
}

whenever(waveformData, (data: WaveformData) => {
  console.log('resampling waveform data', data)
  resampleWaveformData(data)
})

const { width } = useElementSize(waveformCanvas)
watch(width, async (w) => {
  if (!track?.url) return
  let data = unref(waveformData)
  if (!data) {
    const context = await getAudioContext()
    const audioBuffer = await loadAudioBuffer(context, track.url)
    data = await loadWaveformData(context, audioBuffer)
    waveformData.value = data
  }
  console.log('Canvas width changed', w, 'resampling waveform data')
  resampleWaveformData(data, clamp(w, 0, 1000))
})
</script>

<template>
  <div>
    <canvas
      ref="waveformCanvas"
      width="820"
      height="60"
      class="h-14 p-1 w-full border" />
  </div>
</template>

<style scoped></style>
