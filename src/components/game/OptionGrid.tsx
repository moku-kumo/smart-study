import { motion } from 'framer-motion'

interface OptionGridProps<T extends string | number> {
  options: T[]
  onSelect: (option: T) => void
  disabled?: boolean
  columns?: number
  renderOption?: (option: T) => React.ReactNode
}

export default function OptionGrid<T extends string | number>({
  options,
  onSelect,
  disabled = false,
  columns = 3,
  renderOption,
}: OptionGridProps<T>) {
  const gridCols = columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-3 w-full max-w-md`}>
      {options.map((opt, i) => (
        <motion.button
          key={String(opt)}
          onClick={() => onSelect(opt)}
          disabled={disabled}
          className="flex items-center justify-center rounded-2xl bg-white border-2 border-gray-200 p-4 text-2xl font-bold text-gray-700 shadow-sm hover:border-blue-400 hover:shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[64px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          whileTap={{ scale: 0.9 }}
        >
          {renderOption ? renderOption(opt) : String(opt)}
        </motion.button>
      ))}
    </div>
  )
}
