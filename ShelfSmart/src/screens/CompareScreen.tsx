import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import PercentageBadge from '../components/PercentageBadge';
import {useTheme} from '../context/ThemeContext';

const getCurrencySymbol = (): string => {
  try {
    // Use Intl to detect locale currency symbol
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD', // fallback
      currencyDisplay: 'narrowSymbol',
    });
    const parts = formatter.formatToParts(0);
    const symbol = parts.find(p => p.type === 'currency');
    return symbol?.value ?? '$';
  } catch {
    return '$';
  }
};

interface ComparisonResult {
  perUnitA: number;
  perUnitB: number;
  winner: 'A' | 'B' | 'equal';
  percentage: number;
}

const formatPerUnit = (value: number): string => {
  if (value >= 0.01) {
    return value.toFixed(2);
  }
  return value.toFixed(4);
};

const CompareScreen: React.FC = () => {
  const {colors} = useTheme();
  const [priceA, setPriceA] = useState('');
  const [unitsA, setUnitsA] = useState('');
  const [priceB, setPriceB] = useState('');
  const [unitsB, setUnitsB] = useState('');
  const resultAnim = useRef(new Animated.Value(0)).current;
  const [showResult, setShowResult] = useState(false);

  const priceARef = useRef<TextInput>(null);
  const unitsARef = useRef<TextInput>(null);
  const priceBRef = useRef<TextInput>(null);
  const unitsBRef = useRef<TextInput>(null);

  const currencySymbol = getCurrencySymbol();

  const calculate = useCallback((): ComparisonResult | null => {
    const pA = parseFloat(priceA);
    const uA = parseFloat(unitsA);
    const pB = parseFloat(priceB);
    const uB = parseFloat(unitsB);

    if (!pA || !uA || !pB || !uB || pA <= 0 || uA <= 0 || pB <= 0 || uB <= 0) {
      return null;
    }

    const perUnitA = pA / uA;
    const perUnitB = pB / uB;

    // Check for equality with small epsilon
    if (Math.abs(perUnitA - perUnitB) < 0.000001) {
      return {perUnitA, perUnitB, winner: 'equal', percentage: 0};
    }

    const winner = perUnitA < perUnitB ? 'A' : 'B';
    const percentage =
      (Math.abs(perUnitA - perUnitB) / Math.max(perUnitA, perUnitB)) * 100;

    return {perUnitA, perUnitB, winner, percentage};
  }, [priceA, unitsA, priceB, unitsB]);

  const result = calculate();

  // Animate result in/out
  React.useEffect(() => {
    if (result && !showResult) {
      setShowResult(true);
      Animated.timing(resultAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!result && showResult) {
      Animated.timing(resultAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowResult(false));
    }
  }, [result, showResult, resultAnim]);

  const handleClear = () => {
    setPriceA('');
    setUnitsA('');
    setPriceB('');
    setUnitsB('');
    setShowResult(false);
    resultAnim.setValue(0);
    priceARef.current?.focus();
  };

  const getResultState = (product: 'A' | 'B') => {
    if (!result) return null;
    if (result.winner === 'equal') return 'equal' as const;
    return result.winner === product ? ('winner' as const) : ('loser' as const);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, {color: colors.text}]}>ShelfSmart</Text>

        <ProductCard
          label="Product A"
          price={priceA}
          units={unitsA}
          onPriceChange={setPriceA}
          onUnitsChange={setUnitsA}
          perUnit={result ? formatPerUnit(result.perUnitA) : undefined}
          resultState={getResultState('A')}
          currencySymbol={currencySymbol}
          priceRef={priceARef}
          unitsRef={unitsARef}
          onPriceSubmit={() => unitsARef.current?.focus()}
          onUnitsSubmit={() => priceBRef.current?.focus()}
        />

        {showResult && result && (
          <Animated.View
            style={{
              opacity: resultAnim,
              transform: [
                {
                  translateY: resultAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            <PercentageBadge
              winner={result.winner}
              percentage={result.percentage}
            />
          </Animated.View>
        )}

        <ProductCard
          label="Product B"
          price={priceB}
          units={unitsB}
          onPriceChange={setPriceB}
          onUnitsChange={setUnitsB}
          perUnit={result ? formatPerUnit(result.perUnitB) : undefined}
          resultState={getResultState('B')}
          currencySymbol={currencySymbol}
          priceRef={priceBRef}
          unitsRef={unitsBRef}
          onPriceSubmit={() => unitsBRef.current?.focus()}
          onUnitsSubmit={() => {}}
        />

        <TouchableOpacity
          style={[styles.clearButton, {backgroundColor: colors.clearButton}]}
          onPress={handleClear}
          activeOpacity={0.8}>
          <Text style={[styles.clearButtonText, {color: colors.clearButtonText}]}>
            Clear
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  clearButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CompareScreen;
