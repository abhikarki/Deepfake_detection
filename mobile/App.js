import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './screens/HomeScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { colors } from './assets/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: '#E0E0E0',
            borderTopWidth: 1,
            paddingBottom: 0,
            paddingTop: 0,
            height: 56,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 8,
            marginTop: 8,
          },
          tabBarIconStyle: {
            display: 'none',
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            tabBarLabel: 'Results',
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            tabBarLabel: 'About',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}