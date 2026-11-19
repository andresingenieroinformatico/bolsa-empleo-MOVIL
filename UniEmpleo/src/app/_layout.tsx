import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Brand } from '@/constants/theme';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Brand.green,
    background: Brand.canvas,
    card: Brand.surface,
    text: Brand.ink,
    border: Brand.line,
    notification: Brand.red,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={appTheme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Brand.canvas },
          }}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
