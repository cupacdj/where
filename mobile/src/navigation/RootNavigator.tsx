import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

export const RootNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        tabBarShowIcon: true,
        tabBarIndicatorStyle: {
          backgroundColor: '#0284c7',
          height: 4,
          borderRadius: 2,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
