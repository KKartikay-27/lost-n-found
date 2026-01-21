import AsyncStorage from '@react-native-async-storage/async-storage';

export const setToken = (token: string) =>
  AsyncStorage.setItem('token', token);

export const getToken = () =>
  AsyncStorage.getItem('token');
