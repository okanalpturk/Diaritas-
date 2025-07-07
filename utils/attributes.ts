import { Attribute } from '@/types'

export const initialAttributes: Attribute[] = [
  {
    id: 'vitality',
    name: 'Vitality',
    value: 10,
    description: 'Physical health, energy, and stamina',
    color: '#ff4444'
  },
  {
    id: 'discipline',
    name: 'Discipline',
    value: 10,
    description: 'Self-control, consistency, and dedication',
    color: '#4444ff'
  },
  {
    id: 'creativity',
    name: 'Creativity',
    value: 10,
    description: 'Imagination, innovation, and artistic expression',
    color: '#ff44ff'
  },
  {
    id: 'curiosity',
    name: 'Curiosity',
    value: 10,
    description: 'Desire to learn, explore, and understand',
    color: '#44ffff'
  },
  {
    id: 'empathy',
    name: 'Empathy',
    value: 10,
    description: 'Understanding and sharing others\' feelings',
    color: '#ff8844'
  },
  {
    id: 'sociality',
    name: 'Sociality',
    value: 10,
    description: 'Social skills and connection with others',
    color: '#44ff44'
  },
  {
    id: 'resilience',
    name: 'Resilience',
    value: 10,
    description: 'Ability to recover from setbacks and adapt',
    color: '#8844ff'
  },
  {
    id: 'courage',
    name: 'Courage',
    value: 10,
    description: 'Bravery to face challenges and take risks',
    color: '#ff4488'
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    value: 10,
    description: 'Deep understanding and good judgment',
    color: '#ffff44'
  },
  {
    id: 'integrity',
    name: 'Integrity',
    value: 10,
    description: 'Honesty, moral principles, and authenticity',
    color: '#44ff88'
  }
]

export const clampAttributeValue = (value: number): number => {
  return Math.max(0, value)
}

export const getAttributeLevel = (value: number): string => {
  if (value >= 80) return 'Legendary'
  if (value >= 60) return 'Expert'
  if (value >= 40) return 'Advanced'
  if (value >= 20) return 'Intermediate'
  return 'Novice'
}

export const getAttributeColor = (value: number, baseColor: string): string => {
  const intensity = Math.max(0.3, value / 100)
  return `${baseColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`
}