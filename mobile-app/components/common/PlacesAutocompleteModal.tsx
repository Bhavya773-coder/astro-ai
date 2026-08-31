import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Search, MapPin, X, Check } from 'lucide-react-native';
import { searchPlaces, PlaceItem } from '../../services/placesService';
import { haptic } from '../../haptics';

interface PlacesAutocompleteModalProps {
  visible: boolean;
  title?: string;
  placeholder?: string;
  initialValue?: string;
  onClose: () => void;
  onSelect: (place: PlaceItem) => void;
}

export function PlacesAutocompleteModal({
  visible,
  title = 'Select Location',
  placeholder = 'Type city, state, or country...',
  initialValue = '',
  onClose,
  onSelect,
}: PlacesAutocompleteModalProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setQuery(initialValue);
      if (initialValue && initialValue.length >= 2) {
        doSearch(initialValue);
      } else {
        setResults([]);
      }
    }
  }, [visible, initialValue]);

  const doSearch = async (text: string) => {
    if (!text || text.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const places = await searchPlaces(text);
      setResults(places);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      doSearch(text);
    }, 280);
  };

  const handleSelectPlace = (place: PlaceItem) => {
    haptic.press();
    onSelect(place);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MapPin size={20} color="#7209B7" />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#726F8D" />
            </TouchableOpacity>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Search size={18} color="#7209B7" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#9E9BB3"
              value={query}
              onChangeText={handleChangeText}
              autoFocus={true}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {loading && <ActivityIndicator size="small" color="#7209B7" />}
          </View>

          {/* Results List */}
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.7}
                onPress={() => handleSelectPlace(item)}
              >
                <View style={styles.pinIconWrapper}>
                  <MapPin size={16} color="#7209B7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.displayName}</Text>
                </View>
                {initialValue === item.displayName && (
                  <Check size={16} color="#03B07A" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loading && query.trim().length >= 2 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching places found.</Text>
                  <TouchableOpacity
                    style={styles.useCustomBtn}
                    onPress={() => {
                      handleSelectPlace({
                        id: `custom_${Date.now()}`,
                        name: query.trim(),
                        country: '',
                        displayName: query.trim(),
                      });
                    }}
                  >
                    <Text style={styles.useCustomBtnText}>Use "{query.trim()}"</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: 400,
    paddingTop: 18,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 17,
    color: '#2C2B3D',
  },
  closeBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 9, 183, 0.16)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 15,
    color: '#2C2B3D',
    padding: 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 111, 141, 0.08)',
    gap: 12,
  },
  pinIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#2C2B3D',
  },
  itemSub: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
  },
  useCustomBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  useCustomBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
  },
});

export default PlacesAutocompleteModal;
