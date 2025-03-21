import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ChatInput = ({ input, setInput, onSend }) => {
  const { darkMode } = useTheme();

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' },
        ]}
        value={input}
        onChangeText={setInput}
        placeholder="Type a message..."
        placeholderTextColor={darkMode ? '#aaa' : '#555'}
      />
      <TouchableOpacity style={styles.button} onPress={onSend}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  input: { flex: 1, borderWidth: 1, padding: 10, borderRadius: 5, marginRight: 10 },
  button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ChatInput;
