import React from 'react';
import { View } from 'react-native';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle';
}

// Web implementation - returns null since AdMob is not supported on web
export default function AdBanner({ size = 'banner' }: AdBannerProps) {
  return null;
}