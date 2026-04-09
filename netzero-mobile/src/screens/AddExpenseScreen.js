import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, StatusBar, Linking
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { key: 'FOOD',       label: '🍕 Food' },
  { key: 'HOTEL',      label: '🏨 Hotel' },
  { key: 'TRAVEL',     label: '🚗 Travel' },
  { key: 'ACTIVITIES', label: '🎉 Activities' },
  { key: 'SHOPPING',   label: '🛒 Shopping' },
  { key: 'OTHER',      label: '💰 Other' },
];

const SPLIT_TYPES = [
  { key: 'EQUAL',      label: '⚖️ Equal' },
  { key: 'CUSTOM',     label: '✏️ Custom ₹' },
  { key: 'PERCENTAGE', label: '% Percent' },
];

export default function AddExpenseScreen({ route, navigation }) {
  const { groupId, members } = route.params;
  const { user } = useAuth();

  const [title,      setTitle]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [category,   setCategory]   = useState('FOOD');
  const [paidBy,     setPaidBy]     = useState(user.userId);
  const [splitType,  setSplitType]  = useState('EQUAL');
  const [splitAmong, setSplitAmong] = useState(members || []);
  const [customMap,  setCustomMap]  = useState({});   // { userId: '300' }
  const [pctMap,     setPctMap]     = useState({});   // { userId: '50' }
  const [loading,    setLoading]    = useState(false);

  const toggleMember = (id) => {
    setSplitAmong(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Per-person preview for EQUAL split
  const perPersonEqual =
    splitAmong.length > 0 && amount
      ? (parseFloat(amount) / splitAmong.length).toFixed(2)
      : null;

  // Percentage total
  const pctTotal = Object.values(pctMap)
    .reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const handleAdd = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Title and amount are required');
      return;
    }
    if (splitAmong.length === 0) {
      Alert.alert('Error', 'Select at least one person to split with');
      return;
    }
    if (splitType === 'PERCENTAGE' && Math.abs(pctTotal - 100) > 0.1) {
      Alert.alert('Error', `Percentages must add up to 100% (currently ${pctTotal.toFixed(1)}%)`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        amount: parseFloat(amount),
        category,
        paidBy,
        groupId,
        splitAmong,
        splitType,
        customSplits: splitType === 'CUSTOM'
          ? Object.fromEntries(
              Object.entries(customMap).map(([k, v]) => [k, parseFloat(v) || 0])
            )
          : splitType === 'PERCENTAGE'
          ? Object.fromEntries(
              Object.entries(pctMap).map(([k, v]) => [k, parseFloat(v) || 0])
            )
          : {},
      };
      await api.post('/expenses', payload);
      Alert.alert('✅ Added', 'Expense saved!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to add expense');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C3FF5" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ padding: 20 }}>
        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dinner at beach"
          value={title}
          onChangeText={setTitle}
        />

        {/* Amount */}
        <Text style={styles.label}>Amount (₹) *</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, category === cat.key && styles.chipActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.chipText, category === cat.key && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Paid By */}
        <Text style={styles.label}>Paid By</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 4 }}>
          {(members || []).map(memberId => (
            <TouchableOpacity
              key={memberId}
              style={[styles.chip, paidBy === memberId && styles.chipActive]}
              onPress={() => setPaidBy(memberId)}
            >
              <Text style={[styles.chipText, paidBy === memberId && styles.chipTextActive]}>
                {memberId === user.userId ? '👤 You' : `👤 ${memberId.slice(0, 8)}...`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Split Type */}
        <Text style={styles.label}>Split Type</Text>
        <View style={styles.splitRow}>
          {SPLIT_TYPES.map(st => (
            <TouchableOpacity
              key={st.key}
              style={[styles.splitBtn, splitType === st.key && styles.splitBtnActive]}
              onPress={() => setSplitType(st.key)}
            >
              <Text style={[styles.splitBtnText, splitType === st.key && styles.splitBtnTextActive]}>
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Split Among */}
        <Text style={styles.label}>Split Among</Text>
        <Text style={styles.hint}>Tap to toggle · {splitAmong.length} selected</Text>

        {splitType === 'EQUAL' && perPersonEqual && (
          <View style={styles.previewBanner}>
            <Text style={styles.previewText}>
              Each person pays ₹{perPersonEqual}
            </Text>
          </View>
        )}
        {splitType === 'PERCENTAGE' && (
          <View style={[styles.previewBanner,
            { backgroundColor: Math.abs(pctTotal - 100) < 0.1 ? '#DCFCE7' : '#FEF2F2' }]}>
            <Text style={styles.previewText}>
              Total: {pctTotal.toFixed(1)}% {Math.abs(pctTotal - 100) < 0.1 ? '✅' : '⚠️ must equal 100'}
            </Text>
          </View>
        )}

        {(members || []).map(memberId => {
          const isSelected = splitAmong.includes(memberId);
          return (
            <View key={memberId} style={styles.memberRow}>
              <TouchableOpacity
                style={[styles.memberToggle, isSelected && styles.memberToggleActive]}
                onPress={() => toggleMember(memberId)}
              >
                <Text style={styles.memberText}>
                  {memberId === user.userId ? '👤 You' : `👤 ${memberId.slice(0, 8)}...`}
                </Text>
                <Text style={{ fontSize: 18 }}>{isSelected ? '✅' : '⬜'}</Text>
              </TouchableOpacity>
              {isSelected && splitType === 'CUSTOM' && (
                <TextInput
                  style={styles.customInput}
                  placeholder="₹ amount"
                  keyboardType="numeric"
                  value={customMap[memberId] || ''}
                  onChangeText={v =>
                    setCustomMap(prev => ({ ...prev, [memberId]: v }))
                  }
                />
              )}
              {isSelected && splitType === 'PERCENTAGE' && (
                <TextInput
                  style={styles.customInput}
                  placeholder="% share"
                  keyboardType="numeric"
                  value={pctMap[memberId] || ''}
                  onChangeText={v =>
                    setPctMap(prev => ({ ...prev, [memberId]: v }))
                  }
                />
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.button}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Add Expense ✓</Text>
          }
        </TouchableOpacity>
        <View style={{ height: 40 }} />
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
    marginBottom: 6, marginTop: 16,
  },
  hint: { fontSize: 12, color: '#888', marginBottom: 8, marginTop: -4 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0',
  },
  amountInput: { fontSize: 22, fontWeight: 'bold', color: '#6C3FF5' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#fff',
    marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0',
  },
  chipActive: { backgroundColor: '#6C3FF5', borderColor: '#6C3FF5' },
  chipText: { fontSize: 13, color: '#444' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  splitRow: { flexDirection: 'row', gap: 8 },
  splitBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E0E0E0',
    alignItems: 'center', backgroundColor: '#fff',
  },
  splitBtnActive: { borderColor: '#6C3FF5', backgroundColor: '#EDE9FE' },
  splitBtnText: { fontSize: 12, color: '#666' },
  splitBtnTextActive: { color: '#6C3FF5', fontWeight: 'bold' },
  previewBanner: {
    backgroundColor: '#EDE9FE', borderRadius: 10, padding: 10,
    marginBottom: 10, alignItems: 'center',
  },
  previewText: { color: '#5B21B6', fontWeight: '600', fontSize: 14 },
  memberRow: { marginBottom: 6 },
  memberToggle: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  memberToggleActive: { borderColor: '#6C3FF5', backgroundColor: '#F5F3FF' },
  memberText: { fontSize: 14, color: '#444' },
  customInput: {
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#6C3FF5',
    padding: 10, fontSize: 14, marginTop: 4,
  },
  button: {
    backgroundColor: '#6C3FF5', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});