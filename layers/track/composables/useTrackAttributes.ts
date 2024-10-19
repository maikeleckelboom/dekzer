import type { Track } from '~~/layers/track/types'

export function useTrackAttributes(track: MaybeRefOrGetter<Track>, currentTime:MaybeRefOrGetter<number>) {
  const title = computed(() => toValue(track)?.common.title)
  const artist = computed(() => toValue(track)?.common.artist)
  const picture = computed(() => toValue(track)?.pictureUrl)
  const bpm = computed(() => toValue(track)?.common.bpm)
  const key = computed(() => toValue(track)?.common.key)
  const duration = computed(() => toValue(track)?.format.duration)
  const remaining = computed(() => toValue(currentTime) - toValue(duration))
  return {
    title,
    artist,
    picture,
    bpm,
    key,
    duration,
    remaining,
  }
}
