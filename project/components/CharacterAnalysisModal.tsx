import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X, Crown, TrendingUp, Target, Quote, Sparkles } from 'lucide-react-native';
import { CharacterAnalysis } from '@/types';
import { getAttributeIcon } from '@/utils/attributeIcons';

interface CharacterAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  analysis: CharacterAnalysis | null;
  isLoading: boolean;
  characterName?: string;
}

export default function CharacterAnalysisModal({ 
  visible, 
  onClose, 
  analysis, 
  isLoading,
  characterName
}: CharacterAnalysisModalProps) {

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Crown size={24} color="#ffd700" />
            <Text style={styles.headerTitle}>
              {characterName ? `${characterName}'s Analysis` : 'Character Analysis'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#ffd700" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffd700" />
            <Text style={styles.loadingText}>Analyzing your character...</Text>
            <Text style={styles.loadingSubtext}>
              Our AI is studying your attributes and journey
            </Text>
          </View>
        ) : analysis ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Archetype Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={20} color="#ffd700" />
                  <Text style={styles.sectionTitle}>Character Archetype</Text>
                </View>
                <View style={styles.archetypeCard}>
                  <Text style={styles.archetypeText}>{analysis.archetype}</Text>
                </View>
              </View>

              {/* Character Quote */}
              <View style={styles.section}>
                <View style={styles.quoteCard}>
                  <Quote size={24} color="#ffd700" style={styles.quoteIcon} />
                  <Text style={styles.quoteText}>"{analysis.characterQuote}"</Text>
                </View>
              </View>

              {/* Personality Insights */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Crown size={20} color="#ffd700" />
                  <Text style={styles.sectionTitle}>Personality Insights</Text>
                </View>
                <Text style={styles.insightsText}>{analysis.personalityInsights}</Text>
              </View>

              {/* Dominant Traits */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={20} color="#ffd700" />
                  <Text style={styles.sectionTitle}>Dominant Traits</Text>
                </View>
                {analysis.dominantTraits.map((trait, index) => {
                  const IconComponent = getAttributeIcon(trait.attribute);
                  return (
                    <View key={index} style={styles.traitCard}>
                      <View style={styles.traitHeader}>
                        <IconComponent size={18} color="#ffd700" />
                        <Text style={styles.traitName}>
                          {trait.attribute.charAt(0).toUpperCase() + trait.attribute.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.traitInsight}>{trait.insight}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Growth Areas */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Target size={20} color="#ffd700" />
                  <Text style={styles.sectionTitle}>Growth Opportunities</Text>
                </View>
                {analysis.growthAreas.map((area, index) => {
                  const IconComponent = getAttributeIcon(area.attribute);
                  return (
                    <View key={index} style={styles.growthCard}>
                      <View style={styles.growthHeader}>
                        <IconComponent size={18} color="#f59e0b" />
                        <Text style={styles.growthName}>
                          {area.attribute.charAt(0).toUpperCase() + area.attribute.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.growthSuggestion}>{area.suggestion}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Strengths */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={20} color="#ffd700" />
                  <Text style={styles.sectionTitle}>Your Superpowers</Text>
                </View>
                <View style={styles.strengthsContainer}>
                  {analysis.strengths.map((strength, index) => (
                    <View key={index} style={styles.strengthItem}>
                      <Text style={styles.strengthText}>• {strength}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Life Philosophy */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Crown size={20} color="#ffd700" />
                  <Text style={styles.sectionTitle}>Life Philosophy</Text>
                </View>
                <Text style={styles.philosophyText}>{analysis.lifePhilosophy}</Text>
              </View>

              {/* Character Evolution */}
              {analysis.characterEvolution && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TrendingUp size={20} color="#ffd700" />
                    <Text style={styles.sectionTitle}>Character Evolution</Text>
                  </View>
                  <Text style={styles.evolutionText}>{analysis.characterEvolution}</Text>
                </View>
              )}

              <View style={styles.bottomPadding} />
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load character analysis</Text>
            <TouchableOpacity onPress={onClose} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffd700',
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  archetypeCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
  },
  archetypeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.3,
  },
  quoteText: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 24,
    paddingRight: 40,
  },
  insightsText: {
    fontSize: 16,
    color: '#bbb',
    lineHeight: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  traitCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd700',
  },
  traitInsight: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  growthCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  growthName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  growthSuggestion: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  strengthsContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  strengthItem: {
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 14,
    color: '#4ade80',
    lineHeight: 20,
  },
  philosophyText: {
    fontSize: 16,
    color: '#bbb',
    lineHeight: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  evolutionText: {
    fontSize: 16,
    color: '#bbb',
    lineHeight: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f87171',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});