import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

const ChatbotScreen = ({ isVisible, onClose, apiKey }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('Quechua');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) {
    return null;
  }

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, from: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente que solo habla en ${language} y responde preguntas sobre las páginas de la aplicación móvil. Páginas: Login, Mapa de centros de votación, Candidatos, Cronograma, Electores, Miembros de Mesa. Pregunta: "${input}"`,
                },
              ],
            },
          ],
        }
      );

      const botMessage = {
        text: response.data.candidates[0].content.parts[0].text.trim(),
        from: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching response from Gemini:', error);
      const errorMessage = {
        text: 'Disculpa, no puedo responder en este momento.',
        from: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isExpanded ? styles.expanded : styles.collapsed]}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
        <Text style={styles.expandButtonText}>{isExpanded ? '▼' : '▲'}</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Asistente en {language}</Text>
      <View style={styles.languageSelector}>
        <TouchableOpacity onPress={() => setLanguage('Quechua')} style={[styles.languageButton, language === 'Quechua' && styles.selectedLanguage]}>
          <Text style={styles.languageButtonText}>Quechua</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLanguage('Aymara')} style={[styles.languageButton, language === 'Aymara' && styles.selectedLanguage]}>
          <Text style={styles.languageButtonText}>Aymara</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.from === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={msg.from === 'user' ? styles.userMessageText : styles.botMessageText}>{msg.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator size="small" color="#007AFF" />}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  collapsed: {
    width: 200,
    height: 100,
  },
  expanded: {
    width: 300,
    height: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  expandButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  languageButton: {
    backgroundColor: '#e5e5ea',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedLanguage: {
    backgroundColor: '#007AFF',
  },
  languageButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageBubble: {
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  botMessage: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  userMessageText: {
    fontSize: 16,
    color: '#fff',
  },
  botMessageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#bdc3c7',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatbotScreen;
