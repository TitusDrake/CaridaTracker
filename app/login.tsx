import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      setError('Please enter email/username and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(emailOrUsername, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
        <Text variant="headlineLarge" style={styles.title}>CaridaTracker</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Sign in to continue</Text>

        {error ? (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {error}
          </HelperText>
        ) : null}

        <View style={styles.formContainer}>
          <TextInput
            label="Email or Username"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            autoCapitalize="none"
            autoComplete="username"
            disabled={isLoading}
            mode="outlined"
            style={styles.input}
            placeholder="Enter your email or username"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            disabled={isLoading}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
          >
            Login
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/forgot-password')}
            style={styles.forgotPassword}
          >
            Forgot Password?
          </Button>

          <View style={styles.createAccountContainer}>
            <Text variant="bodyMedium" style={styles.createAccountText}>
              {"Don't have an account?"}{' '}
            </Text>
            <Button
              mode="text"
              onPress={() => router.push('/register')}
              compact
              style={styles.signUpButton}
              labelStyle={styles.signUpLabel}
            >
              Sign Up
            </Button>
          </View>
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
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  forgotPassword: {
    marginTop: 8,
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  createAccountText: {
    opacity: 0.7,
  },
  signUpButton: {
    marginLeft: -8,
  },
  signUpLabel: {
    fontWeight: '600',
  },
});
