import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const ChatScreen = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [personality, setPersonality] = useState('friendly');
  const [input, setInput] = useState('');

  const BASE_URL = "https://5346-129-49-252-184.ngrok-free.app"; // Backend URL

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setInput('');

    try {
      // Step 1: Send message to backend for safety & scam check
      const safetyResponse = await axios.post(`${BASE_URL}/check-safety`, { message: input });

      if (safetyResponse.data.isUnsafe) {
        setMessages((prev) => [...prev, { role: 'bot', content: safetyResponse.data.filteredText }]);
        return; // Stop further processing
      }

      // Step 2: Send to chat endpoint only if safe
      const response = await axios.post(`${BASE_URL}/chat`, { userId: 'user123', message: input, personality });

      setMessages((prev) => [...prev, { role: 'bot', content: response.data.reply }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [...prev, { role: 'bot', content: "Oops! Something went wrong. Try again later." }]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>Personal AI Chatbot</Text>
      <Switch value={darkMode} onValueChange={toggleTheme} />

      <Picker
        selectedValue={personality}
        onValueChange={(value) => setPersonality(value)}
        style={{ color: darkMode ? '#fff' : '#000' }}
      >
        <Picker.Item label="Professional Assistant" value="professional" />
        <Picker.Item label="Friendly Buddy" value="friendly" />
        <Picker.Item label="Witty Comedian" value="witty" />
      </Picker>

      <ChatMessages messages={messages} />
      <ChatInput input={input} setInput={setInput} onSend={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
});

export default ChatScreen;
