import React, {useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';

interface ProductCardProps {
  label: string;
  price: string;
  units: string;
  onPriceChange: (value: string) => void;
  onUnitsChange: (value: string) => void;
  perUnit?: string;
  resultState?: 'winner' | 'loser' | 'equal' | null;
  currencySymbol: string;
  priceRef?: React.RefObject<TextInput>;
  unitsRef?: React.RefObject<TextInput>;
  onPriceSubmit?: () => void;
  onUnitsSubmit?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  label,
  price,
  units,
  onPriceChange,
  onUnitsChange,
  perUnit,
  resultState,
  currencySymbol,
  priceRef,
  unitsRef,
  onPriceSubmit,
  onUnitsSubmit,
}) => {
  const {colors} = useTheme();

  const getBorderColor = () => {
    switch (resultState) {
      case 'winner':
        return colors.winnerBorder;
      case 'loser':
        return colors.loserBorder;
      case 'equal':
        return colors.equalBorder;
      default:
        return 'transparent';
    }
  };

  const getBackgroundColor = () => {
    switch (resultState) {
      case 'winner':
        return colors.winnerBackground;
      case 'loser':
        return colors.loserBackground;
      case 'equal':
        return colors.equalBackground;
      default:
        return colors.card;
    }
  };

  const sanitizeNumeric = (text: string): string => {
    // Allow digits and one decimal point, no negatives
    let cleaned = text.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    // Enforce max value of 9999999.99
    const num = parseFloat(cleaned);
    if (num > 9999999.99) {
      return '9999999.99';
    }
    return cleaned;
  };

  const cardOpacity = resultState === 'loser' ? 0.7 : 1;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          borderLeftWidth: resultState ? 4 : 0,
          opacity: cardOpacity,
        },
      ]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
        {resultState === 'winner' && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>
            Price
          </Text>
          <View style={styles.inputWrapper}>
            <Text style={[styles.currencySymbol, {color: colors.currencyText}]}>
              {currencySymbol}
            </Text>
            <TextInput
              ref={priceRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={price}
              onChangeText={(text) => onPriceChange(sanitizeNumeric(text))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              returnKeyType="next"
              onSubmitEditing={onPriceSubmit}
              blurOnSubmit={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>
            Units
          </Text>
          <TextInput
            ref={unitsRef}
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                color: colors.inputText,
              },
            ]}
            value={units}
            onChangeText={(text) => onUnitsChange(sanitizeNumeric(text))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="next"
            onSubmitEditing={onUnitsSubmit}
            blurOnSubmit={false}
          />
        </View>
      </View>

      {perUnit != null && (
        <Text style={[styles.perUnit, {color: colors.textSecondary}]}>
          {currencySymbol}
          {perUnit}/unit
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#22C55E',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 6,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 18,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  perUnit: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'right',
  },
});

export default ProductCard;
