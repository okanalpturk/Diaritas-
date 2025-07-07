'use client'

import { Home, BarChart3, History, User } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'attributes', label: 'Attributes', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="bg-secondary rounded-xl p-2 border border-gray-700">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-secondary'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}