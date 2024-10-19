<script lang="ts" setup>
import { Primitive, type PrimitiveProps, VisuallyHidden } from 'radix-vue'
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext

const { as = 'span', asChild = false } = defineProps<PrimitiveProps>()

const slotText = computed(
  () => {
    let returnText: string | null = null

    if (track.value?.common.title && track.value?.common.title !== '') {
      returnText = track.value?.common.title
    }

    const [text] = Array.from(slots.default?.() ?? [])
      .map((node) => node?.children)
      .join('')
      .trim()
      .split('\n')

    if (text && text !== '') {
      returnText ??= text
    }

    if (!returnText) {
      returnText = ''
    }

    const [match] = returnText.match(/\(([^)]+)\)/) || []

    if (!match) return returnText

    return returnText.replace(match, highlightParentheses(match))
  },
  { flush: 'post' }
)

function highlightParentheses(match: string | undefined) {
  if (!match) return ''
  return `<span class="text-muted-foreground font-light">${match}</span>`
}

const slots = defineSlots<{
  default(): void
}>()
</script>

<template>
  <div class="row-start-1 flex items-end mr-2">
    <Primitive
      :as="as"
      :as-child="asChild"
      :class="
        cn('text-foreground text- text-start text-lg font-semibold leading-tight max-w-96 truncate', $attrs.class)
      "
      v-html="slotText" />
    <VisuallyHidden>
      <slot>
        {{ track?.common.title }}
      </slot>
    </VisuallyHidden>
  </div>
</template>
