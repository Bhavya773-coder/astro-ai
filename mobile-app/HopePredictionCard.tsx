import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createCustomCalendarEvent, explainOraclePrediction, saveOracleSynchronicity, submitOracleOutcome } from './api';

export default function HopePredictionCard({ metadata }: { metadata: any }) {
  const original = metadata?.prediction_original;
  const id = metadata?.prediction_id;
  const [status, setStatus] = useState(metadata?.status || 'open');
  const [factors, setFactors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [synchronicitySaved, setSynchronicitySaved] = useState(false);
  if (!original || !id) return null;

  const outcome = async (choice: string) => {
    setBusy(true);
    try {
      const response = await submitOracleOutcome(id, choice);
      setStatus(response?.data?.status || status);
    } finally { setBusy(false); }
  };

  const explain = async () => {
    setBusy(true);
    try {
      const response = await explainOraclePrediction(id);
      setFactors(response?.data?.factors || []);
    } finally { setBusy(false); }
  };

  const addToCalendar = async () => {
    const date = original.time_window?.end || original.time_window?.start;
    if (!date) return;
    await createCustomCalendarEvent({ title: `Hope outcome check: ${original.text}`, description: `Review Hope prediction ${id} and record what happened.`, date, category: 'special_day' });
    setCalendarSaved(true);
  };

  const saveSynchronicity = async () => {
    await saveOracleSynchronicity(id, `Strong match: ${original.text}`);
    setSynchronicitySaved(true);
  };

  const windowLabel = original.time_window?.label || [original.time_window?.start, original.time_window?.end].filter(Boolean).join(' – ');
  const outcomeDue = status === 'awaiting_outcome' || (original.valid_until && Date.parse(original.valid_until) <= Date.now());
  return (
    <View style={styles.card} accessible accessibilityLabel="Hope original prediction">
      <View style={styles.header}><Text style={styles.kicker}>HOPE'S ORIGINAL CALL</Text><Text style={styles.status}>{String(status).replace(/_/g, ' ')}</Text></View>
      <Text style={styles.call}>{original.text}</Text>
      <Text style={styles.meta}>{String(original.direction || '').replace(/_/g, ' ')} · {original.strength} · {windowLabel || 'open-ended'}</Text>
      {!!original.recommended_action && <Text style={styles.action}>Practical action: {original.recommended_action}</Text>}
      {!!metadata.reused && <Text style={styles.reused}>Same inputs — original call reused.</Text>}
      {!!metadata.recalculated && <Text style={styles.changed}>Material context changed — new calculation.</Text>}
      {!!factors.length && <Text style={styles.factors}>Factors: {factors.join(', ')}</Text>}
      <View style={styles.buttons}>
        <TouchableOpacity disabled={busy} style={styles.button} onPress={explain}><Text style={styles.buttonText}>Why?</Text></TouchableOpacity>
        {(original.time_window?.end || original.time_window?.start) && <TouchableOpacity disabled={calendarSaved} style={styles.button} onPress={addToCalendar}><Text style={styles.buttonText}>{calendarSaved ? 'Calendar added' : 'Add outcome check'}</Text></TouchableOpacity>}
        {outcomeDue && !['confirmed_strong', 'confirmed_partial', 'missed'].includes(status) && [
          ['very_similar', 'Very similar'], ['partly', 'Partly'], ['no', 'No'], ['something_else', 'Other'], ['not_sure', 'Not sure']
        ].map(([value, label]) => <TouchableOpacity key={value} disabled={busy} style={styles.button} onPress={() => outcome(value)}><Text style={styles.buttonText}>{label}</Text></TouchableOpacity>)}
        {status === 'confirmed_strong' && <TouchableOpacity disabled={synchronicitySaved} style={styles.button} onPress={saveSynchronicity}><Text style={styles.buttonText}>{synchronicitySaved ? 'Saved' : 'Save Synchronicity'}</Text></TouchableOpacity>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12, borderWidth: 1, borderColor: 'rgba(217,70,239,0.25)', borderRadius: 16, backgroundColor: 'rgba(217,70,239,0.06)', padding: 13 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  kicker: { color: '#C026D3', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  status: { color: '#6B6478', fontSize: 10, textTransform: 'capitalize' },
  call: { color: '#211D2B', fontWeight: '700', fontSize: 15, lineHeight: 21, marginTop: 9 },
  meta: { color: '#746E7F', fontSize: 12, textTransform: 'capitalize', marginTop: 6 },
  action: { color: '#554E61', fontSize: 12, lineHeight: 18, marginTop: 8 },
  reused: { color: '#0891B2', fontSize: 11, marginTop: 7 },
  changed: { color: '#B45309', fontSize: 11, marginTop: 7 },
  factors: { color: '#746E7F', fontSize: 11, marginTop: 7 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 11 },
  button: { borderWidth: 1, borderColor: 'rgba(147,51,234,0.2)', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7 },
  buttonText: { color: '#7E22CE', fontSize: 11, fontWeight: '600' }
});
