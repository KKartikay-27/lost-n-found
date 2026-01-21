import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';

export default function Button({ title, onPress, variant }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === 'danger' && { backgroundColor: Colors.danger },
        variant === 'secondary' && { backgroundColor: '#E2E8F0' },
      ]}
    >
      <Text style={[
        styles.text,
        variant === 'secondary' && { color: Colors.text },
      ]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
  },
});
