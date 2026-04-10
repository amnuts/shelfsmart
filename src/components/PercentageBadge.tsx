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
      <View style={[styles.badge, {borderColor: colors.equalBorder}]}>
        <Text style={[styles.text, {color: colors.equalBorder}]}>Same value!</Text>
      </View>
    );
  }

  const winnerLabel = winner === 'A' ? 'Product A' : 'Product B';
  const roundedPct = Math.round(percentage * 10) / 10;

  return (
    <View style={[styles.badge, {borderColor: colors.badgeBackground}]}>
      <Text style={[styles.text, {color: colors.text}]}>
        {winnerLabel} is
      </Text>
      <Text style={[styles.pct, {color: colors.badgeBackground}]}>
        {roundedPct}%
      </Text>
      <Text style={[styles.text, {color: colors.text}]}>cheaper</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pct: {
    fontWeight: '800',
    fontSize: 28,
    marginVertical: 2,
  },
});

export default PercentageBadge;
