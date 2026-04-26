import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCorrect, playWrong } from '@/lib/audio'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameTimer } from '@/hooks/useGameTimer'
import { randInt, shuffle } from '@/lib/random'

/* ================================================================
   SVG 테마별 틀린그림찾기
   테마: 숲, 바다, 우주, 도시, 농장, 수중
================================================================ */

const W = 360
const H = 280
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)]

/* ── 요소 타입 ── */
type ElemType =
  | 'sun' | 'moon' | 'cloud' | 'star'
  | 'tree' | 'palmTree' | 'cactus'
  | 'flower' | 'mushroom' | 'bush'
  | 'house' | 'building' | 'barn'
  | 'mountain' | 'bird' | 'fence' | 'butterfly'
  | 'pond' | 'boat' | 'wave' | 'fish' | 'crab' | 'shell' | 'umbrella' | 'sandcastle'
  | 'planet' | 'rocket' | 'ufo' | 'comet'
  | 'car' | 'streetlamp' | 'trafficLight'
  | 'cow' | 'chicken' | 'pig' | 'windmill' | 'haystack'
  | 'seaweed' | 'jellyfish' | 'octopus' | 'coral' | 'turtle' | 'bubbles'

interface SceneElem {
  id: string
  type: ElemType
  x: number; y: number; size: number
  color: string; color2?: string
}

interface Diff {
  elemId: string
  kind: 'color' | 'missing' | 'size'
  altColor?: string; altSize?: number
  cx: number; cy: number; r: number
}

interface Level {
  elems: SceneElem[]
  diffs: Diff[]
  bgColor: string
  groundColor: string
  theme: Theme
  groundY: number
}

type Theme = 'forest' | 'ocean' | 'space' | 'city' | 'farm' | 'underwater'

const THEME_NAMES: Record<Theme, string> = {
  forest: '🌲 숲',
  ocean: '🏖️ 바다',
  space: '🚀 우주',
  city: '🏙️ 도시',
  farm: '🐄 농장',
  underwater: '🐠 바닷속',
}

const THEMES: Theme[] = ['forest', 'ocean', 'space', 'city', 'farm', 'underwater']

/* ── SVG 요소 렌더러 ── */
function renderElem(e: SceneElem, oc?: string, os?: number, hidden?: boolean) {
  if (hidden) return null
  const c = oc ?? e.color
  const c2 = e.color2
  const s = os ?? e.size
  const k = e.id

  switch (e.type) {
    /* ── 공통 ── */
    case 'sun':
      return <g key={k}>
        {[0,45,90,135,180,225,270,315].map(a =>
          <line key={a} x1={e.x} y1={e.y} x2={e.x+Math.cos(a*Math.PI/180)*s*1.6} y2={e.y+Math.sin(a*Math.PI/180)*s*1.6} stroke={c} strokeWidth={2} strokeLinecap="round" opacity={0.5}/>
        )}
        <circle cx={e.x} cy={e.y} r={s} fill={c}/><circle cx={e.x-s*0.2} cy={e.y-s*0.15} r={s*0.15} fill="#FFF" opacity={0.5}/>
      </g>
    case 'moon':
      return <g key={k}>
        <circle cx={e.x} cy={e.y} r={s} fill={c}/>
        <circle cx={e.x+s*0.3} cy={e.y-s*0.2} r={s*0.8} fill={c2 ?? '#0B1D3A'}/>
      </g>
    case 'cloud':
      return <g key={k} opacity={0.85}>
        <ellipse cx={e.x} cy={e.y} rx={s*1.4} ry={s*0.7} fill={c}/>
        <ellipse cx={e.x-s*0.7} cy={e.y+s*0.1} rx={s*0.9} ry={s*0.55} fill={c}/>
        <ellipse cx={e.x+s*0.7} cy={e.y+s*0.1} rx={s*0.9} ry={s*0.55} fill={c}/>
        <ellipse cx={e.x-s*0.3} cy={e.y-s*0.3} rx={s*0.6} ry={s*0.5} fill={c}/>
      </g>
    case 'star':
      return <g key={k}><polygon points={starPoints(e.x,e.y,s,s*0.4,5)} fill={c}/></g>
    case 'bird':
      return <g key={k}>
        <path d={`M${e.x-s*0.6},${e.y+s*0.2}Q${e.x-s*0.3},${e.y-s*0.4} ${e.x},${e.y}`} stroke={c} strokeWidth={2} fill="none" strokeLinecap="round"/>
        <path d={`M${e.x},${e.y}Q${e.x+s*0.3},${e.y-s*0.4} ${e.x+s*0.6},${e.y+s*0.2}`} stroke={c} strokeWidth={2} fill="none" strokeLinecap="round"/>
      </g>
    case 'butterfly':
      return <g key={k}>
        <ellipse cx={e.x-s*0.35} cy={e.y-s*0.1} rx={s*0.4} ry={s*0.5} fill={c} opacity={0.8} transform={`rotate(-15 ${e.x-s*0.35} ${e.y-s*0.1})`}/>
        <ellipse cx={e.x+s*0.35} cy={e.y-s*0.1} rx={s*0.4} ry={s*0.5} fill={c} opacity={0.8} transform={`rotate(15 ${e.x+s*0.35} ${e.y-s*0.1})`}/>
        <ellipse cx={e.x} cy={e.y} rx={s*0.06} ry={s*0.3} fill="#333"/>
      </g>
    case 'mountain':
      return <g key={k}>
        <polygon points={`${e.x-s*1.5},${e.y+s} ${e.x},${e.y-s} ${e.x+s*1.5},${e.y+s}`} fill={c}/>
        <polygon points={`${e.x-s*0.3},${e.y-s*0.5} ${e.x},${e.y-s} ${e.x+s*0.3},${e.y-s*0.5}`} fill="#FFF" opacity={0.7}/>
      </g>

    /* ── 나무류 ── */
    case 'tree':
      return <g key={k}>
        <rect x={e.x-s*0.15} y={e.y-s*0.2} width={s*0.3} height={s*1.2} rx={3} fill={c2??'#8B4513'}/>
        <circle cx={e.x} cy={e.y-s*0.7} r={s*0.7} fill={c}/>
        <circle cx={e.x-s*0.4} cy={e.y-s*0.4} r={s*0.5} fill={c}/>
        <circle cx={e.x+s*0.4} cy={e.y-s*0.4} r={s*0.5} fill={c}/>
      </g>
    case 'palmTree':
      return <g key={k}>
        <path d={`M${e.x},${e.y+s*1.2} Q${e.x+s*0.3},${e.y+s*0.3} ${e.x+s*0.1},${e.y-s*0.5}`} stroke={c2??'#8B6914'} strokeWidth={s*0.25} fill="none" strokeLinecap="round"/>
        {[-50,-20,10,40,70].map((a,i) =>
          <ellipse key={i} cx={e.x+s*0.1+Math.cos(a*Math.PI/180)*s*0.8} cy={e.y-s*0.5+Math.sin(a*Math.PI/180)*s*0.6} rx={s*0.7} ry={s*0.15} fill={c} transform={`rotate(${a} ${e.x+s*0.1+Math.cos(a*Math.PI/180)*s*0.8} ${e.y-s*0.5+Math.sin(a*Math.PI/180)*s*0.6})`}/>
        )}
        <circle cx={e.x+s*0.05} cy={e.y-s*0.35} r={s*0.12} fill="#8B4513"/>
        <circle cx={e.x+s*0.2} cy={e.y-s*0.4} r={s*0.1} fill="#8B4513"/>
      </g>
    case 'cactus':
      return <g key={k}>
        <rect x={e.x-s*0.2} y={e.y-s*0.8} width={s*0.4} height={s*1.6} rx={s*0.2} fill={c}/>
        <rect x={e.x-s*0.6} y={e.y-s*0.3} width={s*0.5} height={s*0.2} rx={s*0.1} fill={c}/>
        <rect x={e.x-s*0.6} y={e.y-s*0.3} width={s*0.2} height={s*-0.5} rx={s*0.1} fill={c}/>
        <rect x={e.x+s*0.2} y={e.y-s*0.5} width={s*0.5} height={s*0.2} rx={s*0.1} fill={c}/>
        <rect x={e.x+s*0.5} y={e.y-s*0.5} width={s*0.2} height={s*-0.4} rx={s*0.1} fill={c}/>
        <circle cx={e.x} cy={e.y-s*0.85} r={s*0.15} fill="#FF6B8A"/>
      </g>

    /* ── 식물 ── */
    case 'flower': {
      const pr = s*0.45
      return <g key={k}>
        <line x1={e.x} y1={e.y} x2={e.x} y2={e.y+s*1.5} stroke="#2E8B57" strokeWidth={2}/>
        {Array.from({length:5}).map((_,i) => {
          const a=(i*72)-90; const px=e.x+Math.cos(a*Math.PI/180)*pr; const py=e.y+Math.sin(a*Math.PI/180)*pr
          return <ellipse key={i} cx={px} cy={py} rx={s*0.35} ry={s*0.2} fill={c} transform={`rotate(${a} ${px} ${py})`}/>
        })}
        <circle cx={e.x} cy={e.y} r={s*0.2} fill="#FFD700"/>
      </g>
    }
    case 'mushroom':
      return <g key={k}>
        <rect x={e.x-s*0.15} y={e.y} width={s*0.3} height={s*0.6} fill="#F5DEB3"/>
        <ellipse cx={e.x} cy={e.y} rx={s*0.55} ry={s*0.35} fill={c}/>
        <circle cx={e.x-s*0.15} cy={e.y-s*0.1} r={s*0.1} fill="#FFF" opacity={0.7}/>
        <circle cx={e.x+s*0.2} cy={e.y+s*0.05} r={s*0.07} fill="#FFF" opacity={0.7}/>
      </g>
    case 'bush':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s} ry={s*0.6} fill={c}/>
        <ellipse cx={e.x-s*0.5} cy={e.y-s*0.1} rx={s*0.6} ry={s*0.45} fill={c}/>
        <ellipse cx={e.x+s*0.5} cy={e.y-s*0.1} rx={s*0.6} ry={s*0.45} fill={c}/>
      </g>

    /* ── 건물 ── */
    case 'house':
      return <g key={k}>
        <rect x={e.x-s} y={e.y-s*0.8} width={s*2} height={s*1.4} rx={3} fill={c}/>
        <polygon points={`${e.x-s*1.3},${e.y-s*0.8} ${e.x},${e.y-s*1.8} ${e.x+s*1.3},${e.y-s*0.8}`} fill={c2??'#B22222'}/>
        <rect x={e.x-s*0.2} y={e.y-s*0.1} width={s*0.4} height={s*0.7} rx={s*0.2} fill="#5C4033"/>
        <rect x={e.x-s*0.7} y={e.y-s*0.55} width={s*0.35} height={s*0.3} rx={2} fill="#87CEEB" stroke="#FFF" strokeWidth={1.5}/>
        <rect x={e.x+s*0.35} y={e.y-s*0.55} width={s*0.35} height={s*0.3} rx={2} fill="#87CEEB" stroke="#FFF" strokeWidth={1.5}/>
      </g>
    case 'building':
      return <g key={k}>
        <rect x={e.x-s*0.7} y={e.y-s*2} width={s*1.4} height={s*2.5} rx={2} fill={c}/>
        {Array.from({length:4}).map((_,row) =>
          Array.from({length:2}).map((_,col) =>
            <rect key={`${row}-${col}`} x={e.x-s*0.45+col*s*0.6} y={e.y-s*1.8+row*s*0.5} width={s*0.3} height={s*0.25} rx={1} fill={pick(['#FFD700','#87CEEB','#333'])} opacity={0.8}/>
          )
        )}
      </g>
    case 'barn':
      return <g key={k}>
        <rect x={e.x-s} y={e.y-s*0.6} width={s*2} height={s*1.2} fill={c}/>
        <polygon points={`${e.x-s*1.1},${e.y-s*0.6} ${e.x},${e.y-s*1.5} ${e.x+s*1.1},${e.y-s*0.6}`} fill={c}/>
        <line x1={e.x} y1={e.y-s*1.5} x2={e.x} y2={e.y+s*0.6} stroke="#FFF" strokeWidth={2} opacity={0.4}/>
        <rect x={e.x-s*0.3} y={e.y-s*0.1} width={s*0.6} height={s*0.7} rx={s*0.3} fill="#5C4033"/>
      </g>

    /* ── 울타리/연못 ── */
    case 'fence':
      return <g key={k}>
        <rect x={e.x-s} y={e.y-s*0.3} width={s*2} height={s*0.12} fill={c} rx={1}/>
        <rect x={e.x-s} y={e.y+s*0.15} width={s*2} height={s*0.12} fill={c} rx={1}/>
        {Array.from({length:4}).map((_,i) => {
          const px=e.x-s+(i*s*2)/3
          return <rect key={i} x={px-s*0.06} y={e.y-s*0.5} width={s*0.12} height={s*0.9} fill={c} rx={1}/>
        })}
      </g>
    case 'pond':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*1.2} ry={s*0.6} fill={c} opacity={0.7}/>
        <ellipse cx={e.x+s*0.2} cy={e.y-s*0.1} rx={s*0.4} ry={s*0.15} fill="#FFF" opacity={0.2}/>
      </g>

    /* ── 바다 테마 ── */
    case 'wave':
      return <g key={k} opacity={0.5}>
        <path d={`M${e.x-s},${e.y} Q${e.x-s*0.5},${e.y-s*0.5} ${e.x},${e.y} Q${e.x+s*0.5},${e.y+s*0.5} ${e.x+s},${e.y}`} stroke={c} strokeWidth={2.5} fill="none" strokeLinecap="round"/>
      </g>
    case 'boat':
      return <g key={k}>
        <path d={`M${e.x-s},${e.y} L${e.x-s*0.7},${e.y+s*0.6} L${e.x+s*0.7},${e.y+s*0.6} L${e.x+s},${e.y} Z`} fill={c}/>
        <line x1={e.x} y1={e.y+s*0.3} x2={e.x} y2={e.y-s} stroke="#8B4513" strokeWidth={2}/>
        <polygon points={`${e.x},${e.y-s} ${e.x},${e.y+s*0.2} ${e.x+s*0.6},${e.y+s*0.1}`} fill={c2??'#FFF'} opacity={0.9}/>
      </g>
    case 'fish':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.6} ry={s*0.3} fill={c}/>
        <polygon points={`${e.x+s*0.5},${e.y} ${e.x+s*0.9},${e.y-s*0.3} ${e.x+s*0.9},${e.y+s*0.3}`} fill={c}/>
        <circle cx={e.x-s*0.25} cy={e.y-s*0.05} r={s*0.08} fill="#FFF"/>
        <circle cx={e.x-s*0.25} cy={e.y-s*0.05} r={s*0.04} fill="#000"/>
      </g>
    case 'crab':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.5} ry={s*0.35} fill={c}/>
        <circle cx={e.x-s*0.25} cy={e.y-s*0.1} r={s*0.06} fill="#000"/>
        <circle cx={e.x+s*0.25} cy={e.y-s*0.1} r={s*0.06} fill="#000"/>
        {[-1,1].map(d => [0.2,0.4,0.6].map((off,i) =>
          <line key={`${d}-${i}`} x1={e.x+d*s*0.4} y1={e.y+s*off*0.5} x2={e.x+d*s*0.8} y2={e.y+s*(off*0.5+0.15)} stroke={c} strokeWidth={2} strokeLinecap="round"/>
        ))}
        <circle cx={e.x-s*0.7} cy={e.y-s*0.2} r={s*0.15} fill={c}/>
        <circle cx={e.x+s*0.7} cy={e.y-s*0.2} r={s*0.15} fill={c}/>
      </g>
    case 'shell':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.5} ry={s*0.4} fill={c}/>
        {[0,1,2].map(i =>
          <path key={i} d={`M${e.x},${e.y+s*0.3} Q${e.x+s*(i*0.15-0.15)},${e.y-s*0.1} ${e.x+s*(i*0.2-0.2)},${e.y-s*0.35}`} stroke="#FFF" strokeWidth={1} fill="none" opacity={0.4}/>
        )}
      </g>
    case 'umbrella':
      return <g key={k}>
        <line x1={e.x} y1={e.y-s*0.8} x2={e.x} y2={e.y+s*0.8} stroke="#8B4513" strokeWidth={2.5}/>
        <path d={`M${e.x-s},${e.y-s*0.5} Q${e.x-s*0.5},${e.y-s*1.5} ${e.x},${e.y-s*0.8} Q${e.x+s*0.5},${e.y-s*1.5} ${e.x+s},${e.y-s*0.5}`} fill={c}/>
      </g>
    case 'sandcastle':
      return <g key={k}>
        <rect x={e.x-s*0.8} y={e.y-s*0.3} width={s*1.6} height={s*0.7} fill={c} rx={2}/>
        <rect x={e.x-s*0.6} y={e.y-s*0.7} width={s*0.35} height={s*0.5} fill={c}/>
        <rect x={e.x+s*0.25} y={e.y-s*0.7} width={s*0.35} height={s*0.5} fill={c}/>
        <rect x={e.x-s*0.15} y={e.y-s*1} width={s*0.3} height={s*0.8} fill={c}/>
        <line x1={e.x} y1={e.y-s*1} x2={e.x} y2={e.y-s*1.3} stroke="#8B4513" strokeWidth={1.5}/>
        <polygon points={`${e.x},${e.y-s*1.3} ${e.x+s*0.25},${e.y-s*1.15} ${e.x},${e.y-s*1}`} fill="#FF4500"/>
      </g>

    /* ── 우주 테마 ── */
    case 'planet':
      return <g key={k}>
        <circle cx={e.x} cy={e.y} r={s} fill={c}/>
        <ellipse cx={e.x} cy={e.y} rx={s*1.6} ry={s*0.3} fill="none" stroke={c2??'#DDD'} strokeWidth={2.5} opacity={0.6}/>
        <circle cx={e.x-s*0.2} cy={e.y-s*0.3} r={s*0.2} fill="#FFF" opacity={0.15}/>
      </g>
    case 'rocket':
      return <g key={k}>
        <rect x={e.x-s*0.25} y={e.y-s*0.6} width={s*0.5} height={s*1.2} rx={s*0.25} fill={c}/>
        <polygon points={`${e.x-s*0.25},${e.y-s*0.6} ${e.x},${e.y-s*1.2} ${e.x+s*0.25},${e.y-s*0.6}`} fill={c2??'#FF4500'}/>
        <polygon points={`${e.x-s*0.25},${e.y+s*0.4} ${e.x-s*0.55},${e.y+s*0.7} ${e.x-s*0.25},${e.y+s*0.1}`} fill={c2??'#FF4500'}/>
        <polygon points={`${e.x+s*0.25},${e.y+s*0.4} ${e.x+s*0.55},${e.y+s*0.7} ${e.x+s*0.25},${e.y+s*0.1}`} fill={c2??'#FF4500'}/>
        <circle cx={e.x} cy={e.y-s*0.15} r={s*0.15} fill="#87CEEB"/>
        <ellipse cx={e.x} cy={e.y+s*0.8} rx={s*0.15} ry={s*0.3} fill="#FFA500" opacity={0.8}/>
        <ellipse cx={e.x} cy={e.y+s*0.7} rx={s*0.08} ry={s*0.2} fill="#FFD700"/>
      </g>
    case 'ufo':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*1.2} ry={s*0.3} fill={c} opacity={0.8}/>
        <ellipse cx={e.x} cy={e.y-s*0.15} rx={s*0.6} ry={s*0.45} fill={c2??'#C0C0C0'}/>
        <circle cx={e.x} cy={e.y-s*0.2} r={s*0.15} fill="#87CEEB" opacity={0.7}/>
        {[-0.6,0,0.6].map((off,i) =>
          <circle key={i} cx={e.x+s*off} cy={e.y+s*0.1} r={s*0.08} fill="#FFD700" opacity={0.7}/>
        )}
      </g>
    case 'comet':
      return <g key={k}>
        <circle cx={e.x} cy={e.y} r={s*0.3} fill={c}/>
        <path d={`M${e.x+s*0.2},${e.y} Q${e.x+s},${e.y+s*0.1} ${e.x+s*2},${e.y+s*0.3}`} stroke={c} strokeWidth={s*0.15} fill="none" opacity={0.4} strokeLinecap="round"/>
      </g>

    /* ── 도시 테마 ── */
    case 'car':
      return <g key={k}>
        <rect x={e.x-s*0.8} y={e.y-s*0.2} width={s*1.6} height={s*0.5} rx={3} fill={c}/>
        <rect x={e.x-s*0.5} y={e.y-s*0.55} width={s*1} height={s*0.4} rx={s*0.1} fill={c} opacity={0.85}/>
        <rect x={e.x-s*0.35} y={e.y-s*0.5} width={s*0.3} height={s*0.3} fill="#B0E0E6" rx={1}/>
        <rect x={e.x+s*0.05} y={e.y-s*0.5} width={s*0.3} height={s*0.3} fill="#B0E0E6" rx={1}/>
        <circle cx={e.x-s*0.45} cy={e.y+s*0.3} r={s*0.18} fill="#333"/>
        <circle cx={e.x+s*0.45} cy={e.y+s*0.3} r={s*0.18} fill="#333"/>
      </g>
    case 'streetlamp':
      return <g key={k}>
        <rect x={e.x-s*0.06} y={e.y-s*1.5} width={s*0.12} height={s*2} fill="#555"/>
        <circle cx={e.x} cy={e.y-s*1.5} r={s*0.2} fill={c}/>
        <circle cx={e.x} cy={e.y-s*1.5} r={s*0.35} fill={c} opacity={0.2}/>
      </g>
    case 'trafficLight':
      return <g key={k}>
        <rect x={e.x-s*0.05} y={e.y-s*1.2} width={s*0.1} height={s*1.5} fill="#555"/>
        <rect x={e.x-s*0.2} y={e.y-s*1.2} width={s*0.4} height={s*0.8} rx={s*0.1} fill="#333"/>
        <circle cx={e.x} cy={e.y-s*1} r={s*0.1} fill={c === '#22c55e' ? '#22c55e' : '#555'}/>
        <circle cx={e.x} cy={e.y-s*0.75} r={s*0.1} fill={c === '#EAB308' ? '#EAB308' : '#555'}/>
        <circle cx={e.x} cy={e.y-s*0.5} r={s*0.1} fill={c === '#EF4444' ? '#EF4444' : '#555'}/>
      </g>

    /* ── 농장 테마 ── */
    case 'cow':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.7} ry={s*0.45} fill="#FFF"/>
        <circle cx={e.x-s*0.6} cy={e.y-s*0.15} r={s*0.3} fill="#FFF"/>
        <ellipse cx={e.x+s*0.1} cy={e.y-s*0.1} rx={s*0.2} ry={s*0.15} fill={c}/>
        <ellipse cx={e.x-s*0.25} cy={e.y+s*0.1} rx={s*0.15} ry={s*0.1} fill={c}/>
        <circle cx={e.x-s*0.7} cy={e.y-s*0.25} r={s*0.06} fill="#000"/>
        {[-0.4,-0.15,0.15,0.4].map((off,i) =>
          <rect key={i} x={e.x+s*off-s*0.04} y={e.y+s*0.35} width={s*0.08} height={s*0.35} fill="#333"/>
        )}
      </g>
    case 'chicken':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.4} ry={s*0.35} fill={c}/>
        <circle cx={e.x-s*0.3} cy={e.y-s*0.2} r={s*0.2} fill={c}/>
        <polygon points={`${e.x-s*0.45},${e.y-s*0.15} ${e.x-s*0.65},${e.y-s*0.1} ${e.x-s*0.45},${e.y-s*0.05}`} fill="#FFA500"/>
        <circle cx={e.x-s*0.25} cy={e.y-s*0.4} r={s*0.1} fill="#FF0000"/>
        <circle cx={e.x-s*0.35} cy={e.y-s*0.25} r={s*0.04} fill="#000"/>
        <line x1={e.x-s*0.1} y1={e.y+s*0.3} x2={e.x-s*0.15} y2={e.y+s*0.6} stroke="#FFA500" strokeWidth={1.5}/>
        <line x1={e.x+s*0.1} y1={e.y+s*0.3} x2={e.x+s*0.05} y2={e.y+s*0.6} stroke="#FFA500" strokeWidth={1.5}/>
      </g>
    case 'pig':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.55} ry={s*0.45} fill={c}/>
        <ellipse cx={e.x} cy={e.y+s*0.1} rx={s*0.2} ry={s*0.13} fill="#D4869A"/>
        <circle cx={e.x-s*0.07} cy={e.y+s*0.1} r={s*0.04} fill="#B05C73"/>
        <circle cx={e.x+s*0.07} cy={e.y+s*0.1} r={s*0.04} fill="#B05C73"/>
        <circle cx={e.x-s*0.2} cy={e.y-s*0.1} r={s*0.06} fill="#000"/>
        <circle cx={e.x+s*0.2} cy={e.y-s*0.1} r={s*0.06} fill="#000"/>
        <ellipse cx={e.x-s*0.3} cy={e.y-s*0.35} rx={s*0.15} ry={s*0.2} fill={c} transform={`rotate(-20 ${e.x-s*0.3} ${e.y-s*0.35})`}/>
        <ellipse cx={e.x+s*0.3} cy={e.y-s*0.35} rx={s*0.15} ry={s*0.2} fill={c} transform={`rotate(20 ${e.x+s*0.3} ${e.y-s*0.35})`}/>
      </g>
    case 'windmill':
      return <g key={k}>
        <rect x={e.x-s*0.15} y={e.y-s*0.5} width={s*0.3} height={s*1.5} fill="#DEB887"/>
        <polygon points={`${e.x-s*0.3},${e.y+s} ${e.x},${e.y-s*0.5} ${e.x+s*0.3},${e.y+s}`} fill="#DEB887"/>
        {[0,90,180,270].map(a =>
          <rect key={a} x={e.x-s*0.08} y={e.y-s*0.5-s*0.8} width={s*0.16} height={s*0.8} rx={2} fill={c} transform={`rotate(${a} ${e.x} ${e.y-s*0.5})`}/>
        )}
        <circle cx={e.x} cy={e.y-s*0.5} r={s*0.1} fill="#8B4513"/>
      </g>
    case 'haystack':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y+s*0.2} rx={s*0.7} ry={s*0.3} fill={c}/>
        <ellipse cx={e.x} cy={e.y-s*0.1} rx={s*0.55} ry={s*0.35} fill={c}/>
        <ellipse cx={e.x} cy={e.y-s*0.35} rx={s*0.35} ry={s*0.2} fill={c}/>
      </g>

    /* ── 수중 테마 ── */
    case 'seaweed':
      return <g key={k}>
        <path d={`M${e.x},${e.y+s} Q${e.x+s*0.3},${e.y+s*0.5} ${e.x},${e.y} Q${e.x-s*0.3},${e.y-s*0.5} ${e.x},${e.y-s}`} stroke={c} strokeWidth={s*0.2} fill="none" strokeLinecap="round"/>
        <path d={`M${e.x+s*0.2},${e.y+s*0.8} Q${e.x+s*0.5},${e.y+s*0.3} ${e.x+s*0.2},${e.y-s*0.2}`} stroke={c} strokeWidth={s*0.15} fill="none" strokeLinecap="round" opacity={0.7}/>
      </g>
    case 'jellyfish':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.5} ry={s*0.4} fill={c} opacity={0.7}/>
        {[-0.3,-0.1,0.1,0.3].map((off,i) =>
          <path key={i} d={`M${e.x+s*off},${e.y+s*0.3} Q${e.x+s*off+s*0.1},${e.y+s*0.6} ${e.x+s*off},${e.y+s*0.9}`} stroke={c} strokeWidth={1.5} fill="none" opacity={0.5}/>
        )}
      </g>
    case 'octopus':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.5} ry={s*0.45} fill={c}/>
        <circle cx={e.x-s*0.2} cy={e.y-s*0.1} r={s*0.1} fill="#FFF"/>
        <circle cx={e.x+s*0.2} cy={e.y-s*0.1} r={s*0.1} fill="#FFF"/>
        <circle cx={e.x-s*0.2} cy={e.y-s*0.1} r={s*0.05} fill="#000"/>
        <circle cx={e.x+s*0.2} cy={e.y-s*0.1} r={s*0.05} fill="#000"/>
        {[-0.4,-0.25,-0.1,0.05,0.2,0.35].map((off,i) =>
          <path key={i} d={`M${e.x+s*off},${e.y+s*0.35} Q${e.x+s*off+(i%2?0.15:-0.15)*s},${e.y+s*0.7} ${e.x+s*off},${e.y+s*1}`} stroke={c} strokeWidth={s*0.08} fill="none" strokeLinecap="round"/>
        )}
      </g>
    case 'coral':
      return <g key={k}>
        <path d={`M${e.x},${e.y+s*0.5} L${e.x},${e.y} L${e.x-s*0.3},${e.y-s*0.4}`} stroke={c} strokeWidth={s*0.15} fill="none" strokeLinecap="round"/>
        <path d={`M${e.x},${e.y} L${e.x+s*0.35},${e.y-s*0.35}`} stroke={c} strokeWidth={s*0.12} fill="none" strokeLinecap="round"/>
        <path d={`M${e.x},${e.y+s*0.2} L${e.x-s*0.4},${e.y+s*0.05}`} stroke={c} strokeWidth={s*0.1} fill="none" strokeLinecap="round"/>
        <circle cx={e.x-s*0.3} cy={e.y-s*0.4} r={s*0.12} fill={c}/>
        <circle cx={e.x+s*0.35} cy={e.y-s*0.35} r={s*0.1} fill={c}/>
      </g>
    case 'turtle':
      return <g key={k}>
        <ellipse cx={e.x} cy={e.y} rx={s*0.6} ry={s*0.45} fill={c}/>
        <ellipse cx={e.x} cy={e.y} rx={s*0.5} ry={s*0.35} fill={c2??'#2E8B57'}/>
        <circle cx={e.x-s*0.55} cy={e.y} r={s*0.18} fill={c}/>
        <circle cx={e.x-s*0.6} cy={e.y-s*0.05} r={s*0.04} fill="#000"/>
        <ellipse cx={e.x-s*0.3} cy={e.y+s*0.4} rx={s*0.15} ry={s*0.08} fill={c}/>
        <ellipse cx={e.x+s*0.3} cy={e.y+s*0.4} rx={s*0.15} ry={s*0.08} fill={c}/>
        <circle cx={e.x} cy={e.y} r={s*0.12} fill={c} opacity={0.5}/>
      </g>
    case 'bubbles':
      return <g key={k}>
        <circle cx={e.x} cy={e.y} r={s*0.3} fill="none" stroke="#FFF" strokeWidth={1} opacity={0.5}/>
        <circle cx={e.x+s*0.3} cy={e.y-s*0.4} r={s*0.2} fill="none" stroke="#FFF" strokeWidth={1} opacity={0.4}/>
        <circle cx={e.x-s*0.2} cy={e.y-s*0.5} r={s*0.15} fill="none" stroke="#FFF" strokeWidth={1} opacity={0.3}/>
      </g>

    default: return null
  }
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, pts: number) {
  return Array.from({length: pts*2}).map((_, i) => {
    const r = i%2===0 ? outerR : innerR
    const a = (i*Math.PI/pts) - Math.PI/2
    return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`
  }).join(' ')
}

/* ================================================================
   테마별 장면 생성
================================================================ */

function generateScene(round: number): Level {
  const theme = THEMES[round % THEMES.length]
  const elems: SceneElem[] = []
  let idC = 0
  const id = () => `e${idC++}`

  let bgColor: string
  let groundColor: string
  let groundY = 170

  switch (theme) {
    case 'forest': {
      bgColor = pick(['#87CEEB', '#B0E0E6', '#ADD8E6'])
      groundColor = pick(['#90EE90', '#7CCD7C', '#8FBC8F'])
      elems.push({ id: id(), type: 'sun', x: randInt(40,80), y: randInt(25,50), size: randInt(18,24), color: pick(['#FFD700','#FFA500']) })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'cloud', x: randInt(80+i*100,150+i*100), y: randInt(20,60), size: randInt(14,20), color: pick(['#FFF','#F0F0F0']) })
      if (Math.random()>0.4) for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'mountain', x: randInt(50+i*150,180+i*150), y: randInt(125,150), size: randInt(40,60), color: pick(['#6B8E23','#808080','#696969']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'house', x: randInt(100,260), y: randInt(170,190), size: randInt(22,28), color: pick(['#FFD700','#DEB887','#F4A460']), color2: pick(['#B22222','#8B0000','#CD5C5C']) })
      for (let i=0; i<randInt(2,4); i++)
        elems.push({ id: id(), type: 'tree', x: randInt(20+i*80,70+i*80), y: randInt(180,205), size: randInt(18,28), color: pick(['#228B22','#2E8B57','#3CB371']), color2: pick(['#8B4513','#A0522D']) })
      for (let i=0; i<randInt(2,5); i++)
        elems.push({ id: id(), type: 'flower', x: randInt(20,340), y: randInt(220,250), size: randInt(6,10), color: pick(['#FF6B8A','#FFD700','#FF69B4','#DA70D6','#FF4500']) })
      if (Math.random()>0.5) for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'mushroom', x: randInt(30,330), y: randInt(225,250), size: randInt(8,12), color: pick(['#FF4500','#FF6347','#DC143C']) })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'bird', x: randInt(100,300), y: randInt(40,100), size: randInt(6,10), color: '#333' })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'butterfly', x: randInt(50,310), y: randInt(130,200), size: randInt(8,13), color: pick(['#FF69B4','#9370DB','#FFD700','#00CED1']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'bush', x: randInt(40,320), y: randInt(215,240), size: randInt(14,20), color: pick(['#228B22','#2E8B57']) })
      if (Math.random()>0.5) elems.push({ id: id(), type: 'pond', x: randInt(80,280), y: randInt(230,255), size: randInt(18,26), color: pick(['#4169E1','#1E90FF']) })
      break
    }
    case 'ocean': {
      bgColor = pick(['#87CEEB', '#B0E0E6'])
      groundColor = pick(['#F4D790', '#EDC9AF', '#DEB887'])
      groundY = 180
      elems.push({ id: id(), type: 'sun', x: randInt(250,320), y: randInt(30,55), size: randInt(22,28), color: '#FFD700' })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'cloud', x: randInt(40+i*100,120+i*100), y: randInt(20,55), size: randInt(12,18), color: '#FFF' })
      for (let i=0; i<randInt(2,4); i++)
        elems.push({ id: id(), type: 'wave', x: randInt(40+i*70,100+i*70), y: randInt(155,175), size: randInt(25,40), color: pick(['#4169E1','#1E90FF','#6495ED']) })
      if (Math.random()>0.3) elems.push({ id: id(), type: 'boat', x: randInt(80,280), y: randInt(120,150), size: randInt(18,25), color: pick(['#8B4513','#CD853F','#A0522D']), color2: '#FFF' })
      for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'palmTree', x: randInt(20+i*200,100+i*200), y: randInt(180,200), size: randInt(20,28), color: '#228B22', color2: '#8B6914' })
      if (Math.random()>0.3) elems.push({ id: id(), type: 'umbrella', x: randInt(120,240), y: randInt(200,220), size: randInt(16,22), color: pick(['#FF4500','#FF69B4','#4169E1','#FFD700']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'sandcastle', x: randInt(100,260), y: randInt(225,245), size: randInt(12,18), color: '#DEB887' })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'shell', x: randInt(30,330), y: randInt(240,260), size: randInt(6,10), color: pick(['#FFB6C1','#DDA0DD','#FFF0F5','#FFDAB9']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'crab', x: randInt(50,310), y: randInt(230,255), size: randInt(8,13), color: pick(['#FF4500','#FF6347','#E8672C']) })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'bird', x: randInt(50,310), y: randInt(30,80), size: randInt(5,8), color: '#333' })
      break
    }
    case 'space': {
      bgColor = pick(['#0B1D3A', '#0D0D2B', '#1A0A2E'])
      groundColor = pick(['#4A4A6A', '#3D3D5C', '#555577'])
      groundY = 200
      elems.push({ id: id(), type: 'moon', x: randInt(40,100), y: randInt(30,60), size: randInt(20,28), color: '#F5F5DC', color2: bgColor })
      for (let i=0; i<randInt(5,10); i++)
        elems.push({ id: id(), type: 'star', x: randInt(10,350), y: randInt(10,160), size: randInt(3,7), color: pick(['#FFD700','#FFF','#FFFACD','#ADD8E6']) })
      for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'planet', x: randInt(150+i*100,250+i*80), y: randInt(40,100), size: randInt(15,25), color: pick(['#FF6347','#4169E1','#32CD32','#DA70D6','#FF8C00']), color2: pick(['#DDD','#AAA','#FFD700']) })
      if (Math.random()>0.3) elems.push({ id: id(), type: 'rocket', x: randInt(80,280), y: randInt(80,150), size: randInt(16,22), color: '#E8E8E8', color2: '#FF4500' })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'ufo', x: randInt(60,300), y: randInt(50,120), size: randInt(14,20), color: pick(['#C0C0C0','#90EE90','#9370DB']), color2: '#C0C0C0' })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'comet', x: randInt(50,200), y: randInt(30,80), size: randInt(8,14), color: pick(['#FFD700','#87CEEB','#FFF']) })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'mountain', x: randInt(40+i*120,140+i*120), y: randInt(200,225), size: randInt(20,35), color: pick(['#5A5A7A','#6B6B8D','#4A4A6A']) })
      break
    }
    case 'city': {
      bgColor = pick(['#FFB347', '#FF7F50', '#87CEEB', '#FFA07A'])
      groundColor = pick(['#808080', '#696969', '#778899'])
      groundY = 185
      if (bgColor.startsWith('#FF'))
        elems.push({ id: id(), type: 'sun', x: randInt(150,210), y: randInt(50,80), size: randInt(25,35), color: '#FFD700' })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'cloud', x: randInt(30+i*100,100+i*100), y: randInt(20,60), size: randInt(12,18), color: '#FFF' })
      for (let i=0; i<randInt(3,5); i++)
        elems.push({ id: id(), type: 'building', x: randInt(20+i*65,60+i*65), y: randInt(160,185), size: randInt(18,28), color: pick(['#4A5568','#2D3748','#718096','#A0AEC0','#E2E8F0','#CBD5E0']) })
      for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'streetlamp', x: randInt(30+i*200,120+i*200), y: randInt(210,230), size: randInt(12,16), color: '#FFD700' })
      for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'car', x: randInt(60+i*150,180+i*150), y: randInt(235,250), size: randInt(14,20), color: pick(['#FF4500','#4169E1','#FFD700','#32CD32','#FF69B4']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'trafficLight', x: randInt(100,260), y: randInt(210,230), size: randInt(12,16), color: pick(['#22c55e','#EAB308','#EF4444']) })
      for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'tree', x: randInt(40+i*200,130+i*200), y: randInt(205,220), size: randInt(12,18), color: '#228B22', color2: '#8B4513' })
      for (let i=0; i<randInt(0,2); i++)
        elems.push({ id: id(), type: 'bird', x: randInt(50,310), y: randInt(30,80), size: randInt(5,8), color: '#333' })
      break
    }
    case 'farm': {
      bgColor = pick(['#87CEEB', '#B0E0E6'])
      groundColor = pick(['#90EE90', '#7CCD7C', '#8DB600'])
      groundY = 170
      elems.push({ id: id(), type: 'sun', x: randInt(280,330), y: randInt(25,50), size: randInt(20,26), color: '#FFD700' })
      for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'cloud', x: randInt(50+i*120,150+i*120), y: randInt(20,50), size: randInt(14,20), color: '#FFF' })
      elems.push({ id: id(), type: 'barn', x: randInt(60,150), y: randInt(165,180), size: randInt(25,32), color: pick(['#B22222','#CD5C5C','#8B0000']) })
      if (Math.random()>0.3) elems.push({ id: id(), type: 'windmill', x: randInt(230,310), y: randInt(175,195), size: randInt(18,24), color: '#FFF' })
      elems.push({ id: id(), type: 'fence', x: randInt(140,250), y: randInt(205,215), size: randInt(30,45), color: pick(['#DEB887','#D2B48C']) })
      if (Math.random()>0.3) elems.push({ id: id(), type: 'cow', x: randInt(140,260), y: randInt(215,235), size: randInt(14,20), color: '#333' })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'chicken', x: randInt(50+i*80,120+i*80), y: randInt(225,250), size: randInt(8,12), color: pick(['#FFF','#F5DEB3','#DEB887']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'pig', x: randInt(200,300), y: randInt(230,250), size: randInt(12,18), color: pick(['#FFB6C1','#FFC0CB']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'haystack', x: randInt(40,320), y: randInt(220,245), size: randInt(14,20), color: pick(['#DAA520','#B8860B','#D2B48C']) })
      for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'tree', x: randInt(20+i*250,80+i*250), y: randInt(180,200), size: randInt(16,24), color: pick(['#228B22','#2E8B57']), color2: '#8B4513' })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'flower', x: randInt(20,340), y: randInt(230,255), size: randInt(5,8), color: pick(['#FF6B8A','#FFD700','#FF4500','#DA70D6']) })
      break
    }
    case 'underwater': {
      bgColor = pick(['#1A5276', '#1B4F72', '#154360'])
      groundColor = pick(['#F4D790', '#DEB887', '#C4A882'])
      groundY = 210
      for (let i=0; i<randInt(2,4); i++)
        elems.push({ id: id(), type: 'wave', x: randInt(30+i*80,100+i*80), y: randInt(10,30), size: randInt(30,50), color: pick(['#2E86C1','#3498DB']) })
      for (let i=0; i<randInt(3,6); i++)
        elems.push({ id: id(), type: 'seaweed', x: randInt(15+i*55,45+i*55), y: randInt(180,220), size: randInt(20,35), color: pick(['#228B22','#2E8B57','#006400','#3CB371']) })
      for (let i=0; i<randInt(2,4); i++)
        elems.push({ id: id(), type: 'coral', x: randInt(20+i*80,80+i*80), y: randInt(220,255), size: randInt(12,20), color: pick(['#FF6B8A','#FF4500','#FF69B4','#FFA500','#DA70D6']) })
      for (let i=0; i<randInt(2,4); i++)
        elems.push({ id: id(), type: 'fish', x: randInt(30,330), y: randInt(60,180), size: randInt(10,18), color: pick(['#FFD700','#FF6347','#4169E1','#32CD32','#FF69B4','#FFA500']) })
      if (Math.random()>0.3) for (let i=0; i<randInt(1,2); i++)
        elems.push({ id: id(), type: 'jellyfish', x: randInt(50,310), y: randInt(50,120), size: randInt(12,18), color: pick(['#DDA0DD','#FF69B4','#87CEEB','#9370DB']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'octopus', x: randInt(60,300), y: randInt(160,200), size: randInt(14,20), color: pick(['#9370DB','#FF69B4','#FF6347']) })
      if (Math.random()>0.4) elems.push({ id: id(), type: 'turtle', x: randInt(60,300), y: randInt(100,160), size: randInt(14,20), color: pick(['#2E8B57','#6B8E23']), color2: '#228B22' })
      for (let i=0; i<randInt(2,4); i++)
        elems.push({ id: id(), type: 'bubbles', x: randInt(30,330), y: randInt(30,180), size: randInt(8,15), color: '#FFF' })
      for (let i=0; i<randInt(1,3); i++)
        elems.push({ id: id(), type: 'shell', x: randInt(30,330), y: randInt(245,265), size: randInt(6,10), color: pick(['#FFB6C1','#DDA0DD','#FFDAB9']) })
      break
    }
  }

  // ── 차이점 생성 ──
  const diffCount = Math.min(3 + Math.floor(round / 3), 5)
  const small: ElemType[] = ['flower','bird','butterfly','bush','cloud','star','shell','crab','fish','bubbles','chicken','mushroom','wave','haystack','comet']
  const noSize: ElemType[] = ['bird','fence','wave','bubbles','streetlamp','trafficLight']
  const candidates = elems.filter(e => {
    if (e.type === 'sun' || e.type === 'moon') return elems.filter(x => x.type === e.type).length > 1
    return true
  })
  const chosen = shuffle(candidates).slice(0, Math.min(diffCount, candidates.length))

  const diffs: Diff[] = chosen.map(elem => {
    const canMissing = small.includes(elem.type)
    const kinds: Diff['kind'][] = ['color']
    if (canMissing) kinds.push('missing')
    if (!noSize.includes(elem.type)) kinds.push('size')
    const kind = pick(kinds)

    const d: Diff = { elemId: elem.id, kind, cx: elem.x, cy: elem.y, r: Math.max(elem.size * 1.2, 20) }

    if (kind === 'color') {
      const pools: Record<string, string[]> = {
        flower: ['#FF6B8A','#FFD700','#FF69B4','#FF4500','#DA70D6','#FFA500'],
        tree: ['#228B22','#2E8B57','#3CB371','#8B4513','#6B8E23'],
        house: ['#FFD700','#FF8C00','#DEB887','#F4A460','#87CEEB'],
        cloud: ['#FFE4E1','#E6E6FA','#FFDAB9'],
        butterfly: ['#FF69B4','#9370DB','#FFD700','#00CED1','#FF6347'],
        building: ['#4A5568','#CBD5E0','#A0AEC0','#2D3748'],
        car: ['#FF4500','#4169E1','#FFD700','#32CD32','#FF69B4','#9370DB'],
        fish: ['#FFD700','#FF6347','#4169E1','#32CD32','#FF69B4','#FFA500'],
        coral: ['#FF6B8A','#FF4500','#FF69B4','#FFA500','#DA70D6'],
        planet: ['#FF6347','#4169E1','#32CD32','#DA70D6','#FF8C00'],
        jellyfish: ['#DDA0DD','#FF69B4','#87CEEB','#9370DB'],
        octopus: ['#9370DB','#FF69B4','#FF6347','#4169E1'],
        barn: ['#B22222','#CD5C5C','#8B0000','#A0522D'],
        chicken: ['#FFF','#F5DEB3','#DEB887','#FFD700'],
        pig: ['#FFB6C1','#FFC0CB','#DDA0DD'],
        seaweed: ['#228B22','#2E8B57','#006400','#3CB371'],
        umbrella: ['#FF4500','#FF69B4','#4169E1','#FFD700','#32CD32'],
        star: ['#FFD700','#FFF','#FFFACD','#ADD8E6','#FF69B4'],
      }
      const pool = pools[elem.type] ?? ['#FF6347','#4169E1','#FFD700','#32CD32','#9370DB']
      let alt = pick(pool); let t=0
      while (alt === elem.color && t < 10) { alt = pick(pool); t++ }
      d.altColor = alt
    } else if (kind === 'size') {
      d.altSize = elem.size * (Math.random() > 0.5 ? 0.5 : 1.5)
    }

    return d
  })

  return { elems, diffs, bgColor, groundColor, theme, groundY }
}

/* ── 장면 SVG 컴포넌트 ── */
function SceneSVG({ level, isRight, found, onTap }: {
  level: Level; isRight: boolean; found: Set<string>; onTap?: (id: string) => void
}) {
  const { elems, diffs, bgColor, groundColor, theme, groundY } = level
  const diffMap = useMemo(() => new Map(diffs.map(d => [d.elemId, d])), [diffs])
  const isUnderwater = theme === 'underwater'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl shadow-md border-2 border-white" style={{ maxHeight: '38vh' }}
      onClick={ev => {
        if (!isRight || !onTap) return
        const svg = ev.currentTarget; const rect = svg.getBoundingClientRect()
        const cx = (ev.clientX - rect.left) * W / rect.width
        const cy = (ev.clientY - rect.top) * H / rect.height
        for (const d of diffs) {
          if (found.has(d.elemId)) continue
          if (Math.sqrt((cx-d.cx)**2 + (cy-d.cy)**2) < d.r * 1.3) { onTap(d.elemId); return }
        }
        onTap('__miss__')
      }}
    >
      {/* 배경 */}
      <rect x={0} y={0} width={W} height={H} fill={bgColor}/>
      {/* 바다 테마: 수면 */}
      {theme === 'ocean' && <>
        <rect x={0} y={groundY - 30} width={W} height={30} fill="#4169E1" opacity={0.4}/>
        <rect x={0} y={groundY - 15} width={W} height={15} fill="#4169E1" opacity={0.3}/>
      </>}
      {/* 수중 테마: 물 그라데이션 */}
      {isUnderwater && <defs><linearGradient id={`wg-${isRight?'r':'l'}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#AEE6F7"/><stop offset="100%" stopColor="#0B3D91"/></linearGradient></defs>}
      {isUnderwater && <rect x={0} y={0} width={W} height={H} fill={`url(#wg-${isRight?'r':'l'})`} opacity={0.3}/>}
      {/* 땅/해저 */}
      <ellipse cx={W/2} cy={H+30} rx={W*0.8} ry={H-groundY+40} fill={groundColor}/>
      {/* 도시 도로 줄 */}
      {theme === 'city' && <line x1={0} y1={groundY+35} x2={W} y2={groundY+35} stroke="#FFF" strokeWidth={2} strokeDasharray="12 8" opacity={0.5}/>}

      {elems.map(elem => {
        const diff = isRight ? diffMap.get(elem.id) : undefined
        const isFound = found.has(elem.id)
        let oc: string|undefined, os: number|undefined, hid = false
        if (diff && !isFound) {
          if (diff.kind==='color') oc=diff.altColor
          else if (diff.kind==='missing') hid=true
          else if (diff.kind==='size') os=diff.altSize
        }
        return renderElem(elem, oc, os, hid)
      })}

      {diffs.map(d => found.has(d.elemId) ? (
        <g key={`f-${d.elemId}`}>
          <circle cx={d.cx} cy={d.cy} r={d.r} fill="none" stroke="#22c55e" strokeWidth={3} strokeDasharray="6 3">
            <animate attributeName="r" from={d.r*0.8} to={d.r*1.1} dur="0.6s" repeatCount="1" fill="freeze"/>
          </circle>
          <text x={d.cx} y={d.cy+4} textAnchor="middle" fontSize={14} fill="#22c55e" fontWeight="bold">✓</text>
        </g>
      ) : null)}
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

  const handleTap = useCallback((elemId: string) => {
    if (cleared) return
    if (elemId === '__miss__') {
      if (soundEnabled) playWrong()
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 400)
      setScore(s => Math.max(0, s - 2))
      return
    }
    if (found.has(elemId)) return
    if (soundEnabled) playCorrect()
    const nf = new Set(found); nf.add(elemId); setFound(nf)
    setScore(s => s + 10)
    if (nf.size === totalDiffs) { setScore(s => s + 20); setCleared(true) }
  }, [cleared, found, totalDiffs, soundEnabled])

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-indigo-50 to-violet-50 p-3">
      <header className="flex items-center justify-between mb-2">
        <Link to="/game" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20}/> 게임
        </Link>
        <h2 className="text-lg font-bold text-gray-700">🔍 틀린그림찾기</h2>
        <span className="text-lg font-bold text-orange-500">⭐{score}</span>
      </header>

      <div className="text-center mb-2">
        <p className="text-sm text-gray-500">
          라운드 {round+1} — {THEME_NAMES[level.theme]} · 틀린곳{' '}
          <span className="font-bold text-indigo-600">{found.size}</span>/{totalDiffs}
        </p>
        <div className="flex justify-center gap-1 mt-1">
          {level.diffs.map((d,i) => (
            <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
              found.has(d.elemId) ? 'bg-green-400 border-green-500 scale-110' : 'bg-white border-gray-300'
            }`}/>
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col gap-2 items-center justify-center">
        <div className="w-full max-w-md">
          <p className="text-xs text-center text-gray-400 mb-1">▼ 원본</p>
          <SceneSVG level={level} isRight={false} found={found}/>
        </div>
        <div className={`w-full max-w-md transition-all ${wrongFlash ? 'ring-4 ring-red-400 rounded-2xl' : ''}`}>
          <p className="text-xs text-center text-gray-400 mb-1">▼ 다른 그림을 찾아 터치!</p>
          <SceneSVG level={level} isRight={true} found={found} onTap={handleTap}/>
        </div>
      </main>

      <AnimatePresence>
        {cleared && (
          <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xl font-bold text-green-600 mb-1">모두 찾았어요!</p>
              <p className="text-gray-500 mb-4">+20 보너스 포함 ⭐{score}</p>
              <button onClick={next} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-lg transition-colors">
                다음 라운드 →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
