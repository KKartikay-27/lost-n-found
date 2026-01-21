import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Derive LAN IP from Expo when on a physical device; fallback to emulator defaults
const expoHostUri: string | undefined =
  // @ts-ignore - different Expo versions expose different shapes
  (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

let baseHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
if (expoHostUri) {
  const h = String(expoHostUri).split(':')[0];
  if (h && h !== '127.0.0.1' && h !== 'localhost') baseHost = h;
}

const api = axios.create({ baseURL: `http://${baseHost}:5050/api`, timeout: 8000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);

export default api;
