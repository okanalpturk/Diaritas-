'use client'

import { Attribute } from '@/types'
import { getAttributeLevel } from '@/utils/attributes'
import { getAttributeIcon } from '@/utils/attributeIcons'

interface AttributeBarProps {
  attribute: Attribute
  showLevel?: boolean
}

export default function AttributeBar({ attribute, showLevel = false }: AttributeBarProps) {
  const percentage = Math.max(0, Math.min(100, (attribute.value / Math.max(attribute.value, 100)) * 100))
  const level = getAttributeLevel(attribute.value)
  const IconComponent = getAttributeIcon(attribute.id)

  const getBarColor = () => {
    if (percentage >= 80) return 'bg-yellow-400'
    if (percentage >= 60) return 'bg-purple-500'
    if (percentage >= 40) return 'bg-cyan-500'
    if (percentage >= 20) return 'bg-green-500'
    return 'bg-gray-500'
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-primary" />
          <span className="font-semibold text-white">{attribute.name}</span>
        </div>
        <span className="text-primary font-semibold">{attribute.value}</span>
      </div>
      
      <div className="mb-1">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor()} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {showLevel && (
        <div className={`text-sm font-semibold text-right ${getBarColor().replace('bg-', 'text-')}`}>
          {level}
        </div>
      )}
    </div>
  )
}