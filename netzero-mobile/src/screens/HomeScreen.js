import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  RefreshControl, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/groups/my/${user.userId}`);
      setGroups(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load trips');
    }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchGroups(); }, []));

  const active  = groups.filter(g => g.status === 'ACTIVE');
  const settled = groups.filter(g => g.status !== 'ACTIVE');

  const totalBudget = active.reduce(
    (s, g) => s + (g.totalBudget || 0), 0);

  const BudgetBar = ({ spent, total }) => {
    if (!total) return null;
    const pct = Math.min((spent / total) * 100, 100);
    const color = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#22C55E';
    return (
      <View style={styles.budgetBarWrap}>
        <View style={[styles.budgetBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    );
  };

  const renderGroup = ({ item }) => {
    const memberCount = item.memberIds?.length || 0;
    const isActive = item.status === 'ACTIVE';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GroupDetail', { group: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardEmoji}>
            <Text style={styles.emojiText}>
              {item.name?.charAt(0)?.toUpperCase() || '✈'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.groupDesc} numberOfLines={1}>{item.description}</Text>
            ) : null}
          </View>
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeSettled]}>
            <Text style={[styles.badgeText, { color: isActive ? '#166534' : '#6B7280' }]}>
              {isActive ? 'Active' : 'Settled'}
            </Text>
          </View>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>👥 {memberCount} members</Text>
          {item.totalBudget ? (
            <Text style={styles.metaText}>💰 ₹{item.totalBudget.toLocaleString()}</Text>
          ) : null}
        </View>
        {item.totalBudget ? <BudgetBar total={item.totalBudget} spent={0} /> : null}
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title, count }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Manage your trips & splits</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileInitial}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{active.length}</Text>
          <Text style={styles.statLabel}>Active Trips</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{groups.length}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            ₹{totalBudget > 0 ? `${(totalBudget / 1000).toFixed(0)}K` : '—'}
          </Text>
          <Text style={styles.statLabel}>Budget Pool</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#008cff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {active.length > 0 && (
                <>
                  <SectionHeader title="🔥 Active Trips" count={active.length} />
                  {active.map(item => (
                    <View key={item.id}>{renderGroup({ item })}</View>
                  ))}
                </>
              )}
              {settled.length > 0 && (
                <>
                  <SectionHeader title="✅ Settled Trips" count={settled.length} />
                  {settled.map(item => (
                    <View key={item.id}>{renderGroup({ item })}</View>
                  ))}
                </>
              )}
              {groups.length === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>✈️</Text>
                  <Text style={styles.emptyTitle}>No trips yet!</Text>
                  <Text style={styles.emptySubTitle}>
                    Create your first trip below
                  </Text>
                </View>
              )}
            </>
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchGroups} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ New Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 52, paddingBottom: 24,
    backgroundColor: '#0A2463', // Premium MMT Deep Blue
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#99D1FF', marginTop: 2 },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  profileInitial: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  statsStrip: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: -1, borderRadius: 14,
    paddingVertical: 14, elevation: 4,
    shadowColor: '#008cff', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#008cff' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 20, marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
  sectionBadge: {
    marginLeft: 8, backgroundColor: '#008cff',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
  },
  sectionBadgeText: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardEmoji: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EAF5FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  emojiText: { fontSize: 20, fontWeight: 'bold', color: '#008cff' },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  groupDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeSettled: { backgroundColor: '#F3F4F6' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 10 },
  metaText: { fontSize: 12, color: '#888' },
  budgetBarWrap: {
    height: 4, backgroundColor: '#F3F4F6',
    borderRadius: 2, marginTop: 10, overflow: 'hidden',
  },
  budgetBarFill: { height: '100%', borderRadius: 2 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#444' },
  emptySubTitle: { fontSize: 14, color: '#888', marginTop: 6 },
  fab: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    backgroundColor: '#E73B3B', // MMT Coral Red accent
    borderRadius: 10,
    paddingVertical: 16, alignItems: 'center', elevation: 8,
    shadowColor: '#E73B3B', shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 12,
  },
  fabText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});