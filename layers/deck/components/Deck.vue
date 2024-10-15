<script lang="ts" setup>
import { useForwardPropsEmits } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import type { DeckRootEmits, DeckRootProps } from './DeckRoot.vue'

interface DeckEmits extends DeckRootEmits {
}

interface DeckProps extends DeckRootProps {
	class?: HTMLAttributes['class']
}

const props = defineProps<DeckProps>()
const emits = defineEmits<DeckEmits>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

/**
 * Here we may implement specific business logic for the Deck component
 */

</script>

<template>
	<DeckRoot v-bind="forwarded">
		<slot />
	</DeckRoot>
</template>