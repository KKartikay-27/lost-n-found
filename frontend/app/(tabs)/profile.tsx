import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import api from '../../src/api/axios';
import Button from '../../src/components/Button';
import { Colors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const [myCount, setMyCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  const initials = useMemo(() => {
    const n = user?.name || '';
    const parts = n.trim().split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join('') || 'U';
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/items/my-items');
        const items = Array.isArray(res.data) ? res.data : [];
        setMyCount(items.length);
        setResolvedCount(items.filter((item: any) => item.isResolved).length);
      } catch {}
    };
    load();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.row}> 
            <Ionicons name="mail-outline" size={16} color={Colors.gray} />
            <Text style={styles.meta}>{user?.email}</Text>
          </View>
          {user?.phone ? (
            <View style={styles.row}> 
              <Ionicons name="call-outline" size={16} color={Colors.gray} />
              <Text style={styles.meta}>{user?.phone}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="albums-outline" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{myCount}</Text>
          <Text style={styles.statLabel}>My Posts</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-outline" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{resolvedCount}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <Button title="Logout" variant="danger" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, backgroundColor: '#F8FAFC' },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0EAFF',
  },
  avatarText: { color: Colors.primary, fontSize: 22, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  meta: { color: Colors.gray },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text },
  statLabel: { color: Colors.gray },
});
