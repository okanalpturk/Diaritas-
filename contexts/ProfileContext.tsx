'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserProfile, PromptResponse } from '@/types'
import { getUserProfile, saveUserProfile, getPromptHistory, addPromptToHistory } from '@/utils/storage'

interface ProfileContextType {
  profile: UserProfile | null
  history: PromptResponse[]
  isLoading: boolean
  updateProfile: (profile: UserProfile) => Promise<void>
  addToHistory: (response: PromptResponse) => Promise<void>
  refreshData: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [history, setHistory] = useState<PromptResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [userProfile, promptHistory] = await Promise.all([
        getUserProfile(),
        getPromptHistory()
      ])
      setProfile(userProfile)
      setHistory(promptHistory)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updatedProfile: UserProfile) => {
    try {
      await saveUserProfile(updatedProfile)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const addToHistory = async (response: PromptResponse) => {
    try {
      await addPromptToHistory(response)
      setHistory(prevHistory => [response, ...prevHistory.slice(0, 99)])
    } catch (error) {
      console.error('Error adding to history:', error)
      throw error
    }
  }

  const refreshData = async () => {
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  const value: ProfileContextType = {
    profile,
    history,
    isLoading,
    updateProfile,
    addToHistory,
    refreshData,
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}