import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCorrect, playWrong } from '@/lib/audio'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameTimer } from '@/hooks/useGameTimer'
import { randInt, shuffle } from '@/lib/random'

/* ================================================================
   SVG 장면 기반 진짜 틀린그림찾기
   - 매 라운드 절차적으로 장면 생성
   - 왼쪽 = 원본, 오른쪽 = 일부 변경
   - 오른쪽 그림에서 다른 부분을 탭하면 정답
================================================================ */

/* ── 색상 팔레트 ── */
const COLORS = {
  sky: ['#87CEEB', '#B0E0E6', '#ADD8E6', '#E0F0FF'],
  ground: ['#90EE90', '#7CCD7C', '#8FBC8F', '#98FB98'],
  tree: ['#228B22', '#2E8B57', '#3CB371', '#32CD32'],
  trunk: ['#8B4513', '#A0522D', '#6B3410', '#D2691E'],
  flower: ['#FF6B8A', '#FFD700', '#FF69B4', '#FF4500', '#DA70D6', '#FF1493', '#FFA500'],
  house: ['#FFD700', '#FF8C00', '#FF6347', '#DEB887', '#F4A460'],
  roof: ['#B22222', '#8B0000', '#CD5C5C', '#A52A2A', '#DC143C'],
  sun: ['#FFD700', '#FFA500', '#FFEC8B'],
  cloud: ['#FFFFFF', '#F0F0F0', '#E8E8E8'],
  water: ['#4169E1', '#1E90FF', '#6495ED'],
  bird: ['#333333', '#8B4513', '#4A4A4A'],
  fence: ['#DEB887', '#D2B48C', '#C4A882'],
  butterfly: ['#FF69B4', '#FFD700', '#9370DB', '#FF6347', '#00CED1'],
}

const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)]

/* ── 장면 요소 타입 ── */
type ElemType = 'sun' | 'cloud' | 'tree' | 'flower' | 'house' | 'mountain' | 'bird' | 'bush' | 'fence' | 'butterfly' | 'pond'

interface SceneElem {
  id: string
  type: ElemType
  x: number
  y: number
  size: number
  color: string
  color2?: string // 보조색
  variant?: number
}

interface Diff {
  elemId: string
  kind: 'color' | 'missing' | 'size'
  altColor?: string
  altSize?: number
  cx: number
  cy: number
  r: number // 히트 반경
}

interface Level {
  elems: SceneElem[]
  diffs: Diff[]
  bgColor: string
  groundColor: string
}

/* ── SVG 요소 렌더러 ── */
function renderElem(e: SceneElem, overrideColor?: string, overrideSize?: number, hidden?: boolean) {
  if (hidden) return null
  const c = overrideColor ?? e.color
  const c2 = e.color2
  const s = overrideSize ?? e.size
  const key = e.id

  switch (e.type) {
    case 'sun':
      return (
        <g key={key}>
          {/* 광선 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={e.x}
              y1={e.y}
              x2={e.x + Math.cos((angle * Math.PI) / 180) * s * 1.6}
              y2={e.y + Math.sin((angle * Math.PI) / 180) * s * 1.6}
              stroke={c}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.6}
            />
          ))}
          <circle cx={e.x} cy={e.y} r={s} fill={c} />
          <circle cx={e.x - s * 0.2} cy={e.y - s * 0.15} r={s * 0.15} fill="#FFF" opacity={0.5} />
        </g>
      )

    case 'cloud':
      return (
        <g key={key} opacity={0.9}>
          <ellipse cx={e.x} cy={e.y} rx={s * 1.4} ry={s * 0.7} fill={c} />
          <ellipse cx={e.x - s * 0.8} cy={e.y + s * 0.1} rx={s * 0.9} ry={s * 0.6} fill={c} />
          <ellipse cx={e.x + s * 0.8} cy={e.y + s * 0.1} rx={s * 0.9} ry={s * 0.6} fill={c} />
          <ellipse cx={e.x - s * 0.3} cy={e.y - s * 0.3} rx={s * 0.7} ry={s * 0.55} fill={c} />
          <ellipse cx={e.x + s * 0.4} cy={e.y - s * 0.25} rx={s * 0.65} ry={s * 0.5} fill={c} />
        </g>
      )

    case 'tree':
      return (
        <g key={key}>
          {/* 줄기 */}
          <rect x={e.x - s * 0.15} y={e.y - s * 0.2} width={s * 0.3} height={s * 1.2} rx={3} fill={c2 ?? pick(COLORS.trunk)} />
          {/* 잎 - 둥근 나무 */}
          <circle cx={e.x} cy={e.y - s * 0.7} r={s * 0.7} fill={c} />
          <circle cx={e.x - s * 0.4} cy={e.y - s * 0.4} r={s * 0.5} fill={c} />
          <circle cx={e.x + s * 0.4} cy={e.y - s * 0.4} r={s * 0.5} fill={c} />
          {/* 하이라이트 */}
          <circle cx={e.x - s * 0.2} cy={e.y - s * 0.9} r={s * 0.2} fill="#FFF" opacity={0.15} />
        </g>
      )

    case 'flower': {
      const petalCount = 5
      const pr = s * 0.45
      return (
        <g key={key}>
          {/* 줄기 */}
          <line x1={e.x} y1={e.y} x2={e.x} y2={e.y + s * 1.5} stroke="#2E8B57" strokeWidth={2} />
          {/* 잎 */}
          <ellipse cx={e.x + s * 0.4} cy={e.y + s * 1.0} rx={s * 0.3} ry={s * 0.15} fill="#3CB371" transform={`rotate(-30 ${e.x + s * 0.4} ${e.y + s * 1.0})`} />
          {/* 꽃잎 */}
          {Array.from({ length: petalCount }).map((_, i) => {
            const angle = (i * 360) / petalCount - 90
            const px = e.x + Math.cos((angle * Math.PI) / 180) * pr
            const py = e.y + Math.sin((angle * Math.PI) / 180) * pr
            return <ellipse key={i} cx={px} cy={py} rx={s * 0.35} ry={s * 0.2} fill={c} transform={`rotate(${angle} ${px} ${py})`} />
          })}
          {/* 중심 */}
          <circle cx={e.x} cy={e.y} r={s * 0.2} fill="#FFD700" />
        </g>
      )
    }

    case 'house':
      return (
        <g key={key}>
          {/* 벽 */}
          <rect x={e.x - s} y={e.y - s * 0.8} width={s * 2} height={s * 1.4} rx={3} fill={c} />
          {/* 지붕 */}
          <polygon points={`${e.x - s * 1.3},${e.y - s * 0.8} ${e.x},${e.y - s * 1.8} ${e.x + s * 1.3},${e.y - s * 0.8}`} fill={c2 ?? pick(COLORS.roof)} />
          {/* 문 */}
          <rect x={e.x - s * 0.25} y={e.y - s * 0.1} width={s * 0.5} height={s * 0.7} rx={s * 0.25} fill="#5C4033" />
          <circle cx={e.x + s * 0.1} cy={e.y + s * 0.2} r={2} fill="#FFD700" />
          {/* 창문 */}
          <rect x={e.x - s * 0.8} y={e.y - s * 0.55} width={s * 0.4} height={s * 0.35} rx={2} fill="#87CEEB" stroke="#FFF" strokeWidth={1.5} />
          <rect x={e.x + s * 0.4} y={e.y - s * 0.55} width={s * 0.4} height={s * 0.35} rx={2} fill="#87CEEB" stroke="#FFF" strokeWidth={1.5} />
        </g>
      )

    case 'mountain':
      return (
        <g key={key}>
          <polygon points={`${e.x - s * 1.5},${e.y + s} ${e.x},${e.y - s} ${e.x + s * 1.5},${e.y + s}`} fill={c} />
          {/* 눈 덮인 봉우리 */}
          <polygon points={`${e.x - s * 0.35},${e.y - s * 0.5} ${e.x},${e.y - s} ${e.x + s * 0.35},${e.y - s * 0.5}`} fill="#FFF" opacity={0.8} />
        </g>
      )

    case 'bird': {
      return (
        <g key={key}>
          <path d={`M${e.x - s * 0.6},${e.y + s * 0.2} Q${e.x - s * 0.3},${e.y - s * 0.4} ${e.x},${e.y}`} stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d={`M${e.x},${e.y} Q${e.x + s * 0.3},${e.y - s * 0.4} ${e.x + s * 0.6},${e.y + s * 0.2}`} stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      )
    }

    case 'bush':
      return (
        <g key={key}>
          <ellipse cx={e.x} cy={e.y} rx={s} ry={s * 0.6} fill={c} />
          <ellipse cx={e.x - s * 0.5} cy={e.y - s * 0.1} rx={s * 0.6} ry={s * 0.45} fill={c} />
          <ellipse cx={e.x + s * 0.5} cy={e.y - s * 0.1} rx={s * 0.6} ry={s * 0.45} fill={c} />
        </g>
      )

    case 'fence': {
      const posts = 4
      return (
        <g key={key}>
          {/* 가로바 */}
          <rect x={e.x - s} y={e.y - s * 0.3} width={s * 2} height={s * 0.12} fill={c} rx={1} />
          <rect x={e.x - s} y={e.y + s * 0.15} width={s * 2} height={s * 0.12} fill={c} rx={1} />
          {/* 기둥 */}
          {Array.from({ length: posts }).map((_, i) => {
            const px = e.x - s + (i * s * 2) / (posts - 1)
            return <rect key={i} x={px - s * 0.06} y={e.y - s * 0.5} width={s * 0.12} height={s * 0.9} fill={c} rx={1} />
          })}
        </g>
      )
    }

    case 'butterfly':
      return (
        <g key={key}>
          {/* 왼쪽 날개 */}
          <ellipse cx={e.x - s * 0.35} cy={e.y - s * 0.15} rx={s * 0.4} ry={s * 0.55} fill={c} opacity={0.8} transform={`rotate(-15 ${e.x - s * 0.35} ${e.y - s * 0.15})`} />
          <ellipse cx={e.x - s * 0.25} cy={e.y + s * 0.25} rx={s * 0.3} ry={s * 0.35} fill={c} opacity={0.7} transform={`rotate(15 ${e.x - s * 0.25} ${e.y + s * 0.25})`} />
          {/* 오른쪽 날개 */}
          <ellipse cx={e.x + s * 0.35} cy={e.y - s * 0.15} rx={s * 0.4} ry={s * 0.55} fill={c} opacity={0.8} transform={`rotate(15 ${e.x + s * 0.35} ${e.y - s * 0.15})`} />
          <ellipse cx={e.x + s * 0.25} cy={e.y + s * 0.25} rx={s * 0.3} ry={s * 0.35} fill={c} opacity={0.7} transform={`rotate(-15 ${e.x + s * 0.25} ${e.y + s * 0.25})`} />
          {/* 몸 */}
          <ellipse cx={e.x} cy={e.y} rx={s * 0.07} ry={s * 0.35} fill="#333" />
          {/* 더듬이 */}
          <line x1={e.x} y1={e.y - s * 0.3} x2={e.x - s * 0.2} y2={e.y - s * 0.6} stroke="#333" strokeWidth={1} />
          <line x1={e.x} y1={e.y - s * 0.3} x2={e.x + s * 0.2} y2={e.y - s * 0.6} stroke="#333" strokeWidth={1} />
          <circle cx={e.x - s * 0.2} cy={e.y - s * 0.6} r={1.5} fill="#333" />
          <circle cx={e.x + s * 0.2} cy={e.y - s * 0.6} r={1.5} fill="#333" />
        </g>
      )

    case 'pond':
      return (
        <g key={key}>
          <ellipse cx={e.x} cy={e.y} rx={s * 1.2} ry={s * 0.6} fill={c} opacity={0.7} />
          <ellipse cx={e.x + s * 0.2} cy={e.y - s * 0.1} rx={s * 0.5} ry={s * 0.2} fill="#FFF" opacity={0.2} />
        </g>
      )

    default:
      return null
  }
}

/* ── 장면 생성 ── */
const W = 360
const H = 280

function generateScene(round: number): Level {
  const bgColor = pick(COLORS.sky)
  const groundColor = pick(COLORS.ground)
  const elems: SceneElem[] = []
  let idCounter = 0
  const id = () => `e${idCounter++}`

  // 해 (항상)
  elems.push({
    id: id(), type: 'sun',
    x: randInt(40, 80), y: randInt(30, 55), size: randInt(18, 25),
    color: pick(COLORS.sun),
  })

  // 구름 1~3개
  const cloudCount = randInt(1, 3)
  for (let i = 0; i < cloudCount; i++) {
    elems.push({
      id: id(), type: 'cloud',
      x: randInt(80 + i * 100, 140 + i * 100), y: randInt(25, 65), size: randInt(14, 22),
      color: pick(COLORS.cloud),
    })
  }

  // 산 0~2개
  if (Math.random() > 0.4) {
    const mCount = randInt(1, 2)
    for (let i = 0; i < mCount; i++) {
      elems.push({
        id: id(), type: 'mountain',
        x: randInt(60 + i * 140, 160 + i * 140), y: randInt(130, 155), size: randInt(40, 60),
        color: pick(['#6B8E23', '#808080', '#696969', '#556B2F']),
      })
    }
  }

  // 집 0~1개
  if (Math.random() > 0.35) {
    elems.push({
      id: id(), type: 'house',
      x: randInt(80, 280), y: randInt(165, 185), size: randInt(22, 30),
      color: pick(COLORS.house), color2: pick(COLORS.roof),
    })
  }

  // 나무 2~4개
  const treeCount = randInt(2, 4)
  for (let i = 0; i < treeCount; i++) {
    elems.push({
      id: id(), type: 'tree',
      x: randInt(25 + i * 80, 70 + i * 80), y: randInt(175, 200), size: randInt(18, 28),
      color: pick(COLORS.tree), color2: pick(COLORS.trunk),
    })
  }

  // 꽃 2~5개
  const flowerCount = randInt(2, 5)
  for (let i = 0; i < flowerCount; i++) {
    elems.push({
      id: id(), type: 'flower',
      x: randInt(20, 340), y: randInt(215, 245), size: randInt(6, 10),
      color: pick(COLORS.flower),
    })
  }

  // 덤불 0~2개
  if (Math.random() > 0.3) {
    const bCount = randInt(1, 2)
    for (let i = 0; i < bCount; i++) {
      elems.push({
        id: id(), type: 'bush',
        x: randInt(30, 330), y: randInt(210, 240), size: randInt(12, 20),
        color: pick(COLORS.tree),
      })
    }
  }

  // 새 0~3마리
  const birdCount = randInt(0, 3)
  for (let i = 0; i < birdCount; i++) {
    elems.push({
      id: id(), type: 'bird',
      x: randInt(100, 320), y: randInt(40, 100), size: randInt(6, 10),
      color: pick(COLORS.bird),
    })
  }

  // 나비 0~2마리
  if (Math.random() > 0.4) {
    const btCount = randInt(1, 2)
    for (let i = 0; i < btCount; i++) {
      elems.push({
        id: id(), type: 'butterfly',
        x: randInt(40, 320), y: randInt(120, 210), size: randInt(8, 14),
        color: pick(COLORS.butterfly),
      })
    }
  }

  // 울타리 0~1
  if (Math.random() > 0.5) {
    elems.push({
      id: id(), type: 'fence',
      x: randInt(100, 260), y: randInt(200, 225), size: randInt(25, 40),
      color: pick(COLORS.fence),
    })
  }

  // 연못 0~1
  if (Math.random() > 0.6) {
    elems.push({
      id: id(), type: 'pond',
      x: randInt(100, 260), y: randInt(225, 250), size: randInt(18, 28),
      color: pick(COLORS.water),
    })
  }

  // ── 차이점 생성 ──
  const diffCount = Math.min(3 + Math.floor(round / 3), 5) // 3~5개
  const candidates = elems.filter(
    (e) => e.type !== 'sun' || elems.filter((x) => x.type === 'sun').length > 1,
  )
  const chosen = shuffle(candidates).slice(0, diffCount)

  const diffs: Diff[] = chosen.map((elem) => {
    // missing 은 작은 요소만
    const canMissing = ['flower', 'bird', 'butterfly', 'bush', 'cloud'].includes(elem.type)
    const kinds: Diff['kind'][] = ['color']
    if (canMissing) kinds.push('missing')
    if (!['bird', 'fence'].includes(elem.type)) kinds.push('size')
    const kind = pick(kinds)

    const d: Diff = {
      elemId: elem.id,
      kind,
      cx: elem.x,
      cy: elem.y,
      r: Math.max(elem.size * 1.2, 20),
    }

    if (kind === 'color') {
      // 다른 색 선택
      const colorPool =
        elem.type === 'flower' ? COLORS.flower
          : elem.type === 'tree' ? COLORS.tree
            : elem.type === 'house' ? COLORS.house
              : elem.type === 'cloud' ? ['#FFE4E1', '#E6E6FA', '#FFDAB9']
                : elem.type === 'butterfly' ? COLORS.butterfly
                  : elem.type === 'bush' ? COLORS.tree
                    : elem.type === 'mountain' ? ['#808080', '#A0522D', '#6B8E23']
                      : COLORS.flower
      let alt = pick(colorPool)
      let tries = 0
      while (alt === elem.color && tries < 10) { alt = pick(colorPool); tries++ }
      d.altColor = alt
    } else if (kind === 'size') {
      d.altSize = elem.size * (Math.random() > 0.5 ? 0.5 : 1.6)
    }

    return d
  })

  return { elems, diffs, bgColor, groundColor }
}

/* ── 장면 SVG 컴포넌트 ── */
function SceneSVG({
  level,
  isRight,
  found,
  onTap,
}: {
  level: Level
  isRight: boolean
  found: Set<string>
  onTap?: (elemId: string) => void
}) {
  const { elems, diffs, bgColor, groundColor } = level
  const diffMap = useMemo(() => new Map(diffs.map((d) => [d.elemId, d])), [diffs])

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-2xl shadow-md border-2 border-white"
      style={{ maxHeight: '38vh' }}
      onClick={(e) => {
        if (!isRight || !onTap) return
        const svg = e.currentTarget
        const rect = svg.getBoundingClientRect()
        const scaleX = W / rect.width
        const scaleY = H / rect.height
        const cx = (e.clientX - rect.left) * scaleX
        const cy = (e.clientY - rect.top) * scaleY

        // 가장 가까운 diff 찾기
        for (const d of diffs) {
          if (found.has(d.elemId)) continue
          const dist = Math.sqrt((cx - d.cx) ** 2 + (cy - d.cy) ** 2)
          if (dist < d.r * 1.3) {
            onTap(d.elemId)
            return
          }
        }
        onTap('__miss__')
      }}
    >
      {/* 하늘 */}
      <rect x={0} y={0} width={W} height={H} fill={bgColor} />
      {/* 땅 */}
      <ellipse cx={W / 2} cy={H + 30} rx={W * 0.75} ry={H * 0.45} fill={groundColor} />

      {/* 요소 렌더링 */}
      {elems.map((elem) => {
        const diff = isRight ? diffMap.get(elem.id) : undefined
        const isFound = found.has(elem.id)

        let overrideColor: string | undefined
        let overrideSize: number | undefined
        let hidden = false

        if (diff && !isFound) {
          if (diff.kind === 'color') overrideColor = diff.altColor
          else if (diff.kind === 'missing') hidden = true
          else if (diff.kind === 'size') overrideSize = diff.altSize
        }

        return renderElem(elem, overrideColor, overrideSize, hidden)
      })}

      {/* 찾은 차이점 표시 (양쪽 모두) */}
      {diffs.map((d) =>
        found.has(d.elemId) ? (
          <g key={`found-${d.elemId}`}>
            <circle cx={d.cx} cy={d.cy} r={d.r} fill="none" stroke="#22c55e" strokeWidth={3} strokeDasharray="6 3">
              <animate attributeName="r" from={d.r * 0.8} to={d.r * 1.1} dur="0.6s" repeatCount="1" fill="freeze" />
            </circle>
            <text x={d.cx} y={d.cy + 4} textAnchor="middle" fontSize={14} fill="#22c55e" fontWeight="bold">✓</text>
          </g>
        ) : null,
      )}
    </svg>
  )
}

/* ── 메인 컴포넌트 ── */
export default function SpotDiff() {
  useGameTimer()
  const { soundEnabled } = useSettingsStore()
  const [round, setRound] = useState(0)
  const [level, setLevel] = useState(() => generateScene(0))
  const [score, setScore] = useState(0)
  const [found, setFound] = useState<Set<string>>(new Set())
  const [wrongFlash, setWrongFlash] = useState(false)
  const [cleared, setCleared] = useState(false)

  const totalDiffs = level.diffs.length

  const next = useCallback(() => {
    const nr = round + 1
    setRound(nr)
    setLevel(generateScene(nr))
    setFound(new Set())
    setCleared(false)
  }, [round])

  const handleTap = useCallback(
    (elemId: string) => {
      if (cleared) return

      if (elemId === '__miss__') {
        if (soundEnabled) playWrong()
        setWrongFlash(true)
        setTimeout(() => setWrongFlash(false), 400)
        setScore((s) => Math.max(0, s - 2))
        return
      }

      if (found.has(elemId)) return

      if (soundEnabled) playCorrect()
      const next = new Set(found)
      next.add(elemId)
      setFound(next)
      setScore((s) => s + 10)

      if (next.size === totalDiffs) {
        // 보너스
        setScore((s) => s + 20)
        setCleared(true)
      }
    },
    [cleared, found, totalDiffs, soundEnabled],
  )

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-indigo-50 to-violet-50 p-3">
      <header className="flex items-center justify-between mb-2">
        <Link to="/game" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} /> 게임
        </Link>
        <h2 className="text-lg font-bold text-gray-700">🔍 틀린그림찾기</h2>
        <span className="text-lg font-bold text-orange-500">⭐{score}</span>
      </header>

      {/* 진행 표시 */}
      <div className="text-center mb-2">
        <p className="text-sm text-gray-500">
          라운드 {round + 1} · 틀린곳{' '}
          <span className="font-bold text-indigo-600">{found.size}</span>/{totalDiffs}
        </p>
        <div className="flex justify-center gap-1 mt-1">
          {level.diffs.map((d, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                found.has(d.elemId) ? 'bg-green-400 border-green-500 scale-110' : 'bg-white border-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 두 그림 */}
      <main className="flex-1 flex flex-col gap-2 items-center justify-center">
        <div className="w-full max-w-md">
          <p className="text-xs text-center text-gray-400 mb-1">▼ 원본</p>
          <SceneSVG level={level} isRight={false} found={found} />
        </div>
        <div className={`w-full max-w-md transition-all ${wrongFlash ? 'ring-4 ring-red-400 rounded-2xl' : ''}`}>
          <p className="text-xs text-center text-gray-400 mb-1">▼ 다른 그림을 찾아 터치!</p>
          <SceneSVG level={level} isRight={true} found={found} onTap={handleTap} />
        </div>
      </main>

      {/* 클리어 */}
      <AnimatePresence>
        {cleared && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          >
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xl font-bold text-green-600 mb-1">모두 찾았어요!</p>
              <p className="text-gray-500 mb-4">+20 보너스 포함 ⭐{score}</p>
              <button
                onClick={next}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-lg transition-colors"
              >
                다음 라운드 →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
