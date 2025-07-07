'use client'

import { useState } from 'react'
import { Sparkles, User } from 'lucide-react'

interface CharacterSetupProps {
  visible: boolean
  onComplete: (name: string) => void
}

export default function CharacterSetup({ visible, onComplete }: CharacterSetupProps) {
  const [characterName, setCharacterName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!characterName.trim()) return
    
    setIsSubmitting(true)
    setTimeout(() => {
      onComplete(characterName.trim())
      setIsSubmitting(false)
    }, 500)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-gray-700 rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Welcome to Your RPG Life!</h2>
          <p className="text-gray-400">
            Begin your journey with Diaritas by creating your character
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <User className="w-5 h-5 text-primary" />
            </div>
            <input
              type="text"
              className="w-full bg-secondary border-2 border-gray-600 rounded-xl py-4 pl-12 pr-4 text-white text-lg font-medium focus:outline-none focus:border-primary"
              placeholder="Enter your character name"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              maxLength={30}
              autoFocus
            />
          </div>
          
          <p className="text-gray-500 text-sm text-center">
            Choose a name that represents your heroic journey
          </p>

          <button
            type="submit"
            disabled={!characterName.trim() || isSubmitting}
            className="w-full bg-primary text-secondary font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            {isSubmitting ? 'Creating Character...' : 'Create Character'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm italic">
            Track your daily activities and watch your character grow stronger!
          </p>
        </div>
      </div>
    </div>
  )
}