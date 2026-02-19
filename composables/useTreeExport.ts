import { toPng } from 'html-to-image'

interface TreeNode {
  id: number
  fullName: string
  gender: string
  birthDate: string | null
  deathDate: string | null
  isAlive: boolean
  avatarUrl: string | null
  generation: number
  spouses?: { fullName: string }[]
  children?: TreeNode[]
}

export interface PdfExportOptions {
  paperSize: 'a4' | 'a3' | 'a2'
  orientation: 'portrait' | 'landscape'
  quality: 'standard' | 'high'
}

interface LayoutNode {
  data: TreeNode
  x: number
  y: number
  children?: LayoutNode[]
}

export function useTreeExport() {
  const exporting = ref(false)

  function countGenerations(nodes: TreeNode[]): number {
    let max = 0
    function walk(n: TreeNode) {
      if (n.generation > max) max = n.generation
      n.children?.forEach(walk)
    }
    nodes.forEach(walk)
    return max
  }

  function countMembers(nodes: TreeNode[]): number {
    let count = 0
    function walk(n: TreeNode) {
      if (n.id !== 0) count++
      n.children?.forEach(walk)
    }
    nodes.forEach(walk)
    return count
  }

  function formatYears(birthDate: string | null, deathDate: string | null, isAlive: boolean): string {
    const birth = birthDate ? new Date(birthDate).getFullYear() : '?'
    if (!isAlive && deathDate) return `${birth} - ${new Date(deathDate).getFullYear()}`
    if (!isAlive) return `${birth} - ?`
    return `${birth} - nay`
  }

  /**
   * Compute tree layout using simple algorithm (like d3.tree)
   * Returns flat array of positioned nodes + links
   */
  function layoutTree(roots: TreeNode[]): { nodes: LayoutNode[]; links: { from: LayoutNode; to: LayoutNode }[]; width: number; height: number } {
    let treeData: TreeNode
    if (roots.length === 1) {
      treeData = roots[0]
    } else {
      treeData = { id: 0, fullName: '', gender: 'male', birthDate: null, deathDate: null, isAlive: false, avatarUrl: null, generation: 0, spouses: [], children: roots }
    }

    // Use a simple Reingold-Tilford style layout
    const nodeW = 200
    const nodeH = 140
    const hGap = 40  // horizontal gap between siblings
    const vGap = 60  // vertical gap between generations

    // First pass: assign widths bottom-up
    function assignWidth(node: TreeNode): number {
      if (!node.children?.length) return nodeW
      const childrenWidth = node.children.reduce((sum, c) => sum + assignWidth(c), 0) + (node.children.length - 1) * hGap
      return Math.max(nodeW, childrenWidth)
    }

    const totalWidth = assignWidth(treeData)

    // Second pass: assign positions top-down
    const allNodes: LayoutNode[] = []
    const allLinks: { from: LayoutNode; to: LayoutNode }[] = []

    function position(node: TreeNode, left: number, top: number, availWidth: number): LayoutNode {
      const x = left + availWidth / 2
      const y = top
      const layoutNode: LayoutNode = { data: node, x, y }
      allNodes.push(layoutNode)

      if (node.children?.length) {
        // Calculate children total needed width
        const childWidths = node.children.map(c => assignWidth(c))
        const totalChildWidth = childWidths.reduce((s, w) => s + w, 0) + (node.children.length - 1) * hGap

        let cx = left + (availWidth - totalChildWidth) / 2
        const childTop = top + nodeH + vGap

        layoutNode.children = node.children.map((child, i) => {
          const cw = childWidths[i]
          const childNode = position(child, cx, childTop, cw)
          allLinks.push({ from: layoutNode, to: childNode })
          cx += cw + hGap
          return childNode
        })
      }

      return layoutNode
    }

    position(treeData, 0, 0, totalWidth)

    const maxY = allNodes.reduce((m, n) => Math.max(m, n.y), 0)

    return { nodes: allNodes, links: allLinks, width: totalWidth, height: maxY + nodeH }
  }

  function escapeHtml(str: string): string {
    const d = document.createElement('div')
    d.textContent = str
    return d.innerHTML
  }

  /** Render a node card as HTML string */
  function renderNodeCard(data: TreeNode): string {
    if (data.id === 0) return ''

    const years = formatYears(data.birthDate, data.deathDate, data.isAlive)
    const isMale = data.gender === 'male'
    const borderColor = isMale ? '#93c5fd' : '#f9a8d4'
    const bgColor = data.isAlive ? '#ffffff' : '#f9fafb'
    const genderSymbol = isMale ? '♂' : '♀'
    const genderColor = isMale ? '#60a5fa' : '#f472b6'
    const spouseName = data.spouses?.[0]?.fullName

    return `
      <div style="
        background:${bgColor};
        border:2px solid ${borderColor};
        border-radius:10px;
        padding:8px 6px 10px;
        text-align:center;
        box-shadow:0 2px 6px rgba(0,0,0,0.08);
        font-family:'Be Vietnam Pro',sans-serif;
        width:184px;
        box-sizing:border-box;
      ">
        <div style="
          width:36px;height:36px;border-radius:50%;margin:0 auto 4px;
          background:#f3f4f6;display:flex;align-items:center;justify-content:center;
          font-size:16px;color:${genderColor};overflow:hidden;
          border:1.5px solid ${borderColor};
        ">${data.avatarUrl ? `<img src="${data.avatarUrl}" style="width:100%;height:100%;object-fit:cover;"/>` : genderSymbol}</div>
        <div style="font-weight:600;font-size:12px;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;">${escapeHtml(data.fullName)}</div>
        <div style="font-size:10px;color:#9ca3af;margin-top:1px;">${years}</div>
        <div style="font-size:9px;color:#b45309;font-weight:600;margin-top:1px;">Đời ${data.generation}</div>
        ${spouseName ? `<div style="font-size:9px;color:#92400e;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">∞ ${escapeHtml(spouseName)}</div>` : ''}
      </div>
    `
  }

  /** Create SVG lines connecting parent to children */
  function renderLinks(links: { from: LayoutNode; to: LayoutNode }[], nodeW: number, nodeH: number): string {
    const halfW = nodeW / 2
    let paths = ''

    // Group links by parent for orthogonal routing
    const byParent = new Map<LayoutNode, LayoutNode[]>()
    for (const link of links) {
      if (!byParent.has(link.from)) byParent.set(link.from, [])
      byParent.get(link.from)!.push(link.to)
    }

    for (const [parent, children] of byParent) {
      const px = parent.x
      const py = parent.y + nodeH - 10 // bottom of parent card
      const midY = py + 30 // horizontal connector y

      // Vertical line down from parent
      paths += `<line x1="${px}" y1="${py}" x2="${px}" y2="${midY}" stroke="#c4a574" stroke-width="2"/>`

      if (children.length === 1) {
        // Single child - straight line down
        const cy = children[0].y + 5
        paths += `<line x1="${px}" y1="${midY}" x2="${children[0].x}" y2="${cy}" stroke="#c4a574" stroke-width="2"/>`
      } else {
        // Multiple children - horizontal bar then vertical drops
        const minX = Math.min(...children.map(c => c.x))
        const maxX = Math.max(...children.map(c => c.x))

        // Horizontal connector
        paths += `<line x1="${minX}" y1="${midY}" x2="${maxX}" y2="${midY}" stroke="#c4a574" stroke-width="2"/>`

        // Vertical drops to each child
        for (const child of children) {
          const cy = child.y + 5
          paths += `<line x1="${child.x}" y1="${midY}" x2="${child.x}" y2="${cy}" stroke="#c4a574" stroke-width="2"/>`
        }
      }
    }

    return paths
  }

  /** Decorative border SVG */
  function createBorderSvg(w: number, h: number): string {
    const p = 40

    // Meander pattern segments
    const mSize = 14
    let meander = ''
    // Top
    for (let x = p; x < w - p - mSize; x += mSize * 2) {
      meander += `<path d="M${x},${p} h${mSize} v${mSize} h${mSize} v${-mSize}" fill="none" stroke="#C5973A" stroke-width="1.2" opacity="0.45"/>`
    }
    // Bottom
    for (let x = p; x < w - p - mSize; x += mSize * 2) {
      meander += `<path d="M${x},${h - p} h${mSize} v${-mSize} h${mSize} v${mSize}" fill="none" stroke="#C5973A" stroke-width="1.2" opacity="0.45"/>`
    }
    // Left
    for (let y = p; y < h - p - mSize; y += mSize * 2) {
      meander += `<path d="M${p},${y} v${mSize} h${mSize} v${mSize} h${-mSize}" fill="none" stroke="#C5973A" stroke-width="1.2" opacity="0.45"/>`
    }
    // Right
    for (let y = p; y < h - p - mSize; y += mSize * 2) {
      meander += `<path d="M${w - p},${y} v${mSize} h${-mSize} v${mSize} h${mSize}" fill="none" stroke="#C5973A" stroke-width="1.2" opacity="0.45"/>`
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" style="position:absolute;top:0;left:0;pointer-events:none;">
      <rect x="18" y="18" width="${w - 36}" height="${h - 36}" rx="8" fill="none" stroke="#8B6914" stroke-width="3.5"/>
      <rect x="28" y="28" width="${w - 56}" height="${h - 56}" rx="5" fill="none" stroke="#B8860B" stroke-width="1.5"/>
      ${meander}
      <rect x="${p + mSize + 2}" y="${p + mSize + 2}" width="${w - 2 * p - 2 * mSize - 4}" height="${h - 2 * p - 2 * mSize - 4}" rx="3" fill="none" stroke="#D4A847" stroke-width="0.8"/>
      ${cornerLotus(p, p, 1, 1)}
      ${cornerLotus(w - p, p, -1, 1)}
      ${cornerLotus(p, h - p, 1, -1)}
      ${cornerLotus(w - p, h - p, -1, -1)}
    </svg>`
  }

  function cornerLotus(cx: number, cy: number, sx: number, sy: number): string {
    return `<g transform="translate(${cx},${cy}) scale(${sx},${sy})">
      <path d="M0,0 C12,3 22,12 26,26" fill="none" stroke="#B8860B" stroke-width="2.2" opacity="0.7"/>
      <path d="M0,0 C3,12 12,22 26,26" fill="none" stroke="#B8860B" stroke-width="2.2" opacity="0.7"/>
      <ellipse cx="18" cy="6" rx="9" ry="4.5" fill="#DAA520" opacity="0.3" transform="rotate(18,18,6)"/>
      <ellipse cx="6" cy="18" rx="4.5" ry="9" fill="#DAA520" opacity="0.3" transform="rotate(18,6,18)"/>
      <ellipse cx="20" cy="14" rx="6" ry="3" fill="#DAA520" opacity="0.2" transform="rotate(38,20,14)"/>
      <ellipse cx="14" cy="20" rx="3" ry="6" fill="#DAA520" opacity="0.2" transform="rotate(38,14,20)"/>
      <circle cx="2" cy="2" r="3.5" fill="#B8860B" opacity="0.55"/>
      <circle cx="2" cy="2" r="1.5" fill="#EAC65C"/>
    </g>`
  }

  function dividerHtml(width: number): string {
    return `<div style="display:flex;align-items:center;justify-content:center;width:${width}px;margin:0 auto;">
      <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#C5973A);"></div>
      <div style="display:flex;gap:5px;padding:0 10px;">
        <div style="width:4px;height:4px;background:#C5973A;border-radius:50%;"></div>
        <div style="width:7px;height:7px;background:#B8860B;transform:rotate(45deg);"></div>
        <div style="width:4px;height:4px;background:#C5973A;border-radius:50%;"></div>
      </div>
      <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#C5973A);"></div>
    </div>`
  }

  /** Pre-convert all avatar URLs in tree data to base64 */
  async function preloadAvatars(nodes: TreeNode[]): Promise<void> {
    const promises: Promise<void>[] = []
    function walk(n: TreeNode) {
      if (n.avatarUrl && !n.avatarUrl.startsWith('data:')) {
        promises.push(
          toBase64(n.avatarUrl).then(dataUrl => {
            n.avatarUrl = dataUrl || null
          })
        )
      }
      n.children?.forEach(walk)
    }
    nodes.forEach(walk)
    await Promise.all(promises)
  }

  async function exportTree(
    _svgEl: SVGSVGElement,
    familyName: string,
    treeDataArray: TreeNode[],
  ) {
    exporting.value = true

    try {
      // 0. Pre-convert avatars to base64 to avoid tainted canvas
      const treeDataClone: TreeNode[] = JSON.parse(JSON.stringify(treeDataArray))
      await preloadAvatars(treeDataClone)

      // 1. Compute tree layout from data (independent of current SVG)
      const nodeW = 192
      const nodeH = 130
      const layout = layoutTree(treeDataClone)

      // 2. Dimensions
      const framePad = 75
      const headerH = 180
      const footerH = 70
      const treePadX = 60
      const treePadY = 30

      const contentW = layout.width + treePadX * 2
      const contentH = layout.height + treePadY * 2
      const totalW = Math.max(contentW + framePad * 2, 900)
      const totalH = contentH + headerH + footerH + framePad * 2

      const totalGens = countGenerations(treeDataClone)
      const totalMems = countMembers(treeDataClone)
      const today = new Date()
      const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

      // 3. Build container
      const container = document.createElement('div')
      container.style.cssText = `
        position:fixed; left:-99999px; top:0;
        width:${totalW}px; height:${totalH}px;
        font-family:'Be Vietnam Pro',sans-serif;
        overflow:hidden;
      `
      document.body.appendChild(container)

      // Background
      const bg = document.createElement('div')
      bg.style.cssText = `
        position:absolute;inset:0;
        background:
          radial-gradient(ellipse at 25% 15%, rgba(218,165,32,0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 75% 85%, rgba(218,165,32,0.05) 0%, transparent 50%),
          linear-gradient(170deg, #FEF9EE 0%, #FDF3DE 35%, #FCF0D4 65%, #FBEAC6 100%);
      `
      container.appendChild(bg)

      // Border overlay
      const borderDiv = document.createElement('div')
      borderDiv.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
      borderDiv.innerHTML = createBorderSvg(totalW, totalH)
      container.appendChild(borderDiv)

      // Content wrapper
      const content = document.createElement('div')
      content.style.cssText = `position:relative;padding:${framePad + 18}px;`
      container.appendChild(content)

      // === HEADER ===
      const header = document.createElement('div')
      header.style.cssText = `text-align:center;padding:20px 0 15px;`
      header.innerHTML = `
        ${dividerHtml(Math.min(450, totalW - 200))}
        <div style="margin:14px 0 2px;font-size:20px;font-weight:500;color:#8B6914;letter-spacing:10px;">GIA PHẢ</div>
        <div style="font-size:44px;font-weight:700;color:#5C2E0E;letter-spacing:5px;line-height:1.25;margin:0 0 6px;text-shadow:0 1px 2px rgba(0,0,0,0.06);">${escapeHtml(familyName.toUpperCase())}</div>
        ${dividerHtml(Math.min(380, totalW - 250))}
        <div style="margin-top:10px;font-size:12px;color:#A08050;letter-spacing:3px;">Từ đời thứ nhất đến đời thứ ${totalGens}</div>
      `
      content.appendChild(header)

      // === TREE AREA ===
      const treeArea = document.createElement('div')
      treeArea.style.cssText = `
        position:relative;
        width:${contentW}px;
        height:${contentH}px;
        margin:10px auto 0;
      `
      content.appendChild(treeArea)

      // Draw connecting lines as SVG overlay
      const linesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      linesSvg.setAttribute('width', String(contentW))
      linesSvg.setAttribute('height', String(contentH))
      linesSvg.style.cssText = `position:absolute;top:0;left:0;pointer-events:none;`
      linesSvg.innerHTML = renderLinks(layout.links, nodeW, nodeH)
      treeArea.appendChild(linesSvg)

      // Render each node as absolutely positioned HTML
      for (const node of layout.nodes) {
        if (node.data.id === 0) continue
        const card = document.createElement('div')
        card.style.cssText = `
          position:absolute;
          left:${node.x - nodeW / 2 + treePadX}px;
          top:${node.y + treePadY}px;
          width:${nodeW}px;
        `
        card.innerHTML = renderNodeCard(node.data)
        treeArea.appendChild(card)
      }

      // Adjust line SVG positions to match node positions
      // Lines use node.x/y directly, nodes are offset by treePad
      linesSvg.style.left = `${treePadX}px`
      linesSvg.style.top = `${treePadY}px`

      // === FOOTER ===
      const footer = document.createElement('div')
      footer.style.cssText = `text-align:center;padding:18px 0 5px;margin-top:5px;`
      footer.innerHTML = `
        ${dividerHtml(Math.min(320, totalW - 300))}
        <div style="margin-top:12px;font-size:13px;color:#8B7355;letter-spacing:1px;">${totalGens} đời · ${totalMems} thành viên</div>
        <div style="margin-top:5px;font-size:11px;color:#B0976A;font-style:italic;">Ngày xuất bản: ${dateStr}</div>
      `
      content.appendChild(footer)

      // 4. Wait for rendering
      await new Promise(r => setTimeout(r, 400))

      // 5. Capture
      const dataUrl = await toPng(container, {
        pixelRatio: 2,
        backgroundColor: '#FEF9EE',
        width: totalW,
        height: totalH,
        style: { position: 'static', left: 'auto', top: 'auto' },
      })

      document.body.removeChild(container)

      // 6. Download
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `gia-pha-${familyName.toLowerCase().replace(/\s+/g, '-')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

    } catch (err) {
      console.error('Export failed:', err)
      alert('Xuất ảnh thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'))
    } finally {
      exporting.value = false
    }
  }

  /** Convert an image URL to a base64 data URL */
  async function toBase64(url: string): Promise<string> {
    try {
      const resp = await fetch(url)
      const blob = await resp.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch {
      return ''
    }
  }

  async function exportTreeAsPdf(
    svgEl: SVGSVGElement,
    options: PdfExportOptions,
  ) {
    exporting.value = true

    try {
      // 1. Get bounding box of tree content
      const originalG = svgEl.querySelector('g')
      if (!originalG) throw new Error('Không tìm thấy nội dung cây gia phả')
      const bbox = originalG.getBBox()

      // 2. Paper sizes in mm
      const paperSizes: Record<string, [number, number]> = {
        a4: [210, 297],
        a3: [297, 420],
        a2: [420, 594],
      }
      const [paperW, paperH] = paperSizes[options.paperSize] || paperSizes.a4
      const isLandscape = options.orientation === 'landscape'
      const pageW = isLandscape ? paperH : paperW
      const pageH = isLandscape ? paperW : paperH

      const pixelRatio = options.quality === 'high' ? 3 : 2
      const mmToPx = 3.7795

      // Margins
      const marginMm = 15
      const headerHeightMm = 20
      const contentMarginTop = marginMm + headerHeightMm
      const availW = pageW - marginMm * 2
      const availH = pageH - contentMarginTop - marginMm

      // 3. Calculate render size to fit tree into available area
      const padding = 60
      const vbW = bbox.width + padding * 2
      const vbH = bbox.height + padding * 2
      const svgAspect = vbW / vbH
      const availAspect = availW / availH
      let renderW: number, renderH: number
      if (svgAspect > availAspect) {
        renderW = availW
        renderH = availW / svgAspect
      } else {
        renderH = availH
        renderW = availH * svgAspect
      }

      const renderWPx = Math.round(renderW * mmToPx * pixelRatio)
      const renderHPx = Math.round(renderH * mmToPx * pixelRatio)

      // 4. Create a temporary wrapper with the SVG clone, reset transform and set viewBox
      const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement
      const clonedG = clonedSvg.querySelector('g')
      if (clonedG) clonedG.removeAttribute('transform')

      const vbX = bbox.x - padding
      const vbY = bbox.y - padding
      clonedSvg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`)
      clonedSvg.setAttribute('width', String(renderWPx))
      clonedSvg.setAttribute('height', String(renderHPx))
      clonedSvg.style.width = `${renderWPx}px`
      clonedSvg.style.height = `${renderHPx}px`

      // Place offscreen for html-to-image to capture
      const wrapper = document.createElement('div')
      wrapper.style.cssText = `position:fixed;left:-99999px;top:0;width:${renderWPx}px;height:${renderHPx}px;background:#ffffff;`
      wrapper.appendChild(clonedSvg)
      document.body.appendChild(wrapper)

      await new Promise(r => setTimeout(r, 300))

      // 5. Use html-to-image (handles CORS/foreignObject correctly)
      const imgDataUrl = await toPng(wrapper, {
        pixelRatio: 1,
        backgroundColor: '#FFFFFF',
        width: renderWPx,
        height: renderHPx,
        style: { position: 'static', left: 'auto', top: 'auto' },
      })

      document.body.removeChild(wrapper)

      // 6. Create jsPDF
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: options.orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: options.paperSize,
      })

      // 7. Title and date
      const today = new Date()
      const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

      pdf.setFontSize(16)
      pdf.setTextColor(92, 46, 14)
      pdf.text('Cây Gia Phả', pageW / 2, marginMm + 6, { align: 'center' })

      pdf.setFontSize(9)
      pdf.setTextColor(160, 128, 80)
      pdf.text(`Ngày xuất: ${dateStr}`, pageW / 2, marginMm + 12, { align: 'center' })

      // 8. Add image centered
      const imgX = marginMm + (availW - renderW) / 2
      const imgY = contentMarginTop + (availH - renderH) / 2
      pdf.addImage(imgDataUrl, 'PNG', imgX, imgY, renderW, renderH)

      // 9. Save
      pdf.save(`cay-gia-pha-${options.paperSize}-${options.orientation}.pdf`)

    } catch (err) {
      console.error('PDF export failed:', err)
      alert('Xuất PDF thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'))
    } finally {
      exporting.value = false
    }
  }

  return { exportTree, exportTreeAsPdf, exporting }
}
