interface ConstantSourceNodeOptions {
  offset?: number
}

export function useConstantSourceNode(id: string, { offset = 0 }: ConstantSourceNodeOptions) {
  const node = useNode<ConstantSourceNode>(id, (context) => context.createConstantSource())
  whenever(node, (n) => (n.offset.value = offset), { immediate: true })
  return node
}
