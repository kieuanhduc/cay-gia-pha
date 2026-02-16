interface MemberNode {
  id: number
  fullName: string
  gender: string
  generation: number
  fatherId: number | null
  motherId: number | null
}

interface SpouseRecord {
  memberAId: number
  memberBId: number
}

interface EdgeInfo {
  type: 'father' | 'mother' | 'child' | 'spouse'
  fromId: number
  toId: number
}

interface RelationshipResult {
  path: { id: number; fullName: string; gender: string; generation: number }[]
  relationship: string
  description: string
}

/**
 * Build an adjacency graph from members and spouse records.
 * Each edge carries a type so we can interpret the path.
 */
function buildGraph(members: MemberNode[], spouses: SpouseRecord[]) {
  const adj = new Map<number, EdgeInfo[]>()
  const memberMap = new Map<number, MemberNode>()

  for (const m of members) {
    memberMap.set(m.id, m)
    if (!adj.has(m.id)) adj.set(m.id, [])
  }

  for (const m of members) {
    if (m.fatherId && memberMap.has(m.fatherId)) {
      // m -> father
      adj.get(m.id)!.push({ type: 'father', fromId: m.id, toId: m.fatherId })
      // father -> m (child)
      if (!adj.has(m.fatherId)) adj.set(m.fatherId, [])
      adj.get(m.fatherId)!.push({ type: 'child', fromId: m.fatherId, toId: m.id })
    }
    if (m.motherId && memberMap.has(m.motherId)) {
      // m -> mother
      adj.get(m.id)!.push({ type: 'mother', fromId: m.id, toId: m.motherId })
      // mother -> m (child)
      if (!adj.has(m.motherId)) adj.set(m.motherId, [])
      adj.get(m.motherId)!.push({ type: 'child', fromId: m.motherId, toId: m.id })
    }
  }

  for (const s of spouses) {
    if (memberMap.has(s.memberAId) && memberMap.has(s.memberBId)) {
      if (!adj.has(s.memberAId)) adj.set(s.memberAId, [])
      if (!adj.has(s.memberBId)) adj.set(s.memberBId, [])
      adj.get(s.memberAId)!.push({ type: 'spouse', fromId: s.memberAId, toId: s.memberBId })
      adj.get(s.memberBId)!.push({ type: 'spouse', fromId: s.memberBId, toId: s.memberAId })
    }
  }

  return { adj, memberMap }
}

/**
 * BFS to find the shortest path between two members.
 */
function bfs(adj: Map<number, EdgeInfo[]>, startId: number, endId: number): EdgeInfo[] | null {
  if (startId === endId) return []

  const visited = new Set<number>()
  const parent = new Map<number, { edge: EdgeInfo; prevId: number }>()
  const queue: number[] = [startId]
  visited.add(startId)

  while (queue.length > 0) {
    const current = queue.shift()!
    const edges = adj.get(current) || []

    for (const edge of edges) {
      if (!visited.has(edge.toId)) {
        visited.add(edge.toId)
        parent.set(edge.toId, { edge, prevId: current })

        if (edge.toId === endId) {
          // Reconstruct path
          const path: EdgeInfo[] = []
          let cur = endId
          while (parent.has(cur)) {
            const p = parent.get(cur)!
            path.unshift(p.edge)
            cur = p.prevId
          }
          return path
        }

        queue.push(edge.toId)
      }
    }
  }

  return null
}

/**
 * Determine whether a parent is on the paternal or maternal side
 * relative to a starting member, by examining the edge sequence.
 */
function getSide(edges: EdgeInfo[]): 'paternal' | 'maternal' | 'unknown' {
  // The first upward edge from A determines the side
  if (edges.length === 0) return 'unknown'
  if (edges[0].type === 'father') return 'paternal'
  if (edges[0].type === 'mother') return 'maternal'
  return 'unknown'
}

/**
 * Interpret a path of edges and produce a Vietnamese relationship name.
 */
function interpretRelationship(
  edges: EdgeInfo[],
  memberMap: Map<number, MemberNode>,
  startId: number,
  endId: number,
): { relationship: string; description: string } {
  if (edges.length === 0) {
    return { relationship: 'chính mình', description: 'Cùng một người' }
  }

  const target = memberMap.get(endId)!
  const start = memberMap.get(startId)!
  const targetGender = target.gender
  const startGender = start.gender

  // Collect edge types
  const types = edges.map((e) => e.type)

  // --- Direct parent (1 edge up) ---
  if (types.length === 1 && types[0] === 'father') {
    return { relationship: 'cha', description: `${target.fullName} là cha của ${start.fullName}` }
  }
  if (types.length === 1 && types[0] === 'mother') {
    return { relationship: 'mẹ', description: `${target.fullName} là mẹ của ${start.fullName}` }
  }

  // --- Direct child (1 edge down) ---
  if (types.length === 1 && types[0] === 'child') {
    const rel = targetGender === 'male' ? 'con trai' : 'con gái'
    return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
  }

  // --- Spouse (1 edge) ---
  if (types.length === 1 && types[0] === 'spouse') {
    const rel = targetGender === 'male' ? 'chồng' : 'vợ'
    return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
  }

  // --- Grandparent (2 edges up) ---
  if (types.length === 2 && (types[0] === 'father' || types[0] === 'mother') && (types[1] === 'father' || types[1] === 'mother')) {
    const side = getSide(edges)
    if (targetGender === 'male') {
      const rel = side === 'paternal' ? 'ông nội' : 'ông ngoại'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    } else {
      const rel = side === 'paternal' ? 'bà nội' : 'bà ngoại'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    }
  }

  // --- Grandchild (2 edges down) ---
  if (types.length === 2 && types[0] === 'child' && types[1] === 'child') {
    // Check the side: is the start person the father's side or mother's side parent?
    const middleMember = memberMap.get(edges[0].toId)!
    const side = middleMember.fatherId === startId ? 'paternal' : 'maternal'
    const rel = side === 'paternal' ? 'cháu nội' : 'cháu ngoại'
    return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
  }

  // --- Sibling (up then down: father/mother -> child) ---
  if (types.length === 2 && (types[0] === 'father' || types[0] === 'mother') && types[1] === 'child') {
    const targetBirth = target.generation * 1000 + (target.birthOrder || 0)
    const startBirth = start.generation * 1000 + (start.birthOrder || 0)
    const isOlder = targetBirth < startBirth

    if (targetGender === 'male') {
      const rel = isOlder ? 'anh trai' : 'em trai'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    } else {
      const rel = isOlder ? 'chị gái' : 'em gái'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    }
  }

  // --- Great-grandparent (3 edges up) ---
  if (types.length === 3 && types.every((t) => t === 'father' || t === 'mother')) {
    const side = getSide(edges)
    if (targetGender === 'male') {
      const rel = side === 'paternal' ? 'cụ ông (nội)' : 'cụ ông (ngoại)'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    } else {
      const rel = side === 'paternal' ? 'cụ bà (nội)' : 'cụ bà (ngoại)'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    }
  }

  // --- Great-grandchild (3 edges down) ---
  if (types.length === 3 && types.every((t) => t === 'child')) {
    const rel = targetGender === 'male' ? 'chắt trai' : 'chắt gái'
    return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
  }

  // --- Uncle / Aunt (2 edges up, 1 down: parent -> parent -> child) ---
  if (types.length === 3 && (types[0] === 'father' || types[0] === 'mother') && (types[1] === 'father' || types[1] === 'mother') && types[2] === 'child') {
    const side = getSide(edges)
    if (side === 'paternal') {
      // Father's side
      if (targetGender === 'male') {
        // Compare with start's father to determine chú/bác
        const fatherId = start.fatherId
        const father = fatherId ? memberMap.get(fatherId) : null
        if (father) {
          const targetOrder = target.birthOrder || 0
          const fatherOrder = father.birthOrder || 0
          const rel = targetOrder < fatherOrder ? 'bác trai' : 'chú'
          return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
        }
        return { relationship: 'chú/bác', description: `${target.fullName} là chú/bác của ${start.fullName}` }
      } else {
        return { relationship: 'cô', description: `${target.fullName} là cô của ${start.fullName}` }
      }
    } else {
      // Mother's side
      if (targetGender === 'male') {
        return { relationship: 'cậu', description: `${target.fullName} là cậu của ${start.fullName}` }
      } else {
        // Compare with start's mother to determine dì/bác gái
        const motherId = start.motherId
        const mother = motherId ? memberMap.get(motherId) : null
        if (mother) {
          const targetOrder = target.birthOrder || 0
          const motherOrder = mother.birthOrder || 0
          const rel = targetOrder < motherOrder ? 'bác gái' : 'dì'
          return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
        }
        return { relationship: 'dì', description: `${target.fullName} là dì của ${start.fullName}` }
      }
    }
  }

  // --- Nephew / Niece (1 up, 2 down: parent -> child -> child) ---
  if (types.length === 3 && (types[0] === 'father' || types[0] === 'mother') && types[1] === 'child' && types[2] === 'child') {
    const rel = targetGender === 'male' ? 'cháu trai' : 'cháu gái'
    return { relationship: rel, description: `${target.fullName} là ${rel} (con của anh chị em) của ${start.fullName}` }
  }

  // --- Spouse of parent (step-parent via spouse edge) ---
  if (types.length === 2 && (types[0] === 'father' || types[0] === 'mother') && types[1] === 'spouse') {
    if (types[0] === 'father') {
      // Father's spouse = mother (or step-mother)
      const rel = targetGender === 'female' ? 'mẹ' : 'cha dượng'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    } else {
      const rel = targetGender === 'male' ? 'cha' : 'mẹ kế'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    }
  }

  // --- Child's spouse (con dâu / con rể) ---
  if (types.length === 2 && types[0] === 'child' && types[1] === 'spouse') {
    const rel = targetGender === 'male' ? 'con rể' : 'con dâu'
    return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
  }

  // --- Spouse's parent (father-in-law / mother-in-law) ---
  if (types.length === 2 && types[0] === 'spouse' && (types[1] === 'father' || types[1] === 'mother')) {
    if (targetGender === 'male') {
      const rel = startGender === 'male' ? 'bố vợ' : 'bố chồng'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    } else {
      const rel = startGender === 'male' ? 'mẹ vợ' : 'mẹ chồng'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    }
  }

  // --- Sibling's spouse (anh/chị/em dâu/rể) ---
  if (types.length === 3 && (types[0] === 'father' || types[0] === 'mother') && types[1] === 'child' && types[2] === 'spouse') {
    if (targetGender === 'male') {
      const rel = 'anh/em rể'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    } else {
      const rel = 'chị/em dâu'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    }
  }

  // --- Spouse's sibling ---
  if (types.length === 3 && types[0] === 'spouse' && (types[1] === 'father' || types[1] === 'mother') && types[2] === 'child') {
    if (targetGender === 'male') {
      const rel = startGender === 'male' ? 'anh/em vợ' : 'anh/em chồng'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    } else {
      const rel = startGender === 'male' ? 'chị/em vợ' : 'chị/em chồng'
      return { relationship: rel, description: `${target.fullName} là ${rel} của ${start.fullName}` }
    }
  }

  // --- Cousin (2 up, 2 down) ---
  if (types.length === 4
    && (types[0] === 'father' || types[0] === 'mother')
    && (types[1] === 'father' || types[1] === 'mother')
    && types[2] === 'child'
    && types[3] === 'child') {
    const side = getSide(edges)
    const sideLabel = side === 'paternal' ? 'họ nội' : 'họ ngoại'
    const rel = targetGender === 'male' ? 'anh/em họ' : 'chị/em họ'
    return { relationship: `${rel} (${sideLabel})`, description: `${target.fullName} là ${rel} bên ${sideLabel} của ${start.fullName}` }
  }

  // --- Fallback: describe step by step ---
  return buildStepByStepDescription(edges, memberMap, startId, endId)
}

/**
 * For complex paths, build a step-by-step Vietnamese description.
 */
function buildStepByStepDescription(
  edges: EdgeInfo[],
  memberMap: Map<number, MemberNode>,
  startId: number,
  endId: number,
): { relationship: string; description: string } {
  const start = memberMap.get(startId)!
  const target = memberMap.get(endId)!

  const steps: string[] = []
  let currentId = startId

  for (const edge of edges) {
    const nextMember = memberMap.get(edge.toId)!
    switch (edge.type) {
      case 'father':
        steps.push(`cha: ${nextMember.fullName}`)
        break
      case 'mother':
        steps.push(`mẹ: ${nextMember.fullName}`)
        break
      case 'child':
        steps.push(`con: ${nextMember.fullName}`)
        break
      case 'spouse':
        steps.push(`${nextMember.gender === 'male' ? 'chồng' : 'vợ'}: ${nextMember.fullName}`)
        break
    }
    currentId = edge.toId
  }

  // Count generations difference
  const genDiff = target.generation - start.generation
  let relationship: string

  if (genDiff === 0) {
    relationship = 'cùng thế hệ'
  } else if (genDiff > 0) {
    relationship = `hậu duệ (${genDiff} đời)`
  } else {
    relationship = `tiền bối (${Math.abs(genDiff)} đời)`
  }

  const description = `Quan hệ giữa ${start.fullName} và ${target.fullName}: ${steps.join(' → ')}`

  return { relationship, description }
}

/**
 * Main exported function: find the relationship between two members.
 */
export function findRelationship(
  members: MemberNode[],
  spouses: SpouseRecord[],
  memberAId: number,
  memberBId: number,
): RelationshipResult | null {
  const { adj, memberMap } = buildGraph(members, spouses)

  if (!memberMap.has(memberAId) || !memberMap.has(memberBId)) {
    return null
  }

  if (memberAId === memberBId) {
    const member = memberMap.get(memberAId)!
    return {
      path: [{ id: member.id, fullName: member.fullName, gender: member.gender, generation: member.generation }],
      relationship: 'chính mình',
      description: 'Cùng một người',
    }
  }

  const edges = bfs(adj, memberAId, memberBId)
  if (!edges) return null

  // Reconstruct path nodes
  const pathIds = [memberAId]
  for (const edge of edges) {
    pathIds.push(edge.toId)
  }

  const path = pathIds.map((id) => {
    const m = memberMap.get(id)!
    return { id: m.id, fullName: m.fullName, gender: m.gender, generation: m.generation }
  })

  const { relationship, description } = interpretRelationship(edges, memberMap, memberAId, memberBId)

  return { path, relationship, description }
}
