interface ParsedMs {
  days: number
  hours: number
  minutes: number
  seconds: number
  ms: number
}

function parseMilliseconds(ms: number): ParsedMs {
  return {
    days: Math.trunc(ms / 86400000),
    hours: Math.trunc(ms / 3600000) % 24,
    minutes: Math.trunc(ms / 60000) % 60,
    seconds: Math.trunc(ms / 1000) % 60,
    ms: Math.trunc(ms) % 1000
  }
}

function addZero(value: number, digits: number = 2): string {
  return value.toString().padStart(digits, '0')
}

function getSignSymbol(duration: number, showMilliseconds: boolean): string {
  if (showMilliseconds) return duration < 0 ? '-' : ''
  return duration <= -1000 ? '-' : ''
}

type FormatDurationOptions = Partial<{
  leading: MaybeRefOrGetter<boolean>
  ms: MaybeRefOrGetter<boolean>
  fractionDigits: MaybeRefOrGetter<number>
}>

function formatDuration(ms: number, options: FormatDurationOptions = {}): string {
  const leading = computed(() => toValue(options.leading) || false)
  const showMilliseconds = computed(() => toValue(options.ms) || false)

  const signSymbol = getSignSymbol(ms, showMilliseconds.value)
  const parsedMilliseconds = parseMilliseconds(ms < 0 ? -ms : ms)
  const seconds = addZero(parsedMilliseconds.seconds)

  let output = ''

  if (parsedMilliseconds.days && !output) {
    const { days, hours, minutes } = parsedMilliseconds
    output = `${signSymbol}${days}:${addZero(hours)}:${addZero(minutes)}:${seconds}`
  }

  if (parsedMilliseconds.hours && !output) {
    output = `${signSymbol}${
      leading.value ? addZero(parsedMilliseconds.hours) : parsedMilliseconds.hours
    }:${addZero(parsedMilliseconds.minutes)}:${seconds}`
  }

  if (!output) {
    output = `${signSymbol}${
      leading.value ? addZero(parsedMilliseconds.minutes) : parsedMilliseconds.minutes
    }:${seconds}`
  }

  if (showMilliseconds.value) {
    const seconds = addZero(parsedMilliseconds.seconds)
    const minutes = addZero(parsedMilliseconds.minutes)
    const hours = addZero(parsedMilliseconds.hours)
    const days = addZero(parsedMilliseconds.days)

    if (parsedMilliseconds.days) {
      output = `${signSymbol}${days}:${hours}:${minutes}:${seconds}`
    } else if (parsedMilliseconds.hours) {
      output = `${signSymbol}${hours}:${minutes}:${seconds}`
    } else {
      const oneDigitMs = Math.floor(parsedMilliseconds.ms / 100)
      output = `${signSymbol}${minutes}:${seconds}.${oneDigitMs}`
    }
  }

  return output
}

function formatSeconds(
  seconds: number,
  options: FormatDurationOptions = {
    ms: true
  }
): string {
  return formatDuration(seconds * 1000, options)
}

export { formatDuration, formatSeconds, type FormatDurationOptions }
