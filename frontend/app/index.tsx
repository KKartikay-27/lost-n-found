import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  // If there is no token (user is null), force login
  return user ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}
