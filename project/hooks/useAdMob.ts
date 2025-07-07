import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { adMobService } from '@/utils/adMobService';

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRewardedAdReady, setIsRewardedAdReady] = useState(false);

  useEffect(() => {
    const initializeAdMob = async () => {
      if (Platform.OS === 'web') {
        return;
      }

      try {
        await adMobService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AdMob:', error);
      }
    };

    initializeAdMob();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Check rewarded ad status periodically
    const checkRewardedAdStatus = () => {
      setIsRewardedAdReady(adMobService.isRewardedAdReady());
    };

    checkRewardedAdStatus();
    const interval = setInterval(checkRewardedAdStatus, 2000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  return {
    isInitialized,
    isRewardedAdReady,
    isAvailable: Platform.OS !== 'web',
  };
}