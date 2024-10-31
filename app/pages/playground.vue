<script lang="ts" setup>
const track1Url = shallowRef<string>(
  '/assets/Serato/StarterPack/02%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3'
)

const track2Url = shallowRef<string>(
  '/assets/Serato/StarterPack/03%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3'
)

const { buffer: track1Buffer } = useAudioBuffer({ url: track1Url })
const track1BufferSourceNode = useBufferSourceNode('track1SourceNode', { buffer: track1Buffer })

const track1GainNode = useGainNode('track1GainNode', { gain: 1 })
const track1VolumeNode = useGainNode('track1VolumeNode', { gain: 0.8 })
const track1AnalyserLNode = useAnalyserNode('track1AnalyserLNode', { fftSize: 1024 })
const track1AnalyserRNode = useAnalyserNode('track1AnalyserRNode', { fftSize: 1024 })
const track1CompressorNode = useDynamicCompressorNode('track1CompressorNode', 'trackBalancer')
const track1MixerNode = useGainNode('track1MixerNode', { gain: 0.5 })

const { buffer: track2Buffer } = useAudioBuffer({ url: track2Url })
const track2BufferSourceNode = useBufferSourceNode('track2SourceNode', { buffer: track2Buffer })

const track2GainNode = useGainNode('track2GainNode', { gain: 1 })
const track2VolumeNode = useGainNode('track2VolumeNode', { gain: 0.8 })
const track2AnalyserLNode = useAnalyserNode('track2AnalyserLNode', { fftSize: 1024 })
const track2AnalyserRNode = useAnalyserNode('track2AnalyserRNode', { fftSize: 1024 })
const track2CompressorNode = useDynamicCompressorNode('track2CompressorNode', 'trackBalancer')
const track2MixerNode = useGainNode('track2MixerNode', { gain: 0.5 })

const masterGainNode = useGainNode('masterGainNode', { gain: 1 })
const masterAnalyserLNode = useAnalyserNode('masterAnalyserLNode', { fftSize: 1024 })
const masterAnalyserRNode = useAnalyserNode('masterAnalyserRNode', { fftSize: 1024 })
const masterCompressorNode = useDynamicCompressorNode('masterCompressorNode', 'masterLimiter')

const { audioContext, getAudioContext } = useAudioContext()

whenever(logicAnd(track1BufferSourceNode, track2BufferSourceNode), async () => {
  /** Track 1 Chain */

  /** Track 2 Chain */

  /** Master Chain */

})

const { channels: track1Channels } = useAudioLevelAnalyser(
  track1AnalyserLNode,
  track1AnalyserRNode
)
const { channels: track2Channels } = useAudioLevelAnalyser(
  track2AnalyserLNode,
  track2AnalyserRNode
)
const { channels: masterChannels } = useAudioLevelAnalyser(
  masterAnalyserLNode,
  masterAnalyserRNode
)

function onLoadTrack(event: Event) {
  const target = event.target as HTMLInputElement
  const track = target.dataset.track
  const [file] = target.files || []
  if (!file) return
  const url = URL.createObjectURL(file)
  const trackUrl = track === '1' ? track1Url : track2Url
  trackUrl.value = url
}

function play(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.dataset.track === '1') {
    track1BufferSourceNode.value?.start()
    track1Playing.value = true
  } else if (target.dataset.track === '2') {
    track2BufferSourceNode.value?.start()
    track2Playing.value = true
  }
}

function pause(event: Event) {
  const target = event.target as HTMLInputElement
  const track = target.dataset.track === '1' ? track1BufferSourceNode : track2BufferSourceNode
  track?.value?.stop()
}

const track1Playing = shallowRef<boolean>(false)
const track2Playing = shallowRef<boolean>(false)
</script>

<template>
  <div class="mx-auto my-8 grid w-full max-w-lg grid-cols-2 gap-4 p-2">
    <div class="col-span-full flex flex-col space-y-4 divide-y">
      <!-- Master -->
      <div class="flex flex-col space-y-4">
        <div>
          <h2 class="text-lg font-semibold">Master</h2>
          <div class="flex flex-row space-x-2">
            <div class="w-1/2">
              <p class="text-sm">Left</p>
              <p class="text-sm">{{ masterChannels?.[0] }}</p>
            </div>
            <div class="w-1/2">
              <p class="text-sm">Right</p>
              <p class="text-sm">{{ masterChannels?.[1] }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col space-y-2">
          <label
            class="text-sm"
            for="masterGain"
            >Master Gain</label
          >
          <input
            id="masterGain"
            max="1"
            min="0"
            step="0.01"
            type="range" />
        </div>
      </div>
    </div>
    <div class="my-4 flex flex-col space-y-2">
      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-semibold">Track 1</h2>
        <button
          v-if="!track1Playing"
          data-track="1"
          @click="play">
          Play
        </button>
        <button
          v-else
          data-track="1"
          @click="pause">
          Pause
        </button>
        <!-- # Here -->
        <div class="flex flex-row space-x-2">
          <div class="w-1/2">
            <p class="text-sm">Left</p>
            <p class="text-sm">{{ track1Channels?.[0] }}</p>
          </div>
          <div class="w-1/2">
            <p class="text-sm">Right</p>
            <p class="text-sm">{{ track1Channels?.[1] }}</p>
          </div>
        </div>
      </div>
      <label
        class="text-sm"
        for="track1"
        >Track 1</label
      >
      <input
        id="track1"
        accept="audio/*"
        data-track="1"
        type="file"
        @change="onLoadTrack" />
    </div>
    <div class="my-4 flex flex-col space-y-2">
      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-semibold">Track 2</h2>
        <button
          v-if="!track2Playing"
          data-track="2"
          @click="play">
          Play
        </button>
        <button
          v-else
          data-track="2"
          @click="pause">
          Pause
        </button>

        <div class="flex flex-row space-x-2">
          <div class="w-1/2">
            <p class="text-sm">Left</p>
            <p class="text-sm">{{ track2Channels?.[0] }}</p>
          </div>
          <div class="w-1/2">
            <p class="text-sm">Right</p>
            <p class="text-sm">{{ track2Channels?.[1] }}</p>
          </div>
        </div>
      </div>
      <label
        class="text-sm"
        for="track2"
        >Track 2</label
      >
      <input
        id="track2"
        accept="audio/*"
        data-track="2"
        type="file"
        @change="onLoadTrack" />
    </div>
    <!-- Track 1 -->
    <div class="flex flex-col space-y-4">
      <div class="flex flex-col space-y-2">
        <label
          class="text-sm"
          for="track1Gain"
          >Track 1 Gain</label
        >
        <input
          id="track1Gain"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
      <div class="flex flex-col space-y-2">
        <label
          class="text-sm"
          for="track1Volume"
          >Track 1 Volume</label
        >
        <input
          id="track1Volume"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
    </div>
    <!-- Track 2 -->
    <div class="flex flex-col space-y-4">
      <div class="flex flex-col space-y-2">
        <label
          class="text-sm"
          for="track2Gain"
          >Track 2 Gain</label
        >
        <input
          id="track2Gain"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
      <div class="flex flex-col space-y-2">
        <label
          class="text-sm"
          for="track2Volume"
          >Track 2 Volume</label
        >
        <input
          id="track2Volume"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
    </div>
  </div>
</template>
