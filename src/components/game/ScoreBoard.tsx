interface ScoreBoardProps {
  score: number
  total: number
}

export default function ScoreBoard({ score, total }: ScoreBoardProps) {
  return (
    <div className="flex items-center gap-1 text-lg font-bold">
      <span className="text-green-500">{score}</span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-500">{total}</span>
    </div>
  )
}
