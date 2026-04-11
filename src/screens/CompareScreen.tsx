import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  TextInput,
  NativeModules,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProductSection from '../components/ProductSection';
import {useTheme} from '../context/ThemeContext';

const monoFont = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

const localeToCurrency: Record<string, string> = {
  en_US: 'USD', en_GB: 'GBP', en_AU: 'AUD', en_CA: 'CAD', en_NZ: 'NZD',
  en_IE: 'EUR', en_SG: 'SGD', en_ZA: 'ZAR', en_IN: 'INR', en_HK: 'HKD',
  de_DE: 'EUR', de_AT: 'EUR', de_CH: 'CHF',
  fr_FR: 'EUR', fr_BE: 'EUR', fr_CH: 'CHF', fr_CA: 'CAD',
  it_IT: 'EUR', es_ES: 'EUR', pt_PT: 'EUR', pt_BR: 'BRL',
  nl_NL: 'EUR', nl_BE: 'EUR', fi_FI: 'EUR', el_GR: 'EUR',
  ja_JP: 'JPY', ko_KR: 'KRW', zh_CN: 'CNY', zh_TW: 'TWD', zh_HK: 'HKD',
  sv_SE: 'SEK', da_DK: 'DKK', nb_NO: 'NOK', nn_NO: 'NOK',
  pl_PL: 'PLN', cs_CZ: 'CZK', hu_HU: 'HUF', ro_RO: 'RON',
  tr_TR: 'TRY', th_TH: 'THB', vi_VN: 'VND', id_ID: 'IDR',
  ms_MY: 'MYR', ar_SA: 'SAR', ar_AE: 'AED', he_IL: 'ILS',
  ru_RU: 'RUB', uk_UA: 'UAH', bg_BG: 'BGN', hr_HR: 'EUR',
  sk_SK: 'EUR', sl_SI: 'EUR', et_EE: 'EUR', lv_LV: 'EUR', lt_LT: 'EUR',
  mt_MT: 'EUR', cy_GB: 'GBP',
};

const getCurrencySymbol = (): string => {
  try {
    const locale = Platform.select({
      ios: NativeModules.SettingsManager?.settings?.AppleLocale ??
           NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ?? 'en_US',
      android: NativeModules.I18nManager?.localeIdentifier ?? 'en_US',
      default: 'en_US',
    });
    const normalised = locale.replace('-', '_');
    const currency = localeToCurrency[normalised] ?? 'USD';
    const formatter = new Intl.NumberFormat(normalised.replace('_', '-'), {
      style: 'currency',
      currency,
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

// Zigzag edge component
// Top: triangles point UP (paper edge visible from above, background shows through gaps)
// Bottom: triangles point DOWN (paper edge visible from below)
const ZigzagEdge: React.FC<{color: string; position: 'top' | 'bottom'}> = ({color, position}) => {
  const teeth = 35;
  return (
    <View style={zigzagStyles.container}>
      <View style={zigzagStyles.row}>
        {Array.from({length: teeth}).map((_, i) => (
          <View
            key={i}
            style={
              position === 'top'
                ? {
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderBottomWidth: 6,
                    borderStyle: 'solid' as const,
                    borderBottomColor: color,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                  }
                : {
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderTopWidth: 6,
                    borderStyle: 'solid' as const,
                    borderTopColor: color,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                  }
            }
          />
        ))}
      </View>
    </View>
  );
};

const zigzagStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    height: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

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

        {/* Receipt paper */}
        <View>
          {/* Shadow layers */}
          <View style={[styles.receiptShadow1, {backgroundColor: colors.receiptBackground}]} />

          <ZigzagEdge color={colors.receiptBackground} position="top" />

          <View style={[styles.receipt, {backgroundColor: colors.receiptBackground}]}>
            {/* Receipt header */}
            <Text style={[styles.shopName, {color: colors.receiptText}]}>
              ShelfSmart
            </Text>
            <Text style={[styles.receiptSubtitle, {color: colors.receiptTextSecondary}]}>
              PRICE COMPARISON
            </Text>
            <View style={[styles.thinLine, {backgroundColor: colors.receiptDash}]} />
            <Text style={[styles.receiptDate, {color: colors.receiptTextSecondary, fontFamily: monoFont}]}>
              {new Date().toLocaleDateString()}
            </Text>
            <View style={[styles.thickLine, {backgroundColor: colors.receiptText}]} />

            {/* Product A */}
            <ProductSection
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

            <View style={[styles.thinLine, {backgroundColor: colors.receiptDash}]} />

            {/* Product B */}
            <ProductSection
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

            <View style={[styles.thickLine, {backgroundColor: colors.receiptText}]} />

            {/* Thank you / Clear */}
            <TouchableOpacity
              style={[styles.thankYouButton, {borderColor: colors.receiptDash}]}
              onPress={handleClear}
              activeOpacity={0.6}>
              <Text style={[styles.thankYouText, {color: colors.receiptText}]}>
                CLEAR
              </Text>
            </TouchableOpacity>
          </View>

          <ZigzagEdge color={colors.receiptBackground} position="bottom" />
        </View>
      </ScrollView>

      {showWarning && (
        <Animated.View
          style={[
            styles.dimOverlay,
            {
              opacity: warningAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
              }),
            },
          ]}
          pointerEvents="none"
        />
      )}

      {showWarning && (
        <View style={styles.warningContainer} pointerEvents="box-none">
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
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  // rgba(0, 0, 0, 0.18) 0px 2px 4px
  receiptShadow1: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.98,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 2,
  },
  receipt: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  shopName: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 12,
  },
  receiptSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 4,
    marginBottom: 10,
  },
  receiptDate: {
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 6,
  },
  thinLine: {
    height: 1,
    marginVertical: 4,
  },
  thickLine: {
    height: 2,
    marginVertical: 8,
  },
  thankYouButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  warningContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 20,
    top: '72%',
  },
  warningBanner: {
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
