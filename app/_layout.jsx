import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider
} from 'react-native-paper';
import AuthProvider from '../providers/AuthProvider';
import ProductProvider from '../providers/ProductProvider';
import CustomerProvider from '../providers/CustomerProvider';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
       <CustomerProvider>
         <ProductProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ProductProvider>
       </CustomerProvider>
      </AuthProvider>
    </PaperProvider>
  );
}