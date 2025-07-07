import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getAttributeLevel } from '@/utils/attributes';
import AttributeBar from '@/components/AttributeBar';
import { useProfile } from '@/contexts/ProfileContext';
import AdBanner from '@/components/AdBanner';

export default function AttributesScreen() {
  const { profile, isLoading } = useProfile();

  const getTotalLevel = () => {
    if (!profile) return 0;
    return profile.attributes.reduce((sum, attr) => sum + attr.value, 0);
  };

  const getAverageLevel = () => {
    if (!profile) return 0;
    return Math.round(getTotalLevel() / profile.attributes.length);
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading attributes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdBanner />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile.characterName ? `${profile.characterName}'s Attributes` : 'Character Attributes'}
        </Text>
        <Text style={styles.subtitle}>Your life stats breakdown</Text>
        
        <View style={styles.overallStats}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Points</Text>
            <Text style={styles.statValue}>{getTotalLevel()}</Text>
            <Text style={styles.statSubtitle}>across all attributes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Average Level</Text>
            <Text style={styles.statValue}>{getAverageLevel()}</Text>
            <Text style={styles.statSubtitle}>{getAttributeLevel(getAverageLevel())}</Text>
          </View>
        </View>
      </View>

      <View style={styles.attributesContainer}>
        {profile.attributes.map((attribute, index) => (
          <View key={attribute.id} style={styles.attributeCard}>
            <AttributeBar attribute={attribute} showLevel />
            <Text style={styles.attributeDescription}>
              {attribute.description}
            </Text>
          </View>
        ))}
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
    marginBottom: 24,
  },
  overallStats: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
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
  statTitle: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  attributesContainer: {
    padding: 20,
    gap: 16,
  },
  attributeCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  attributeDescription: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 12,
    lineHeight: 20,
  },
});