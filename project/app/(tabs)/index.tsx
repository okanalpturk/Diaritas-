import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';
import { UserProfile, PromptResponse, AttributeChange } from '@/types';
import { clampAttributeValue } from '@/utils/attributes';
import { canAffordReflection, spendTokensForReflection, checkForTokenRewards, awardTokens } from '@/utils/tokenSystem';
import AttributeBar from '@/components/AttributeBar';
import RadarChart from '@/components/RadarChart';
import CharacterSetup from '@/components/CharacterSetup';
import TokenWarning from '@/components/TokenWarning';
import TokenBalanceSection from '@/components/TokenBalanceSection';
import AdBanner from '@/components/AdBanner';
import { useProfile } from '@/contexts/ProfileContext';

export default function HomeScreen() {
  const { profile, isLoading: profileLoading, updateProfile, addToHistory } = useProfile();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<PromptResponse | null>(null);
  const [showCharacterSetup, setShowCharacterSetup] = useState(false);

  useEffect(() => {
    // Show character setup if it's the first time
    if (profile?.isFirstTime) {
      setShowCharacterSetup(true);
    }
  }, [profile]);

  const handleCharacterSetupComplete = async (name: string) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      characterName: name,
      isFirstTime: false,
    };
    
    await updateProfile(updatedProfile);
    setShowCharacterSetup(false);
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || !profile) return;

    // Check if user has enough tokens
    if (!canAffordReflection(profile)) {
      Alert.alert(
        'Insufficient Tokens',
        'You need at least 1 token to submit a daily reflection. Complete daily activities to earn more tokens.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Check for token rewards before processing
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let isNewDay = false;
      if (profile.lastPromptDate) {
        const lastDate = new Date(profile.lastPromptDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        isNewDay = diffDays > 0;
      } else {
        isNewDay = true;
      }

      // Award tokens for various achievements
      let updatedProfile = { ...profile };
      const tokenRewards = checkForTokenRewards(profile, isNewDay);
      
      for (const reward of tokenRewards) {
        updatedProfile = awardTokens(updatedProfile, reward);
      }

      // Spend token for reflection
      updatedProfile = spendTokensForReflection(updatedProfile);

      // Use environment variable for production or relative path for development
      const apiUrl = process.env.EXPO_PUBLIC_API_URL 
        ? `${process.env.EXPO_PUBLIC_API_URL}/analyze-prompt`
        : '/analyze-prompt';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to analyze prompt';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response format from server');
      }
      
      if (!data.analysis || !data.attributeChanges) {
        throw new Error('Invalid response structure from server');
      }
      
      // Update attributes based on GPT analysis
      data.attributeChanges.forEach((change: AttributeChange) => {
        const attributeIndex = updatedProfile.attributes.findIndex(
          attr => attr.id === change.attribute
        );
        if (attributeIndex !== -1) {
          updatedProfile.attributes[attributeIndex].value = clampAttributeValue(
            updatedProfile.attributes[attributeIndex].value + change.change
          );
        }
      });

      // Update profile stats
      updatedProfile.totalPrompts += 1;
      updatedProfile.lastPromptDate = new Date();
      
      // Calculate streak
      if (profile.lastPromptDate) {
        const lastDate = new Date(profile.lastPromptDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Same day, don't change streak
        } else if (diffDays === 1) {
          updatedProfile.streak += 1;
        } else {
          updatedProfile.streak = 1;
        }
      } else {
        updatedProfile.streak = 1;
      }

      await updateProfile(updatedProfile);

      // Create and save response
      const promptResponse: PromptResponse = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        analysis: data.analysis,
        attributeChanges: data.attributeChanges,
        timestamp: new Date(),
        type: 'reflection',
      };

      setLastResponse(promptResponse);
      await addToHistory(promptResponse);
      setPrompt('');

      // Show token rewards if any
      if (tokenRewards.length > 0) {
        const rewardMessages = tokenRewards.map(r => `+${r.amount} ${r.reason}`).join('\n');
        Alert.alert(
          'Tokens Earned!',
          rewardMessages,
          [{ text: 'Awesome!' }]
        );
      }
      
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to analyze your prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (profileLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your character...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AdBanner />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Overview
          </Text>
          <Text style={styles.subtitle}>Your character's current status and daily reflection</Text>
        </View>

        <TokenBalanceSection />

        <TokenWarning tokens={profile.tokens} />

        <View style={styles.promptContainer}>
          <Text style={styles.sectionTitle}>Daily Reflection</Text>
          <View style={styles.costInfo}>
            <Text style={styles.costText}>Cost: 1 token per reflection</Text>
          </View>
          <Text style={styles.promptLabel}>
            Tell me about your day. What did you do? How did you feel?
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="I worked out for 30 minutes, read a book, helped a friend with their problem... you can write in your own language"
            placeholderTextColor="#666"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmitPrompt}
            disabled={isLoading || !prompt.trim() || !canAffordReflection(profile)}
          >
            {isLoading ? (
              <Sparkles size={20} color="#1a1a2e" />
            ) : (
              <Send size={20} color="#1a1a2e" />
            )}
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Analyzing...' : 'Submit'}
            </Text>
          </TouchableOpacity>
          
          {!canAffordReflection(profile) && (
            <Text style={styles.insufficientTokensText}>
              Insufficient tokens for reflection
            </Text>
          )}
        </View>

        {lastResponse && (
          <View style={styles.responseContainer}>
            <Text style={styles.sectionTitle}>Latest Analysis</Text>
            <Text style={styles.responseText}>{lastResponse.analysis}</Text>
            <View style={styles.changesContainer}>
              {lastResponse.attributeChanges.map((change, index) => (
                <View key={index} style={styles.changeItem}>
                  <Text style={[
                    styles.changeText,
                    { color: change.change > 0 ? '#4ade80' : '#f87171' }
                  ]}>
                    {change.attribute}: {change.change > 0 ? '+' : ''}{change.change}
                  </Text>
                  <Text style={styles.changeReason}>{change.reason}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.radarContainer}>
          <Text style={styles.sectionTitle}>Your Character</Text>
          <RadarChart attributes={profile.attributes} />
        </View>

        <View style={styles.bottomStatsContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.totalPrompts}</Text>
              <Text style={styles.statLabel}>Total Prompts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <CharacterSetup
        visible={showCharacterSetup}
        onComplete={handleCharacterSetupComplete}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
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
  scrollView: {
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
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
  },
  statLabel: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  bottomStatsContainer: {
    padding: 20,
    marginBottom: 20,
  },
  radarContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 16,
  },
  promptContainer: {
    padding: 20,
  },
  costInfo: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
  },
  costText: {
    fontSize: 14,
    color: '#ffd700',
    fontWeight: '500',
  },
  promptLabel: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 12,
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  insufficientTokensText: {
    fontSize: 14,
    color: '#f87171',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  responseContainer: {
    padding: 20,
  },
  responseText: {
    fontSize: 16,
    color: '#bbb',
    lineHeight: 24,
    marginBottom: 16,
  },
  changesContainer: {
    gap: 12,
  },
  changeItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  changeReason: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
});