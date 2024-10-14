<script lang="ts" setup>
interface Props {
	channels: [number, number]
}

const { channels = [-10, -3] } = defineProps<Partial<Props>>()

const MASTER_GAIN_DEFAULT = 3 as const
const MASTER_GAIN_MIN: number = -12 as const
const MASTER_GAIN_MAX: number = 12 as const

const TRACK_GAIN_MIN: number = -24 as const
const TRACK_GAIN_MAX: number = 24 as const
const TRACK_GAIN_DEFAULT = 0 as const

const uid = useId()
const gainValue = useState<number>(`deck-gain-fader-${uid}`, () => TRACK_GAIN_DEFAULT)
</script>

<template>
	<GainFaderRoot>
		<GainFaderOutputChannel :model-value="channels.at(0)" />
		<GainFaderHandle v-model="gainValue" :max="TRACK_GAIN_MAX" :min="TRACK_GAIN_MIN" :title="gainValue" />
		<GainFaderOutputChannel :model-value="channels.at(1)" />
	</GainFaderRoot>
</template>
