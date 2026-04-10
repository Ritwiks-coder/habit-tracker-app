import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Dimensions, Share, Modal, Pressable, Linking, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore'; 

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

const LeaderboardScreen = () => {
  const { user, userProfile, ghostMode, setGhostMode, playfulMode } = useApp();
  const isSassyMode = playfulMode;

  const [period, setPeriod] = useState('Week');
  
  // NEW: Firebase & Modal State
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const hasFriends = userProfile?.friends && userProfile.friends.length > 0;
  const myCode = userProfile?.referralCode || "LOADING...";

  const messageToShare = isSassyMode 
    ? `I'm dominating my habits. Download the app, use my invite code ${myCode}, and let's see if you can keep up. 🚀`
    : `Join me on my habit-tracking journey! Use my invite code ${myCode} when you sign up to get 50 bonus coins. 🪙`;

  // ==========================================
  // FETCH REAL-TIME DATA
  // ==========================================
  // ==========================================
  // FETCH REAL-TIME DATA
  // ==========================================
  useEffect(() => {
    if (!hasFriends || !user) {
      setIsLoadingList(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        // Filter out any accidentally null or undefined friend UIDs
        const uidsToFetch = [user.uid, ...userProfile.friends].filter(Boolean);
        
        const userDocs = await Promise.all(
          uidsToFetch.map(uid => firestore().collection('users').doc(uid).get())
        );

        const formattedData = userDocs
          .filter(doc => doc && doc.exists)
          .map(doc => {
            // 🔥 THE FIX: Safe data extraction. If data is undefined, fallback to an empty object
            const data = doc.data() || {};

            return {
              id: doc.id,
              name: data.displayName || data.name || "Ghost User", // Also checks 'name' just in case
              completedTaskCount: data.totalPoints || 0, 
              avatar: data.avatar || '🧑‍💼', 
              isMe: doc.id === user.uid
            };
          })
          .sort((a, b) => b.completedTaskCount - a.completedTaskCount)
          .map((u, i) => ({ ...u, rank: i + 1 }));

        setLeaderboardData(formattedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchLeaderboard();
  }, [hasFriends, userProfile, user]);

  // ==========================================
  // SHARE HANDLERS
  // ==========================================
  const shareToWhatsApp = async () => {
    try { await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(messageToShare)}`); setIsShareModalVisible(false); } 
    catch { Toast.show({ type: 'error', text1: 'WhatsApp not installed' }); }
  };

  const shareToInstagram = async () => {
    await Clipboard.setStringAsync(messageToShare);
    Toast.show({ type: 'success', text1: 'Copied!', text2: 'Paste this in your Instagram DM or Story.' });
    try { await Linking.openURL('instagram://app'); setIsShareModalVisible(false); } 
    catch { executeNativeShare(); }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(messageToShare);
    Toast.show({ type: 'success', text1: 'Copied to clipboard! 📋' });
    setIsShareModalVisible(false);
  };

  const executeNativeShare = async () => {
    try { await Share.share({ message: messageToShare }); setIsShareModalVisible(false); } 
    catch (error) { console.error("Error:", error.message); }
  };

  // ==========================================
  // UI LOGIC
  // ==========================================
  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = [100, 130, 80];
  const podiumRanks = [2, 1, 3];
  const avatarSizes = [60, 78, 56];
  const rankBorderColors = ['#C0C0C0', '#FFD700', '#CD7F32'];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* HEADER */}
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

        {/* LOADING STATE */}
        {hasFriends && isLoadingList ? (
          <View style={{ flex: 1, justifyContent: 'center', marginTop: 100 }}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : 

        /* POPULATED LIST (YOUR ORIGINAL UI) */
        hasFriends && !isLoadingList ? (
          <>
            <View style={s.periodToggle}>
              {['Week', 'Month'].map(p => (
                <TouchableOpacity key={p} style={[s.periodBtn, period === p && s.periodBtnActive]} onPress={() => setPeriod(p)}>
                  <Text style={[s.periodBtnText, period === p && s.periodBtnTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Podium Top 3 */}
            <View style={s.podiumWrapper}>
              {podiumOrder.map((userData, i) => {
                if (!userData) return null;
                const isGhosted = ghostMode && !userData.isMe;
                const rank = podiumRanks[i];
                const h = podiumHeights[i];
                const avatarSize = avatarSizes[i];
                const borderColor = rankBorderColors[i];

                return (
                  <View key={userData.rank} style={s.podiumCol}>
                    <View style={[s.podiumTop, isGhosted && s.userRowBlur]}>
                      <View style={[s.podiumAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderColor }]}>
                        
                        {/* Dynamic Avatar Handler */}
                        {isGhosted ? <Text style={{ fontSize: avatarSize * 0.5 }}>👻</Text> : 
                          userData.avatar?.startsWith('http') ? 
                          <Image source={{ uri: userData.avatar }} style={{ width: '100%', height: '100%', borderRadius: 100 }} /> :
                          <Text style={{ fontSize: avatarSize * 0.5 }}>{userData.avatar}</Text>
                        }

                        <View style={[s.rankBadge, { borderColor, backgroundColor: '#fff' }]}>
                          <Text style={[s.rankBadgeText, { color: borderColor }]}>{rank}</Text>
                        </View>
                      </View>
                      <Text style={s.podiumName} numberOfLines={1}>
                        {isGhosted ? '••••••' : userData.name.split(' ')[0]}
                      </Text>
                      <View style={s.podiumScore}>
                        <Text style={s.podiumScoreText}>🪙 {isGhosted ? '•••' : userData.completedTaskCount}</Text>
                      </View>
                    </View>

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
            {rest.map((userData, i) => {
              const isGhosted = ghostMode && !userData.isMe;
              return (
                <View key={userData.rank}>
                  <View style={[s.userRow, userData.isMe && s.userRowMe, isGhosted && s.userRowBlur]}>
                    <Text style={s.rank}>{userData.rank}</Text>
                    
                    <View style={s.userAvatar}>
                      {isGhosted ? <Text style={{ fontSize: 24 }}>👻</Text> : 
                        userData.avatar?.startsWith('http') ? 
                        <Image source={{ uri: userData.avatar }} style={{ width: '100%', height: '100%', borderRadius: 100 }} /> :
                        <Text style={{ fontSize: 24 }}>{userData.avatar}</Text>
                      }
                    </View>

                    <Text style={[s.userName, { flex: 1 }]} numberOfLines={1}>
                      {isGhosted ? '••••••' : userData.name}
                    </Text>
                    <View style={s.scoreRow}>
                      <Text style={s.scoreText}>{isGhosted ? '•••' : userData.completedTaskCount} Coins 🪙</Text>
                    </View>
                  </View>
                  {i < rest.length - 1 && <View style={s.separator} />}
                </View>
              );
            })}

            <TouchableOpacity onPress={() => setIsShareModalVisible(true)} activeOpacity={0.85}>
              <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.inviteBtn}>
                <Text style={s.inviteBtnText}>Invite Friend (+100 Coins)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : 

        /* EMPTY STATE CARD (NO FRIENDS YET) */
        (
          <View style={s.emptyCard}>
            <View style={s.iconCircle}>
              <MaterialCommunityIcons name={isSassyMode ? "account-cancel-outline" : "account-group"} size={60} color="#10B981" />
            </View>
            <Text style={s.emptyTitle}>{isSassyMode ? "It's awfully quiet in here." : "Build your community"}</Text>
            <Text style={s.emptySubtitle}>
              {isSassyMode ? "Invite some friends so you actually have someone to crush on the leaderboard." : "Invite friends to track habits together. You get 100 coins, they get 50!"}
            </Text>
            <View style={s.codeContainer}>
              <Text style={s.codeLabel}>YOUR INVITE CODE</Text>
              <Text style={s.codeText}>{myCode}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsShareModalVisible(true)} activeOpacity={0.85} style={{width: '100%'}}>
              <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.inviteBtnEmpty}>
                <MaterialCommunityIcons name="share-variant" size={20} color="#FFFFFF" />
                <Text style={s.inviteBtnText}>Invite Friend (+100 Coins)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* 🚀 CUSTOM SHARE MODAL */}
      <Modal animationType="slide" transparent={true} visible={isShareModalVisible} onRequestClose={() => setIsShareModalVisible(false)}>
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackground} onPress={() => setIsShareModalVisible(false)} />
          <View style={s.modalContent}>
            <View style={s.modalDragHandle} />
            <Text style={s.modalTitle}>Share Invite Code</Text>
            <Text style={s.modalSubtitle}>Send this to your friends. You get 100 coins when they join!</Text>
            <View style={s.modalCodeBox}>
              <Text style={s.modalCodeText}>{myCode}</Text>
            </View>
            <View style={s.socialOptionsContainer}>
              <TouchableOpacity style={s.socialOption} onPress={shareToWhatsApp}>
                <View style={[s.socialIconCircle, { backgroundColor: '#E8F5E9' }]}><MaterialCommunityIcons name="whatsapp" size={34} color="#25D366" /></View>
                <Text style={s.socialOptionText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialOption} onPress={shareToInstagram}>
                <View style={[s.socialIconCircle, { backgroundColor: '#FCE4EC' }]}><MaterialCommunityIcons name="instagram" size={34} color="#E1306C" /></View>
                <Text style={s.socialOptionText}>Instagram</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialOption} onPress={copyToClipboard}>
                <View style={[s.socialIconCircle, { backgroundColor: '#EFF6FF' }]}><MaterialCommunityIcons name="link-variant" size={30} color="#3B82F6" /></View>
                <Text style={s.socialOptionText}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialOption} onPress={executeNativeShare}>
                <View style={[s.socialIconCircle, { backgroundColor: '#F3F4F6' }]}><MaterialCommunityIcons name="dots-horizontal" size={34} color="#6B7280" /></View>
                <Text style={s.socialOptionText}>More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1E' },
  ghostRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ghostLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },

  // Toggle
  periodToggle: { flexDirection: 'row', backgroundColor: '#E8F8F2', borderRadius: 30, padding: 4, marginBottom: 28 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 26, alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#10B981' },
  periodBtnText: { fontSize: 15, fontWeight: '600', color: '#10B981' },
  periodBtnTextActive: { color: '#fff' },

  // Podium
  podiumWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 28 },
  podiumCol: { flex: 1, alignItems: 'center' },
  podiumTop: { alignItems: 'center', marginBottom: 8, gap: 4 },
  podiumAvatar: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 3, position: 'relative', marginBottom: 4, overflow: 'visible' },
  rankBadge: { position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  rankBadgeText: { fontSize: 11, fontWeight: '800' },
  podiumName: { fontSize: 12, fontWeight: '700', color: '#1C1C1E', textAlign: 'center' },
  podiumScore: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  podiumScoreText: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  podiumBar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
  podiumBarNum: { color: '#fff', fontSize: 28, fontWeight: '900' },

  // List Items
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  userRowMe: { borderWidth: 1.5, borderColor: '#10B981', borderRadius: 16, paddingHorizontal: 12, backgroundColor: '#F0FDF4' },
  userRowBlur: { opacity: 0.2 }, 
  rank: { fontSize: 15, fontWeight: '700', color: '#9CA3AF', width: 20 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  userName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontSize: 15, color: '#10B981', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 80 },

  // Buttons
  inviteBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 24 },
  inviteBtnEmpty: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 },
  inviteBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Empty State Card (Light Mode Theme)
  emptyCard: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6', marginTop: 20 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 10, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  codeContainer: { backgroundColor: '#F9FAFB', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', width: '100%' },
  codeLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 6 },
  codeText: { fontSize: 24, color: '#10B981', fontWeight: '900', letterSpacing: 3 },

  // Modal (Light Mode Theme)
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 50, alignItems: 'center' },
  modalDragHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 5, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 25, paddingHorizontal: 10 },
  modalCodeBox: { backgroundColor: '#ECFDF5', borderWidth: 2, borderColor: '#10B981', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 40, marginBottom: 30 },
  modalCodeText: { fontSize: 28, fontWeight: '900', color: '#10B981', letterSpacing: 4 },
  socialOptionsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  socialOption: { alignItems: 'center', flex: 1 },
  socialIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  socialOptionText: { fontSize: 12, color: '#4B5563', fontWeight: '600' }
});

export default LeaderboardScreen;