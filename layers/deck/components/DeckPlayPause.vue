<script lang="ts" setup>
const { playing = false } = defineProps<{
	playing?: boolean
}>()

const emit = defineEmits<{
	playPause: [payload: boolean]
}>()
</script>

<template>
	<div>
		<DeckButton @click="emit('playPause', !playing)">
			{{ playing ? 'Pause' : 'Play' }}
		</DeckButton>
	</div>
</template>

<style scoped>

</style>