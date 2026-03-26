import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNav = ({ state, navigation }) => {
  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'TaskList', icon: 'clipboard-outline', activeIcon: 'clipboard' },
    { name: 'Leaderboard', icon: 'trophy-outline', activeIcon: 'trophy' },
  ];

  return (
    <View style={s.container}>
      {tabs.map((tab, i) => {
        const active = state.index === i;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[s.tab, active && s.activeTab]}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Ionicons
              name={active ? tab.activeIcon : tab.icon}
              size={26}
              color={active ? '#fff' : '#6B7280'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
});

export default BottomNav;