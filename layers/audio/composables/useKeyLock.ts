export function useKeyLock(id: MaybeRefOrGetter<string>) {
    const locked = useState<boolean>(`key-lock-${id}`, () => false)
    return {
        locked,
        toggle() {
            locked.value = !locked.value
        },
        lock() {
            locked.value = true
        },
        unlock() {
            locked.value = false
        }
    }
}