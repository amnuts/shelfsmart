import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';

const SettingsScreen: React.FC = () => {
  const {colors, mode, setMode} = useTheme();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Settings</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, {color: colors.textSecondary}]}>
          Theme
        </Text>
        <View
          style={[
            styles.segmentedControl,
            {backgroundColor: colors.card},
          ]}>
          <TouchableOpacity
            style={[
              styles.segment,
              mode === 'bold' && [
                styles.segmentActive,
                {backgroundColor: colors.text},
              ],
            ]}
            onPress={() => setMode('bold')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentText,
                {color: mode === 'bold' ? colors.background : colors.text},
              ]}>
              Bold
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              mode === 'system' && [
                styles.segmentActive,
                {backgroundColor: colors.text},
              ],
            ]}
            onPress={() => setMode('system')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentText,
                {color: mode === 'system' ? colors.background : colors.text},
              ]}>
              System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, {color: colors.textSecondary}]}>
          ShelfSmart v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  version: {
    fontSize: 13,
  },
});

export default SettingsScreen;
