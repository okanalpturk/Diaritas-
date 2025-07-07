import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Sparkles, User } from 'lucide-react-native';

interface CharacterSetupProps {
  visible: boolean;
  onComplete: (name: string) => void;
}

export default function CharacterSetup({ visible, onComplete }: CharacterSetupProps) {
  const [characterName, setCharacterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!characterName.trim()) return;
    
    setIsSubmitting(true);
    // Add a small delay for better UX
    setTimeout(() => {
      onComplete(characterName.trim());
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Sparkles size={48} color="#ffd700" />
            </View>
            <Text style={styles.title}>Welcome to Your RPG Life!</Text>
            <Text style={styles.subtitle}>
              Begin your journey with Diaritas by creating your character
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <User size={20} color="#ffd700" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your character name"
                placeholderTextColor="#666"
                value={characterName}
                onChangeText={setCharacterName}
                maxLength={30}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
            
            <Text style={styles.helperText}>
              Choose a name that represents your heroic journey
            </Text>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!characterName.trim() || isSubmitting) && styles.createButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!characterName.trim() || isSubmitting}
            >
              <Sparkles size={20} color="#1a1a2e" />
              <Text style={styles.createButtonText}>
                {isSubmitting ? 'Creating Character...' : 'Create Character'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Track your daily activities and watch your character grow stronger!
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 26,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    paddingVertical: 20,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#ffd700',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});