import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', 
        { email, password });
      await login({
        userId: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        upiId: res.data.upiId,
      }, res.data.token);
    } catch (e) {
      Alert.alert('Error', 
        e.response?.data?.message || 
        'Login failed');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === 'ios' ? 
        'padding' : 'height'}>
      <ScrollView 
        contentContainerStyle={styles.scroll}>
        <View style={styles.heroSection}>
          <Text style={styles.logo}>NetZero</Text>
          <Text style={styles.tagline}>
            Travel Smart. Split Sharp.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Welcome Back 👋
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>
                  Login
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => 
              navigation.navigate('Register')}>
            <Text style={styles.link}>
              No account? Register here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2463' },
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },
  heroSection: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 },
  logo: { fontSize: 46, fontWeight: '900', color: '#ffffff', letterSpacing: 1 },
  tagline: { fontSize: 16, color: '#99D1FF', marginTop: 8, fontWeight: '500' },
  card: { 
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 30, paddingBottom: 50, elevation: 20,
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: -5 }, shadowRadius: 15
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 24 },
  input: { 
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 16, fontSize: 16,
    marginBottom: 16, backgroundColor: '#F9FAFB' 
  },
  button: { 
    backgroundColor: '#008cff',
    borderRadius: 12, padding: 18,
    alignItems: 'center', marginTop: 10,
    shadowColor: '#008cff', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 24, color: '#0A2463', fontSize: 15, fontWeight: '600' },
});