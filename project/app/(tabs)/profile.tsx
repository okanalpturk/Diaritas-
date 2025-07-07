import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, Target, Brain, Sparkles } from 'lucide-react-native';
import { useProfile } from '@/contexts/ProfileContext';
import { CharacterAnalysis } from '@/types';
import { canAffordCharacterAnalysis, spendTokensForAnalysis } from '@/utils/tokenSystem';
import CharacterAnalysisModal from '@/components/CharacterAnalysisModal';
import TokenBalanceSection from '@/components/TokenBalanceSection';
import AdBanner from '@/components/AdBanner';

export default function ProfileScreen() {
  const { profile, history, isLoading, updateProfile, addToHistory } = useProfile();
  const [showAnalysis, setShowAnalysis] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<CharacterAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(false);

  const handleGetAnalysis = async () => {
    if (!profile) return;
    
    // Check if user has enough tokens
    if (!canAffordCharacterAnalysis(profile)) {
      Alert.alert(
        'Insufficient Tokens',
        'You need at least 5 tokens to get an AI character analysis. Complete daily activities to earn more tokens.',
        [{ text: 'OK' }]
      );
      return;
    }

    setShowAnalysis(true);
    setAnalysisLoading(true);
    
    try {
      // Spend tokens for analysis
      const updatedProfile = spendTokensForAnalysis(profile);
      await updateProfile(updatedProfile);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL ? 
        `${process.env.EXPO_PUBLIC_API_URL}/character-analysis` : 
        '/character-analysis';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          profile,
          history: history.slice(0, 10) // Send last 10 entries
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get character analysis');
      }

      const analysisData = await response.json();
      setAnalysis(analysisData);
      
      // Add character analysis to history
      const analysisHistoryEntry = {
        id: Date.now().toString(),
        prompt: 'Character Analysis Request',
        analysis: 'AI Character Analysis Generated',
        attributeChanges: [],
        timestamp: new Date(),
        type: 'character_analysis' as const,
        characterAnalysis: analysisData,
      };
      
      await addToHistory(analysisHistoryEntry);
    } catch (error) {
      console.error('Error getting character analysis:', error);
      Alert.alert('Error', 'Failed to generate character analysis. Please try again.');
      setShowAnalysis(false);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getHighestAttribute = () => {
    if (!profile) return null;
    return profile.attributes.reduce((max, attr) => 
      attr.value > max.value ? attr : max
    );
  };

  const getLowestAttribute = () => {
    if (!profile) return null;
    return profile.attributes.reduce((min, attr) => 
      attr.value < min.value ? attr : min
    );
  };

  const getTotalDays = () => {
    if (!profile?.lastPromptDate) return 0;
    const start = new Date('2024-01-01'); // App start date
    const end = new Date(profile.lastPromptDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const highestAttr = getHighestAttribute();
  const lowestAttr = getLowestAttribute();

  return (
    <View style={styles.container}>
      <AdBanner />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile.characterName ? `${profile.characterName}'s Profile` : 'Character Profile'}
        </Text>
        <Text style={styles.subtitle}>Your life statistics</Text>
      </View>

      <TokenBalanceSection />

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Calendar size={24} color="#ffd700" />
          <Text style={styles.statValue}>{profile.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Target size={24} color="#ffd700" />
          <Text style={styles.statValue}>{profile.totalPrompts}</Text>
          <Text style={styles.statLabel}>Total Prompts</Text>
        </View>
      </View>


      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Character Analysis</Text>
        <TouchableOpacity 
          style={styles.analysisButton}
          onPress={handleGetAnalysis}
          disabled={!canAffordCharacterAnalysis(profile)}
        >
          <Brain size={24} color="#1a1a2e" />
          <View style={styles.analysisButtonContent}>
            <Text style={styles.analysisButtonTitle}>Get AI Character Analysis</Text>
            <Text style={styles.analysisButtonSubtitle}>
              Deep insights into your personality and growth (5 tokens)
            </Text>
          </View>
          <Sparkles size={20} color="#1a1a2e" />
        </TouchableOpacity>
      </View>

      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        
        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>Strongest Attribute</Text>
          <Text style={styles.achievementValue}>
            {highestAttr?.name} - {highestAttr?.value}
          </Text>
          <Text style={styles.achievementDescription}>
            {highestAttr?.description}
          </Text>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>Growth Opportunity</Text>
          <Text style={styles.achievementValue}>
            {lowestAttr?.name} - {lowestAttr?.value}
          </Text>
          <Text style={styles.achievementDescription}>
            {lowestAttr?.description}
          </Text>
        </View>

        {profile.streak >= 7 && (
          <View style={styles.achievementCard}>
            <Text style={styles.achievementTitle}>🔥 Week Warrior</Text>
            <Text style={styles.achievementDescription}>
              Maintained a 7-day streak!
            </Text>
          </View>
        )}

        {profile.totalPrompts >= 30 && (
          <View style={styles.achievementCard}>
            <Text style={styles.achievementTitle}>📚 Dedicated Tracker</Text>
            <Text style={styles.achievementDescription}>
              Completed 30+ daily reflections!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About Diaritas</Text>
        <Text style={styles.infoText}>
          Track your daily activities and watch your life attributes grow. Each day brings new opportunities to level up different aspects of your character.
        </Text>
        <Text style={styles.infoText}>
          Use the daily reflection feature to analyze your activities and see how they impact your attributes. The more consistent you are, the stronger your character becomes!
        </Text>
      </View>

      <CharacterAnalysisModal
        visible={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        analysis={analysis}
        isLoading={analysisLoading}
        characterName={profile.characterName}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
  },
  loadingText: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
  },
  analysisSection: {
    padding: 20,
  },
  analysisButton: {
    backgroundColor: '#ffd700',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    opacity: 1,
  },
  analysisButtonDisabled: {
    opacity: 0.5,
  },
  analysisButtonContent: {
    flex: 1,
  },
  analysisButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  analysisButtonSubtitle: {
    fontSize: 14,
    color: '#1a1a2e',
    opacity: 0.8,
  },
  achievementsContainer: {
    padding: 20,
  },
  achievementCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: 8,
  },
  achievementValue: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  infoContainer: {
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 22,
    marginBottom: 12,
  },
});