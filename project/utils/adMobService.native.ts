import { Platform } from 'react-native';
import { UserProfile } from '@/types';

// AdMob service for handling ads across the app
export class AdMobService {
  private static instance: AdMobService;
  private isInitialized = false;
  private rewardedAd: any = null;
  private isRewardedAdLoaded = false;

  // AdMob Ad Unit IDs (replace with your actual IDs)
  private readonly AD_UNIT_IDS = {
    // Test IDs - replace with your actual AdMob unit IDs
    banner: Platform.select({
      ios: 'ca-app-pub-3940256099942544/2934735716', // Test banner ID
      android: 'ca-app-pub-3940256099942544/6300978111', // Test banner ID
    }),
    rewarded: Platform.select({
      ios: 'ca-app-pub-3940256099942544/1712485313', // Test rewarded ID
      android: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ID
    }),
  };

  private constructor() {}

  public static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  public async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('AdMob not available on web platform');
      return;
    }

    try {
      // Check if the module exists before importing
      const GoogleMobileAdsModule = await import('react-native-google-mobile-ads').catch(() => null);
      
      if (!GoogleMobileAdsModule) {
        console.log('react-native-google-mobile-ads not available');
        return;
      }
      
      const GoogleMobileAds = GoogleMobileAdsModule.GoogleMobileAds || GoogleMobileAdsModule.default;
      
      if (GoogleMobileAds && typeof GoogleMobileAds.initialize === 'function') {
        await GoogleMobileAds.initialize();
      } else if (typeof GoogleMobileAds === 'function') {
        await GoogleMobileAds().initialize();
      } else {
        console.log('GoogleMobileAds initialization method not found');
        return;
      }
      
      this.isInitialized = true;
      console.log('AdMob initialized successfully');
      
      // Load rewarded ad immediately
      await this.loadRewardedAd();
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  public async loadRewardedAd(): Promise<void> {
    if (Platform.OS === 'web' || !this.isInitialized) return;

    try {
      const GoogleMobileAdsModule = await import('react-native-google-mobile-ads').catch(() => null);
      
      if (!GoogleMobileAdsModule) {
        console.log('react-native-google-mobile-ads not available for rewarded ads');
        return;
      }
      
      const { RewardedAd, RewardedAdEventType, TestIds } = GoogleMobileAdsModule;
      
      const adUnitId = this.AD_UNIT_IDS.rewarded || TestIds.REWARDED;
      this.rewardedAd = RewardedAd.createForAdRequest(adUnitId);

      // Set up event listeners
      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isRewardedAdLoaded = true;
        console.log('Rewarded ad loaded');
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward: any) => {
        console.log('User earned reward:', reward);
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        this.isRewardedAdLoaded = false;
        // Reload ad for next time
        this.loadRewardedAd();
      });

      // Load the ad
      await this.rewardedAd.load();
    } catch (error) {
      console.error('Failed to load rewarded ad:', error);
    }
  }

  public async showRewardedAd(): Promise<boolean> {
    if (Platform.OS === 'web' || !this.isInitialized || !this.isRewardedAdLoaded) {
      return false;
    }

    try {
      await this.rewardedAd?.show();
      return true;
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return false;
    }
  }

  public isRewardedAdReady(): boolean {
    return Platform.OS !== 'web' && this.isInitialized && this.isRewardedAdLoaded;
  }

  public getBannerAdUnitId(): string | undefined {
    if (Platform.OS === 'web') return undefined;
    return this.AD_UNIT_IDS.banner;
  }
}

// Export singleton instance
export const adMobService = AdMobService.getInstance();