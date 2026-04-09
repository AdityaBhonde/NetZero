import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, StatusBar
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const EMOJIS = ['✈️','🏖️','🏔️','🍕','🎉','🚗','🏨','🌍','🎒','👨‍👩‍👧'];

export default function CreateGroupScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget]           = useState('');
  const [emoji, setEmoji]             = useState('✈️');
  const [loading, setLoading]         = useState(false);

  // Member add state (shown after group creation)
  const [groupId, setGroupId]         = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [members, setMembers]         = useState([]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Trip name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/groups', {
        name: `${emoji} ${name.trim()}`,
        description,
        totalBudget: budget ? parseFloat(budget) : null,
        createdBy: user.userId,
        memberIds: [user.userId],
        status: 'ACTIVE',
      });
      setGroupId(res.data.id);
      setMembers([{ name: user.name, email: user.email, self: true }]);
    } catch (e) {
      Alert.alert('Error', 'Failed to create trip');
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      // Search user by email
      const searchRes = await api.get(
        `/users/search?email=${memberEmail.trim().toLowerCase()}`
      );
      const found = searchRes.data;
      // Add to group
      await api.post(
        `/groups/${groupId}/members?userId=${found.userId}`
      );
      setMembers(prev => [...prev, found]);
      setMemberEmail('');
      Alert.alert('✅ Added', `${found.name} added to the trip!`);
    } catch (e) {
      Alert.alert(
        'Not Found',
        'No user found with that email. Make sure they are registered.'
      );
    }
    setAddingMember(false);
  };

  const handleDone = () => {
    Alert.alert('🎉 Trip Created!', `"${emoji} ${name}" is ready!`, [
      { text: 'Go to Trip', onPress: () => navigation.goBack() }
    ]);
  };

  // ─── Step 2: Member add UI (after group creation) ───
  if (groupId) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6C3FF5" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Members</Text>
        </View>

        <ScrollView style={{ padding: 20 }}>
          <View style={styles.successBanner}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successText}>
              "{emoji} {name}" created!
            </Text>
            <Text style={styles.successSub}>
              Now add your travel buddies
            </Text>
          </View>

          <Text style={styles.label}>Add by Email</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="friend@email.com"
              value={memberEmail}
              onChangeText={setMemberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddMember}
              disabled={addingMember}
            >
              {addingMember
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.addBtnText}>Add</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.membersLabel}>
            Members ({members.length})
          </Text>
          {members.map((m, i) => (
            <View key={i} style={styles.memberChip}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {m.name?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.memberName}>
                  {m.name} {m.self ? '(you)' : ''}
                </Text>
                <Text style={styles.memberEmail}>{m.email}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>Done — Go to Trip 🚀</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── Step 1: Create group form ───
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C3FF5" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Trip</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ padding: 20 }}>
        {/* Emoji Picker */}
        <Text style={styles.label}>Pick an emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}>
          {EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emojiBtnText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Trip Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Goa 2025"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="What's this trip about?"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Total Budget (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 20000 (optional)"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create Trip & Add Members →</Text>
          }
        </TouchableOpacity>
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
  label: {
    fontSize: 14, fontWeight: '600', color: '#444',
    marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0',
  },
  emojiBtn: {
    width: 48, height: 48, borderRadius: 12, marginRight: 8,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#E0E0E0',
    justifyContent: 'center', alignItems: 'center',
  },
  emojiBtnActive: { borderColor: '#6C3FF5', backgroundColor: '#EDE9FE' },
  emojiBtnText: { fontSize: 22 },
  button: {
    backgroundColor: '#6C3FF5', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 28, marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successBanner: {
    backgroundColor: '#EDE9FE', borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20,
  },
  successIcon: { fontSize: 40, marginBottom: 8 },
  successText: { fontSize: 18, fontWeight: 'bold', color: '#5B21B6' },
  successSub: { fontSize: 13, color: '#7C3AED', marginTop: 4 },
  searchRow: { flexDirection: 'row', gap: 10 },
  addBtn: {
    backgroundColor: '#6C3FF5', borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  membersLabel: {
    fontSize: 14, fontWeight: '600', color: '#444',
    marginTop: 20, marginBottom: 10,
  },
  memberChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginBottom: 8, gap: 12,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6C3FF5', justifyContent: 'center', alignItems: 'center',
  },
  memberAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  memberName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  memberEmail: { fontSize: 12, color: '#888', marginTop: 2 },
  doneBtn: {
    backgroundColor: '#22C55E', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});