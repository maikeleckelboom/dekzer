export function tryWithoutFail<T>(fn: () => T): T | undefined {
  try {
    return fn()
  } catch {
    return undefined
  }
}