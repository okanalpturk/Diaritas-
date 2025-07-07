import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Coins } from 'lucide-react-native';

interface TokenDisplayProps {
  tokens: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function TokenDisplay({ tokens, size = 'medium', showIcon = true }: TokenDisplayProps) {
  const getStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          icon: 16,
          text: styles.tokenTextSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          icon: 32,
          text: styles.tokenTextLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          icon: 24,
          text: styles.tokenTextMedium,
        };
    }
  };

  const styleConfig = getStyles();

  return (
    <View style={[styles.container, styleConfig.container]}>
      {showIcon && <Coins size={styleConfig.icon} color="#ffd700" />}
      <Text style={[styles.tokenText, styleConfig.text]}>{tokens || 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSmall: {
    gap: 4,
  },
  containerMedium: {
    gap: 6,
  },
  containerLarge: {
    gap: 8,
  },
  tokenText: {
    color: '#ffd700',
    fontWeight: '600',
  },
  tokenTextSmall: {
    fontSize: 16,
  },
  tokenTextMedium: {
    fontSize: 24,
  },
  tokenTextLarge: {
    fontSize: 28,
  },
});