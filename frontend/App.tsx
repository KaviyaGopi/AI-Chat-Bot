import React from 'react';
import { SafeAreaView } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext'; 
import ChatScreen from './src/screens/ChatScreen';


const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider>
      <ChatScreen />
      </ThemeProvider>
   </SafeAreaView>
  );
};

export default App;
