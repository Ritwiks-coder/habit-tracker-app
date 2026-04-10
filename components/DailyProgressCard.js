import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { generateDynamicMessage } from '../utils/sassyRoastGenerator'; 

const DailyProgressCard = ({ completedCount, totalTasks, skippedCount = 0, userProfile, isSassyMode, currentStreak = 0 }) => {
  
  // 🔥 THE FIX: Subtract skipped tasks so they aren't penalized
  const activeTotal = totalTasks - skippedCount;
  
  // Calculate percentage based on their "True Goal" for today
  let progressPercentage = 0;
  if (totalTasks > 0 && activeTotal === 0) {
    progressPercentage = 100; // They skipped literally everything, but technically cleared the board!
  } else if (activeTotal > 0) {
    progressPercentage = Math.round((completedCount / activeTotal) * 100);
  }
  
  const dailyMessage = totalTasks === 0 
    ? "Add some habits to get started!" 
    : generateDynamicMessage(userProfile, isSassyMode, progressPercentage);

  return (
    <View style={styles.card}>
      
      {/* Centered Top Row: Stats & Streak */}
      <View style={styles.statsRow}>
        <Text style={styles.progressText}>
          <Text style={{ color: '#10B981', fontWeight: '900', fontSize: 16 }}>{completedCount}</Text>
          <Text style={{ color: '#9CA3AF' }}> / {activeTotal} Tasks Completed</Text>
        </Text>
        
        <View style={styles.streakBadge}>
          <MaterialCommunityIcons name="fire" size={14} color="#F59E0B" />
          <Text style={styles.streakText}>{currentStreak}</Text>
        </View>
      </View>

      {/* Ultra-Thin Progress Bar */}
      <View style={styles.barBackground}>
        <LinearGradient
          colors={['#34D399', '#10B981']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${progressPercentage}%` }]}
        />
      </View>

      {/* Centered Sassy Message */}
      <Text style={styles.message} numberOfLines={1}>
        {dailyMessage}
      </Text>

    </View>
  );
};

export default DailyProgressCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12, 
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
    gap: 10, 
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
    marginLeft: 2,
  },
  barBackground: {
    width: '100%',
    height: 6, 
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  message: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});