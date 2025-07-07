import React from 'react';
import { View } from 'react-native';

interface TokenWarningProps {
  tokens: number;
  onGetMoreTokens?: () => void;
}

export default function TokenWarning({ tokens, onGetMoreTokens }: TokenWarningProps) {
  // Component now returns nothing - effectively removing the warning
  return null;
}