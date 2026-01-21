import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';

export default function ItemCard({ item, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {item.isResolved && <View style={styles.resolvedStrip} />}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.typePill, item.type === 'lost' ? styles.lost : styles.found]}>
            <Ionicons
              name={item.type === 'lost' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              color="#fff"
              size={14}
            />
            <Text style={styles.pillText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={Colors.gray} />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  resolvedStrip: {
    height: 4,
    backgroundColor: '#16A34A',
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { marginLeft: 4, color: Colors.gray },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  lost: { backgroundColor: '#F97316' },
  found: { backgroundColor: '#16A34A' },
});
