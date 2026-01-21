import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import api from '../../src/api/axios';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Missing info', 'Please enter name, email, and password.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/auth/register', form);
      router.replace('/(auth)/login');
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Registration failed, please try again.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Create Account</Text>
      <Input placeholder="Name" onChangeText={(v: string) => setForm({ ...form, name: v })} />
      <Input placeholder="Email" onChangeText={(v: string) => setForm({ ...form, email: v })} />
      <Input placeholder="Password" secureTextEntry onChangeText={(v: string) => setForm({ ...form, password: v })} />
      <Button title={submitting ? 'Registering...' : 'Register'} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
});
