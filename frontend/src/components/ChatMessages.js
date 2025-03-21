import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ChatMessages = ({ messages }) => {
  const { darkMode } = useTheme();

  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => (
        <View style={[styles.message, item.role === 'user' ? styles.userMessage : styles.botMessage, 
          { backgroundColor: darkMode ? (item.role === 'user' ? '#4caf50' : '#444') : (item.role === 'user' ? '#d3f8d3' : '#f0f0f0') }
        ]}>
          <Text style={{ color: darkMode ? '#fff' : '#000' }}>{item.content}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
});

export default ChatMessages;
