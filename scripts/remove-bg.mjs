import sharp from 'sharp'

const INPUT = 'public/images/pororo.png'
const OUTPUT = 'public/images/pororo.png'

// 배경색 제거: 밝은 회색/흰색 계열 픽셀을 투명으로
const THRESHOLD = 200 // R,G,B 모두 이 값 이상이면 배경으로 판정

const img = sharp(INPUT)
const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

// Flood-fill from edges to find background
const visited = new Uint8Array(width * height)
const queue = []

// Seed from edges
for (let x = 0; x < width; x++) {
  queue.push([x, 0])
  queue.push([x, height - 1])
}
for (let y = 0; y < height; y++) {
  queue.push([0, y])
  queue.push([width - 1, y])
}

function isBackground(idx) {
  const r = data[idx], g = data[idx + 1], b = data[idx + 2]
  // Light gray/white background OR very transparent already
  return (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) || data[idx + 3] < 10
}

// BFS flood fill
while (queue.length > 0) {
  const [x, y] = queue.shift()
  if (x < 0 || x >= width || y < 0 || y >= height) continue
  const pos = y * width + x
  if (visited[pos]) continue
  const idx = pos * channels
  if (!isBackground(idx)) continue
  visited[pos] = 1
  // Make transparent
  data[idx + 3] = 0
  queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1])
}

// Also soften edges: semi-transparent pixels near the boundary
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const pos = y * width + x
    if (visited[pos]) continue
    const idx = pos * channels
    // Check if any neighbor is background
    let bgNeighbors = 0
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) { bgNeighbors++; continue }
      if (visited[ny * width + nx]) bgNeighbors++
    }
    if (bgNeighbors > 0 && data[idx] >= THRESHOLD - 30 && data[idx+1] >= THRESHOLD - 30 && data[idx+2] >= THRESHOLD - 30) {
      data[idx + 3] = Math.max(0, data[idx + 3] - bgNeighbors * 60)
    }
  }
}

await sharp(data, { raw: { width, height, channels } })
  .png()
  .toFile(OUTPUT + '.tmp')

// Replace original
import { rename } from 'fs/promises'
await rename(OUTPUT + '.tmp', OUTPUT)

console.log(`Done! Background removed: ${OUTPUT}`)
