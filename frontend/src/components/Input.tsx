import { TextInput, StyleSheet } from 'react-native';

export default function Input(props: any) {
  return (
    <TextInput
      {...props}
      style={styles.input}
      placeholderTextColor="#94A3B8"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
