import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../src/api/axios';
import Button from '../../src/components/Button';
import { useAuth } from '../../src/context/AuthContext';

export default function ItemDetail() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/items/${id}`).then(res => setItem(res.data));
  }, []);

  if (!item) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Item' }} />
      {item.imageUrl && (
        <TouchableOpacity onPress={() => router.push({ pathname: '/item/image', params: { uri: item.imageUrl } })}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text style={styles.meta}>{item.location}</Text>
      {item.postedBy && (
        <View style={styles.postedBy}>
          <Text style={styles.postedByLabel}>Posted by</Text>
          <Text style={styles.postedByName}>{item.postedBy.name}</Text>
          <Text style={styles.postedByEmail}>{item.postedBy.email}</Text>
        </View>
      )}
      {user?.id === item?.postedBy?._id && (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          {!item.isResolved && (
            <Button
              title="Mark Resolved"
              onPress={async () => {
                try {
                  await api.patch(`/items/${id}/resolve`);
                  const res = await api.get(`/items/${id}`);
                  setItem(res.data);
                } catch (e: any) {
                  Alert.alert('Error', e?.response?.data?.message || 'Failed to resolve');
                }
              }}
            />
          )}
          <Button
            title="Delete"
            variant="danger"
            onPress={() => {
              Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await api.delete(`/items/${id}`);
                      router.back();
                    } catch (e: any) {
                      Alert.alert('Error', e?.response?.data?.message || 'Failed to delete');
                    }
                  },
                },
              ]);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { marginTop: 8, color: '#64748B' },
  postedBy: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  postedByLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  postedByName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  postedByEmail: { fontSize: 14, color: '#64748B', marginTop: 2 },
});
