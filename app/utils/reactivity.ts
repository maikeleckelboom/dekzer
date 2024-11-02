type NotNull<T> = T extends null | undefined ? never : T

export function unrefNotNull<T>(ref: MaybeRefOrGetter<T>): NotNull<T> {
  const resolved = toValue(ref)
  if (resolved === undefined || resolved === null) {
    throw new Error('ref is not defined')
  }
  return <NotNull<T>>resolved
}
