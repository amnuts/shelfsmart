import React, {createContext, useContext, useState, useCallback} from 'react';
import {useColorScheme} from 'react-native';

type ThemeMode = 'bold' | 'system';

interface Colors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  winnerBorder: string;
  winnerBackground: string;
  loserBorder: string;
  loserBackground: string;
  equalBorder: string;
  equalBackground: string;
  badgeBackground: string;
  badgeText: string;
  clearButton: string;
  clearButtonText: string;
  tabBar: string;
  tabBarText: string;
  tabBarActiveText: string;
  inputBackground: string;
  inputText: string;
  currencyText: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: Colors;
}

const lightColors: Colors = {
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#1F2937',
  textSecondary: '#6B7280',
  winnerBorder: '#22C55E',
  winnerBackground: '#F0FDF4',
  loserBorder: '#D1D5DB',
  loserBackground: '#F9FAFB',
  equalBorder: '#3B82F6',
  equalBackground: '#EFF6FF',
  badgeBackground: '#22C55E',
  badgeText: '#FFFFFF',
  clearButton: '#EF4444',
  clearButtonText: '#FFFFFF',
  tabBar: '#1F2937',
  tabBarText: '#9CA3AF',
  tabBarActiveText: '#FFFFFF',
  inputBackground: '#FFFFFF',
  inputText: '#1F2937',
  currencyText: '#6B7280',
};

const darkColors: Colors = {
  background: '#1F2937',
  card: '#374151',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  winnerBorder: '#22C55E',
  winnerBackground: '#064E3B',
  loserBorder: '#4B5563',
  loserBackground: '#1F2937',
  equalBorder: '#3B82F6',
  equalBackground: '#1E3A5F',
  badgeBackground: '#22C55E',
  badgeText: '#FFFFFF',
  clearButton: '#EF4444',
  clearButtonText: '#FFFFFF',
  tabBar: '#111827',
  tabBarText: '#6B7280',
  tabBarActiveText: '#FFFFFF',
  inputBackground: '#4B5563',
  inputText: '#F9FAFB',
  currencyText: '#9CA3AF',
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'bold',
  setMode: () => {},
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [mode, setMode] = useState<ThemeMode>('bold');
  const systemScheme = useColorScheme();

  const resolveColors = useCallback((): Colors => {
    if (mode === 'bold') {
      return lightColors;
    }
    return systemScheme === 'dark' ? darkColors : lightColors;
  }, [mode, systemScheme]);

  return (
    <ThemeContext.Provider value={{mode, setMode, colors: resolveColors()}}>
      {children}
    </ThemeContext.Provider>
  );
};
