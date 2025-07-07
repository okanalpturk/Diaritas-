import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Attribute } from '@/types';
import { getAttributeLevel } from '@/utils/attributes';
import { getAttributeIcon } from '@/utils/attributeIcons';
import { useProfile } from '@/contexts/ProfileContext';

interface AttributeBarProps {
  attribute: Attribute;
  showLevel?: boolean;
}

export default function AttributeBar({ attribute, showLevel = false }: AttributeBarProps) {
  const { history } = useProfile();
  const percentage = Math.max(0, Math.min(100, (attribute.value / Math.max(attribute.value, 100)) * 100));
  const level = getAttributeLevel(attribute.value);
  const IconComponent = getAttributeIcon(attribute.id);

  // Get the most recent change for this attribute
  const getRecentChange = () => {
    // Look through only the last history entry for changes to this attribute
    const recentEntries = history.slice(0, 1);
    
    for (const entry of recentEntries) {
      if (entry.type === 'reflection' && entry.attributeChanges) {
        const change = entry.attributeChanges.find(
          change => change.attribute.toLowerCase() === attribute.id.toLowerCase()
        );
        if (change && change.change !== 0) {
          return change.change;
        }
      }
    }
    return null;
  };

  const recentChange = getRecentChange();

  const getBarColor = () => {
    // If there's a recent change, use green/red colors
    if (recentChange !== null) {
      return recentChange > 0 ? '#4ade80' : '#f87171';
    }
    
    // Default color based on value
    if (percentage >= 80) return '#ffd700';
    if (percentage >= 60) return '#8b5cf6';
    if (percentage >= 40) return '#06b6d4';
    if (percentage >= 20) return '#10b981';
    return '#6b7280';
  };

  const getBarGlow = () => {
    if (recentChange !== null) {
      return {
        shadowColor: recentChange > 0 ? '#4ade80' : '#f87171',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 4,
      };
    }
    return {};
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <IconComponent 
            size={18} 
            color={recentChange !== null ? (recentChange > 0 ? '#4ade80' : '#f87171') : '#ffd700'} 
          />
          <Text style={styles.attributeName}>{attribute.name}</Text>
          {recentChange !== null && (
            <View style={[
              styles.changeIndicator,
              { backgroundColor: recentChange > 0 ? '#4ade80' : '#f87171' }
            ]}>
              <Text style={styles.changeText}>
                {recentChange > 0 ? '+' : ''}{recentChange}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.attributeValue}>{attribute.value}</Text>
      </View>
      
      <View style={styles.barContainer}>
        <View style={[styles.barBackground, getBarGlow()]}>
          <View 
            style={[
              styles.barFill,
              { 
                width: `${percentage}%`,
                backgroundColor: getBarColor(),
              }
            ]}
          />
        </View>
      </View>
      
      {showLevel && (
        <Text style={[styles.levelText, { color: getBarColor() }]}>
          {level}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  attributeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  changeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  attributeValue: {
    fontSize: 14,
    color: '#ffd700',
    fontWeight: '600',
  },
  barContainer: {
    marginBottom: 4,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});