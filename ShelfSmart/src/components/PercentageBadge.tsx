import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../context/ThemeContext';

interface PercentageBadgeProps {
  winner: 'A' | 'B' | 'equal';
  percentage: number;
}

const PercentageBadge: React.FC<PercentageBadgeProps> = ({winner, percentage}) => {
  const {colors} = useTheme();

  if (winner === 'equal') {
    return (
      <View style={[styles.badge, {backgroundColor: colors.equalBorder}]}>
        <Text style={[styles.text, {color: '#FFFFFF'}]}>Same value!</Text>
      </View>
    );
  }

  const winnerLabel = winner === 'A' ? 'Product A' : 'Product B';
  const roundedPct = Math.round(percentage * 10) / 10;

  return (
    <View style={[styles.badge, {backgroundColor: colors.badgeBackground}]}>
      <Text style={[styles.text, {color: colors.badgeText}]}>
        {winnerLabel} is{' '}
        <Text style={styles.bold}>{roundedPct}% cheaper</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
    fontSize: 22,
  },
});

export default PercentageBadge;
