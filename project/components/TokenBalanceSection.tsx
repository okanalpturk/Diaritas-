import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Play, Coins } from 'lucide-react-native';
import { adMobService } from '@/utils/adMobService';
import { useProfile } from '@/contexts/ProfileContext';
import { awardTokens } from '@/utils/tokenSystem';
import TokenDisplay from './TokenDisplay';

interface TokenBalanceSectionProps {
  showTitle?: boolean;
}

export default function TokenBalanceSection({ showTitle = true }: TokenBalanceSectionProps) {
  const [isAdReady, setIsAdReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, updateProfile } = useProfile();

  useEffect(() => {
    // Check ad availability periodically
    const checkAdAvailability = () => {
      setIsAdReady(adMobService.isRewardedAdReady());
    };

    checkAdAvailability();
    const interval = setInterval(checkAdAvailability, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleWatchAd = async () => {
    if (!profile || !isAdReady) return;

    setIsLoading(true);
    try {
      const adShown = await adMobService.showRewardedAd();
      
      if (adShown) {
        // Award 1 token for watching the ad
        const updatedProfile = awardTokens(profile, {
          amount: 1,
          reason: 'Watched reward ad',
          type: 'special',
        });

        await updateProfile(updatedProfile);
        
        Alert.alert(
          'Reward Earned!',
          'You earned 1 token for watching the ad!',
          [{ text: 'Awesome!' }]
        );
      } else {
        Alert.alert(
          'Ad Not Available',
          'No ads are available right now. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      Alert.alert(
        'Error',
        'Failed to show ad. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={styles.title}>Token Balance</Text>
      )}
      
      <Text style={styles.dailyLoginText}>Login daily to receive +1 token</Text>
      
      <View style={styles.contentContainer}>
        <View style={styles.balanceContainer}>
          <TokenDisplay tokens={profile.tokens} size="medium" />
        </View>

        <TouchableOpacity
          style={[
            styles.adButton,
            (!isAdReady || isLoading) && styles.adButtonDisabled
          ]}
          onPress={handleWatchAd}
          disabled={!isAdReady || isLoading}
        >
          <View style={styles.buttonContent}>
            <View style={styles.titleRow}>
              <Play size={20} color="#1a1a2e" />
              <Text style={styles.buttonTitle}>
                {isLoading ? 'Loading Ad...' : 'Watch Ad'}
              </Text>
            </View>
            <View style={styles.rewardInfo}>
              <Coins size={12} color="#1a1a2e" />
              <Text style={styles.rewardText}>+1</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: 12,
    textAlign: 'center',
  },
  dailyLoginText: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: 16,
  },
  balanceContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 60,
  },
  adButton: {
    flex: 1,
    backgroundColor: '#ffd700',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 60,
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  adButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    alignItems: 'center',
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonTitle: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: '500',
  },
});