import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { acceptOracleDisclosure } from './api';

interface Props {
  visible: boolean;
  text?: string;
  version?: string;
  onAccepted: () => void;
}

export default function HopeDisclosureModal({ visible, text, version, onAccepted }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const accept = async () => {
    setSaving(true);
    setError('');
    try {
      await acceptOracleDisclosure();
      onAccepted();
    } catch (err: any) {
      setError(err.message || 'Could not save your choice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <View style={styles.card} accessible accessibilityRole="summary" accessibilityLabel="Hope predictive entertainment disclosure">
          <Text style={styles.star}>✦</Text>
          <Text style={styles.title}>Meet Hope</Text>
          <Text style={styles.body}>{text || 'Hope is an adaptive Oracle for predictive entertainment, curiosity, and self-exploration—not factual certainty or professional advice. Hope predicts. Reality happens. You validate. Hope learns.'}</Text>
          <Text style={styles.detail}>Hope keeps original calls visible. You decide whether reality matched. Important medical, legal, financial, and emergency decisions require qualified real-world help.</Text>
          {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={accept} disabled={saving} accessibilityRole="button" accessibilityLabel="I understand, continue to Hope">
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>I understand — continue to Hope</Text>}
          </TouchableOpacity>
          {!!version && <Text style={styles.version}>Disclosure {version}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,7,18,0.88)', justifyContent: 'center', padding: 22 },
  card: { borderRadius: 24, padding: 24, backgroundColor: '#171225', borderWidth: 1, borderColor: 'rgba(217,70,239,0.35)' },
  star: { color: '#D946EF', fontSize: 32, marginBottom: 10 },
  title: { color: '#fff', fontSize: 25, fontWeight: '700', marginBottom: 12 },
  body: { color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 24 },
  detail: { color: 'rgba(255,255,255,0.58)', fontSize: 13, lineHeight: 20, marginTop: 14 },
  error: { color: '#FCA5A5', marginTop: 12 },
  button: { minHeight: 50, marginTop: 22, borderRadius: 14, backgroundColor: '#9333EA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  version: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 10 }
});
