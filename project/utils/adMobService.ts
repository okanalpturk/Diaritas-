import { UserProfile } from '@/types';

export interface TokenReward {
  amount: number;
  reason: string;
  type: 'daily_login' | 'streak_bonus' | 'achievement' | 'special';
}

// Web implementation - AdMob service stub for web platform
export class AdMobService {
  private static instance: AdMobService;

  private constructor() {}

  public static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  public async initialize(): Promise<void> {
    console.log('AdMob not available on web platform');
  }

  public async loadRewardedAd(): Promise<void> {
    // No-op on web
  }

  public async showRewardedAd(): Promise<boolean> {
    return false;
  }

  public isRewardedAdReady(): boolean {
    return false;
  }

  public getBannerAdUnitId(): string | undefined {
    return undefined;
  }
}

// Export singleton instance
export const adMobService = AdMobService.getInstance();