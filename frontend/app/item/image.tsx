import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

export default function FullImage() {
  const { uri } = useLocalSearchParams<{ uri: string }>();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Image' }} />
      <Image source={{ uri }} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
