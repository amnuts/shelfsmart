import React, {useState, useRef, useCallback} from 'react';
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
  stampPercentage?: number;
  currencySymbol: string;
  priceRef?: React.RefObject<TextInput>;
  unitsRef?: React.RefObject<TextInput>;
  onPriceSubmit?: () => void;
  onUnitsSubmit?: () => void;
}

const monoFont = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

const ProductCard: React.FC<ProductCardProps> = ({
  label,
  price,
  units,
  onPriceChange,
  onUnitsChange,
  perUnit,
  resultState,
  stampPercentage,
  currencySymbol,
  priceRef,
  unitsRef,
  onPriceSubmit,
  onUnitsSubmit,
}) => {
  const {colors} = useTheme();
  const priceAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unitsAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceFocused = useRef(false);
  const unitsFocused = useRef(false);
  const [priceFocusedState, setPriceFocusedState] = useState(false);
  const [unitsFocusedState, setUnitsFocusedState] = useState(false);

  const AUTO_ADVANCE_DELAY = 800;

  const handlePriceChange = useCallback(
    (text: string) => {
      const cleaned = sanitizeNumeric(text);
      onPriceChange(cleaned);
      if (priceAdvanceTimer.current) clearTimeout(priceAdvanceTimer.current);
      if (cleaned && priceFocused.current) {
        priceAdvanceTimer.current = setTimeout(() => {
          if (priceFocused.current) onPriceSubmit?.();
        }, AUTO_ADVANCE_DELAY);
      }
    },
    [onPriceChange, onPriceSubmit],
  );

  const handleUnitsChange = useCallback(
    (text: string) => {
      const cleaned = sanitizeNumeric(text);
      onUnitsChange(cleaned);
      if (unitsAdvanceTimer.current) clearTimeout(unitsAdvanceTimer.current);
      if (cleaned && unitsFocused.current) {
        unitsAdvanceTimer.current = setTimeout(() => {
          if (unitsFocused.current) onUnitsSubmit?.();
        }, AUTO_ADVANCE_DELAY);
      }
    },
    [onUnitsChange, onUnitsSubmit],
  );

  const getAccentColor = () => {
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

  const sanitizeNumeric = (text: string): string => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    const num = parseFloat(cleaned);
    if (num > 9999999.99) {
      return '9999999.99';
    }
    return cleaned;
  };

  const cardOpacity = resultState === 'loser' ? 0.65 : 1;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.receiptBackground,
          opacity: cardOpacity,
          borderLeftColor: getAccentColor(),
          borderLeftWidth: resultState ? 4 : 0,
        },
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.label, {color: colors.receiptText}]}>{label}</Text>
        {resultState === 'winner' && (
          <View style={[styles.bestValueBadge, {backgroundColor: colors.winnerBorder}]}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
        )}
        {resultState === 'equal' && (
          <View style={[styles.bestValueBadge, {backgroundColor: colors.equalBorder}]}>
            <Text style={styles.bestValueText}>EQUAL</Text>
          </View>
        )}
      </View>

      <View style={[styles.dashedLine, {borderColor: colors.receiptDash}]} />

      {/* Line items */}
      <View style={styles.lineItem}>
        <Text style={[styles.lineLabel, {color: colors.receiptTextSecondary}]}>
          Price
        </Text>
        <View style={styles.inputWithCurrency}>
          <Text
            style={[
              styles.currencySymbol,
              {color: colors.receiptTextSecondary, fontFamily: monoFont},
            ]}>
            {currencySymbol}
          </Text>
          <TextInput
            ref={priceRef}
            style={[
              styles.input,
              {
                backgroundColor: colors.receiptInputBackground,
                color: colors.receiptText,
                fontFamily: monoFont,
              },
              priceFocusedState && styles.inputFocused,
            ]}
            value={price}
            onChangeText={handlePriceChange}
            onFocus={() => { priceFocused.current = true; setPriceFocusedState(true); }}
            onBlur={() => {
              priceFocused.current = false;
              setPriceFocusedState(false);
              if (priceAdvanceTimer.current) clearTimeout(priceAdvanceTimer.current);
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.receiptTextSecondary}
            returnKeyType="next"
            onSubmitEditing={onPriceSubmit}
            blurOnSubmit={false}
          />
        </View>
      </View>

      <View style={styles.lineItem}>
        <Text style={[styles.lineLabel, {color: colors.receiptTextSecondary}]}>
          Units
        </Text>
        <TextInput
          ref={unitsRef}
          style={[
            styles.input,
            styles.unitsInput,
            {
              backgroundColor: colors.receiptInputBackground,
              color: colors.receiptText,
              fontFamily: monoFont,
            },
            unitsFocusedState && styles.inputFocused,
          ]}
          value={units}
          onChangeText={handleUnitsChange}
          onFocus={() => { unitsFocused.current = true; setUnitsFocusedState(true); }}
          onBlur={() => {
            unitsFocused.current = false;
            setUnitsFocusedState(false);
            if (unitsAdvanceTimer.current) clearTimeout(unitsAdvanceTimer.current);
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.receiptTextSecondary}
          returnKeyType="next"
          onSubmitEditing={onUnitsSubmit}
          blurOnSubmit={false}
        />
      </View>

      {/* Total */}
      <View style={[styles.dashedLine, {borderColor: colors.receiptDash}]} />
      <View style={styles.totalRow}>
        <Text
          style={[
            styles.totalLabel,
            {color: perUnit != null ? colors.receiptText : colors.receiptDash},
          ]}>
          PER UNIT
        </Text>
        <Text
          style={[
            styles.totalValue,
            {
              fontFamily: monoFont,
              color:
                perUnit == null
                  ? colors.receiptDash
                  : resultState === 'winner'
                    ? colors.winnerBorder
                    : colors.receiptText,
            },
          ]}>
          {perUnit != null
            ? `${currencySymbol}${perUnit}`
            : '—'}
        </Text>
      </View>

      {/* Stamp overlay */}
      {stampPercentage != null && (
        <View style={styles.stampContainer} pointerEvents="none">
          <View
            style={[
              styles.stamp,
              {
                borderColor:
                  resultState === 'equal'
                    ? colors.equalBorder
                    : colors.winnerBorder,
              },
            ]}>
            {resultState === 'equal' ? (
              <Text
                style={[
                  styles.stampLabel,
                  {color: colors.equalBorder},
                ]}>
                SAME{'\n'}VALUE
              </Text>
            ) : (
              <>
                <Text
                  style={[
                    styles.stampPct,
                    {color: colors.winnerBorder},
                  ]}>
                  {Math.round(stampPercentage * 10) / 10}%
                </Text>
                <Text
                  style={[
                    styles.stampLabel,
                    {color: colors.winnerBorder},
                  ]}>
                  CHEAPER
                </Text>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bestValueBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  lineLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 50,
  },
  inputWithCurrency: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 4,
    fontWeight: '500',
  },
  input: {
    fontSize: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    textAlign: 'right',
    minWidth: 100,
  },
  inputFocused: {
    borderColor: '#4D9DC4',
  },
  unitsInput: {
    flex: 0,
    minWidth: 100,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  stampContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    borderWidth: 3,
    borderRadius: 8,
    borderStyle: 'solid',
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    transform: [{rotate: '-15deg'}],
    opacity: 0.35,
  },
  stampPct: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  stampLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
});

export default ProductCard;
