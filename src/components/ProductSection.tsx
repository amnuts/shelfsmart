import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';

interface ProductSectionProps {
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

const ProductSection: React.FC<ProductSectionProps> = ({
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

  const sectionOpacity = resultState === 'loser' ? 0.55 : 1;

  return (
    <View style={[styles.section, {opacity: sectionOpacity}]}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, {color: colors.receiptText}]}>
          {label}
        </Text>
        {resultState === 'winner' && (
          <Text style={[styles.resultTag, {color: colors.winnerBorder}]}>
            BEST VALUE
          </Text>
        )}
        {resultState === 'equal' && (
          <Text style={[styles.resultTag, {color: colors.equalBorder}]}>
            EQUAL
          </Text>
        )}
      </View>

      {/* Line items */}
      <View style={styles.lineItem}>
        <Text style={[styles.lineLabel, {color: colors.receiptTextSecondary}]}>
          Price
        </Text>
        <View style={styles.dotLeader}>
          <Text
            style={[styles.dots, {color: colors.receiptDash}]}
            numberOfLines={1}>
            {'· '.repeat(50)}
          </Text>
        </View>
        <View style={styles.valueArea}>
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
                color: colors.receiptText,
                fontFamily: monoFont,
              },
              priceFocusedState && {backgroundColor: colors.receiptInputBackground, borderColor: '#4D9DC4'},
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
            placeholderTextColor={colors.receiptDash}
            returnKeyType="next"
            onSubmitEditing={onPriceSubmit}
            blurOnSubmit={false}
          />
        </View>
      </View>

      <View style={styles.lineItem}>
        <Text style={[styles.lineLabel, {color: colors.receiptTextSecondary}]}>
          Qty
        </Text>
        <View style={styles.dotLeader}>
          <Text
            style={[styles.dots, {color: colors.receiptDash}]}
            numberOfLines={1}>
            {'· '.repeat(50)}
          </Text>
        </View>
        <TextInput
          ref={unitsRef}
          style={[
            styles.input,
            {
              color: colors.receiptText,
              fontFamily: monoFont,
            },
            unitsFocusedState && {backgroundColor: colors.receiptInputBackground, borderColor: '#4D9DC4'},
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
          placeholderTextColor={colors.receiptDash}
          returnKeyType="next"
          onSubmitEditing={onUnitsSubmit}
          blurOnSubmit={false}
        />
      </View>

      {/* Per unit total */}
      <View style={[styles.perUnitRow]}>
        <Text
          style={[
            styles.perUnitLabel,
            {
              color: perUnit != null ? colors.receiptText : colors.receiptDash,
              fontFamily: monoFont,
            },
          ]}>
          Per unit
        </Text>
        <Text
          style={[
            styles.perUnitValue,
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
            : '---'}
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
  section: {
    paddingVertical: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resultTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  lineLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dotLeader: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  dots: {
    fontSize: 12,
    letterSpacing: 2,
  },
  valueArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 2,
    fontWeight: '500',
  },
  input: {
    fontSize: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    textAlign: 'right',
    minWidth: 80,
    backgroundColor: 'transparent',
  },
  perUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
  },
  perUnitLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  perUnitValue: {
    fontSize: 20,
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

export default ProductSection;
