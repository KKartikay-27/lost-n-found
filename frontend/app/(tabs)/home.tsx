import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import api from '../../src/api/axios';
import Button from '../../src/components/Button';
import ItemCard from '../../src/components/ItemCard';

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const qs = filter === 'all' ? '' : `?type=${filter}`;
    const res = await api.get(`/items${qs}`);
    setItems(res.data);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 12, flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="All" variant={filter === 'all' ? 'primary' : 'secondary'} onPress={() => setFilter('all')} />
        <Button title="Lost" variant={filter === 'lost' ? 'primary' : 'secondary'} onPress={() => setFilter('lost')} />
        <Button title="Found" variant={filter === 'found' ? 'primary' : 'secondary'} onPress={() => setFilter('found')} />
        <View style={{ flex: 1 }} />
        <Button title="Add" onPress={() => router.push('/item/add')} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={() => router.push(`/item/${item._id}`)} />
        )}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

