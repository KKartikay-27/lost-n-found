import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../src/api/axios';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { uploadImageToCloudinarySigned } from '../../src/utils/cloudinaryUpload';

export default function AddItem() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    type: 'lost' as 'lost' | 'found',
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to upload an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your camera to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };
  const showImagePicker = () => {
    Alert.alert('Add Image', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
    ]);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      Alert.alert('Missing fields', 'Please fill title, description, and location.');
      return;
    }
    try {
      setSubmitting(true);
      let imageUrl: string | undefined;
      if (imageUri) {
        try {
          // Signed upload via backend signature; optionally set a folder name
          imageUrl = await uploadImageToCloudinarySigned(imageUri, 'lostnfound');
        } catch (err: any) {
          console.warn('Image upload skipped:', err?.message || err);
        }
      }
      await api.post('/items', { ...form, imageUrl });
      router.back();
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Unable to post item. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ padding: 24, gap: 12 }} edges={['top']}>
      <Stack.Screen options={{ title: 'Add Item' }} />
      <Input placeholder="Title" onChangeText={(v: string) => setForm({ ...form, title: v })} />
      <Input placeholder="Description" onChangeText={(v: string) => setForm({ ...form, description: v })} />
      <Input placeholder="Location" onChangeText={(v: string) => setForm({ ...form, location: v })} />
      <Input placeholder="Category (optional)" onChangeText={(v: string) => setForm({ ...form, category: v })} />
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4, marginBottom: 8 }}>
        <Button
          title="Lost"
          variant={form.type === 'lost' ? 'primary' : 'secondary'}
          onPress={() => setForm({ ...form, type: 'lost' })}
        />
        <Button
          title="Found"
          variant={form.type === 'found' ? 'primary' : 'secondary'}
          onPress={() => setForm({ ...form, type: 'found' })}
        />
      </View>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
      ) : null}
      <Button title={imageUri ? 'Change Image' : 'Add Image'} onPress={showImagePicker} />
      <Button title={submitting ? 'Posting…' : 'Post Item'} onPress={submit} disabled={submitting} />
    </SafeAreaView>
  );
}
