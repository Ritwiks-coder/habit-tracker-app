import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, Switch, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

// 1. Using global context for Ghost Mode syncing
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const FlameIcon = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Defs>
      <RadialGradient id="lb1" cx="68.884" cy="124.296" r="70.587"
        gradientTransform="matrix(-1 -.00434 -.00713 1.6408 131.986 -79.345)"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0.314" stopColor="#ff9800"/>
        <Stop offset="0.662" stopColor="#ff6d00"/>
        <Stop offset="0.972" stopColor="#f44336"/>
      </RadialGradient>
    </Defs>
    <Path fill="url(#lb1)" d="M35.56 40.73c-.57 6.08-.97 16.84 2.62 21.42c0 0-1.69-11.82 13.46-26.65c6.1-5.97 7.51-14.09 5.38-20.18c-1.21-3.45-3.42-6.3-5.34-8.29c-1.12-1.17-.26-3.1 1.37-3.03c9.86.44 25.84 3.18 32.63 20.22c2.98 7.48 3.2 15.21 1.78 23.07c-.9 5.02-4.1 16.18 3.2 17.55c5.21.98 7.73-3.16 8.86-6.14c.47-1.24 2.1-1.55 2.98-.56c8.8 10.01 9.55 21.8 7.73 31.95c-3.52 19.62-23.39 33.9-43.13 33.9c-24.66 0-44.29-14.11-49.38-39.65c-2.05-10.31-1.01-30.71 14.89-45.11c1.18-1.08 3.11-.12 2.95 1.5Z"/>
  </Svg>
);

const USERS = [
  { rank: 1, name: 'Shreya Monstera', completedTaskCount: 142, avatar: '👩‍🦱', isMe: false },
  { rank: 2, name: 'Anjali Kadam', completedTaskCount: 128, avatar: '👩', isMe: false },
  { rank: 3, name: 'Roy Oberoi', completedTaskCount: 115, avatar: '👨', isMe: false },
  { rank: 4, name: 'Atul', completedTaskCount: 95, avatar: '🧑', isMe: false },
  { rank: 5, name: 'Anuj', completedTaskCount: 88, avatar: '👱', isMe: false },
  { rank: 6, name: 'Priyanka', completedTaskCount: 76, avatar: '👩‍🦰', isMe: false },
  { rank: 7, name: 'Rutik (You)', completedTaskCount: 64, avatar: '🧑‍💼', isMe: true },
  { rank: 8, name: 'Aniket', completedTaskCount: 42, avatar: '👨‍💼', isMe: false },
];

const LeaderboardScreen = () => {
  // Global sync instead of local state
  const { ghostMode, setGhostMode } = useApp();
  const [period, setPeriod] = useState('Week');

  const top3 = USERS.slice(0, 3);
  const rest = USERS.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = [100, 130, 80];
  const podiumRanks = [2, 1, 3];
  const avatarSizes = [60, 78, 56];
  const rankBorderColors = ['#C0C0C0', '#FFD700', '#CD7F32'];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Leaderboard</Text>
          <View style={s.ghostRow}>
            <Text style={s.ghostLabel}>Ghost Mode</Text>
            <Switch
              value={ghostMode}
              onValueChange={setGhostMode}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={ghostMode ? '#10B981' : '#fff'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        <View style={s.divider} />

        {/* Week / Month Toggle */}
        <View style={s.periodToggle}>
          {['Week', 'Month'].map(p => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, period === p && s.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.periodBtnText, period === p && s.periodBtnTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Podium Top 3 */}
        <View style={s.podiumWrapper}>
          {podiumOrder.map((user, i) => {
            if (!user) return null;
            
            // Logic to hide the users
            const isGhosted = ghostMode && !user.isMe;
            const rank = podiumRanks[i];
            const h = podiumHeights[i];
            const avatarSize = avatarSizes[i];
            const borderColor = rankBorderColors[i];

            return (
              <View key={user.rank} style={s.podiumCol}>
                <View style={[s.podiumTop, isGhosted && s.userRowBlur]}>
                  <View style={[
                    s.podiumAvatar,
                    { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderColor }
                  ]}>
                    <Text style={{ fontSize: avatarSize * 0.5 }}>
                      {isGhosted ? '👻' : user.avatar}
                    </Text>
                    <View style={[s.rankBadge, { borderColor, backgroundColor: '#fff' }]}>
                      <Text style={[s.rankBadgeText, { color: borderColor }]}>{rank}</Text>
                    </View>
                  </View>
                  <Text style={s.podiumName} numberOfLines={1}>
                    {isGhosted ? '••••••' : user.name.split(' ')[0]}
                  </Text>
                  <View style={s.podiumScore}>
                    <Feather name="check-circle" size={12} color="#10B981" />
                    <Text style={s.podiumScoreText}>
                      {isGhosted ? '•••' : user.completedTaskCount}
                    </Text>
                  </View>
                </View>

                {/* Original Green Gradient */}
                <LinearGradient
                  colors={rank === 1 ? ['#10B981', '#059669'] : ['#34D399', '#10B981']}
                  style={[s.podiumBar, { height: h }]}
                >
                  <Text style={s.podiumBarNum}>{rank}</Text>
                </LinearGradient>
              </View>
            );
          })}
        </View>

        {/* Rest of list rank 4+ */}
        {rest.map((user, i) => {
          const isGhosted = ghostMode && !user.isMe;
          return (
            <View key={user.rank}>
              <View style={[
                s.userRow,
                user.isMe && s.userRowMe,
                isGhosted && s.userRowBlur,
              ]}>
                <Text style={s.rank}>{user.rank}</Text>
                <View style={s.userAvatar}>
                  <Text style={{ fontSize: 24 }}>
                    {isGhosted ? '👻' : user.avatar}
                  </Text>
                </View>
                <Text style={[s.userName, { flex: 1 }]} numberOfLines={1}>
                  {isGhosted ? '••••••' : user.name}
                </Text>
                <View style={s.scoreRow}>
                  <Feather name="check-circle" size={14} color="#10B981" />
                  <Text style={s.scoreText}>
                    {isGhosted ? '•••' : user.completedTaskCount} Tasks
                  </Text>
                </View>
              </View>
              {i < rest.length - 1 && <View style={s.separator} />}
            </View>
          );
        })}

        {/* Invite Button */}
        <TouchableOpacity onPress={() => Alert.alert('Invite Friends')} activeOpacity={0.85}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.inviteBtn}
          >
            <Text style={s.inviteBtnText}>Invite Friends</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1E' },
  ghostRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ghostLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },

  periodToggle: { flexDirection: 'row', backgroundColor: '#E8F8F2', borderRadius: 30, padding: 4, marginBottom: 28 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 26, alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#10B981' },
  periodBtnText: { fontSize: 15, fontWeight: '600', color: '#10B981' },
  periodBtnTextActive: { color: '#fff' },

  podiumWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 28 },
  podiumCol: { flex: 1, alignItems: 'center' },
  podiumTop: { alignItems: 'center', marginBottom: 8, gap: 4 },
  podiumAvatar: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 3, position: 'relative', marginBottom: 4 },
  rankBadge: { position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  rankBadgeText: { fontSize: 11, fontWeight: '800' },
  podiumName: { fontSize: 12, fontWeight: '700', color: '#1C1C1E', textAlign: 'center' },
  podiumScore: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  podiumScoreText: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  podiumBar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
  podiumBarNum: { color: '#fff', fontSize: 28, fontWeight: '900' },

  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  userRowMe: { borderWidth: 1.5, borderColor: '#10B981', borderRadius: 16, paddingHorizontal: 12, backgroundColor: '#F0FDF4' },
  userRowBlur: { opacity: 0.2 }, // This creates the blur/fade effect
  rank: { fontSize: 15, fontWeight: '700', color: '#9CA3AF', width: 20 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontSize: 15, color: '#10B981', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 80 },

  inviteBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 24 },
  inviteBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default LeaderboardScreen;