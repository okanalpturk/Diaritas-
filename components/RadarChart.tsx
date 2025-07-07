'use client'

import { Attribute } from '@/types'

interface RadarChartProps {
  attributes: Attribute[]
  size?: number
}

export default function RadarChart({ attributes, size = 300 }: RadarChartProps) {
  const center = size / 2
  const maxRadius = center - 60
  const levels = 5

  const values = attributes.map(attr => attr.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue

  const getRelativeValue = (value: number) => {
    if (range === 0) return 50
    return 20 + ((value - minValue) / range) * 60
  }

  const getPoint = (index: number, relativeValue: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / attributes.length - Math.PI / 2
    const normalizedValue = relativeValue / 100
    const actualRadius = radius * normalizedValue
    
    return {
      x: center + actualRadius * Math.cos(angle),
      y: center + actualRadius * Math.sin(angle),
    }
  }

  const getLabelPoint = (index: number) => {
    const angle = (index * 2 * Math.PI) / attributes.length - Math.PI / 2
    const labelRadius = maxRadius + 30
    
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    }
  }

  const dataPoints = attributes.map((attr, index) => {
    const relativeValue = getRelativeValue(attr.value)
    return getPoint(index, relativeValue, maxRadius)
  })
  const dataPolygonPoints = dataPoints.map(point => `${point.x},${point.y}`).join(' ')

  const getChartColor = () => {
    if (range === 0) return '#4ade80'
    if (range <= 10) return '#06b6d4'
    if (range <= 20) return '#ffd700'
    if (range <= 30) return '#f59e0b'
    return '#f87171'
  }

  const chartColor = getChartColor()

  return (
    <div className="flex flex-col items-center bg-secondary rounded-xl p-6 border border-gray-700">
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid circles */}
          {Array.from({ length: levels }, (_, i) => {
            const radius = (maxRadius * (i + 1)) / levels
            return (
              <circle
                key={`circle-${i}`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
              />
            )
          })}
          
          {/* Grid lines */}
          {attributes.map((_, i) => {
            const endPoint = getPoint(i, 100, maxRadius)
            return (
              <line
                key={`grid-${i}`}
                x1={center}
                y1={center}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
              />
            )
          })}
          
          {/* Data polygon */}
          <polygon
            points={dataPolygonPoints}
            fill={chartColor}
            fillOpacity="0.2"
            stroke={chartColor}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {dataPoints.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={chartColor}
              stroke="#1a1a2e"
              strokeWidth="2"
            />
          ))}
          
          {/* Attribute labels */}
          {attributes.map((attr, index) => {
            const labelPoint = getLabelPoint(index)
            return (
              <text
                key={`label-${index}`}
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize="12"
                fill="#ffd700"
                textAnchor="middle"
                fontWeight="500"
              >
                {attr.name}
              </text>
            )
          })}
        </svg>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="text-sm font-semibold text-primary mb-2">Character Balance</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: chartColor }}
          />
          <span className="text-sm text-white font-medium">
            {range === 0 ? 'Perfect Balance' :
             range <= 10 ? 'Well Balanced' :
             range <= 20 ? 'Moderately Balanced' :
             range <= 30 ? 'Some Imbalance' :
             'Highly Specialized'}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Range: {range} points ({minValue} - {maxValue})
        </p>
      </div>
      
      <div className="mt-4 w-full">
        <h4 className="text-sm font-medium text-primary text-center mb-3">Attribute Values</h4>
        <div className="grid grid-cols-2 gap-2">
          {attributes.map((attr) => {
            const isHighest = attr.value === maxValue
            const isLowest = attr.value === minValue
            return (
              <div key={attr.id} className="flex items-center justify-between p-2 bg-background rounded border border-primary">
                <span className="text-xs text-gray-300">{attr.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-primary">{attr.value}</span>
                  {isHighest && <span className="text-green-400 text-xs">↑</span>}
                  {isLowest && <span className="text-red-400 text-xs">↓</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}