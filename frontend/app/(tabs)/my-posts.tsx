import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import api from '../../src/api/axios';
import ItemCard from '../../src/components/ItemCard';
import { useAuth } from '../../src/context/AuthContext';

export default function MyPosts() {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/items/my-items');
      setItems(res.data);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        setItems([]);
      }
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={{ padding: 16, gap: 12, flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => <ItemCard item={item} onPress={() => router.push(`/item/${item._id}`)} />}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

