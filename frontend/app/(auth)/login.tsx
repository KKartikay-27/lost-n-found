import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import api from '../../src/api/axios';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { useAuth } from '../../src/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      const message = e?.response?.status === 401
        ? 'Invalid email or password.'
        : (e?.response?.data?.message || 'Login failed, please try again.');
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Welcome Back</Text>
      <Input placeholder="Email" onChangeText={(v: string) => setEmail(v)} />
      <Input placeholder="Password" secureTextEntry onChangeText={(v: string) => setPassword(v)} />
      <Button title={submitting ? 'Logging in...' : 'Login'} onPress={handleLogin} />
      <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
        Create an account
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  link: { marginTop: 16, textAlign: 'center', color: '#2563EB' },
});
