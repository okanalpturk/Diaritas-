import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Crown, MessageSquare, Brain, Target, Sparkles, Quote } from 'lucide-react-native';
import { useProfile } from '@/contexts/ProfileContext';
import { getAttributeIcon } from '@/utils/attributeIcons';
import AdBanner from '@/components/AdBanner';

export default function HistoryScreen() {
  const { profile, history, isLoading } = useProfile();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptyText}>
          Start tracking your daily activities to see your progress over time.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdBanner />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile?.characterName ? `${profile.characterName}'s Journey` : 'Your Journey'}
        </Text>
        <Text style={styles.subtitle}>Track your progress over time</Text>
      </View>

      <View style={styles.historyContainer}>
        {history.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          return (
            <View key={item.id} style={styles.historyItem}>
              <TouchableOpacity
                style={styles.historyHeader}
                onPress={() => toggleExpanded(item.id)}
              >
                <View style={styles.historyHeaderContent}>
                  <Text style={styles.historyDate}>
                    {formatDate(item.timestamp)}
                  </Text>
                  <Text style={styles.historyTime}>
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
                {isExpanded ? (
                  <ChevronUp size={20} color="#ffd700" />
                ) : (
                  <ChevronDown size={20} color="#ffd700" />
                )}
              </TouchableOpacity>

              <Text style={styles.promptPreview}>
                {item.prompt.length > 100 
                  ? `${item.prompt.substring(0, 100)}...` 
                  : item.prompt}
              </Text>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  {item.type === 'character_analysis' && item.characterAnalysis ? (
                    <View style={styles.characterAnalysisExpanded}>
                      {/* Character Archetype */}
                      <View style={styles.analysisSection}>
                        <View style={styles.sectionHeader}>
                          <Crown size={18} color="#ffd700" />
                          <Text style={styles.sectionLabel}>Character Archetype</Text>
                        </View>
                        <View style={styles.archetypeCard}>
                          <Text style={styles.archetypeText}>{item.characterAnalysis.archetype}</Text>
                        </View>
                      </View>

                      {/* Character Quote */}
                      <View style={styles.quoteSection}>
                        <Quote size={20} color="#ffd700" style={styles.quoteIcon} />
                        <Text style={styles.quoteText}>"{item.characterAnalysis.characterQuote}"</Text>
                      </View>

                      {/* Personality Insights */}
                      <View style={styles.analysisSection}>
                        <View style={styles.sectionHeader}>
                          <Brain size={18} color="#ffd700" />
                          <Text style={styles.sectionLabel}>Personality Insights</Text>
                        </View>
                        <Text style={styles.analysisText}>{item.characterAnalysis.personalityInsights}</Text>
                      </View>

                      {/* Dominant Traits */}
                      <View style={styles.analysisSection}>
                        <View style={styles.sectionHeader}>
                          <Sparkles size={18} color="#ffd700" />
                          <Text style={styles.sectionLabel}>Dominant Traits</Text>
                        </View>
                        {item.characterAnalysis.dominantTraits.map((trait, index) => {
                          const IconComponent = getAttributeIcon(trait.attribute);
                          return (
                            <View key={index} style={styles.traitItem}>
                              <View style={styles.traitHeader}>
                                <IconComponent size={16} color="#ffd700" />
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
                      <View style={styles.analysisSection}>
                        <View style={styles.sectionHeader}>
                          <Target size={18} color="#ffd700" />
                          <Text style={styles.sectionLabel}>Growth Opportunities</Text>
                        </View>
                        {item.characterAnalysis.growthAreas.map((area, index) => {
                          const IconComponent = getAttributeIcon(area.attribute);
                          return (
                            <View key={index} style={styles.growthItem}>
                              <View style={styles.growthHeader}>
                                <IconComponent size={16} color="#f59e0b" />
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
                      <View style={styles.analysisSection}>
                        <View style={styles.sectionHeader}>
                          <Sparkles size={18} color="#ffd700" />
                          <Text style={styles.sectionLabel}>Your Superpowers</Text>
                        </View>
                        <View style={styles.strengthsList}>
                          {item.characterAnalysis.strengths.map((strength, index) => (
                            <Text key={index} style={styles.strengthText}>• {strength}</Text>
                          ))}
                        </View>
                      </View>

                      {/* Life Philosophy */}
                      <View style={styles.analysisSection}>
                        <View style={styles.sectionHeader}>
                          <Crown size={18} color="#ffd700" />
                          <Text style={styles.sectionLabel}>Life Philosophy</Text>
                        </View>
                        <Text style={styles.analysisText}>{item.characterAnalysis.lifePhilosophy}</Text>
                      </View>

                      {/* Character Evolution */}
                      {item.characterAnalysis.characterEvolution && (
                        <View style={styles.analysisSection}>
                          <View style={styles.sectionHeader}>
                            <Target size={18} color="#ffd700" />
                            <Text style={styles.sectionLabel}>Character Evolution</Text>
                          </View>
                          <Text style={styles.analysisText}>{item.characterAnalysis.characterEvolution}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <>
                      <View style={styles.fullPrompt}>
                        <Text style={styles.sectionLabel}>Your Input:</Text>
                        <Text style={styles.promptText}>{item.prompt}</Text>
                      </View>

                      <View style={styles.analysisSection}>
                        <Text style={styles.sectionLabel}>Analysis:</Text>
                        <Text style={styles.analysisText}>{item.analysis}</Text>
                      </View>

                      <View style={styles.changesSection}>
                        <Text style={styles.sectionLabel}>Attribute Changes:</Text>
                        {item.attributeChanges.map((change, index) => (
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
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 24,
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
  historyContainer: {
    padding: 20,
    gap: 16,
  },
  historyItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyHeaderContent: {
    flex: 1,
  },
  historyTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  historyTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd700',
  },
  historyTime: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 2,
  },
  promptPreview: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  analysisPreview: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  archetypePreview: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: 8,
  },
  quotePreview: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 16,
    gap: 16,
  },
  characterAnalysisExpanded: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  archetypeCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
  },
  archetypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
  },
  quoteSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.3,
  },
  quoteText: {
    fontSize: 15,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 22,
    paddingRight: 32,
  },
  fullPrompt: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  analysisSection: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
  },
  analysisText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  traitItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  traitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffd700',
  },
  traitInsight: {
    fontSize: 13,
    color: '#bbb',
    lineHeight: 18,
  },
  growthItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  growthName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  growthSuggestion: {
    fontSize: 13,
    color: '#bbb',
    lineHeight: 18,
  },
  strengthsList: {
    gap: 4,
  },
  strengthText: {
    fontSize: 14,
    color: '#4ade80',
    lineHeight: 20,
  },
  changesSection: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
  },
  changeItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
    lineHeight: 18,
  },
});