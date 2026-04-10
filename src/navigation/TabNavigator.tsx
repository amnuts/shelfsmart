import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, StyleSheet} from 'react-native';
import CompareScreen from '../screens/CompareScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {useTheme} from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const CompareIcon = ({color}: {color: string}) => (
  <Text style={[styles.icon, {color}]}>⚖</Text>
);

const SettingsIcon = ({color}: {color: string}) => (
  <Text style={[styles.icon, {color}]}>⚙</Text>
);

const TabNavigator: React.FC = () => {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabBarActiveText,
        tabBarInactiveTintColor: colors.tabBarText,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Compare"
        component={CompareScreen}
        options={{
          tabBarIcon: CompareIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
  },
});

export default TabNavigator;
