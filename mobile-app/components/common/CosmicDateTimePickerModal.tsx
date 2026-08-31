import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, Check, X } from 'lucide-react-native';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  { value: 1, label: 'Jan', full: 'January' },
  { value: 2, label: 'Feb', full: 'February' },
  { value: 3, label: 'Mar', full: 'March' },
  { value: 4, label: 'Apr', full: 'April' },
  { value: 5, label: 'May', full: 'May' },
  { value: 6, label: 'Jun', full: 'June' },
  { value: 7, label: 'Jul', full: 'July' },
  { value: 8, label: 'Aug', full: 'August' },
  { value: 9, label: 'Sep', full: 'September' },
  { value: 10, label: 'Oct', full: 'October' },
  { value: 11, label: 'Nov', full: 'November' },
  { value: 12, label: 'Dec', full: 'December' },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'] as const;

interface CosmicDatePickerModalProps {
  visible: boolean;
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;
  onSelectDay: (day: number) => void;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CosmicDatePickerModal({
  visible,
  selectedDay,
  selectedMonth,
  selectedYear,
  onSelectDay,
  onSelectMonth,
  onSelectYear,
  onConfirm,
  onCancel,
}: CosmicDatePickerModalProps) {
  const monthObj = MONTHS.find((m) => m.value === selectedMonth) || MONTHS[7];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <LinearGradient
            colors={['#7209B7', '#4361EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerIconCircle}>
              <Calendar size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Select Birth Date</Text>
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                {selectedDay} {monthObj.full} {selectedYear}
              </Text>
            </View>
          </LinearGradient>

          {/* Wheel Columns */}
          <View style={styles.columnsContainer}>
            {/* Day Column */}
            <View style={styles.columnWrapper}>
              <Text style={styles.columnHeader}>DAY</Text>
              <ScrollView
                style={styles.scroller}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerContent}
              >
                {DAYS.map((d) => {
                  const isActive = selectedDay === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => onSelectDay(d)}
                      style={[styles.itemBtn, isActive && styles.itemBtnActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Month Column */}
            <View style={[styles.columnWrapper, { flex: 1.2 }]}>
              <Text style={styles.columnHeader}>MONTH</Text>
              <ScrollView
                style={styles.scroller}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerContent}
              >
                {MONTHS.map((m) => {
                  const isActive = selectedMonth === m.value;
                  return (
                    <TouchableOpacity
                      key={m.value}
                      onPress={() => onSelectMonth(m.value)}
                      style={[styles.itemBtn, isActive && styles.itemBtnActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Year Column */}
            <View style={[styles.columnWrapper, { flex: 1.1 }]}>
              <Text style={styles.columnHeader}>YEAR</Text>
              <ScrollView
                style={styles.scroller}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerContent}
              >
                {YEARS.map((y) => {
                  const isActive = selectedYear === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      onPress={() => onSelectYear(y)}
                      style={[styles.itemBtn, isActive && styles.itemBtnActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface CosmicTimePickerModalProps {
  visible: boolean;
  selectedHour: number;
  selectedMinute: number;
  selectedPeriod: 'AM' | 'PM';
  onSelectHour: (h: number) => void;
  onSelectMinute: (m: number) => void;
  onSelectPeriod: (p: 'AM' | 'PM') => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CosmicTimePickerModal({
  visible,
  selectedHour,
  selectedMinute,
  selectedPeriod,
  onSelectHour,
  onSelectMinute,
  onSelectPeriod,
  onConfirm,
  onCancel,
}: CosmicTimePickerModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <LinearGradient
            colors={['#7209B7', '#F72585']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerIconCircle}>
              <Clock size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Select Birth Time</Text>
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                {selectedHour}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod}
              </Text>
            </View>
          </LinearGradient>

          {/* Wheel Columns */}
          <View style={styles.columnsContainer}>
            {/* Hour Column */}
            <View style={styles.columnWrapper}>
              <Text style={styles.columnHeader}>HOUR</Text>
              <ScrollView
                style={styles.scroller}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerContent}
              >
                {HOURS.map((h) => {
                  const isActive = selectedHour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      onPress={() => onSelectHour(h)}
                      style={[styles.itemBtn, isActive && styles.itemBtnActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Minute Column */}
            <View style={styles.columnWrapper}>
              <Text style={styles.columnHeader}>MIN</Text>
              <ScrollView
                style={styles.scroller}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerContent}
              >
                {MINUTES.map((m) => {
                  const isActive = selectedMinute === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => onSelectMinute(m)}
                      style={[styles.itemBtn, isActive && styles.itemBtnActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                        {String(m).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Period Column (AM/PM) */}
            <View style={styles.columnWrapper}>
              <Text style={styles.columnHeader}>AM/PM</Text>
              <View style={[styles.scrollerContent, { marginTop: 10 }]}>
                {PERIODS.map((p) => {
                  const isActive = selectedPeriod === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => onSelectPeriod(p)}
                      style={[
                        styles.itemBtn,
                        { marginVertical: 8, paddingVertical: 12 },
                        isActive && styles.itemBtnActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>Confirm Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 30, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  selectedBadgeText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  columnsContainer: {
    flexDirection: 'row',
    height: 220,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FAF9FE',
  },
  columnWrapper: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  columnHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#7209B7',
    letterSpacing: 1,
    marginBottom: 6,
  },
  scroller: {
    flex: 1,
    width: '100%',
  },
  scrollerContent: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  itemBtn: {
    width: '90%',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
  },
  itemBtnActive: {
    backgroundColor: '#7209B7',
    borderColor: '#7209B7',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  itemText: {
    fontFamily: 'SourceSerif4',
    fontSize: 14,
    color: '#2C2B3D',
  },
  itemTextActive: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  footerActions: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 9, 183, 0.08)',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#7209B7',
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#7209B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
