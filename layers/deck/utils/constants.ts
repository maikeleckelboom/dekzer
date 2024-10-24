export type MusicalKey = string
export type MusicalKeyInfo = { label: string; class: string }
export type MusicalKeysMap = Map<MusicalKey, MusicalKeyInfo>

export const MusicalKeysMap: MusicalKeysMap = new Map([
  // Major Keys
  ['C', { label: 'C Major', class: 'text-red-500' }], // Red
  ['C#', { label: 'C♯ Major', class: 'text-orange-500' }], // Orange-Red
  ['Db', { label: 'D♭ Major', class: 'text-orange-500' }], // Same as C♯
  ['D', { label: 'D Major', class: 'text-orange-400' }], // Orange
  ['D#', { label: 'D♯ Major', class: 'text-yellow-500' }], // Yellow-Orange
  ['Eb', { label: 'E♭ Major', class: 'text-yellow-500' }], // Same as D♯
  ['E', { label: 'E Major', class: 'text-yellow-400' }], // Yellow
  ['F', { label: 'F Major', class: 'text-green-400' }], // Yellow-Green
  ['F#', { label: 'F♯ Major', class: 'text-green-500' }], // Green
  ['Gb', { label: 'G♭ Major', class: 'text-green-500' }], // Same as F♯
  ['G', { label: 'G Major', class: 'text-green-600' }], // Bright Green
  ['G#', { label: 'G♯ Major', class: 'text-teal-400' }], // Aqua-Green
  ['Ab', { label: 'A♭ Major', class: 'text-teal-400' }], // Same as G♯
  ['A', { label: 'A Major', class: 'text-cyan-400' }], // Cyan
  ['A#', { label: 'A♯ Major', class: 'text-sky-400' }], // Sky Blue
  ['Bb', { label: 'B♭ Major', class: 'text-sky-400' }], // Same as A♯
  ['B', { label: 'B Major', class: 'text-blue-500' }], // Blue

  // Minor Keys
  ['Cm', { label: 'C Minor', class: 'text-purple-500' }], // Purple
  ['C#m', { label: 'C♯ Minor', class: 'text-violet-500' }], // Violet
  ['Dbm', { label: 'D♭ Minor', class: 'text-violet-500' }], // Same as C♯m
  ['Dm', { label: 'D Minor', class: 'text-pink-500' }], // Magenta
  ['D#m', { label: 'D♯ Minor', class: 'text-pink-400' }], // Pink
  ['Ebm', { label: 'E♭ Minor', class: 'text-pink-400' }], // Same as D♯m
  ['Em', { label: 'E Minor', class: 'text-rose-500' }], // Deep Red
  ['Fm', { label: 'F Minor', class: 'text-red-900' }], // Dark Red
  ['F#m', { label: 'F♯ Minor', class: 'text-orange-900' }], // Dark Orange
  ['Gbm', { label: 'G♭ Minor', class: 'text-orange-900' }], // Same as F♯m
  ['Gm', { label: 'G Minor', class: 'text-olive-600' }], // Olive Green (closest match)
  ['G#m', { label: 'G♯ Minor', class: 'text-teal-900' }], // Dark Teal
  ['Abm', { label: 'A♭ Minor', class: 'text-teal-900' }], // Same as G♯m
  ['Am', { label: 'A Minor', class: 'text-blue-900' }], // Dark Blue
  ['A#m', { label: 'A♯ Minor', class: 'text-indigo-500' }], // Soft Blue
  ['Bbm', { label: 'B♭ Minor', class: 'text-indigo-500' }], // Same as A♯m
  ['Bm', { label: 'B Minor', class: 'text-navy-800' }], // Navy Blue (closest match)

  // Enharmonic Equivalents (same class as their corresponding key)
  ['B#', { label: 'C Major', class: 'text-red-500' }], // Same as C Major
  ['E#', { label: 'F Major', class: 'text-green-400' }], // Same as F Major
  ['Fb', { label: 'E Major', class: 'text-yellow-400' }], // Same as E Major
  ['Cb', { label: 'B Major', class: 'text-blue-500' }], // Same as B Major

  ['B#m', { label: 'C Minor', class: 'text-purple-500' }], // Same as C Minor
  ['E#m', { label: 'F Minor', class: 'text-red-900' }], // Same as F Minor
  ['Fbm', { label: 'E♭ Minor', class: 'text-pink-400' }], // Same as E♭ Minor
  ['Cbm', { label: 'B Minor', class: 'text-navy-800' }] // Same as B Minor
])
