// ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontContextType = {
    largeFontSize: 'default' | 'large';
  toggleFont: () => void;
  
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [largeFontSize, setLargeFontSize] = useState<'default' | 'large'>('default');

  useEffect(() => {
    const loadFont = async () => {
      const storedFont = await AsyncStorage.getItem('largeFontSize');
      console.log('Loaded font size from storage:', storedFont); // Debugging line
      setLargeFontSize(storedFont === 'large' ? 'large' : 'default');
    };
    loadFont();
  }, []);

  const toggleFont = async () => {
    const newFont = largeFontSize === 'large' ? 'default' : 'large';
    setLargeFontSize(newFont);
    await AsyncStorage.setItem('largeFontSize', newFont);
    console.log('Font size set to:', newFont); // Logs the new font size
  };
  
  

  return (
    <FontContext.Provider value={{ largeFontSize, toggleFont }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
