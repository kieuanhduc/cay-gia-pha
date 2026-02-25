import { toPng } from 'html-to-image'

interface TreeNode {
  id: number
  fullName: string
  gender: string
  birthDate: string | null
  deathDate: string | null
  isAlive: boolean
  birthPlace: string | null
  bio: string | null
  deathAnniversaryLunar: string | null
  deathAnniversaryNote: string | null
  avatarUrl: string | null
  generation: number
  fatherName: string | null
  motherName: string | null
  childrenCount: number
  spouses?: {
    fullName: string
    gender?: string
    birthDate?: string | null
    deathDate?: string | null
    isAlive?: boolean
    bio?: string | null
    birthPlace?: string | null
    marriedDate?: string | null
  }[]
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

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '?'
    const d = new Date(dateStr)
    const dd = d.getDate().toString().padStart(2, '0')
    const mm = (d.getMonth() + 1).toString().padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
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
    const nodeW = 224
    const nodeH = 380
    const hGap = 60  // horizontal gap between siblings
    const vGap = 100  // vertical gap between generations

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

  function row(label: string, value: string, color = '#3C2A1A'): string {
    return `<div style="display:flex;gap:4px;margin-top:2px;font-size:9px;line-height:1.4;">
      <span style="color:#B8936A;white-space:nowrap;min-width:52px;">${label}</span>
      <span style="color:${color};font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${value}</span>
    </div>`
  }

  function divLine(): string {
    return `<div style="border-top:1px solid #E8D5A8;margin:5px 0;"></div>`
  }

  /** Render a node card as HTML string */
  function renderNodeCard(data: TreeNode): string {
    if (data.id === 0) return ''

    const isMale = data.gender === 'male'
    // Deep gradient headers — heritage/premium look
    const headerBg = isMale
      ? 'linear-gradient(135deg, #1a3a6b 0%, #2d6496 55%, #3b7fc4 100%)'
      : 'linear-gradient(135deg, #6b1a30 0%, #a03350 55%, #c05670 100%)'
    const genderText = isMale ? 'Nam' : 'Nữ'
    const genderSymbol = isMale ? '♂' : '♀'
    const spouses = data.spouses ?? []

    // Avatar
    const avatarHtml = data.avatarUrl
      ? `<img src="${data.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`
      : `<div style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;color:rgba(255,255,255,0.55);">${genderSymbol}</div>`

    const header = `
      <div style="background:${headerBg};border-radius:8px 8px 0 0;padding:9px 10px 8px;display:flex;align-items:center;gap:9px;">
        <div style="width:48px;height:48px;border-radius:50%;border:2.5px solid rgba(212,160,23,0.85);flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.1);">
          ${avatarHtml}
        </div>
        <div style="overflow:hidden;flex:1;">
          <div style="font-weight:700;font-size:12.5px;color:#FFFFFF;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,0.35);">${escapeHtml(data.fullName)}</div>
          <div style="margin-top:3px;display:flex;gap:4px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:8px;font-weight:600;color:rgba(255,255,255,0.92);background:rgba(255,255,255,0.2);border-radius:3px;padding:1px 5px;letter-spacing:0.3px;">${genderText}</span>
            <span style="font-size:8px;font-weight:700;color:#fbbf24;background:rgba(0,0,0,0.22);border-radius:3px;padding:1px 5px;">Đời ${data.generation}</span>
            <span style="font-size:8px;color:${data.isAlive ? '#86efac' : 'rgba(255,255,255,0.38)'};font-weight:500;">${data.isAlive ? '● Còn sống' : '† Đã mất'}</span>
          </div>
        </div>
      </div>`

    // Life info
    const birthStr = formatDate(data.birthDate)
    const deathStr = !data.isAlive ? formatDate(data.deathDate) : null

    let lifeRows = row('Sinh:', birthStr)
    if (data.birthPlace) lifeRows += row('Nơi sinh:', escapeHtml(data.birthPlace))
    if (!data.isAlive) {
      lifeRows += row('Mất:', deathStr ?? '?', '#64748b')
      if (data.deathAnniversaryLunar) {
        const annivLabel = data.deathAnniversaryLunar + ' (ÂL)'
        const annivNote = data.deathAnniversaryNote ? ' — ' + data.deathAnniversaryNote : ''
        lifeRows += row('Ngày giỗ:', escapeHtml(annivLabel + annivNote), '#7c3aed')
      }
    }

    // Bio block
    const bioText = data.bio ? data.bio.slice(0, 80) + (data.bio.length > 80 ? '…' : '') : ''
    const bioRow = bioText
      ? `<div style="font-size:8.5px;color:#6B5040;line-height:1.5;font-style:italic;border-left:2px solid #D4A017;padding:2px 0 2px 5px;margin-top:3px;">${escapeHtml(bioText)}</div>`
      : ''

    // Family relations
    let familyRows = ''
    if (data.fatherName) familyRows += row('Cha:', escapeHtml(data.fatherName), '#1d4ed8')
    if (data.motherName) familyRows += row('Mẹ:', escapeHtml(data.motherName), '#be185d')

    const spouseLabel = isMale ? 'Vợ' : 'Chồng'
    for (const s of spouses) {
      const sBirth = s.birthDate ? formatDate(s.birthDate) : null
      const sDeath = s.isAlive === false ? formatDate(s.deathDate ?? null) : null
      const sMarried = s.marriedDate ? formatDate(s.marriedDate) : null
      const sBio = s.bio ? s.bio.slice(0, 60) + (s.bio.length > 60 ? '…' : '') : null

      const spouseMeta = [
        sBirth ? `Sinh: ${sBirth}` : null,
        s.birthPlace ? `Nơi sinh: ${escapeHtml(s.birthPlace)}` : null,
        sDeath ? `Mất: ${sDeath}` : null,
        sMarried ? `Kết hôn: ${sMarried}` : null,
      ].filter(Boolean).join(' · ')

      familyRows += `
        <div style="margin-top:4px;padding:4px 7px;background:linear-gradient(135deg,#FFF8EE,#FEF2D8);border-left:3px solid #D4A017;border-radius:0 4px 4px 0;">
          <div style="font-size:9px;color:#78350f;font-weight:700;">${spouseLabel}: ${escapeHtml(s.fullName)}</div>
          ${spouseMeta ? `<div style="font-size:8px;color:#92400e;margin-top:1px;line-height:1.5;">${spouseMeta}</div>` : ''}
          ${sBio ? `<div style="font-size:8px;color:#5B4030;margin-top:2px;font-style:italic;padding-left:4px;line-height:1.4;">${escapeHtml(sBio)}</div>` : ''}
        </div>`
    }

    const childCount = data.childrenCount ?? data.children?.length ?? 0
    if (childCount > 0) {
      familyRows += row('Con:', `${childCount} người`, '#065f46')
    }

    const hasFamilyRows = familyRows.length > 0

    return `
      <div style="
        background:#FFFDF7;
        border:2px solid #C5973A;
        border-radius:10px;
        box-shadow:0 4px 14px rgba(101,67,33,0.18),0 1px 4px rgba(0,0,0,0.07);
        font-family:'Be Vietnam Pro',sans-serif;
        width:220px;
        box-sizing:border-box;
        overflow:hidden;
      ">
        ${header}
        <div style="padding:7px 9px 9px;">
          ${lifeRows}
          ${bioRow}
          ${hasFamilyRows ? divLine() + familyRows : ''}
        </div>
      </div>
    `
  }

  /** Create smooth bezier curves connecting parent to children */
  function renderLinks(links: { from: LayoutNode; to: LayoutNode }[], _nodeW: number, nodeH: number): string {
    let paths = ''

    const byParent = new Map<LayoutNode, LayoutNode[]>()
    for (const link of links) {
      if (!byParent.has(link.from)) byParent.set(link.from, [])
      byParent.get(link.from)!.push(link.to)
    }

    for (const [parent, children] of byParent) {
      const px = parent.x
      const py = parent.y + nodeH - 10 // bottom of parent card

      for (const child of children) {
        const cx = child.x
        const cy = child.y + 5 // top of child card
        const cpY = py + (cy - py) * 0.48

        // Smooth S-curve per connection — elegant heritage look
        paths += `<path d="M${px},${py} C${px},${cpY} ${cx},${cpY} ${cx},${cy}" fill="none" stroke="#C5973A" stroke-width="2" stroke-opacity="0.82"/>`
      }
    }

    return paths
  }

  /** Decorative border SVG */
  function createBorderSvg(w: number, h: number): string {
    const p = 40

    // Meander pattern segments
    const mSize = 12
    let meander = ''
    // Top
    for (let x = p + 6; x < w - p - 6 - mSize * 2; x += mSize * 2) {
      meander += `<path d="M${x},${p} h${mSize} v${mSize} h${mSize} v${-mSize}" fill="none" stroke="#C5973A" stroke-width="1" opacity="0.42"/>`
    }
    // Bottom
    for (let x = p + 6; x < w - p - 6 - mSize * 2; x += mSize * 2) {
      meander += `<path d="M${x},${h - p} h${mSize} v${-mSize} h${mSize} v${mSize}" fill="none" stroke="#C5973A" stroke-width="1" opacity="0.42"/>`
    }
    // Left
    for (let y = p + 6; y < h - p - 6 - mSize * 2; y += mSize * 2) {
      meander += `<path d="M${p},${y} v${mSize} h${mSize} v${mSize} h${-mSize}" fill="none" stroke="#C5973A" stroke-width="1" opacity="0.42"/>`
    }
    // Right
    for (let y = p + 6; y < h - p - 6 - mSize * 2; y += mSize * 2) {
      meander += `<path d="M${w - p},${y} v${mSize} h${-mSize} v${mSize} h${mSize}" fill="none" stroke="#C5973A" stroke-width="1" opacity="0.42"/>`
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" style="position:absolute;top:0;left:0;pointer-events:none;">
      <!-- Outer bold frame -->
      <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="10" fill="none" stroke="#8B6914" stroke-width="3.5"/>
      <!-- Secondary frame -->
      <rect x="23" y="23" width="${w - 46}" height="${h - 46}" rx="7" fill="none" stroke="#B8860B" stroke-width="1.5"/>
      <!-- Meander pattern between frames -->
      ${meander}
      <!-- Inner fine line -->
      <rect x="${p + mSize + 4}" y="${p + mSize + 4}" width="${w - 2 * p - 2 * mSize - 8}" height="${h - 2 * p - 2 * mSize - 8}" rx="3" fill="none" stroke="#D4A847" stroke-width="0.75" opacity="0.55"/>
      <!-- Corner lotus ornaments -->
      ${cornerLotus(p, p, 1, 1)}
      ${cornerLotus(w - p, p, -1, 1)}
      ${cornerLotus(p, h - p, 1, -1)}
      ${cornerLotus(w - p, h - p, -1, -1)}
    </svg>`
  }

  function cornerLotus(cx: number, cy: number, sx: number, sy: number): string {
    return `<g transform="translate(${cx},${cy}) scale(${sx},${sy})">
      <path d="M0,0 C14,4 24,14 28,28" fill="none" stroke="#8B6914" stroke-width="2.5" opacity="0.78"/>
      <path d="M0,0 C4,14 14,24 28,28" fill="none" stroke="#8B6914" stroke-width="2.5" opacity="0.78"/>
      <ellipse cx="20" cy="7" rx="10" ry="4.5" fill="#D4A847" opacity="0.26" transform="rotate(20,20,7)"/>
      <ellipse cx="7" cy="20" rx="4.5" ry="10" fill="#D4A847" opacity="0.26" transform="rotate(20,7,20)"/>
      <ellipse cx="22" cy="13" rx="7" ry="3" fill="#B8860B" opacity="0.3" transform="rotate(42,22,13)"/>
      <ellipse cx="13" cy="22" rx="3" ry="7" fill="#B8860B" opacity="0.3" transform="rotate(42,13,22)"/>
      <ellipse cx="24" cy="18" rx="5" ry="2.2" fill="#C5973A" opacity="0.22" transform="rotate(57,24,18)"/>
      <ellipse cx="18" cy="24" rx="2.2" ry="5" fill="#C5973A" opacity="0.22" transform="rotate(57,18,24)"/>
      <circle cx="2" cy="2" r="4.5" fill="#8B6914" opacity="0.58"/>
      <circle cx="2" cy="2" r="2.5" fill="#EAC65C" opacity="0.92"/>
      <circle cx="2" cy="2" r="1" fill="#FFFFFF" opacity="0.55"/>
      <circle cx="15" cy="8" r="2" fill="#C5973A" opacity="0.36"/>
      <circle cx="8" cy="15" r="2" fill="#C5973A" opacity="0.36"/>
    </g>`
  }

  function dividerHtml(width: number): string {
    return `<div style="display:flex;align-items:center;justify-content:center;width:${width}px;margin:0 auto;">
      <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#8B6914);"></div>
      <div style="display:flex;gap:4px;padding:0 12px;align-items:center;">
        <div style="width:3px;height:3px;background:#C5973A;border-radius:50%;"></div>
        <div style="width:5px;height:5px;background:#D4A017;transform:rotate(45deg);"></div>
        <div style="width:10px;height:10px;background:#8B6914;transform:rotate(45deg);box-shadow:0 0 5px rgba(139,105,20,0.45);"></div>
        <div style="width:5px;height:5px;background:#D4A017;transform:rotate(45deg);"></div>
        <div style="width:3px;height:3px;background:#C5973A;border-radius:50%;"></div>
      </div>
      <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#8B6914);"></div>
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
      const nodeW = 224
      const nodeH = 380
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

      // Background — richer parchment with golden corner glows
      const bg = document.createElement('div')
      bg.style.cssText = `
        position:absolute;inset:0;
        background:
          radial-gradient(ellipse at 0% 0%, rgba(218,165,32,0.13) 0%, transparent 35%),
          radial-gradient(ellipse at 100% 0%, rgba(218,165,32,0.10) 0%, transparent 35%),
          radial-gradient(ellipse at 0% 100%, rgba(218,165,32,0.10) 0%, transparent 35%),
          radial-gradient(ellipse at 100% 100%, rgba(218,165,32,0.13) 0%, transparent 35%),
          linear-gradient(160deg, #FEF8E8 0%, #FDEECE 30%, #FCE9BA 60%, #FBEAB5 100%);
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
        ${dividerHtml(Math.min(500, totalW - 160))}
        <div style="margin:13px 0 3px;font-size:11px;font-weight:600;color:#8B6914;letter-spacing:10px;text-align:center;">— GIA PHẢ VIỆT NAM —</div>
        <div style="font-size:46px;font-weight:800;color:#3D1F08;letter-spacing:6px;line-height:1.2;margin:5px 0 8px;text-align:center;text-shadow:0 2px 5px rgba(0,0,0,0.09);">${escapeHtml(familyName.toUpperCase())}</div>
        ${dividerHtml(Math.min(380, totalW - 240))}
        <div style="margin-top:10px;font-size:12px;color:#A08050;letter-spacing:3px;text-align:center;">Từ đời thứ nhất đến đời thứ ${totalGens} &nbsp;·&nbsp; ${totalMems} thành viên</div>
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
        <div style="margin-top:10px;font-size:12px;color:#8B7355;letter-spacing:2px;text-align:center;">❖ ${totalGens} đời &nbsp;·&nbsp; ${totalMems} thành viên ❖</div>
        <div style="margin-top:5px;font-size:10px;color:#B0976A;font-style:italic;text-align:center;">Ngày xuất bản: ${dateStr}</div>
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
