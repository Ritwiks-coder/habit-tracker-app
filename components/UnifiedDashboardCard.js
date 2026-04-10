import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../src/theme/theme';

const UnifiedDashboardCard = ({ 
  currentBlock,
  skipsRemaining = 3, 
  blockCompleted = 0, 
  blockTotal = 0,
  dailyCompleted = 0,
  dailyTotal = 0
}) => {
  
  // Dynamic block-based themes using DS v2 palette logic
  const getBlockTheme = () => {
    switch (currentBlock) {
      case 'Morning': 
        return { 
          icon: 'weather-sunset-up', 
          color: theme.palette.amber500, 
          bg: theme.palette.amber50,
          border: theme.palette.amberBorder 
        };
      case 'Afternoon': 
        return { 
          icon: 'weather-sunny', 
          color: '#3B82F6', // Blue 500 equivalent
          bg: '#EFF6FF',    // Blue 50 equivalent
          border: 'rgba(59,130,246,0.15)' 
        };
      case 'Evening': 
        return { 
          icon: 'weather-night', 
          color: '#8B5CF6', // Violet 500 equivalent
          bg: '#F5F3FF',    // Violet 50 equivalent
          border: 'rgba(139,92,246,0.15)' 
        };
      default: 
        return { 
          icon: 'clock-outline', 
          color: theme.colors.textSecondary, 
          bg: theme.colors.background,
          border: theme.colors.border 
        };
    }
  };

  const blockTheme = getBlockTheme();

  return (
    <View style={[styles.card, { backgroundColor: blockTheme.bg, borderColor: blockTheme.border }]}>
      
      {/* Left Side: Icon, Block Name, and Daily Total */}
      <View style={styles.side}>
        <MaterialCommunityIcons name={blockTheme.icon} size={32} color={blockTheme.color} style={{ marginRight: 4 }} />
        <View>
          <Text style={[styles.blockText, { color: blockTheme.color }]}>{currentBlock}</Text>
          <Text style={styles.dailyText}>Total Today: {dailyCompleted}/{dailyTotal}</Text>
        </View>
      </View>

      {/* Right Side: Skips Remaining & Current Block Progress */}
      <View style={styles.rightStats}>
        
        {/* Free Skips Pill */}
        <View style={styles.skipPill}>
          <MaterialCommunityIcons name="debug-step-over" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.skipText}>{skipsRemaining}</Text>
        </View>

        {/* Current Time Block Task Count Pill */}
        <View style={[styles.countPill, { backgroundColor: `${blockTheme.color}15` }]}>
          <Text style={[styles.countText, { color: blockTheme.color }]}>
            {blockCompleted}/{blockTotal}
          </Text>
        </View>

      </View>

    </View>
  );
};

export default UnifiedDashboardCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadow.sm
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockText: {
    ...theme.typography.h3,
    fontWeight: '900', 
    marginBottom: 2,
  },
  dailyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary, 
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  skipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    gap: 4,
    ...theme.shadow.sm,
  },
  skipText: {
    ...theme.typography.caption,
    fontWeight: '800',
    color: theme.colors.textSecondary,
  },
  countPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  countText: {
    ...theme.typography.h3,
    fontWeight: '900',
  }
});