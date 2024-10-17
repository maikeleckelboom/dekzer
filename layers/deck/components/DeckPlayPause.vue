<script lang="ts" setup>
const { playing = false } = defineProps<{
	playing?: boolean
}>()

const emit = defineEmits<{
	playPause: [payload: boolean]
}>()
</script>

<template>
	<DeckButton @click="emit('playPause', !playing)">
		{{ playing ? 'Pause' : 'Play' }}
	</DeckButton>
</template>