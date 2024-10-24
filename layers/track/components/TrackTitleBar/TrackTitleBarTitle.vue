<script lang="ts" setup>
import { Primitive, type PrimitiveProps, VisuallyHidden } from 'radix-vue'
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext

const { as = 'span', asChild = false } = defineProps<PrimitiveProps>()

const slotText = computed(() => {
  let returnText: string | undefined = undefined

  if (track.value?.common.title && track.value?.common.title !== '') {
    returnText = track.value?.common.title
  }

  const [text] = Array.from(slots.default?.() ?? [])
    .map((node) => {
      /* @ts-ignore */
      return node.children
    })
    .join('')
    .trim()
    .split('\n')

  if (text && text !== '') {
    returnText = text
  }

  if (!returnText) {
    returnText = ''
  }

  const [match] = returnText.match(/\(([^)]+)\)/) || []

  if (!match) return returnText

  return returnText.replace(match, highlightParentheses(match))
})

function highlightParentheses(match: string | undefined) {
  if (!match) return ''
  return `<span class="text-muted-foreground font-light">${match}</span>`
}

const slots = defineSlots<{
  default(): void
}>()
</script>

<template>
  <div class="row-start-1 mr-2 flex items-end">
    <Primitive
      :as="as"
      :as-child="asChild"
      :class="
        cn(
          'text-foreground truncate text-start text-lg font-semibold leading-tight',
          $attrs?.class ?? ''
        )
      "
      v-html="slotText" />
    <VisuallyHidden>
      <slot>
        {{ track?.common.title }}
      </slot>
    </VisuallyHidden>
  </div>
</template>
