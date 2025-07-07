export interface Attribute {
  id: string
  name: string
  value: number
  description: string
  color: string
}

export interface AttributeChange {
  attribute: string
  change: number
  reason: string
}

export interface PromptResponse {
  id: string
  prompt: string
  analysis: string
  attributeChanges: AttributeChange[]
  timestamp: Date
  type: 'reflection' | 'character_analysis'
  characterAnalysis?: CharacterAnalysis
}

export interface UserProfile {
  attributes: Attribute[]
  totalPrompts: number
  streak: number
  lastPromptDate: Date | null
  characterName?: string
  isFirstTime?: boolean
  tokens: number
  totalTokensEarned: number
  totalTokensSpent: number
}

export interface CharacterAnalysis {
  archetype: string
  dominantTraits: Array<{
    attribute: string
    insight: string
  }>
  growthAreas: Array<{
    attribute: string
    suggestion: string
  }>
  personalityInsights: string
  characterEvolution: string
  strengths: string[]
  lifePhilosophy: string
  characterQuote: string
}