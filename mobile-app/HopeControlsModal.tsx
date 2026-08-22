import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { deleteOracleMemory, deleteOraclePrediction, getOracleCalibration, getOracleMemories, getOraclePredictions, getOracleSettings, updateOracleSettings } from './api';
import HopePredictionCard from './HopePredictionCard';

export default function HopeControlsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [settings, setSettings] = useState({ personalized_learning: true, contextual_signals: true });
  const [calibration, setCalibration] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, m, s, c] = await Promise.all([getOraclePredictions(), getOracleMemories(), getOracleSettings(), getOracleCalibration()]);
      setPredictions(p?.data?.items || []);
      setMemories(m?.data || []);
      if (s?.data) setSettings(s.data);
      setCalibration(c?.data || null);
    } catch (err: any) {
      Alert.alert('Hope', err.message || 'Could not load Hope controls.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (visible) load(); }, [visible]);

  const toggle = async (key: keyof typeof settings) => {
    const value = !settings[key];
    setSettings(current => ({ ...current, [key]: value }));
    try { await updateOracleSettings({ [key]: value }); }
    catch (err: any) { setSettings(current => ({ ...current, [key]: !value })); Alert.alert('Hope', err.message); }
  };

  const removePrediction = (id: string) => Alert.alert('Delete prediction?', 'This also deletes its private input snapshot.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await deleteOraclePrediction(id); setPredictions(current => current.filter(item => item.prediction_id !== id)); } }
  ]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.top}><View><Text style={styles.kicker}>HOPE'S AUDIT TRAIL</Text><Text style={styles.title}>History & privacy</Text></View><TouchableOpacity onPress={onClose} accessibilityRole="button"><Text style={styles.close}>Done</Text></TouchableOpacity></View>
        {loading ? <ActivityIndicator color="#9333EA" style={{ marginTop: 40 }} /> : <ScrollView contentContainerStyle={styles.content}>
          {calibration && <View style={styles.section}><Text style={styles.heading}>Personal calibration</Text><View style={styles.row}><Text style={styles.detail}>{calibration.totals.rated} rated · {calibration.totals.strong} strong · {calibration.totals.partial} partial · {calibration.totals.missed} missed</Text></View><Text style={styles.detail}>{calibration.needs_more_data ? 'Needs more confirmed outcomes before showing patterns.' : `Strongest observed category: ${calibration.strongest_category || 'none yet'}.`} Raw counts only.</Text></View>}
          <View style={styles.section}>
            <Text style={styles.heading}>Privacy controls</Text>
            {([
              ['personalized_learning', 'Personalized learning', 'Use confirmed outcomes and explicitly saved memories.'],
              ['contextual_signals', 'Connected context', 'Use authorized location and calendar signals.']
            ] as const).map(([key, label, detail]) => <View key={key} style={styles.setting}><View style={{ flex: 1 }}><Text style={styles.label}>{label}</Text><Text style={styles.detail}>{detail}</Text></View><Switch value={settings[key]} onValueChange={() => toggle(key)} trackColor={{ true: '#C026D3' }} /></View>)}
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>What Hope remembers</Text>
            {memories.length === 0 ? <Text style={styles.empty}>No explicitly saved memories.</Text> : memories.map(memory => <View key={memory.memory_id} style={styles.row}><Text style={[styles.detail, { flex: 1 }]}>{memory.text}</Text><TouchableOpacity onPress={async () => { await deleteOracleMemory(memory.memory_id); setMemories(current => current.filter(item => item.memory_id !== memory.memory_id)); }}><Text style={styles.delete}>Delete</Text></TouchableOpacity></View>)}
          </View>

          <Text style={styles.heading}>Predictions</Text>
          {predictions.length === 0 ? <Text style={styles.empty}>No Hope v2 predictions yet.</Text> : predictions.map(item => <View key={item.prediction_id} style={styles.section}>
            <View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.question}>{item.canonical_question}</Text><Text style={styles.detail}>{new Date(item.created_at).toLocaleString()}</Text></View><TouchableOpacity onPress={() => removePrediction(item.prediction_id)}><Text style={styles.delete}>Delete</Text></TouchableOpacity></View>
            <HopePredictionCard metadata={{ prediction_id: item.prediction_id, status: item.status, prediction_original: item.prediction_original, reused: item.analytics_flags?.reused, recalculated: !!item.analytics_flags?.recalculation_reason }} />
          </View>)}
        </ScrollView>}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6FB', paddingTop: 50 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DDD6E5' },
  kicker: { color: '#C026D3', fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  title: { color: '#211D2B', fontSize: 24, fontWeight: '700', marginTop: 3 },
  close: { color: '#7E22CE', fontWeight: '700', padding: 8 },
  content: { padding: 16, paddingBottom: 50 },
  section: { backgroundColor: '#fff', borderRadius: 18, padding: 15, marginBottom: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5DFEA' },
  heading: { color: '#211D2B', fontSize: 17, fontWeight: '700', marginBottom: 10 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  label: { color: '#322D3B', fontWeight: '600' },
  detail: { color: '#746E7F', fontSize: 12, lineHeight: 17, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
  delete: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
  empty: { color: '#8A8393', fontSize: 13, marginBottom: 12 },
  question: { color: '#211D2B', fontWeight: '700', fontSize: 15 }
});
