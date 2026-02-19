<template>
  <div ref="containerRef" class="w-full h-full absolute inset-0">
    <svg ref="svgRef" :width="svgWidth" :height="svgHeight" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
  direction: 'vertical' | 'horizontal'
  highlightId?: number | null
}>()

const emit = defineEmits<{
  selectMember: [id: number]
}>()

const containerRef = ref<HTMLDivElement>()
const svgRef = ref<SVGSVGElement>()
const svgWidth = ref(800)
const svgHeight = ref(600)

let zoomBehavior: any = null
let d3: any = null
let renderTimeout: any = null
// Store node positions for panToMember
let nodePositions = new Map<number, { x: number; y: number }>()
let isMobile = false
// Track previous highlight to avoid full-tree re-render on highlight change
let prevHighlightId: number | null = null

function formatYears(birthDate: string | null, deathDate: string | null, isAlive: boolean) {
  const birth = birthDate ? new Date(birthDate).getFullYear() : '?'
  if (!isAlive && deathDate) {
    return `${birth} - ${new Date(deathDate).getFullYear()}`
  }
  if (!isAlive) return `${birth} - ?`
  return `${birth} - nay`
}

function createNodeHtml(data: any, isHighlighted: boolean): string {
  if (data.id === 0) return '<div></div>'

  const years = formatYears(data.birthDate, data.deathDate, data.isAlive)
  const borderColor = isHighlighted ? '#f59e0b' : (data.gender === 'male' ? '#93c5fd' : '#f9a8d4')
  const bgColor = isHighlighted ? '#fffbeb' : (data.isAlive ? '#ffffff' : '#f9fafb')
  const borderWidth = isHighlighted ? '3px' : '2px'
  const genderSymbol = data.gender === 'male' ? '♂' : '♀'
  const shadow = isHighlighted ? '0 0 12px rgba(245,158,11,0.5)' : '0 1px 3px rgba(0,0,0,0.1)'

  const spouseHtml = data.spouses?.length
    ? `<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11px;color:#92400e;margin-top:2px;">&#8734; ${data.spouses[0].fullName}</div>`
    : ''

  const nodeWidth = isMobile ? 156 : 196

  return `<div xmlns="http://www.w3.org/1999/xhtml" style="background:${bgColor};border:${borderWidth} solid ${borderColor};border-radius:12px;padding:${isMobile ? '8px 6px 10px' : '10px 8px 12px'};text-align:center;cursor:pointer;box-shadow:${shadow};font-family:Be Vietnam Pro,sans-serif;width:${nodeWidth}px;box-sizing:border-box;">
  <div xmlns="http://www.w3.org/1999/xhtml" style="width:${isMobile ? 32 : 40}px;height:${isMobile ? 32 : 40}px;border-radius:50%;margin:0 auto 4px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:${isMobile ? 14 : 18}px;color:#9ca3af;overflow:hidden;">${data.avatarUrl ? `<img src="${data.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />` : genderSymbol}</div>
  <div xmlns="http://www.w3.org/1999/xhtml" style="font-weight:600;font-size:${isMobile ? 11 : 13}px;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${data.fullName}</div>
  <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${isMobile ? 10 : 11}px;color:#9ca3af;">${years}</div>
  <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${isMobile ? 9 : 10}px;color:#b45309;font-weight:500;">Đời ${data.generation}</div>
  ${spouseHtml}
</div>`
}

async function renderTree() {
  if (!svgRef.value || !containerRef.value || !props.data) return

  const width = containerRef.value.offsetWidth || containerRef.value.clientWidth || 800
  const height = containerRef.value.offsetHeight || containerRef.value.clientHeight || 600
  isMobile = width < 640

  if (width < 10 || height < 10) {
    renderTimeout = setTimeout(() => renderTree(), 100)
    return
  }

  svgWidth.value = width
  svgHeight.value = height

  if (!d3) {
    d3 = await import('d3')
  }

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  nodePositions = new Map()
  prevHighlightId = null

  // Setup zoom
  zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', (event: any) => {
      g.attr('transform', event.transform)
    })
  svg.call(zoomBehavior as any)

  const g = svg.append('g')

  // Pick first root (or create a virtual root)
  let treeData = props.data
  if (Array.isArray(props.data)) {
    if (props.data.length === 1) {
      treeData = props.data[0]
    } else if (props.data.length > 1) {
      treeData = { id: 0, fullName: 'Gia phả', gender: 'male', generation: 0, children: props.data, spouses: [] }
    } else {
      return
    }
  }

  const root = d3.hierarchy(treeData, (d: any) => d.children)

  const isVertical = props.direction === 'vertical'
  const spacing: [number, number] = isMobile
    ? (isVertical ? [170, 200] : [160, 220])
    : (isVertical ? [220, 240] : [200, 280])

  const treeLayout = d3.tree()
    .nodeSize(spacing)
    .separation((a: any, b: any) => (a.parent === b.parent ? 1 : 1.2))

  treeLayout(root as any)

  // Store node positions
  root.descendants().forEach((d: any) => {
    const px = isVertical ? d.x : d.y
    const py = isVertical ? d.y : d.x
    nodePositions.set(d.data.id, { x: px, y: py })
  })

  // Draw links
  const linkGenerator = isVertical
    ? d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y)
    : d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x)

  g.selectAll('.link')
    .data(root.links())
    .join('path')
    .attr('class', 'link')
    .attr('d', linkGenerator as any)
    .attr('fill', 'none')
    .attr('stroke', '#c4a574')
    .attr('stroke-width', 2)

  // Draw nodes
  const nodeGroups = g.selectAll('.node')
    .data(root.descendants())
    .join('g')
    .attr('class', (d: any) => `node node-${d.data.id}`)
    .attr('transform', (d: any) => {
      return isVertical
        ? `translate(${d.x},${d.y})`
        : `translate(${d.y},${d.x})`
    })
    .style('cursor', 'pointer')

  // foreignObject
  const foW = isMobile ? 160 : 200
  const fo = nodeGroups.append('foreignObject')
    .attr('width', foW)
    .attr('height', 180)
    .attr('x', -foW / 2)
    .attr('y', -50)
    .attr('overflow', 'visible')

  fo.each(function (this: any, d: any) {
    const foEl = this as Element
    const isHighlighted = props.highlightId === d.data.id
    foEl.innerHTML = createNodeHtml(d.data, isHighlighted)
  })

  // Click handler
  nodeGroups.on('click', (_event: any, d: any) => {
    if (d.data.id !== 0) {
      emit('selectMember', d.data.id)
    }
  })

  // Fit to screen
  setTimeout(() => {
    const gNode = g.node()
    if (!gNode) return
    const bounds = gNode.getBBox()
    if (bounds.width === 0) return

    const fullWidth = bounds.width + 200
    const fullHeight = bounds.height + 200
    const scale = Math.min(width / fullWidth, height / fullHeight, 1)

    svg.transition().duration(500).call(
      zoomBehavior.transform,
      d3.zoomIdentity
        .translate(
          width / 2 - (bounds.x + bounds.width / 2) * scale,
          height / 2 - (bounds.y + bounds.height / 2) * scale
        )
        .scale(scale)
    )
  }, 50)
}

function panToMember(memberId: number) {
  if (!svgRef.value || !containerRef.value || !zoomBehavior || !d3) return

  const pos = nodePositions.get(memberId)
  if (!pos) return

  const svg = d3.select(svgRef.value)
  const w = containerRef.value.offsetWidth
  const h = containerRef.value.offsetHeight

  // Pan only — highlight is handled by the highlightId prop watcher
  svg.transition().duration(600).call(
    zoomBehavior.transform,
    d3.zoomIdentity
      .translate(w / 2 - pos.x, h / 2 - pos.y)
      .scale(1)
  )
}

function zoomIn() {
  if (!svgRef.value || !zoomBehavior || !d3) return
  d3.select(svgRef.value).transition().duration(300).call(zoomBehavior.scaleBy, 1.3)
}

function zoomOut() {
  if (!svgRef.value || !zoomBehavior || !d3) return
  d3.select(svgRef.value).transition().duration(300).call(zoomBehavior.scaleBy, 0.7)
}

function fit() {
  if (!svgRef.value || !containerRef.value || !zoomBehavior || !d3) return
  try {
    const svg = d3.select(svgRef.value)
    const g = svg.select('g')
    const gNode = g.node() as SVGGElement | null
    if (!gNode || typeof gNode.getBBox !== 'function') return
    const bounds = gNode.getBBox()
    if (bounds.width === 0 || bounds.height === 0) return
    const w = containerRef.value.offsetWidth
    const h = containerRef.value.offsetHeight
    const scale = Math.min(w / (bounds.width + 200), h / (bounds.height + 200), 1)

    svg.transition().duration(500).call(
      zoomBehavior.transform,
      d3.zoomIdentity
        .translate(
          w / 2 - (bounds.x + bounds.width / 2) * scale,
          h / 2 - (bounds.y + bounds.height / 2) * scale
        )
        .scale(scale)
    )
  } catch (e) {
    console.warn('fit() error:', e)
  }
}

defineExpose({ zoomIn, zoomOut, fit, panToMember, svgEl: svgRef })

onMounted(() => {
  setTimeout(() => renderTree(), 200)
})

onBeforeUnmount(() => {
  if (renderTimeout) clearTimeout(renderTimeout)
})

watch(() => [props.data, props.direction], () => {
  if (renderTimeout) clearTimeout(renderTimeout)
  renderTree()
})

watch(() => props.highlightId, (newId) => {
  if (!svgRef.value || !d3) return
  const svg = d3.select(svgRef.value)

  // Only update the 2 affected nodes (previous + new) instead of all nodes
  const idsToUpdate = new Set<number>()
  if (prevHighlightId != null) idsToUpdate.add(prevHighlightId)
  if (newId != null) idsToUpdate.add(newId)
  if (idsToUpdate.size === 0) return

  svg.selectAll('.node foreignObject').each(function (this: any, d: any) {
    if (idsToUpdate.has(d.data.id)) {
      const foEl = this as Element
      foEl.innerHTML = createNodeHtml(d.data, d.data.id === newId)
    }
  })
  prevHighlightId = newId ?? null
})
</script>
