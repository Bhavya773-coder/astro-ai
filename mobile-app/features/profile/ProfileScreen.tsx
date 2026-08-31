import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Sparkles,
  Bell,
  Sun,
  Moon,
  Smile,
  HelpCircle,
  Lock,
  LogOut,
  Info,
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  Clock,
  User,
} from 'lucide-react-native';
import GoldCoin from '../../components/common/GoldCoin';
import PlacesAutocompleteModal from '../../components/common/PlacesAutocompleteModal';
import { haptic } from '../../haptics';

interface ProfileScreenProps {
  userName: string;
  birthdate: string;
  profileAnswers: Record<string, string>;
  zodiac: any;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  insets: { bottom: number; top: number; left: number; right: number };
  isDark: boolean;
  setMode: (mode: 'light' | 'dark') => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  editFullName: string;
  setEditFullName: (val: string) => void;
  editBirthdate: string;
  setEditBirthdate: (val: string) => void;
  editBirthtime: string;
  setEditBirthtime: (val: string) => void;
  editBirthplace: string;
  setEditBirthplace: (val: string) => void;
  editCurrentLocation?: string;
  setEditCurrentLocation?: (val: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  startEditing: () => void;
  saveProfileDetails: () => void;
  currentProfileSubView: 'profile' | 'help' | 'privacy' | 'credits' | 'terms';
  setCurrentProfileSubView: (view: 'profile' | 'help' | 'privacy' | 'credits' | 'terms') => void;
  previousProfileSubView: 'profile' | 'credits';
  setPreviousProfileSubView: (view: 'profile' | 'credits') => void;
  setIsDatePickerVisible: (val: boolean) => void;
  setIsTimePickerVisible: (val: boolean) => void;
  setIsFeedbackModalOpen: (val: boolean) => void;
  cameraPermissionGranted: boolean;
  libraryPermissionGranted: boolean;
  toggleCameraPermission: () => void;
  toggleLibraryPermission: () => void;
  checkPermissions: () => void;
  handleDeleteAccount: () => void;
  onLogout: () => void;
  isPurchasingCredit: boolean;
  handlePurchase: (bundleId: string, bundleName: string, addCount: number) => Promise<void>;
}

export function ProfileScreen({
  userName,
  birthdate,
  profileAnswers,
  zodiac,
  credits,
  insets,
  isDark,
  setMode,
  isEditingProfile,
  setIsEditingProfile,
  editFullName,
  setEditFullName,
  editBirthdate,
  setEditBirthdate,
  editBirthtime,
  setEditBirthtime,
  editBirthplace,
  setEditBirthplace,
  editCurrentLocation = '',
  setEditCurrentLocation,
  notificationsEnabled,
  setNotificationsEnabled,
  startEditing,
  saveProfileDetails,
  currentProfileSubView,
  setCurrentProfileSubView,
  previousProfileSubView,
  setPreviousProfileSubView,
  setIsDatePickerVisible,
  setIsTimePickerVisible,
  setIsFeedbackModalOpen,
  cameraPermissionGranted,
  libraryPermissionGranted,
  toggleCameraPermission,
  toggleLibraryPermission,
  checkPermissions,
  handleDeleteAccount,
  onLogout,
  isPurchasingCredit,
  handlePurchase,
}: ProfileScreenProps) {
  const isIOS = Platform.OS === 'ios';
  const [activePlacesTarget, setActivePlacesTarget] = useState<'birthplace' | 'living' | null>(null);

  const bundles = [
    {
      id: 'cosmic_starter',
      name: 'Cosmic Starter',
      count: 50,
      price: isIOS ? '₹499/mo' : '₹399/mo',
      priceUSD: isIOS ? '$5.99/mo' : '$4.99/mo',
      color: ['#4A00E0', '#8E2DE2'],
      features: [
        '50 Monthly Credits (No Rollover)',
        'Free Birth Chart & Daily Forecast',
        'Unlimited Text Chat with Hope',
        'Basic Calendar (Up to 10 events/mo)',
        'Basic Chart Overlay & Event Guidance',
        'Standard Processing Speed',
        '1 CR StyleForecaster | 10 CR Picture Readings'
      ]
    },
    {
      id: 'cosmic_explorer',
      name: 'Cosmic Explorer',
      count: 180,
      price: isIOS ? '₹1,499/mo' : '₹1,199/mo',
      priceUSD: isIOS ? '$17.99/mo' : '$14.99/mo',
      color: ['#7209B7', '#F72585'],
      popular: true,
      features: [
        '180 Monthly Credits (No Rollover)',
        'Free Birth Chart & Daily Forecast',
        'Unlimited Text Chat with Hope',
        'Premium Calendar (Unlimited Events)',
        'Detailed Chart Overlay & Reminders',
        'Limited Forecast Reports Included',
        '1 CR StyleForecaster | 10 CR Picture Readings'
      ]
    },
    {
      id: 'cosmic_sage',
      name: 'Cosmic Sage',
      count: 450,
      price: isIOS ? '₹2,999/mo' : '₹2,399/mo',
      priceUSD: isIOS ? '$34.99/mo' : '$29.99/mo',
      color: ['#F3904F', '#3B4371'],
      features: [
        '450 Monthly Credits (No Rollover)',
        'Free Birth Chart & Daily Forecast',
        'Unlimited Text Chat with Hope',
        'Master Calendar (Unlimited Events)',
        'Deep Analysis Overlay & Guidance',
        'Full Comprehensive Forecast Reports',
        'VIP Priority Processing Speed',
        '1 CR StyleForecaster | 10 CR Picture Readings'
      ]
    },
  ];

  if (currentProfileSubView === 'help') {
    return (
      <View style={styles.subViewContainer}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView('profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Help & Support</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll}>
          <View style={styles.helpHeaderCard}>
            <Text style={styles.helpHeaderTitle}>How can we guide you?</Text>
            <Text style={styles.helpHeaderDesc}>
              Explore answers to common questions or reach our astrologers directly.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I earn more credits?</Text>
            <Text style={styles.faqAnswer}>
              AstroAi4u provides daily credits. If you need more, you can explore membership plans, numerology calculations, or view tarot spreads.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How accurate are the readings?</Text>
            <Text style={styles.faqAnswer}>
              Our charts are based on ancient Vedic Astrology principles. Calculations depend on your exact birth time and location coordinates.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Is my face/palm scan photo saved?</Text>
            <Text style={styles.faqAnswer}>
              Never. All face and palm images are processed locally on your device in real-time. We do not store or share private biometric pictures.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.contactSupportBtn}
            onPress={() => {
              Linking.openURL('mailto:arcadian@arcddia.co.in').catch(() => {
                Alert.alert('Email Us', 'Please email us directly at: arcadian@arcddia.co.in');
              });
            }}
          >
            <LinearGradient
              colors={['#7209B7', '#F72585']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactSupportGradient}
            >
              <Text style={styles.contactSupportText}>EMAIL SUPPORT</Text>
              <Text style={styles.contactSupportSub}>arcadian@arcddia.co.in</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  }

  if (currentProfileSubView === 'privacy') {
    return (
      <View style={styles.subViewContainer}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView(previousProfileSubView || 'profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Privacy Policy</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll}>
          <View style={styles.helpHeaderCard}>
            <Text style={styles.helpHeaderTitle}>Privacy Policy & Data Security</Text>
            <Text style={styles.helpHeaderDesc}>
              AstroAi4u is built on Privacy by Design. We respect your personal data and adhere strictly to App Store & Google Play privacy guidelines.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>1. Zero Biometric Storage</Text>
            <Text style={styles.faqAnswer}>
              All palm, face, and coffee reading photos are processed locally in real-time. We NEVER store, sell, or share biometric image data on any external server.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>2. Birth Information Usage</Text>
            <Text style={styles.faqAnswer}>
              Your full name, birthdate, birth time, and birth location coordinates are used exclusively to compute accurate Vedic horoscope charts.
            </Text>
          </View>

          <Text style={styles.helpSectionTitle}>Device App Permissions</Text>

          <View style={styles.permissionBar}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Camera Access</Text>
              <Text style={styles.permissionDesc}>Used to capture live photos for real-time palm or face scans.</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleCameraPermission}
              style={[styles.switchTrack, cameraPermissionGranted ? styles.switchTrackOn : styles.switchTrackOff]}
            >
              <View style={[styles.switchThumb, cameraPermissionGranted ? styles.switchThumbOn : styles.switchThumbOff]} />
            </TouchableOpacity>
          </View>

          <View style={styles.permissionBar}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Photo Gallery Uploads</Text>
              <Text style={styles.permissionDesc}>Used to select saved pictures from your photo library.</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleLibraryPermission}
              style={[styles.switchTrack, libraryPermissionGranted ? styles.switchTrackOn : styles.switchTrackOff]}
            >
              <View style={[styles.switchThumb, libraryPermissionGranted ? styles.switchThumbOn : styles.switchThumbOff]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.systemSettingsBtn} onPress={() => Linking.openSettings()}>
            <Text style={styles.systemSettingsBtnText}>Open Device System Settings</Text>
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  }

  if (currentProfileSubView === 'terms') {
    return (
      <View style={styles.subViewContainer}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView(previousProfileSubView || 'profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Terms of Service</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll}>
          <View style={styles.helpHeaderCard}>
            <Text style={styles.helpHeaderTitle}>Terms of Service</Text>
            <Text style={styles.helpHeaderDesc}>
              AstroAi4u Services & Subscriptions Policy. Last updated: July 2026.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>1. Agreement to Terms</Text>
            <Text style={styles.faqAnswer}>
              By downloading, creating an account, or using AstroAi4u, you agree to comply with and be bound by these Terms of Service.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>2. In-App Subscriptions</Text>
            <Text style={styles.faqAnswer}>
              Subscriptions automatically renew monthly unless auto-renew is disabled at least 24 hours prior to the current period ending.
            </Text>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  }

  if (currentProfileSubView === 'credits') {
    return (
      <View style={styles.subViewContainer}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView('profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Cosmic Membership Plans</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll} nestedScrollEnabled={true}>
          <View style={styles.balanceHeaderCard}>
            <Sparkles size={28} color="#FFD700" style={{ marginBottom: 8 }} />
            <Text style={styles.balanceHeaderTitle}>Current Balance</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 2 }}>
              <GoldCoin size={22} style={{ marginRight: 6 }} />
              <Text style={styles.balanceHeaderValue}>{credits} Credits</Text>
            </View>
            <Text style={styles.balanceHeaderDesc}>
              Choose a monthly plan to get credits, unlock daily forecasts, personalized charts, and AI consultations.
            </Text>
          </View>

          <Text style={styles.helpSectionTitle}>Select Membership Plan</Text>

          {bundles.map((bundle) => (
            <View
              key={bundle.id}
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: bundle.popular ? 2 : 1,
                borderColor: bundle.popular ? '#F72585' : 'rgba(255, 255, 255, 0.15)',
                elevation: 6,
                shadowColor: bundle.popular ? '#F72585' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <LinearGradient
                colors={bundle.color as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 20 }}
              >
                {bundle.popular && (
                  <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#F72585',
                    paddingHorizontal: 12,
                    paddingVertical: 3,
                    borderRadius: 12,
                    marginBottom: 10
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' }}>{bundle.name}</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>{bundle.price}</Text>
                </View>

                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginBottom: 12 }}>Equivalent to {bundle.priceUSD}</Text>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 12,
                  marginBottom: 16
                }}>
                  <GoldCoin size={16} style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 13 }}>{bundle.count} Monthly Credits</Text>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)', paddingTop: 12, marginBottom: 16 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Included Features</Text>
                  {bundle.features.map((feat, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: '#00FFC2', marginRight: 8, fontSize: 13, fontWeight: 'bold' }}>✓</Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 12, fontWeight: '500', flex: 1 }}>
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  disabled={isPurchasingCredit}
                  onPress={() => handlePurchase(bundle.id, bundle.name, bundle.count)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    marginTop: 6
                  }}
                >
                  {isPurchasingCredit ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 }}>SUBSCRIBE NOW</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ))}

          <View style={{
            marginHorizontal: 20,
            marginTop: 14,
            marginBottom: 30,
            padding: 18,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(114, 9, 183, 0.15)',
            shadowColor: '#7209B7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Lock size={15} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={{ color: '#2C2B3D', fontSize: 13, fontFamily: 'Cinzel-Bold' }}>
                Subscription Terms & Privacy Notice
              </Text>
            </View>

            <Text style={{ color: '#726F8D', fontSize: 11, fontFamily: 'SourceSerif4', textAlign: 'center', lineHeight: 16, marginBottom: 14 }}>
              Subscriptions auto-renew monthly unless canceled at least 24 hours before renewal in Account Settings.
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setPreviousProfileSubView('credits'); setCurrentProfileSubView('terms'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(247, 37, 133, 0.08)',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(247, 37, 133, 0.25)'
                }}
              >
                <FileText size={13} color="#F72585" style={{ marginRight: 5 }} />
                <Text style={{ color: '#F72585', fontSize: 11.5, fontFamily: 'Cinzel-Bold' }}>Terms of Service</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setPreviousProfileSubView('credits'); setCurrentProfileSubView('privacy'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(114, 9, 183, 0.08)',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(114, 9, 183, 0.25)'
                }}
              >
                <Lock size={13} color="#7209B7" style={{ marginRight: 5 }} />
                <Text style={{ color: '#7209B7', fontSize: 11.5, fontFamily: 'Cinzel-Bold' }}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabScroll}>
      <Text style={styles.tabViewTitle}>Celestial Profile</Text>

      {/* User Card */}
      {!isEditingProfile ? (
        <View style={styles.profileDetailsCard}>
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.profileInitials}>{userName.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileSubText}>Zodiac Sign: {zodiac?.name}</Text>

          <View style={styles.profileGrid}>
            <View style={styles.profileGridItem}>
              <Text style={styles.profileGridLabel}>BIRTHDATE</Text>
              <Text style={styles.profileGridValue}>{birthdate || 'Not set'}</Text>
            </View>
            <View style={styles.profileGridItem}>
              <Text style={styles.profileGridLabel}>BIRTH TIME</Text>
              <Text style={styles.profileGridValue}>{profileAnswers.birthtime || 'Not set'}</Text>
            </View>
          </View>

          <View style={[styles.profileGrid, { marginTop: 10, borderTopWidth: 0 }]}>
            <View style={styles.profileGridItem}>
              <Text style={styles.profileGridLabel}>BIRTHPLACE</Text>
              <Text style={styles.profileGridValue} numberOfLines={2}>{profileAnswers.birthplace || 'Not set'}</Text>
            </View>
            <View style={styles.profileGridItem}>
              <Text style={styles.profileGridLabel}>CURRENT LIVING PLACE</Text>
              <Text style={styles.profileGridValue} numberOfLines={2}>{profileAnswers.current_location || 'Not set'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileBtn} onPress={startEditing}>
            <Sparkles size={13} color="#7209B7" style={{ marginRight: 6 }} />
            <Text style={styles.editProfileBtnText}>Edit Profile Details</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileDetailsCard}>
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.profileInitials}>
              {(editFullName || userName).substring(0, 2).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.editSectionTitle}>Edit Profile & Astrological Alignment</Text>

          {/* Full Name Input */}
          <View style={styles.editFieldRow}>
            <Text style={styles.editFieldLabel}>FULL NAME</Text>
            <TextInput
              style={styles.profileNameInput}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder="Full Name"
              placeholderTextColor="#9E9BB3"
            />
          </View>

          {/* Birth Date Picker */}
          <View style={styles.editFieldRow}>
            <Text style={styles.editFieldLabel}>BIRTHDATE</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsDatePickerVisible(true)}
              style={styles.pickerTriggerBtn}
            >
              <Calendar size={14} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={styles.pickerTriggerBtnText}>{editBirthdate || 'Select Date'}</Text>
            </TouchableOpacity>
          </View>

          {/* Birth Time Picker */}
          <View style={styles.editFieldRow}>
            <Text style={styles.editFieldLabel}>BIRTH TIME</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsTimePickerVisible(true)}
              style={styles.pickerTriggerBtn}
            >
              <Clock size={14} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={styles.pickerTriggerBtnText}>{editBirthtime || 'Select Time'}</Text>
            </TouchableOpacity>
          </View>

          {/* Birthplace Places Picker */}
          <View style={styles.editFieldRow}>
            <Text style={styles.editFieldLabel}>BIRTHPLACE (FREE PLACES API)</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActivePlacesTarget('birthplace')}
              style={styles.pickerTriggerBtn}
            >
              <MapPin size={14} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={styles.pickerTriggerBtnText} numberOfLines={1}>
                {editBirthplace || 'Search & Pick Birthplace...'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Living Place Places Picker */}
          <View style={styles.editFieldRow}>
            <Text style={styles.editFieldLabel}>CURRENT LIVING PLACE</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActivePlacesTarget('living')}
              style={styles.pickerTriggerBtn}
            >
              <MapPin size={14} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={styles.pickerTriggerBtnText} numberOfLines={1}>
                {editCurrentLocation || 'Search & Pick Living Location...'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.editActionsRow}>
            <TouchableOpacity style={[styles.editActionBtn, styles.editCancelBtn]} onPress={() => setIsEditingProfile(false)}>
              <Text style={styles.editCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.editActionBtn, styles.editSaveBtn]} onPress={saveProfileDetails}>
              <Text style={styles.editSaveBtnText}>Save & Recalculate All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Credits Card */}
      <View style={styles.profileCreditsCard}>
        <View style={styles.profileCreditsLeft}>
          <GoldCoin size={24} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.profileCreditsTitle}>Cosmic Credits</Text>
            <Text style={styles.profileCreditsBalance}>Balance: {credits} CR</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileCreditsBuyBtn}
          activeOpacity={0.8}
          onPress={() => setCurrentProfileSubView('credits')}
        >
          <Text style={styles.profileCreditsBuyBtnText}>Membership Plans</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Notifications Bar */}
      <View style={styles.profileBar}>
        <View style={styles.profileBarLeft}>
          <View style={[styles.barIconBg, { backgroundColor: 'rgba(114, 9, 183, 0.08)' }]}>
            <Bell size={18} color="#7209B7" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.barTitle}>Daily Horoscope Alerts</Text>
            <Text style={styles.barSubtitle}>Receive updates on your vibe chart</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          style={[styles.switchTrack, notificationsEnabled ? styles.switchTrackOn : styles.switchTrackOff]}
        >
          <View style={[styles.switchThumb, notificationsEnabled ? styles.switchThumbOn : styles.switchThumbOff]} />
        </TouchableOpacity>
      </View>

      {/* Theme Toggle */}
      <TouchableOpacity
        style={styles.profileBar}
        activeOpacity={0.7}
        onPress={() => { haptic.press(); setMode(isDark ? 'light' : 'dark'); }}
      >
        <View style={styles.profileBarLeft}>
          <View style={[styles.barIconBg, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(114, 9, 183, 0.08)' }]}>
            {isDark ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#7209B7" />}
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.barTitle}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
            <Text style={styles.barSubtitle}>Toggle cosmic ambiance</Text>
          </View>
        </View>
        <Info size={16} color="#B3A2E7" />
      </TouchableOpacity>

      {/* Feedback & Reviews */}
      <TouchableOpacity style={styles.profileBar} activeOpacity={0.7} onPress={() => setIsFeedbackModalOpen(true)}>
        <View style={styles.profileBarLeft}>
          <View style={[styles.barIconBg, { backgroundColor: 'rgba(247, 37, 133, 0.08)' }]}>
            <Smile size={18} color="#F72585" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.barTitle}>Feedback & Reviews</Text>
            <Text style={styles.barSubtitle}>Share your reviews and suggestions</Text>
          </View>
        </View>
        <Info size={16} color="#B3A2E7" />
      </TouchableOpacity>

      {/* Help & Support */}
      <TouchableOpacity
        style={styles.profileBar}
        activeOpacity={0.7}
        onPress={() => setCurrentProfileSubView('help')}
      >
        <View style={styles.profileBarLeft}>
          <View style={[styles.barIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
            <HelpCircle size={18} color="#3B82F6" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.barTitle}>Help & Support</Text>
            <Text style={styles.barSubtitle}>arcadian@arcddia.co.in</Text>
          </View>
        </View>
        <Info size={16} color="#B3A2E7" />
      </TouchableOpacity>

      {/* Privacy & Security */}
      <TouchableOpacity
        style={styles.profileBar}
        activeOpacity={0.7}
        onPress={() => {
          setPreviousProfileSubView('profile');
          setCurrentProfileSubView('privacy');
          checkPermissions();
        }}
      >
        <View style={styles.profileBarLeft}>
          <View style={[styles.barIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
            <Lock size={18} color="#10B981" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.barTitle}>Privacy & Security</Text>
            <Text style={styles.barSubtitle}>Camera, Photos, and Data Permissions</Text>
          </View>
        </View>
        <Info size={16} color="#B3A2E7" />
      </TouchableOpacity>

      {/* Logout Option */}
      <TouchableOpacity style={styles.logoutProfileBtn} onPress={onLogout}>
        <LogOut size={16} color="#E63946" style={{ marginRight: 8 }} />
        <Text style={styles.logoutProfileText}>Sign Out from AstroAi4u</Text>
      </TouchableOpacity>

      {/* Delete Account Option */}
      <TouchableOpacity
        style={[styles.logoutProfileBtn, { marginTop: 12, backgroundColor: 'rgba(230, 57, 70, 0.08)', borderColor: 'rgba(230, 57, 70, 0.2)' }]}
        onPress={handleDeleteAccount}
      >
        <MaterialCommunityIcons name="delete-forever" size={18} color="#E63946" style={{ marginRight: 8 }} />
        <Text style={[styles.logoutProfileText, { color: '#E63946' }]}>Permanently Delete Account</Text>
      </TouchableOpacity>

      {/* Places Autocomplete Modal for Birthplace / Living place */}
      <PlacesAutocompleteModal
        visible={activePlacesTarget !== null}
        title={activePlacesTarget === 'birthplace' ? 'Select Birth Place' : 'Select Current Living Place'}
        placeholder="Type city, state, or country..."
        initialValue={activePlacesTarget === 'birthplace' ? editBirthplace : editCurrentLocation}
        onClose={() => setActivePlacesTarget(null)}
        onSelect={(place) => {
          if (activePlacesTarget === 'birthplace') {
            setEditBirthplace(place.displayName);
          } else if (activePlacesTarget === 'living' && setEditCurrentLocation) {
            setEditCurrentLocation(place.displayName);
          }
        }}
      />

      <View style={{ height: 100 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabViewTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 24,
    color: '#2C2B3D',
    marginBottom: 16,
    marginTop: 8,
  },
  profileDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.10)',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profileAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7209B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileInitials: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  profileName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 20,
    color: '#2C2B3D',
  },
  profileSubText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    marginTop: 2,
  },
  editSectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#7209B7',
    marginVertical: 10,
  },
  profileGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 111, 141, 0.08)',
  },
  profileGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  profileGridLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#726F8D',
    letterSpacing: 0.5,
  },
  profileGridValue: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12,
    color: '#2C2B3D',
    marginTop: 4,
    textAlign: 'center',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 16,
  },
  editProfileBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#7209B7',
  },
  editFieldRow: {
    width: '100%',
    marginBottom: 12,
  },
  editFieldLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#726F8D',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  profileNameInput: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#2C2B3D',
    backgroundColor: 'rgba(114, 9, 183, 0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
  },
  pickerTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(114, 9, 183, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
  },
  pickerTriggerBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12.5,
    color: '#7209B7',
    flex: 1,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  editActionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelBtn: {
    backgroundColor: 'rgba(114, 111, 141, 0.1)',
  },
  editCancelBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#726F8D',
  },
  editSaveBtn: {
    backgroundColor: '#7209B7',
  },
  editSaveBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  profileCreditsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.10)',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  profileCreditsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCreditsTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#2C2B3D',
  },
  profileCreditsBalance: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    marginTop: 1,
  },
  profileCreditsBuyBtn: {
    backgroundColor: '#7209B7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  profileCreditsBuyBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  profileBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  barIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#2C2B3D',
  },
  barSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    marginTop: 1,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#7209B7',
  },
  switchTrackOff: {
    backgroundColor: 'rgba(114, 111, 141, 0.2)',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  logoutProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.06)',
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.15)',
  },
  logoutProfileText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#E63946',
  },
  subViewContainer: {
    flex: 1,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 9, 183, 0.08)',
  },
  subHeaderBackBtn: {
    padding: 6,
    marginRight: 8,
  },
  subHeaderTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 17,
    color: '#2C2B3D',
  },
  subScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  helpHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.1)',
  },
  helpHeaderTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
    marginBottom: 4,
  },
  helpHeaderDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    lineHeight: 18,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  faqQuestion: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#7209B7',
    marginBottom: 4,
  },
  faqAnswer: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#555469',
    lineHeight: 18,
  },
  contactSupportBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  contactSupportGradient: {
    padding: 16,
    alignItems: 'center',
  },
  contactSupportText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  contactSupportSub: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  helpSectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#2C2B3D',
    marginVertical: 12,
  },
  permissionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  permissionInfo: {
    flex: 1,
    marginRight: 10,
  },
  permissionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#2C2B3D',
  },
  permissionDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    marginTop: 2,
  },
  systemSettingsBtn: {
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  systemSettingsBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
  },
  balanceHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.1)',
  },
  balanceHeaderTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#726F8D',
  },
  balanceHeaderValue: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 24,
    color: '#2C2B3D',
  },
  balanceHeaderDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
});

export default ProfileScreen;
