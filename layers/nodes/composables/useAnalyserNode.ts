export interface AnalyserNodeOptions {
  fftSize?: number
  minDecibels?: number
  maxDecibels?: number
  smoothingTimeConstant?: number
}


export function useAnalyserNode(
  id: string,
  options: AnalyserNodeOptions = {
    fftSize: 2048,
    minDecibels: -60,
    maxDecibels: 0,
    smoothingTimeConstant: 0.8
  }
) {
  const node = useNode<AnalyserNode>(id, (context) => context.createAnalyser())
  whenever(
    node,
    (n) => {
      n.fftSize = options.fftSize ?? 2048
      n.minDecibels = options.minDecibels ?? -100
      n.maxDecibels = options.maxDecibels ?? -30
      n.smoothingTimeConstant = options.smoothingTimeConstant ?? 0.8
    },
    { immediate: true }
  )
  return node
}
