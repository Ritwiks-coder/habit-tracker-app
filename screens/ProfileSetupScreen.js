import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ProfileSetupScreen = () => {
  const { completeOnboarding } = useApp();

  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);

  const genders = [
    { id: 'Male', icon: '👨', label: 'Male' },
    { id: 'Female', icon: '👩', label: 'Female' },
    { id: 'Other', icon: '✨', label: 'Other' },
  ];

  const ages = [
    { id: 'Under 18', label: 'Under 18', sub: 'The Kid' },
    { id: '18-29', label: '18 - 29', sub: 'Young Adult' },
    { id: '30-49', label: '30 - 49', sub: 'The Adult' },
    { id: '50+', label: '50+', sub: 'Silver Fox' },
  ];

  const handleFinish = async () => {
    if (selectedGender && selectedAge) {
      await completeOnboarding(selectedGender, selectedAge);
    }
  };

  const isReady = selectedGender && selectedAge;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.headerTitle}>Welcome.</Text>
        <Text style={styles.headerSubtitle}>
          Let's tailor this experience so we know exactly how to motivate you.
        </Text>

        {/* --- GENDER SELECTION --- */}
        <Text style={styles.sectionTitle}>How do you identify?</Text>
        <View style={styles.row}>
          {genders.map((item) => {
            const isActive = selectedGender === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, isActive && styles.activeCard]}
                onPress={() => setSelectedGender(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={[styles.cardLabel, isActive && styles.activeText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- AGE SELECTION --- */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Where are you at in life?</Text>
        <View style={styles.grid}>
          {ages.map((item) => {
            const isActive = selectedAge === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.gridCard, isActive && styles.activeCard]}
                onPress={() => setSelectedAge(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.gridLabel, isActive && styles.activeText]}>
                  {item.label}
                </Text>
                <Text style={[styles.gridSub, isActive && styles.activeText]}>{item.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>

      {/* --- FLOATING FINISH BUTTON --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleFinish}
          disabled={!isReady}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isReady ? ['#10B981', '#059669'] : ['#F3F4F6', '#E5E7EB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.button, !isReady && styles.buttonDisabled]}
          >
            <Text style={[styles.buttonText, !isReady && { color: '#9CA3AF' }]}>
              {isReady ? "Let's Go 🚀" : "Select options to continue"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileSetupScreen;

const styles = StyleSheet.create({
  // Clean white background
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },

  // Dark text for light mode
  headerTitle: { fontSize: 36, fontWeight: '900', color: '#1C1C1E', marginBottom: 10 },
  headerSubtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 40 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 16 },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },

  // Light gray cards instead of dark blue
  card: { flex: 1, backgroundColor: '#F9FAFB', paddingVertical: 20, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6' },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#4B5563' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridCard: { width: (width - 60) / 2, backgroundColor: '#F9FAFB', paddingVertical: 20, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6' },
  gridLabel: { fontSize: 18, fontWeight: 'bold', color: '#4B5563', marginBottom: 4 },
  gridSub: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  // Active state: Green border with very light green background tint
  activeCard: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  activeText: { color: '#10B981' },

  footer: { paddingHorizontal: 24, paddingBottom: 30, paddingTop: 10 },
  button: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 1 }, // Handled by gradient colors now
  buttonText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
});