import type { Track } from '~~/layers/track/types'

export function useTrackValues(track: MaybeRefOrGetter<Track>) {
  const title = computed(() => toValue(track)?.common.title)
  const artist = computed(() => toValue(track)?.common.artist)
  const picture = computed(() => toValue(track)?.pictureUrl)
  const bpm = computed(() => toValue(track)?.common.bpm)
  const key = computed(() => toValue(track)?.common.key)
  const duration = computed(() => toValue(track)?.format.duration)
  const genre = computed(() => toValue(track)?.common.genre)
  return {
    title,
    artist,
    picture,
    bpm,
    key,
    duration,
    genre,
  }
}
