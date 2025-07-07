'use client'

import { useState, useEffect } from 'react'
import { Send, Sparkles, User, BarChart3, History, Home } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { clampAttributeValue } from '@/utils/attributes'
import { canAffordReflection, spendTokensForReflection, checkForTokenRewards, awardTokens } from '@/utils/tokenSystem'
import AttributeBar from '@/components/AttributeBar'
import RadarChart from '@/components/RadarChart'
import CharacterSetup from '@/components/CharacterSetup'
import TokenBalanceSection from '@/components/TokenBalanceSection'
import Navigation from '@/components/Navigation'
import { PromptResponse, AttributeChange } from '@/types'

export default function Home() {
  const { profile, isLoading: profileLoading, updateProfile, addToHistory } = useProfile()
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<PromptResponse | null>(null)
  const [showCharacterSetup, setShowCharacterSetup] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    if (profile?.isFirstTime) {
      setShowCharacterSetup(true)
    }
  }, [profile])

  const handleCharacterSetupComplete = async (name: string) => {
    if (!profile) return
    
    const updatedProfile = {
      ...profile,
      characterName: name,
      isFirstTime: false,
    }
    
    await updateProfile(updatedProfile)
    setShowCharacterSetup(false)
  }

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || !profile) return

    if (!canAffordReflection(profile)) {
      alert('You need at least 1 token to submit a daily reflection. Complete daily activities to earn more tokens.')
      return
    }

    setIsLoading(true)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let isNewDay = false
      if (profile.lastPromptDate) {
        const lastDate = new Date(profile.lastPromptDate)
        lastDate.setHours(0, 0, 0, 0)
        const diffTime = today.getTime() - lastDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        isNewDay = diffDays > 0
      } else {
        isNewDay = true
      }

      let updatedProfile = { ...profile }
      const tokenRewards = checkForTokenRewards(profile, isNewDay)
      
      for (const reward of tokenRewards) {
        updatedProfile = awardTokens(updatedProfile, reward)
      }

      updatedProfile = spendTokensForReflection(updatedProfile)

      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze prompt')
      }
      
      const data = await response.json()
      
      data.attributeChanges.forEach((change: AttributeChange) => {
        const attributeIndex = updatedProfile.attributes.findIndex(
          attr => attr.id === change.attribute
        )
        if (attributeIndex !== -1) {
          updatedProfile.attributes[attributeIndex].value = clampAttributeValue(
            updatedProfile.attributes[attributeIndex].value + change.change
          )
        }
      })

      updatedProfile.totalPrompts += 1
      updatedProfile.lastPromptDate = new Date()
      
      if (profile.lastPromptDate) {
        const lastDate = new Date(profile.lastPromptDate)
        lastDate.setHours(0, 0, 0, 0)
        const diffTime = today.getTime() - lastDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) {
          // Same day, don't change streak
        } else if (diffDays === 1) {
          updatedProfile.streak += 1
        } else {
          updatedProfile.streak = 1
        }
      } else {
        updatedProfile.streak = 1
      }

      await updateProfile(updatedProfile)

      const promptResponse: PromptResponse = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        analysis: data.analysis,
        attributeChanges: data.attributeChanges,
        timestamp: new Date(),
        type: 'reflection',
      }

      setLastResponse(promptResponse)
      await addToHistory(promptResponse)
      setPrompt('')

      if (tokenRewards.length > 0) {
        const rewardMessages = tokenRewards.map(r => `+${r.amount} ${r.reason}`).join('\n')
        alert(`Tokens Earned!\n${rewardMessages}`)
      }
      
    } catch (error) {
      console.error('Error analyzing prompt:', error)
      alert('Failed to analyze your prompt. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl font-semibold">Loading your character...</div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'attributes':
        return <AttributesTab profile={profile} />
      case 'history':
        return <HistoryTab />
      case 'profile':
        return <ProfileTab profile={profile} />
      default:
        return (
          <div className="space-y-8">
            <TokenBalanceSection />

            <div className="bg-secondary rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-primary mb-4">Daily Reflection</h2>
              <div className="bg-background rounded-lg p-4 mb-4 border-l-4 border-primary">
                <p className="text-primary text-sm font-medium">Cost: 1 token per reflection</p>
              </div>
              <p className="text-gray-300 mb-4">
                Tell me about your day. What did you do? How did you feel?
              </p>
              <textarea
                className="w-full bg-background border border-gray-600 rounded-lg p-4 text-white min-h-[120px] resize-none focus:outline-none focus:border-primary"
                placeholder="I worked out for 30 minutes, read a book, helped a friend with their problem... you can write in your own language"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                onClick={handleSubmitPrompt}
                disabled={isLoading || !prompt.trim() || !canAffordReflection(profile)}
                className="mt-4 w-full bg-primary text-secondary font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors"
              >
                {isLoading ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isLoading ? 'Analyzing...' : 'Submit'}
              </button>
              
              {!canAffordReflection(profile) && (
                <p className="text-red-400 text-sm text-center mt-2 italic">
                  Insufficient tokens for reflection
                </p>
              )}
            </div>

            {lastResponse && (
              <div className="bg-secondary rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-primary mb-4">Latest Analysis</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">{lastResponse.analysis}</p>
                <div className="space-y-3">
                  {lastResponse.attributeChanges.map((change, index) => (
                    <div key={index} className="bg-background rounded-lg p-3 border-l-4 border-primary">
                      <p className={`font-semibold mb-1 ${change.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change.attribute}: {change.change > 0 ? '+' : ''}{change.change}
                      </p>
                      <p className="text-gray-300 text-sm">{change.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-secondary rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-primary mb-4">Your Character</h2>
              <RadarChart attributes={profile.attributes} />
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-primary mb-4">Your Progress</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 text-center border border-gray-600">
                  <div className="text-2xl font-bold text-primary">{profile.totalPrompts}</div>
                  <div className="text-gray-400 text-sm">Total Prompts</div>
                </div>
                <div className="bg-background rounded-lg p-4 text-center border border-gray-600">
                  <div className="text-2xl font-bold text-primary">{profile.streak}</div>
                  <div className="text-gray-400 text-sm">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {profile.characterName ? `${profile.characterName}'s Journey` : 'Your RPG Life'}
          </h1>
          <p className="text-gray-400">Track your daily activities and watch your character grow</p>
        </header>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="mt-8">
          {renderContent()}
        </main>
      </div>
      
      <CharacterSetup
        visible={showCharacterSetup}
        onComplete={handleCharacterSetupComplete}
      />
    </div>
  )
}

// Placeholder components for other tabs
function AttributesTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Character Attributes</h2>
        <p className="text-gray-400">Your life stats breakdown</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary rounded-lg p-4 text-center border border-gray-600">
          <div className="text-lg font-bold text-primary">
            {profile.attributes.reduce((sum: number, attr: any) => sum + attr.value, 0)}
          </div>
          <div className="text-gray-400 text-sm">Total Points</div>
        </div>
        <div className="bg-secondary rounded-lg p-4 text-center border border-gray-600">
          <div className="text-lg font-bold text-primary">
            {Math.round(profile.attributes.reduce((sum: number, attr: any) => sum + attr.value, 0) / profile.attributes.length)}
          </div>
          <div className="text-gray-400 text-sm">Average Level</div>
        </div>
      </div>

      <div className="space-y-4">
        {profile.attributes.map((attribute: any) => (
          <div key={attribute.id} className="bg-secondary rounded-lg p-4 border border-gray-600">
            <AttributeBar attribute={attribute} showLevel />
            <p className="text-gray-400 text-sm mt-3">{attribute.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryTab() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-primary mb-4">History</h2>
      <p className="text-gray-400">Your journey history will appear here as you track your daily activities.</p>
    </div>
  )
}

function ProfileTab({ profile }: { profile: any }) {
  const highestAttr = profile.attributes.reduce((max: any, attr: any) => 
    attr.value > max.value ? attr : max
  )
  const lowestAttr = profile.attributes.reduce((min: any, attr: any) => 
    attr.value < min.value ? attr : min
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          {profile.characterName ? `${profile.characterName}'s Profile` : 'Character Profile'}
        </h2>
        <p className="text-gray-400">Your life statistics</p>
      </div>

      <TokenBalanceSection />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary rounded-lg p-4 text-center border border-gray-600">
          <div className="text-2xl font-bold text-primary mb-2">{profile.streak}</div>
          <div className="text-gray-400 text-sm">Day Streak</div>
        </div>
        <div className="bg-secondary rounded-lg p-4 text-center border border-gray-600">
          <div className="text-2xl font-bold text-primary mb-2">{profile.totalPrompts}</div>
          <div className="text-gray-400 text-sm">Total Prompts</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-secondary rounded-lg p-4 border border-gray-600">
          <h3 className="text-lg font-semibold text-primary mb-2">Strongest Attribute</h3>
          <p className="text-white font-medium">{highestAttr.name} - {highestAttr.value}</p>
          <p className="text-gray-400 text-sm">{highestAttr.description}</p>
        </div>

        <div className="bg-secondary rounded-lg p-4 border border-gray-600">
          <h3 className="text-lg font-semibold text-primary mb-2">Growth Opportunity</h3>
          <p className="text-white font-medium">{lowestAttr.name} - {lowestAttr.value}</p>
          <p className="text-gray-400 text-sm">{lowestAttr.description}</p>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-primary mb-3">About Diaritas</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          Track your daily activities and watch your life attributes grow. Each day brings new opportunities to level up different aspects of your character.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          Use the daily reflection feature to analyze your activities and see how they impact your attributes. The more consistent you are, the stronger your character becomes!
        </p>
      </div>
    </div>
  )
}