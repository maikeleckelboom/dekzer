import { type CompressionLevelPresetKey, getCompressionLevelPreset } from '~~/layers/nodes/utils/constants'

export function useDynamicCompressorNode(
  id: string,
  options: DynamicsCompressorOptions | CompressionLevelPresetKey
) {
  const node = useNode<DynamicsCompressorNode>(id, (context) =>
    context.createDynamicsCompressor()
  )
  whenever(
    node,
    (n) => {
      if (typeof options === 'string') {
        const preset = getCompressionLevelPreset(options)
        n.threshold.value = preset.threshold
        n.ratio.value = preset.ratio
        n.attack.value = preset.attack
        n.release.value = preset.release
        n.knee.value = preset.knee
        return
      }
      if (options.threshold) n.threshold.value = options.threshold
      if (options.ratio) n.ratio.value = options.ratio
      if (options.attack) n.attack.value = options.attack
      if (options.release) n.release.value = options.release
      if (options.knee) n.knee.value = options.knee
    },
    { immediate: true }
  )
  return node
}
