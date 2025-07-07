'use client'

import { useProfile } from '@/contexts/ProfileContext'
import { Coins } from 'lucide-react'

export default function TokenBalanceSection() {
  const { profile } = useProfile()

  if (!profile) return null

  return (
    <div className="text-center mb-6">
      <h2 className="text-lg font-semibold text-primary mb-3">Token Balance</h2>
      <p className="text-sm text-gray-400 mb-3 italic">Login daily to receive +1 token</p>
      
      <div className="bg-secondary rounded-xl p-4 border border-gray-700 inline-block">
        <div className="flex items-center justify-center gap-2">
          <Coins className="w-6 h-6 text-primary" />
          <span className="text-2xl font-bold text-primary">{profile.tokens || 0}</span>
        </div>
      </div>
    </div>
  )
}