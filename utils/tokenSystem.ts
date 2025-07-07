import { UserProfile } from '@/types'

export interface TokenReward {
  amount: number
  reason: string
  type: 'daily_login' | 'streak_bonus' | 'achievement' | 'special'
}

export const TOKEN_COSTS = {
  DAILY_REFLECTION: 1,
  CHARACTER_ANALYSIS: 5,
} as const

export const TOKEN_REWARDS = {
  DAILY_LOGIN: 1,
  STREAK_7_DAYS: 5,
  STREAK_30_DAYS: 15,
  FIRST_REFLECTION: 2,
  ACHIEVEMENT_UNLOCK: 3,
} as const

export const canAffordReflection = (profile: UserProfile): boolean => {
  return profile.tokens >= TOKEN_COSTS.DAILY_REFLECTION
}

export const canAffordCharacterAnalysis = (profile: UserProfile): boolean => {
  return profile.tokens >= TOKEN_COSTS.CHARACTER_ANALYSIS
}

export const spendTokensForReflection = (profile: UserProfile): UserProfile => {
  if (!canAffordReflection(profile)) {
    throw new Error('Insufficient tokens for reflection')
  }

  return {
    ...profile,
    tokens: profile.tokens - TOKEN_COSTS.DAILY_REFLECTION,
    totalTokensSpent: profile.totalTokensSpent + TOKEN_COSTS.DAILY_REFLECTION,
  }
}

export const spendTokensForAnalysis = (profile: UserProfile): UserProfile => {
  if (!canAffordCharacterAnalysis(profile)) {
    throw new Error('Insufficient tokens for character analysis')
  }

  return {
    ...profile,
    tokens: profile.tokens - TOKEN_COSTS.CHARACTER_ANALYSIS,
    totalTokensSpent: profile.totalTokensSpent + TOKEN_COSTS.CHARACTER_ANALYSIS,
  }
}

export const awardTokens = (profile: UserProfile, reward: TokenReward): UserProfile => {
  return {
    ...profile,
    tokens: profile.tokens + reward.amount,
    totalTokensEarned: profile.totalTokensEarned + reward.amount,
  }
}

export const checkForTokenRewards = (profile: UserProfile, isNewDay: boolean): TokenReward[] => {
  const rewards: TokenReward[] = []

  if (isNewDay) {
    rewards.push({
      amount: TOKEN_REWARDS.DAILY_LOGIN,
      reason: 'Daily login bonus',
      type: 'daily_login',
    })
  }

  if (profile.streak === 7) {
    rewards.push({
      amount: TOKEN_REWARDS.STREAK_7_DAYS,
      reason: '7-day streak bonus!',
      type: 'streak_bonus',
    })
  } else if (profile.streak === 30) {
    rewards.push({
      amount: TOKEN_REWARDS.STREAK_30_DAYS,
      reason: '30-day streak bonus!',
      type: 'streak_bonus',
    })
  }

  if (profile.totalPrompts === 0) {
    rewards.push({
      amount: TOKEN_REWARDS.FIRST_REFLECTION,
      reason: 'First reflection bonus',
      type: 'special',
    })
  }

  return rewards
}

export const getTokenStatusMessage = (tokens: number): { message: string; color: string } => {
  if (tokens === 0) {
    return {
      message: 'No tokens remaining',
      color: '#f87171',
    }
  } else if (tokens <= 3) {
    return {
      message: 'Running low on tokens',
      color: '#f59e0b',
    }
  } else if (tokens <= 10) {
    return {
      message: 'Good token balance',
      color: '#ffd700',
    }
  } else {
    return {
      message: 'Excellent token balance',
      color: '#4ade80',
    }
  }
}