import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Alert, ActivityIndicator,
  ScrollView, TextInput, Linking, StatusBar, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { WebView } from 'react-native-webview';

const CATEGORY_EMOJI = {
  FOOD: '🍕', HOTEL: '🏨', TRAVEL: '🚗',
  ACTIVITIES: '🎉', SHOPPING: '🛒', OTHER: '💰',
};
const CATEGORY_COLORS = {
  FOOD: '#FEF3C7', HOTEL: '#DBEAFE', TRAVEL: '#D1FAE5',
  ACTIVITIES: '#FCE7F3', SHOPPING: '#EDE9FE', OTHER: '#F3F4F6',
};

// ──────────────────────────────────────────────
// Main Group Detail Screen
// ──────────────────────────────────────────────
export default function GroupDetailScreen({ route, navigation }) {
  const { group } = route.params;
  const { user } = useAuth();
  const [activeTab,  setActiveTab]  = useState('expenses');
  const [expenses,   setExpenses]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/expenses/group/${group.id}`);
      setExpenses(res.data);
    } catch (e) {}
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchExpenses(); }, []));

  const totalSpent = expenses.reduce(
    (s, e) => s + Number(e.amount || 0), 0
  );

  const budgetPct = group.totalBudget
    ? Math.min((totalSpent / group.totalBudget) * 100, 100)
    : 0;
  const budgetColor =
    budgetPct > 90 ? '#EF4444' : budgetPct > 70 ? '#F59E0B' : '#22C55E';

  const handleDeleteExpense = (id) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/expenses/${id}`);
            setExpenses(prev => prev.filter(e => e.id !== id));
          } catch { Alert.alert('Error', 'Could not delete'); }
        },
      },
    ]);
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      const sr = await api.get(`/users/search?email=${memberEmail.trim().toLowerCase()}`);
      await api.post(`/groups/${group.id}/members?userId=${sr.data.userId}`);
      setMemberEmail('');
      setShowAddMember(false);
      Alert.alert('✅', `${sr.data.name} added!`);
    } catch {
      Alert.alert('Not Found', 'No user with that email found.');
    }
    setAddingMember(false);
  };

  const handleMarkSettled = () => {
    Alert.alert('Mark as Settled', 'All debts cleared?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Settled',
        onPress: async () => {
          try {
            await api.put(`/groups/${group.id}/status?status=SETTLED`);
            Alert.alert('✅ Done', 'Trip marked as settled!');
            navigation.goBack();
          } catch { Alert.alert('Error', 'Could not update status'); }
        },
      },
    ]);
  };

  const renderExpense = ({ item }) => (
    <View style={styles.expenseCard}>
      <View style={[styles.expenseEmojiBox,
        { backgroundColor: CATEGORY_COLORS[item.category] || '#F3F4F6' }]}>
        <Text style={styles.expenseEmoji}>
          {CATEGORY_EMOJI[item.category] || '💰'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseMeta}>
          Paid by {item.paidBy === user.userId ? 'You' : item.paidBy.slice(0,8)+'…'}
          {' · '}{item.splitAmong?.length || 0} people
          {' · '}{item.splitType || 'EQUAL'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.expenseAmount}>₹{item.amount}</Text>
        <TouchableOpacity onPress={() => handleDeleteExpense(item.id)}>
          <Text style={styles.deleteLink}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TABS = ['expenses', 'settle', 'budget', 'itinerary', 'analytics'];
  const TAB_ICONS = { expenses: '💸', settle: '⚖️', budget: '🎒', itinerary: '📍', analytics: '📊' };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{group.name}</Text>
        <TouchableOpacity onPress={handleMarkSettled}>
          <Text style={styles.settleLink}>✅ Close</Text>
        </TouchableOpacity>
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryAmount}>₹{totalSpent.toFixed(2)}</Text>
          </View>
          {group.totalBudget ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>Budget</Text>
              <Text style={styles.summaryBudget}>₹{group.totalBudget.toLocaleString()}</Text>
            </View>
          ) : null}
        </View>
        {group.totalBudget ? (
          <View style={styles.budgetBarWrap}>
            <View style={[styles.budgetBarFill,
              { width: `${budgetPct}%`, backgroundColor: budgetColor }]} />
          </View>
        ) : null}
        {group.totalBudget ? (
          <Text style={styles.budgetHint}>
            {budgetPct > 90 ? '🔴 Over budget!' : budgetPct > 70 ? '🟡 80% used' : '🟢 Under budget'}
            {' · '}₹{(group.totalBudget - totalSpent).toFixed(0)} remaining
          </Text>
        ) : null}
      </View>

      {/* Add Member toggle */}
      <TouchableOpacity
        style={styles.addMemberToggle}
        onPress={() => setShowAddMember(v => !v)}
      >
        <Text style={styles.addMemberToggleText}>
          {showAddMember ? '✕ Cancel' : '➕ Add Member'}
        </Text>
      </TouchableOpacity>
      {showAddMember && (
        <View style={styles.addMemberRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="friend@email.com"
            value={memberEmail}
            onChangeText={setMemberEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddMember} disabled={addingMember}>
            {addingMember
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.addBtnText}>Add</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabIcon}>{TAB_ICONS[tab]}</Text>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'expenses' && (
        <View style={{ flex: 1 }}>
          {loading
            ? <ActivityIndicator color="#6C3FF5" style={{ marginTop: 40 }} />
            : <FlatList
                data={expenses}
                keyExtractor={i => i.id || i._id}
                renderItem={renderExpense}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                ListEmptyComponent={
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyIcon}>💸</Text>
                    <Text style={styles.emptyText}>No expenses yet</Text>
                    <Text style={styles.emptyHint}>Add your first expense below</Text>
                  </View>
                }
              />
          }
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddExpense', {
              groupId: group.id,
              members: group.memberIds,
            })}
          >
            <Text style={styles.fabText}>+ Add Expense</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'settle' && (
        <SettleTab groupId={group.id} userUpiId={user.upiId} />
      )}
      {activeTab === 'analytics' && (
        <AnalyticsTab groupId={group.id} />
      )}
      {activeTab === 'budget' && (
        <BudgetTab groupId={group.id} budget={group.totalBudget} />
      )}
      {activeTab === 'itinerary' && (
        <ItineraryTab groupId={group.id} />
      )}
    </View>
  );
}

// ──────────────────────────────────────────────
// SETTLE TAB
// ──────────────────────────────────────────────
function SettleTab({ groupId, userUpiId }) {
  const [settlements,  setSettlements]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [optimizing,   setOptimizing]   = useState(false);
  const [cycleMsg,     setCycleMsg]     = useState('');

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/settlements/${groupId}`);
      setSettlements(res.data);
    } catch {}
    setLoading(false);
  };

  React.useEffect(() => { fetchSettlements(); }, []);

  const optimize = async () => {
    setOptimizing(true);
    try {
      const before = settlements.length;
      const res = await api.post(`/settlements/optimize/${groupId}`);
      setSettlements(res.data);
      const after = res.data.length;
      if (before > after) {
        setCycleMsg(`⚡ Reduced from ${before} to ${after} transactions via debt optimization!`);
      } else {
        setCycleMsg(`✅ ${after} transactions needed to settle all debts.`);
      }
    } catch {
      Alert.alert('Error', 'Optimization failed');
    }
    setOptimizing(false);
  };

  const markPaid = async (id) => {
    try {
      await api.put(`/settlements/pay/${id}`);
      setSettlements(prev =>
        prev.map(s => s.id === id ? { ...s, status: 'PAID' } : s)
      );
    } catch {}
  };

  const openUPI = (upiId, name, amount) => {
    const safeAmount = Number(amount || 0).toFixed(2);
    const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${safeAmount}&cu=INR`;
    Linking.openURL(url).catch(() =>
      Alert.alert(
        'No UPI App',
        'Install GPay, PhonePe or Paytm. (Note: On Expo Go this might be blocked by Android 11 package visibility, please test on a physical device or full build)'
      )
    );
  };

  const sendWhatsApp = (name, amount, toUpiId) => {
    const msg = `Hey ${name}! 👋 You owe ₹${amount} from this trip. ${
      toUpiId ? `Pay here → upi://pay?pa=${toUpiId}&am=${amount}&cu=INR` : 'Please settle up soon!'
    } (via NetZero)`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`).catch(() =>
      Alert.alert('WhatsApp not found', 'Install WhatsApp to send reminders.')
    );
  };

  const pending = settlements.filter(s => s.status !== 'PAID');
  const paid    = settlements.filter(s => s.status === 'PAID');

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <TouchableOpacity style={styles.optimizeBtn} onPress={optimize} disabled={optimizing}>
        {optimizing
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.optimizeBtnText}>⚡ Optimize Settlements</Text>}
      </TouchableOpacity>

      {cycleMsg ? (
        <View style={styles.cycleCard}>
          <Text style={styles.cycleText}>{cycleMsg}</Text>
          <Text style={styles.cycleHint}>
            Our debt graph + min-heap algorithm minimized transactions.
          </Text>
        </View>
      ) : null}

      {loading && <ActivityIndicator color="#6C3FF5" style={{ marginTop: 20 }} />}

      {pending.length > 0 && (
        <>
          <Text style={styles.settleSection}>📋 Pending ({pending.length})</Text>
          {pending.map(s => (
            <View key={s.id} style={styles.settlementCard}>
              <View style={styles.settlementTop}>
                <View>
                  <Text style={styles.settlementWho}>
                    {s.fromUserName} → {s.toUserName}
                  </Text>
                  <Text style={styles.settlementAmount}>₹{s.amount?.toFixed(2)}</Text>
                </View>
                {s.upiId && (
                  <View style={styles.upiTag}>
                    <Text style={styles.upiTagText}>💳 {s.upiId}</Text>
                  </View>
                )}
              </View>
              <View style={styles.settlementActions}>
                {s.upiId && (
                  <TouchableOpacity
                    style={styles.upiPayBtn}
                    onPress={() => openUPI(s.upiId, s.toUserName, s.amount)}
                  >
                    <Text style={styles.upiPayBtnText}>💸 Pay via UPI</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.whatsappBtn}
                  onPress={() => sendWhatsApp(s.fromUserName, s.amount, s.upiId)}
                >
                  <Text style={styles.whatsappBtnText}>📱 Remind</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.paidBtn}
                  onPress={() => markPaid(s.id)}
                >
                  <Text style={styles.paidBtnText}>✓ Mark Paid</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {paid.length > 0 && (
        <>
          <Text style={styles.settleSection}>✅ Paid ({paid.length})</Text>
          {paid.map(s => (
            <View key={s.id} style={[styles.settlementCard, styles.paidCard]}>
              <Text style={styles.settlementWho}>
                {s.fromUserName} → {s.toUserName}
              </Text>
              <Text style={styles.settlementAmount}>₹{s.amount?.toFixed(2)}</Text>
              <Text style={styles.paidLabel}>✅ PAID</Text>
            </View>
          ))}
        </>
      )}

      {settlements.length === 0 && !loading && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.emptyText}>No settlements yet</Text>
          <Text style={styles.emptyHint}>Hit "Optimize" to calculate who owes whom</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────
// ANALYTICS TAB
// ──────────────────────────────────────────────
function AnalyticsTab({ groupId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    api.get(`/analytics/${groupId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#6C3FF5" style={{ marginTop: 40 }} />;
  if (!data)   return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyText}>No analytics yet</Text>
      <Text style={styles.emptyHint}>Add some expenses first</Text>
    </View>
  );

  const byCategory = data.byCategory || {};
  const byPerson   = data.byPerson   || {};
  const byDay      = data.byDay      || {};
  const total      = data.totalSpent || 0;

  // Compute bar max for day chart
  const dayValues  = Object.values(byDay);
  const maxDay     = dayValues.length ? Math.max(...dayValues) : 1;

  const CAT_COLORS = {
    FOOD:'#F59E0B', HOTEL:'#3B82F6', TRAVEL:'#10B981',
    ACTIVITIES:'#EC4899', SHOPPING:'#8B5CF6', OTHER:'#6B7280',
  };
  const PERSON_COLORS = ['#6C3FF5','#EC4899','#10B981','#F59E0B','#3B82F6'];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Total card */}
      <View style={styles.analyticsHero}>
        <Text style={styles.analyticsHeroLabel}>Total Spent</Text>
        <Text style={styles.analyticsHeroAmt}>₹{total.toFixed(2)}</Text>
        <Text style={styles.analyticsHeroSub}>{data.totalExpenses} expenses</Text>
      </View>

      {/* Top Spender */}
      {data.topSpender && (
        <View style={styles.topSpenderCard}>
          <Text style={styles.topSpenderText}>
            🏆 Top Spender: {data.topSpender}
          </Text>
        </View>
      )}

      {/* First/Second half comparison */}
      {data.firstHalfSpend != null && data.secondHalfSpend != null && (
        <View style={styles.halfCard}>
          <View style={styles.halfItem}>
            <Text style={styles.halfLabel}>First Half</Text>
            <Text style={styles.halfAmt}>₹{data.firstHalfSpend?.toFixed(0)}</Text>
          </View>
          <View style={styles.halfDivider} />
          <View style={styles.halfItem}>
            <Text style={styles.halfLabel}>Second Half</Text>
            <Text style={styles.halfAmt}>₹{data.secondHalfSpend?.toFixed(0)}</Text>
          </View>
        </View>
      )}

      {/* Daily bar chart */}
      {dayValues.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📅 Daily Spending</Text>
          <View style={styles.barChart}>
            {Object.entries(byDay).map(([day, amt]) => {
              const pct = maxDay > 0 ? (amt / maxDay) * 100 : 0;
              return (
                <View key={day} style={styles.barCol}>
                  <Text style={styles.barAmt}>₹{amt >= 1000 ? `${(amt/1000).toFixed(1)}K` : amt.toFixed(0)}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${pct}%`, backgroundColor: '#6C3FF5' }]} />
                  </View>
                  <Text style={styles.barLabel}>{day.slice(5)}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🍕 By Category</Text>
          {Object.entries(byCategory).map(([cat, amt]) => {
            const pct = total > 0 ? (amt / total) * 100 : 0;
            return (
              <View key={cat} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  {CATEGORY_EMOJI[cat] || '💰'} {cat}
                </Text>
                <View style={styles.breakdownBarWrap}>
                  <View style={[styles.breakdownBar,
                    { width: `${pct}%`, backgroundColor: CAT_COLORS[cat] || '#888' }]} />
                </View>
                <Text style={styles.breakdownAmt}>₹{amt.toFixed(0)}</Text>
              </View>
            );
          })}
        </>
      )}

      {/* Per person */}
      {Object.keys(byPerson).length > 0 && (
        <>
          <Text style={styles.sectionTitle}>👤 By Person</Text>
          {Object.entries(byPerson)
            .sort(([,a],[,b]) => b - a)
            .map(([person, amt], i) => {
            const pct = total > 0 ? (amt / total) * 100 : 0;
            return (
              <View key={person} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel} numberOfLines={1}>
                  👤 {person.length > 12 ? person.slice(0, 12) + '…' : person}
                </Text>
                <View style={styles.breakdownBarWrap}>
                  <View style={[styles.breakdownBar,
                    { width: `${pct}%`, backgroundColor: PERSON_COLORS[i % PERSON_COLORS.length] }]} />
                </View>
                <Text style={styles.breakdownAmt}>₹{amt.toFixed(0)}</Text>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────
// BUDGET TAB
// ──────────────────────────────────────────────
function BudgetTab({ groupId, budget }) {
  const [totalBudget, setTotalBudget] = useState(budget?.toString() || '');
  const [items,   setItems]   = useState([
    { name: '', cost: '', rating: 3, category: 'OTHER' }
  ]);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const addItem = () =>
    setItems(prev => [...prev, { name: '', cost: '', rating: 3, category: 'OTHER' }]);

  const removeItem = (idx) =>
    setItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, val) => {
    const u = [...items]; u[idx][field] = val; setItems(u);
  };

  const StarRating = ({ value, onChange }) => (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Text style={{ fontSize: 20 }}>{n <= value ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const optimize = async () => {
    if (!totalBudget) { Alert.alert('Error', 'Enter total budget'); return; }
    const valid = items.filter(i => i.name && i.cost);
    if (valid.length === 0) { Alert.alert('Error', 'Add at least one item'); return; }
    setLoading(true);
    try {
      const res = await api.post('/budget/optimize', {
        groupId,
        totalBudget: parseFloat(totalBudget),
        items: valid.map(i => ({
          name: i.name,
          cost: parseFloat(i.cost),
          rating: i.rating,
          category: i.category,
        })),
      });
      setResult(res.data);
    } catch {
      Alert.alert('Error', 'Budget optimization failed');
    }
    setLoading(false);
  };

  const spent = result?.totalCost || 0;
  const budgetNum = parseFloat(totalBudget) || 0;
  const healthPct = budgetNum > 0 ? Math.min((spent / budgetNum) * 100, 100) : 0;
  const healthColor = healthPct > 90 ? '#EF4444' : healthPct > 70 ? '#F59E0B' : '#22C55E';

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={styles.label}>Total Budget (₹)</Text>
      <TextInput
        style={styles.input}
        value={totalBudget}
        onChangeText={setTotalBudget}
        keyboardType="numeric"
        placeholder="e.g. 20000"
      />

      <Text style={styles.sectionTitle}>📝 Planned Items</Text>
      <Text style={styles.emptyHint}>Add items with cost & rating (1-5 ⭐)</Text>

      {items.map((item, idx) => (
        <View key={idx} style={styles.budgetItemCard}>
          <View style={styles.budgetItemRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Item name"
              value={item.name}
              onChangeText={v => updateItem(idx, 'name', v)}
            />
            <TouchableOpacity onPress={() => removeItem(idx)}>
              <Text style={{ fontSize: 20, color: '#EF4444' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Cost (₹)"
            value={item.cost}
            onChangeText={v => updateItem(idx, 'cost', v)}
            keyboardType="numeric"
          />
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            <StarRating
              value={item.rating}
              onChange={v => updateItem(idx, 'rating', v)}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
        <Text style={styles.addItemText}>+ Add Item</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optimizeBtn} onPress={optimize} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.optimizeBtnText}>🎯 Find Best Combo (Knapsack)</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>🎯 Best Combination</Text>

          {/* Budget Health */}
          <View style={{ marginBottom: 12 }}>
            <View style={styles.budgetBarWrap}>
              <View style={[styles.budgetBarFill, { width: `${healthPct}%`, backgroundColor: healthColor }]} />
            </View>
            <Text style={{ fontSize: 12, color: healthColor, marginTop: 4, fontWeight: '600' }}>
              {healthPct > 90 ? '🔴 Over budget' : healthPct > 70 ? '🟡 High usage' : '🟢 Under budget'}
              {' '}({healthPct.toFixed(0)}% used)
            </Text>
          </View>

          <View style={styles.resultStatsRow}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatNum}>₹{result.totalCost?.toFixed(0)}</Text>
              <Text style={styles.resultStatLabel}>Total Cost</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatNum, { color: '#22C55E' }]}>
                ₹{result.savedAmount?.toFixed(0)}
              </Text>
              <Text style={styles.resultStatLabel}>Saved!</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatNum}>{result.selectedItems?.length}</Text>
              <Text style={styles.resultStatLabel}>Items</Text>
            </View>
          </View>

          <Text style={styles.resultSubtitle}>Selected Items:</Text>
          {result.selectedItems?.map((item, i) => (
            <View key={i} style={styles.resultItem}>
              <Text style={styles.resultItemName}>✅ {item.name}</Text>
              <Text style={styles.resultItemMeta}>₹{item.cost} · {'⭐'.repeat(item.rating)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// ITINERARY TAB (Unified Geo-caching Route Optimizer)
// ──────────────────────────────────────────────
function ItineraryTab({ groupId }) {
  const [places, setPlaces] = useState([
    { name: '', lat: null, lon: null, results: [], showDropdown: false }
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTargetIdx, setMapTargetIdx] = useState(null);
  const [tempCoordinate, setTempCoordinate] = useState({ latitude: 19.0760, longitude: 72.8777 }); // default Mumbai

  const searchNominatim = async (query, idx) => {
    if (query.trim().length < 3) {
      updatePlaceState(idx, { results: [], showDropdown: false });
      return;
    }
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`, {
        headers: { 'Accept-Language': 'en' },
        method: 'GET'
      });
      const data = await resp.json();
      updatePlaceState(idx, { results: data, showDropdown: true });
    } catch {
      // quiet fail
    }
  };

  const updatePlaceState = (idx, newData) => {
    setPlaces(prev => {
      const u = [...prev];
      u[idx] = { ...u[idx], ...newData };
      return u;
    });
  };

  const handleTextChange = (idx, val) => {
    updatePlaceState(idx, { name: val, lat: null, lon: null });
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => searchNominatim(val, idx), 600);
  };

  const selectPlace = (idx, geodata) => {
    updatePlaceState(idx, { 
      name: geodata.display_name.split(',')[0], 
      lat: parseFloat(geodata.lat), 
      lon: parseFloat(geodata.lon), 
      results: [], 
      showDropdown: false 
    });
  };

  const addPlace = () => setPlaces(prev => [...prev, { name: '', lat: null, lon: null, results: [], showDropdown: false }]);
  const removePlace = (idx) => setPlaces(prev => prev.filter((_, i) => i !== idx));

  const openMapFor = (idx) => {
    setMapTargetIdx(idx);
    const existing = places[idx];
    if (existing && existing.lat && existing.lon) {
      setTempCoordinate({ latitude: existing.lat, longitude: existing.lon });
    }
    setIsMapOpen(true);
  };

  const confirmLocation = async (coordOverride) => {
    setIsMapOpen(false);
    if (mapTargetIdx === null) return;

    const lat = coordOverride ? coordOverride.lat : tempCoordinate.latitude;
    const lon = coordOverride ? coordOverride.lon : tempCoordinate.longitude;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const placeName = data.display_name ? data.display_name.split(',')[0] : `Point: ${lat.toFixed(3)}`;
      updatePlaceState(mapTargetIdx, { name: placeName, lat, lon });
    } catch {
      updatePlaceState(mapTargetIdx, { name: `Location Route`, lat, lon });
    }
    setMapTargetIdx(null);
  };

  const optimizeRoute = async () => {
    const validPlaces = places.filter(p => p.lat && p.lon);
    if (validPlaces.length === 0) {
      Alert.alert('Map Data Needed', 'Please search locations or pick them on the map.');
      return;
    }
    if (validPlaces.length < 2) {
      Alert.alert('Add Places', 'At least 2 places required to calculate a GPS route.');
      return;
    }
    setLoading(true);
    try {
      const reqPayload = validPlaces.map(p => ({
        name: p.name, lat: p.lat, lon: p.lon
      }));
      const res = await api.post('/itinerary/optimize', {
        groupId,
        places: reqPayload
      });
      setResult(res.data);
    } catch {
      Alert.alert('Server Error', 'Our routing servers experienced an issue.');
    }
    setLoading(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F4F5F7' }}
      contentContainerStyle={{ paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── HERO BANNER ── */}
      <View style={itin.heroBanner}>
        <Text style={itin.heroEmoji}>🗺️</Text>
        <Text style={itin.heroTitle}>Trip Route Planner</Text>
        <Text style={itin.heroSub}>Add stops · Optimize · Travel smart</Text>
      </View>

      {/* ── STOPS CARD ── */}
      <View style={itin.stopsCard}>
        <Text style={itin.stopsLabel}>YOUR STOPS</Text>

        {places.map((place, idx) => (
          <View key={idx} style={{ zIndex: 200 - idx }}>
            {/* Row header: icon + label */}
            <View style={itin.stopRow}>
              {/* Left timeline icon */}
              <View style={{ alignItems: 'center', marginRight: 12, width: 28 }}>
                <View style={[itin.stopDot, { backgroundColor: idx === 0 ? '#E73B3B' : idx === places.length - 1 ? '#E73B3B' : '#008cff' }]} />
                {idx < places.length - 1 && <View style={itin.dotLine} />}
              </View>

              {/* Input + map button */}
              <View style={{ flex: 1, zIndex: 10 }}>
                <View style={[itin.stopInputWrap, { borderColor: place.lat ? '#22C55E' : '#DDE3EC' }]}>
                  <Text style={itin.stopIcon}>
                    {idx === 0 ? '🏨' : '📍'}
                  </Text>
                  <TextInput
                    style={itin.stopInput}
                    placeholder={idx === 0 ? 'Starting point / Hotel' : `Stop ${idx + 1} — Where to?`}
                    placeholderTextColor="#AAB4C4"
                    value={place.name}
                    onChangeText={v => handleTextChange(idx, v)}
                  />
                  {place.lat
                    ? <Text style={{ fontSize: 16, marginRight: 8 }}>✅</Text>
                    : <TouchableOpacity onPress={() => openMapFor(idx)} style={itin.mapBtn}>
                        <Text style={{ fontSize: 16 }}>📌</Text>
                      </TouchableOpacity>
                  }
                </View>

                {/* Autocomplete dropdown */}
                {place.showDropdown && place.results && place.results.length > 0 && (
                  <View style={itin.dropdown}>
                    {place.results.map((r, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[itin.dropItem, i === place.results.length - 1 && { borderBottomWidth: 0 }]}
                        onPress={() => selectPlace(idx, r)}
                      >
                        <Text style={itin.dropIcon}>📍</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={itin.dropName} numberOfLines={1}>
                            {r.display_name.split(',')[0]}
                          </Text>
                          <Text style={itin.dropAddress} numberOfLines={1}>
                            {r.display_name.split(',').slice(1, 3).join(',')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[itin.dropItem, { backgroundColor: '#EAF5FF', borderBottomWidth: 0 }]}
                      onPress={() => { updatePlaceState(idx, { showDropdown: false }); openMapFor(idx); }}
                    >
                      <Text style={itin.dropIcon}>🗺️</Text>
                      <Text style={[itin.dropName, { color: '#008cff' }]}>Pin on map instead</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Remove button — only if more than 2 stops */}
              {places.length > 2 && (
                <TouchableOpacity onPress={() => removePlace(idx)} style={{ padding: 8, marginLeft: 4 }}>
                  <Text style={{ fontSize: 18, color: '#CBD5E1' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Add stop button */}
        <TouchableOpacity style={itin.addStopBtn} onPress={addPlace}>
          <Text style={itin.addStopPlus}>＋</Text>
          <Text style={itin.addStopText}>Add another stop</Text>
        </TouchableOpacity>
      </View>

      {/* ── FIND ROUTE BUTTON ── */}
      <TouchableOpacity
        style={itin.findBtn}
        onPress={optimizeRoute}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              <Text style={itin.findBtnIcon}>⚡</Text>
              <Text style={itin.findBtnText}>Find Smartest Route</Text>
            </>
        }
      </TouchableOpacity>

      {/* ── RESULT CARD ── */}
      {result && result.optimizedRoute && (
        <View style={itin.resultOuter}>
          {/* Stats row */}
          <View style={itin.statsRow}>
            <View style={itin.statPill}>
              <Text style={itin.statNum}>{result.optimizedRoute.length}</Text>
              <Text style={itin.statLabel}>Stops</Text>
            </View>
            <View style={[itin.statPill, { backgroundColor: '#FFF0F0' }]}>
              <Text style={[itin.statNum, { color: '#E73B3B' }]}>{result.totalDistance.toFixed(0)} km</Text>
              <Text style={itin.statLabel}>Total Distance</Text>
            </View>
            <View style={[itin.statPill, { backgroundColor: '#F0FFF4' }]}>
              <Text style={[itin.statNum, { color: '#16A34A' }]}>Optimal</Text>
              <Text style={itin.statLabel}>Route</Text>
            </View>
          </View>

          <Text style={itin.routeHeading}>✈️  Your Optimized Itinerary</Text>

          {result.optimizedRoute.map((step, i) => (
            <View key={i} style={itin.routeItem}>
              {/* Left timeline */}
              <View style={{ alignItems: 'center', width: 36 }}>
                <View style={[itin.routeDot, {
                  backgroundColor: i === 0 ? '#E73B3B' : i === result.optimizedRoute.length - 1 ? '#E73B3B' : '#008cff'
                }]}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{i + 1}</Text>
                </View>
                {i < result.optimizedRoute.length - 1 && <View style={itin.routeLine} />}
              </View>

              {/* Right card */}
              <View style={[itin.routeCard, i === 0 && { borderLeftColor: '#E73B3B', borderLeftWidth: 3 }]}>
                <Text style={itin.routeCardTitle}>{step.name}</Text>
                <Text style={itin.routeCardCoords}>
                  {step.lat.toFixed(4)}°N, {step.lon.toFixed(4)}°E
                </Text>
                {i === 0 && <View style={itin.startBadge}><Text style={itin.startBadgeText}>START</Text></View>}
                {i === result.optimizedRoute.length - 1 && i !== 0 && (
                  <View style={[itin.startBadge, { backgroundColor: '#E73B3B' }]}>
                    <Text style={itin.startBadgeText}>END</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── MAP MODAL ── */}
      <Modal visible={isMapOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ backgroundColor: '#0A2463', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setIsMapOpen(false)}>
              <Text style={{ color: '#fff', fontSize: 16 }}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>📍 Drop pin on location</Text>
            <View style={{ width: 60 }} />
          </View>
          <WebView
            style={{ flex: 1 }}
            originWhitelist={['*']}
            source={{ html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; font-family: sans-serif; }
    #confirm-btn {
      position: fixed; bottom: 24px; left: 16px; right: 16px;
      background: linear-gradient(135deg, #008cff, #0A2463);
      color: white; font-size: 17px; font-weight: bold;
      padding: 18px; border: none; border-radius: 14px; z-index: 1000;
      box-shadow: 0 6px 24px rgba(0,140,255,0.5);
    }
    #crosshair {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -68%);
      font-size: 40px; z-index: 999; pointer-events: none;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }
    #coords-bar {
      position: fixed; top: 12px; left: 16px; right: 16px; z-index: 998;
      background: rgba(255,255,255,0.96); border-radius: 12px;
      padding: 12px 16px; font-size: 13px; color: #0A2463; font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      display: flex; align-items: center; gap: 8px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="crosshair">📍</div>
  <div id="coords-bar">📍 Move the map, then tap Confirm</div>
  <button id="confirm-btn" onclick="confirmPin()">✅  Confirm This Location</button>
  <script>
    var lat = ${tempCoordinate.latitude};
    var lon = ${tempCoordinate.longitude};
    var map = L.map('map', { zoomControl: true }).setView([lat, lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    map.on('move', function() {
      var c = map.getCenter();
      lat = c.lat; lon = c.lng;
      document.getElementById('coords-bar').innerText = '📍  ' + lat.toFixed(5) + ', ' + lon.toFixed(5);
    });
    function confirmPin() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lon: lon }));
    }
  </script>
</body>
</html>
            ` }}
            onMessage={(e) => {
              try {
                const { lat, lon } = JSON.parse(e.nativeEvent.data);
                setTempCoordinate({ latitude: lat, longitude: lon });
                confirmLocation({ lat, lon });
              } catch {}
            }}
          />
        </View>
      </Modal>

    </ScrollView>
  );
}

// ──────────────────────────────────────────────
// Itinerary-specific premium styles (MMT)
// ──────────────────────────────────────────────
const itin = StyleSheet.create({
  heroBanner: {
    backgroundColor: '#0A2463',
    paddingTop: 28, paddingBottom: 32, alignItems: 'center',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  heroEmoji: { fontSize: 44, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  heroSub: { color: '#99D1FF', fontSize: 13, marginTop: 4, fontWeight: '500' },

  stopsCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18,
    padding: 20, elevation: 4,
    shadowColor: '#0A2463', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 14,
    marginBottom: 14,
  },
  stopsLabel: { fontSize: 11, fontWeight: '800', color: '#AAB4C4', letterSpacing: 1, marginBottom: 16 },

  stopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  stopDot: { width: 14, height: 14, borderRadius: 7, marginTop: 14 },
  dotLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: '#DDE3EC', marginTop: 2 },

  stopInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12,
    backgroundColor: '#F8FAFF', overflow: 'hidden', marginBottom: 4,
  },
  stopIcon: { fontSize: 20, paddingHorizontal: 12 },
  stopInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1a1a1a' },
  mapBtn: {
    backgroundColor: '#EAF5FF', padding: 12,
    borderLeftWidth: 1.5, borderLeftColor: '#DDE3EC',
  },

  dropdown: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    overflow: 'hidden', elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
    marginBottom: 8,
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', padding: 13,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  dropIcon: { fontSize: 16, marginRight: 10 },
  dropName: { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
  dropAddress: { fontSize: 12, color: '#888', marginTop: 1 },

  addStopBtn: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    paddingVertical: 12, paddingHorizontal: 8,
  },
  addStopPlus: { color: '#008cff', fontSize: 22, fontWeight: 'bold', marginRight: 10 },
  addStopText: { color: '#008cff', fontSize: 15, fontWeight: '700' },

  findBtn: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: '#E73B3B', borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#E73B3B', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12,
  },
  findBtnIcon: { fontSize: 20, marginRight: 10 },
  findBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },

  resultOuter: { marginHorizontal: 16, borderRadius: 18, overflow: 'hidden', marginBottom: 24 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statPill: {
    flex: 1, backgroundColor: '#EAF5FF', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '900', color: '#0A2463' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, fontWeight: '600' },

  routeHeading: { fontSize: 16, fontWeight: '800', color: '#0A2463', marginBottom: 14 },

  routeItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  routeDot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  routeLine: { width: 2, minHeight: 32, backgroundColor: '#DDE3EC', marginTop: 2, flex: 1 },
  routeCard: {
    flex: 1, marginLeft: 12, backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 10, elevation: 2,
    borderLeftWidth: 0,
    shadowColor: '#0A2463', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
  },
  routeCardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  routeCardCoords: { fontSize: 11, color: '#888', marginTop: 3 },
  startBadge: {
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: '#008cff', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  startBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingTop: 52,
    backgroundColor: '#0A2463', // MMT Dark Blue
  },
  back: { color: '#fff', fontSize: 16 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  settleLink: { color: '#99D1FF', fontSize: 13, fontWeight: '700' },
  summaryCard: { backgroundColor: '#0A2463', padding: 20, paddingBottom: 30, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  summaryLabel: { color: '#D4C6FF', fontSize: 12 },
  summaryAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 2 },
  summaryBudget: { color: '#D4C6FF', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  budgetBarWrap: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  budgetBarFill: { height: '100%', borderRadius: 3 },
  budgetHint: { color: '#D4C6FF', fontSize: 12, marginTop: 6 },
  addMemberToggle: {
    backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#EDE9FE',
  },
  addMemberToggleText: { color: '#008cff', fontWeight: 'bold', fontSize: 14 },
  addMemberRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0',
  },
  addBtn: {
    backgroundColor: '#008cff', borderRadius: 10,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  dropdownContainer: {
    position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: '#fff',
    borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', zIndex: 99,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5,
    maxHeight: 180, overflow: 'hidden'
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownText: { fontSize: 13, color: '#444' },
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#008cff' },
  tabIcon: { fontSize: 18 },
  tabText: { fontSize: 11, color: '#888', marginTop: 4, fontWeight: '500' },
  activeTabText: { color: '#008cff', fontWeight: '800' },
  expenseCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    elevation: 1, gap: 12,
  },
  expenseEmojiBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  expenseEmoji: { fontSize: 22 },
  expenseTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  expenseMeta: { fontSize: 11, color: '#888', marginTop: 3 },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#008cff' },
  deleteLink: { fontSize: 16, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: '#E73B3B', borderRadius: 12, padding: 16, // MMT Coral
    alignItems: 'center', elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyWrap: { alignItems: 'center', paddingTop: 50 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#444' },
  emptyHint: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' },
  // Settle tab
  optimizeBtn: { backgroundColor: '#008cff', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 14 },
  optimizeBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cycleCard: { backgroundColor: '#EAF5FF', borderRadius: 12, padding: 14, marginBottom: 14 },
  cycleText: { color: '#0A2463', fontWeight: 'bold', fontSize: 14 },
  cycleHint: { color: '#0A2463', opacity: 0.7, fontSize: 12, marginTop: 4 },
  settleSection: { fontSize: 14, fontWeight: 'bold', color: '#666', marginVertical: 10 },
  settlementCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 1 },
  paidCard: { opacity: 0.5 },
  settlementTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  settlementWho: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  settlementAmount: { fontSize: 22, fontWeight: 'bold', color: '#008cff', marginTop: 4 },
  upiTag: { backgroundColor: '#EAF5FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  upiTagText: { fontSize: 11, color: '#0A2463' },
  settlementActions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  upiPayBtn: { backgroundColor: '#008cff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  upiPayBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  whatsappBtn: { backgroundColor: '#22C55E', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  whatsappBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  paidBtn: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  paidBtnText: { color: '#333', fontWeight: '600', fontSize: 13 },
  paidLabel: { color: '#22C55E', fontWeight: 'bold', marginTop: 8 },
  // Analytics tab
  analyticsHero: { backgroundColor: '#0A2463', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 14 },
  analyticsHeroLabel: { color: '#99D1FF', fontSize: 12 },
  analyticsHeroAmt: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  analyticsHeroSub: { color: '#99D1FF', fontSize: 13, marginTop: 4 },
  topSpenderCard: { backgroundColor: '#FEF9C3', borderRadius: 12, padding: 14, marginBottom: 12, alignItems: 'center' },
  topSpenderText: { fontSize: 16, fontWeight: 'bold', color: '#854D0E' },
  halfCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 14, elevation: 1 },
  halfItem: { flex: 1, padding: 16, alignItems: 'center' },
  halfLabel: { fontSize: 12, color: '#888' },
  halfAmt: { fontSize: 18, fontWeight: 'bold', color: '#008cff', marginTop: 4 },
  halfDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginVertical: 12 },
  barChart: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 8, marginBottom: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  barCol: { flex: 1, alignItems: 'center' },
  barAmt: { fontSize: 9, color: '#888', marginBottom: 4 },
  barTrack: { flex: 1, width: '100%', backgroundColor: '#EAF5FF', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4, backgroundColor: '#008cff' },
  barLabel: { fontSize: 9, color: '#888', marginTop: 4 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  breakdownLabel: { fontSize: 12, color: '#444', width: 90 },
  breakdownBarWrap: { flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  breakdownBar: { height: '100%', borderRadius: 5, backgroundColor: '#008cff' },
  breakdownAmt: { fontSize: 12, fontWeight: 'bold', color: '#008cff', width: 55, textAlign: 'right' },
  // Budget tab
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 14 },
  budgetItemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  budgetItemRow: { flexDirection: 'row', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ratingLabel: { fontSize: 13, color: '#666' },
  addItemBtn: { borderWidth: 2, borderColor: '#008cff', borderStyle: 'dashed', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 14 },
  addItemText: { color: '#008cff', fontWeight: 'bold' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 16, elevation: 2 },
  resultTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  resultStatsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#EAF5FF', borderRadius: 12, padding: 14, marginBottom: 14 },
  resultStat: { alignItems: 'center' },
  resultStatNum: { fontSize: 22, fontWeight: 'bold', color: '#008cff' },
  resultStatLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  resultSubtitle: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultItemName: { fontSize: 14, color: '#1a1a1a' },
  resultItemMeta: { fontSize: 13, color: '#008cff', fontWeight: '600' },
});