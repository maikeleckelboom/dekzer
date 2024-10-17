<script lang="ts" setup>
interface Props {
	channels: [number, number]
}

const { channels = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY] } = defineProps<Props>()

const MASTER_GAIN_DEFAULT = 3 as const
const MASTER_GAIN_MIN: number = -12 as const
const MASTER_GAIN_MAX: number = 12 as const

const uid = useId()
const gainValue = useState<number>(`master-gain-fader-${uid}`, () => MASTER_GAIN_DEFAULT)
</script>

<template>
	<GainFaderRoot orientation="horizontal">
		<GainFaderOutputChannel :model-value="channels.at(0)" />
		<GainFaderHandle v-model="gainValue" :max="MASTER_GAIN_MAX" :min="MASTER_GAIN_MIN" :title="gainValue" />
		<GainFaderOutputChannel :model-value="channels.at(1)" />
	</GainFaderRoot>
</template>
