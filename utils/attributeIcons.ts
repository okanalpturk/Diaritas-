import { 
  Heart, 
  Target, 
  Palette, 
  Search, 
  Users, 
  MessageCircle, 
  Shield, 
  Sword, 
  BookOpen, 
  CheckCircle 
} from 'lucide-react'

export const attributeIcons = {
  vitality: Heart,
  discipline: Target,
  creativity: Palette,
  curiosity: Search,
  empathy: Users,
  sociality: MessageCircle,
  resilience: Shield,
  courage: Sword,
  wisdom: BookOpen,
  integrity: CheckCircle,
} as const

export const getAttributeIcon = (attributeId: string) => {
  return attributeIcons[attributeId as keyof typeof attributeIcons] || Heart
}