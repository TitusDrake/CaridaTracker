import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Button, Text, HelperText, Surface } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>Reset Password</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        {error ? (
          <HelperText type="error" visible={true} style={styles.messageText}>
            {error}
          </HelperText>
        ) : null}

        {success ? (
          <Surface style={styles.successContainer} elevation={0}>
            <Text variant="bodyMedium" style={styles.successText}>
              If an account exists with this email, you will receive password reset instructions shortly.
            </Text>
          </Surface>
        ) : null}

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            disabled={isLoading || success}
            mode="outlined"
            style={styles.input}
          />

          {!success ? (
            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
              style={styles.resetButton}
              contentStyle={styles.buttonContent}
            >
              Send Reset Link
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => router.replace('/login')}
              style={styles.resetButton}
              contentStyle={styles.buttonContent}
            >
              Back to Login
            </Button>
          )}

          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            {success ? 'Send another reset link' : 'Back to Login'}
          </Button>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 22,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  successContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#34C759',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  resetButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  backButton: {
    marginTop: 8,
  },
});
