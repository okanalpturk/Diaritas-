import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, PromptResponse } from '@/types';
import { initialAttributes } from './attributes';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  PROMPT_HISTORY: 'prompt_history'
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      const profile = JSON.parse(data);
      return {
        ...profile,
        lastPromptDate: profile.lastPromptDate ? new Date(profile.lastPromptDate) : null
      };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
  }
  
  return {
    attributes: initialAttributes,
    totalPrompts: 0,
    streak: 0,
    lastPromptDate: null,
    characterName: undefined,
    isFirstTime: true,
    tokens: 30,
    totalTokensEarned: 30,
    totalTokensSpent: 0
  };
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const profileToSave = {
      ...profile,
      lastPromptDate: profile.lastPromptDate ? profile.lastPromptDate.toISOString() : null
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileToSave));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

export const getPromptHistory = async (): Promise<PromptResponse[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    if (data) {
      const history = JSON.parse(data);
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        // Ensure all required fields are present
        id: item.id || Date.now().toString(),
        prompt: item.prompt || '',
        analysis: item.analysis || '',
        attributeChanges: item.attributeChanges || []
      }));
    }
  } catch (error) {
    console.error('Error getting prompt history:', error);
  }
  
  return [];
};

export const savePromptHistory = async (history: PromptResponse[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROMPT_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving prompt history:', error);
  }
};

export const addPromptToHistory = async (response: PromptResponse): Promise<void> => {
  try {
    const history = await getPromptHistory();
    history.unshift(response);
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(100);
    }
    await savePromptHistory(history);
  } catch (error) {
    console.error('Error adding prompt to history:', error);
  }
};

export const resetUserData = async (): Promise<void> => {
  try {
    // Clear all stored data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.PROMPT_HISTORY
    ]);
    console.log('User data reset successfully');
  } catch (error) {
    console.error('Error resetting user data:', error);
    throw error;
  }
};