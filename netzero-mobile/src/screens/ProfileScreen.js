import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator,
  StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, login } = useAuth();
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiInput,   setUpiInput]   = useState(user?.upiId || '');
  const [saving,     setSaving]     = useState(false);

  const handleSaveUpi = async () => {
    setSaving(true);
    // Update is stored locally since backend doesn't have a profile update endpoint yet
    // We update auth context only
    await login(
      { ...user, upiId: upiInput },
      null // token is separately handled in AsyncStorage
    );
    setEditingUpi(false);
    setSaving(false);
    Alert.alert('Saved', 'UPI ID updated!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C3FF5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Avatar + name card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Info</Text>
          <InfoRow icon="✉️" label="Email" value={user?.email} />
          <View style={styles.divider} />

          {/* UPI ID (editable) */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>UPI ID</Text>
              {editingUpi ? (
                <View style={styles.upiEditRow}>
                  <TextInput
                    style={styles.upiInput}
                    value={upiInput}
                    onChangeText={setUpiInput}
                    placeholder="name@okicici"
                    autoCapitalize="none"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.saveBtnSmall}
                    onPress={handleSaveUpi}
                    disabled={saving}
                  >
                    {saving
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.saveBtnText}>Save</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.upiRow}>
                  <Text style={styles.infoValue}>
                    {user?.upiId || 'Not set'}
                  </Text>
                  <TouchableOpacity onPress={() => setEditingUpi(true)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tips card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 How NetZero Works</Text>
          <Text style={styles.tipItem}>
            1. Create a trip & add friends
          </Text>
          <Text style={styles.tipItem}>
            2. Add expenses with who paid & splits
          </Text>
          <Text style={styles.tipItem}>
            3. Hit "Optimize" — our algorithm minimizes transactions
          </Text>
          <Text style={styles.tipItem}>
            4. Pay via UPI deep link — one tap!
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>NetZero v1.0 · Made with ❤️</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingTop: 52,
    backgroundColor: '#6C3FF5',
  },
  back: { color: '#fff', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  avatarCard: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 24, alignItems: 'center',
    marginBottom: 16, elevation: 2,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6C3FF5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 16, elevation: 2,
  },
  cardTitle: {
    fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  infoIcon: { fontSize: 22, marginTop: 2 },
  infoLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase' },
  infoValue: { fontSize: 15, color: '#1a1a1a', fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editLink: { color: '#6C3FF5', fontSize: 14, fontWeight: '600' },
  upiEditRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  upiInput: {
    flex: 1, borderWidth: 1.5, borderColor: '#6C3FF5',
    borderRadius: 10, padding: 10, fontSize: 14,
  },
  saveBtnSmall: {
    backgroundColor: '#6C3FF5', borderRadius: 10,
    paddingHorizontal: 14, justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  tipsCard: {
    backgroundColor: '#EDE9FE', borderRadius: 16, padding: 18, marginBottom: 20,
  },
  tipsTitle: { fontSize: 15, fontWeight: 'bold', color: '#5B21B6', marginBottom: 10 },
  tipItem: { fontSize: 13, color: '#5B21B6', marginBottom: 6 },
  logoutBtn: {
    backgroundColor: '#FEE2E2', borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 16,
  },
  logoutText: { color: '#DC2626', fontSize: 16, fontWeight: 'bold' },
  version: { textAlign: 'center', color: '#aaa', fontSize: 12, marginBottom: 20 },
});
