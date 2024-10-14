<script lang="ts" setup>
const isPlaying = ref(false)
const isSynced = ref(false)
const isReady = ref(true)

function setPlaying(state?: boolean) {
	isPlaying.value = !isPlaying.value
}

function setSynced(state?: boolean) {
	isSynced.value = state ?? !isSynced.value
}

function play() {
	// TODO: Implement
}

function setToStart() {
	// TODO: Implement
}
</script>

<template>
	<div class="flex flex-wrap size-min gap-1">
		<div class="flex items-center w-full gap-1">
			<DeckButton :aria-disabled="!isReady" @click="setToStart">
				<Icon name="streamline:button-previous-solid" />
			</DeckButton>
			<DeckButton :aria-disabled="!isReady" class="flex-grow w-auto" wide @click="setPlaying()">
				<Icon v-if="isPlaying" name="streamline:button-pause-2-solid" />
				<Icon v-else name="streamline:button-play-solid" />
			</DeckButton>
		</div>
		<div class="flex items-center w-full gap-1">
			<DeckButton :active="!isSynced" :aria-disabled="!isReady" @click="setSynced(false)">
				OFF
			</DeckButton>
			<DeckButton :active="isSynced" :aria-disabled="!isReady" wide @click="setSynced(true)">
				SYNC
			</DeckButton>
		</div>
	</div>
</template>