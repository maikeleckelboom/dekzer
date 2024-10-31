interface AudioNodeEdge {
  sourceId: string
  targetId: string
}

export const useNodesGraph = createSharedComposable(()=> {
  const nodes = reactive(new Map<string, AudioNode>())
  const edges = ref<AudioNodeEdge[]>([])

  function addNode(id: string, node: AudioNode): void {
    if (nodes.has(id)) {
      console.warn(`Node with ID '${id}' already exists and will be replaced.`)
      nodes.get(id)?.disconnect()
    }
    nodes.set(id, node)
  }

  function removeNode(id: string): void {
    const node = nodes.get(id)
    if (node) {
      node.disconnect()
      nodes.delete(id)
      edges.value = edges.value.filter((edge) => edge.sourceId !== id && edge.targetId !== id)
    } else {
      console.warn(`Node with ID '${id}' does not exist.`)
    }
  }

  function replaceNode(id: string, node: AudioNode): void {
    if (nodes.has(id)) {
      nodes.get(id)?.disconnect()
      nodes.set(id, node)
    } else {
      console.warn(`Node with ID '${id}' does not exist.`)
    }
  }

  function addEdge(sourceId: string, targetId: string): void {
    const sourceNode = nodes.get(sourceId)
    const targetNode = nodes.get(targetId)
    if (!sourceNode || !targetNode) {
      throw new Error(
        `Cannot create edge: Node(s) not found with ID(s) '${sourceId}', '${targetId}'`
      )
    }
    if (edges.value.some((edge) => edge.sourceId === sourceId && edge.targetId === targetId)) {
      return
    }
    sourceNode.connect(targetNode)
    edges.value.push({ sourceId, targetId })
  }

  function removeEdge(sourceId: string, targetId: string): void {
    const sourceNode = nodes.get(sourceId)
    const targetNode = nodes.get(targetId)
    if (!sourceNode || !targetNode) {
      throw new Error(
        `Cannot remove edge: Node(s) not found with ID(s) '${sourceId}', '${targetId}'`
      )
    }
    sourceNode.disconnect(targetNode)
    edges.value = edges.value.filter(
      (edge) => edge.sourceId !== sourceId && edge.targetId !== targetId
    )
  }

  function replaceEdge(
    sourceId: string,
    targetId: string,
    newSourceId: string,
    newTargetId: string
  ): void {
    removeEdge(sourceId, targetId)
    addEdge(newSourceId, newTargetId)
  }

  function toString() {
    const nodeIds = Array.from(nodes.keys())
    const nodeNames = nodeIds.map((id) => nodes.get(id)?.constructor.name)
    const nodeConnections = edges.value.map(
      (edge) => `${edge.sourceId} -> ${edge.targetId}`
    )
    return nodeConnections.join('\n') || 'No connections' + '\n' + nodeNames.join('\n')
  }

  return { nodes, edges, addNode, removeNode, replaceNode, addEdge, removeEdge, replaceEdge, toString }
})
