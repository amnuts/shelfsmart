import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
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

  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const warningAnim = useRef(new Animated.Value(0)).current;

  const BIG_DIFFERENCE_THRESHOLD = 50;

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(calculate());
    }, 400);
    return () => clearTimeout(timer);
  }, [calculate]);

  // Show warning after an extra delay for large differences
  useEffect(() => {
    const isBigDifference =
      result !== null && result.percentage >= BIG_DIFFERENCE_THRESHOLD;

    if (isBigDifference && !showWarning) {
      const timer = setTimeout(() => {
        setShowWarning(true);
        Animated.timing(warningAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 400);
      return () => clearTimeout(timer);
    } else if (!isBigDifference && showWarning) {
      Animated.timing(warningAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowWarning(false));
    }
  }, [result, showWarning, warningAnim]);

  const handleClear = () => {
    setPriceA('');
    setUnitsA('');
    setPriceB('');
    setUnitsB('');
    setResult(null);
    setShowWarning(false);
    warningAnim.setValue(0);
    priceARef.current?.focus();
  };

  const getResultState = (product: 'A' | 'B') => {
    if (!result) return null;
    if (result.winner === 'equal') return 'equal' as const;
    return result.winner === product ? ('winner' as const) : ('loser' as const);
  };

  const getStampPercentage = (product: 'A' | 'B'): number | undefined => {
    if (!result) return undefined;
    if (result.winner === 'equal') return result.percentage;
    if (result.winner === product) return result.percentage;
    return undefined;
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
          stampPercentage={getStampPercentage('A')}
          currencySymbol={currencySymbol}
          priceRef={priceARef}
          unitsRef={unitsARef}
          onPriceSubmit={() => unitsARef.current?.focus()}
          onUnitsSubmit={() => priceBRef.current?.focus()}
        />

        <ProductCard
          label="Product B"
          price={priceB}
          units={unitsB}
          onPriceChange={setPriceB}
          onUnitsChange={setUnitsB}
          perUnit={result ? formatPerUnit(result.perUnitB) : undefined}
          resultState={getResultState('B')}
          stampPercentage={getStampPercentage('B')}
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

        {showWarning && (
          <Animated.View
            style={[
              styles.warningBanner,
              {
                opacity: warningAnim,
                transform: [
                  {
                    translateY: warningAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={[styles.warningEmoji, {backgroundColor: '#4D9DC4'}]}>
              <Text style={styles.warningEmojiText}>?</Text>
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningTextBold}>
                Wow, that's a big difference!
              </Text>
              <Text style={styles.warningText}>
                Probably worth double-checking your numbers?
              </Text>
            </View>
          </Animated.View>
        )}
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
  warningBanner: {
    marginTop: 16,
    marginLeft: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4D9DC4',
    paddingLeft: 50,
    paddingRight: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningEmoji: {
    position: 'absolute',
    left: -27,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    opacity: 1,
  },
  warningEmojiText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  warningContent: {
    flex: 1,
  },
  warningTextBold: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  warningText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CompareScreen;
