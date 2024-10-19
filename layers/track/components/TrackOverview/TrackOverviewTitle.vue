<script lang="ts" setup>
import { Primitive, type PrimitiveProps, VisuallyHidden } from 'radix-vue'
import type { Track } from '~~/layers/track/types'

interface TrackOverviewTitleProps extends PrimitiveProps {
  track?: Track
}

const { as = 'span', asChild = false, track = undefined } = defineProps<TrackOverviewTitleProps>()

function highlightParentheses(match: string | undefined) {
  if (!match) return ''
  return `<span class="text-muted-foreground font-light text-base">${match}</span>`
}

const slotText = computed(
  () => {
    let returnText: string | null = null

    if (track && track.name && track.name !== '') {
      returnText = track.name
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
      returnText = 'Track Name'
    }

    const [match] = returnText.match(/\(([^)]+)\)/) || []

    if (!match) return returnText

    return returnText.replace(match, highlightParentheses(match))
  },
  { flush: 'post' }
)

const slots = defineSlots<{
  default(): void
}>()
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="
      cn('text-foreground truncate text-start text-lg font-bold leading-tight', $attrs.class)
    "
    v-html="slotText" />
  <VisuallyHidden>
    <slot />
  </VisuallyHidden>
</template>
