import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar, setStatusBarHidden } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect, useState } from "react";
import { AppState, Platform, View } from "react-native";
import { use, useCallback } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
  

// if (typeof window !== "undefined" && typeof (window as any).setImmediate === "undefined") {
//   (window as any).setImmediate = function(fn: (...args: any[]) => void, ...args: any[]) {
//     return setTimeout(fn, 0, ...args);
//   };
// }

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-Italic": require("../assets/fonts/PlusJakartaSans-Italic.ttf"),
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-BoldItalic": require("../assets/fonts/PlusJakartaSans-BoldItalic.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraBoldItalic": require("../assets/fonts/PlusJakartaSans-ExtraBoldItalic.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-ExtraLightItalic": require("../assets/fonts/PlusJakartaSans-ExtraLightItalic.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-LightItalic": require("../assets/fonts/PlusJakartaSans-LightItalic.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-MediumItalic": require("../assets/fonts/PlusJakartaSans-MediumItalic.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "Jakarta-SemiBoldItalic": require("../assets/fonts/PlusJakartaSans-SemiBoldItalic.ttf"),
  });

  const [screenDimensions, setScreenDimensions] = useState<{ height: number; width: number }>({ 
    height: Platform.OS === 'web' ? window.innerHeight : 0, 
    width: Platform.OS === 'web' ? window.innerWidth : 0 
  });
  const [isSystemStatusBarVisible, setSystemStatusBarVisible] = useState(false);
  const [isSystemNavigationBarVisible, setSystemNavigationBarVisible] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Remove FullScreen logic; immersive handled by NavigationBar and StatusBar
  useEffect(() => {
    // Optionally set navigation bar style here if desired
    // NavigationBar.setBackgroundColorAsync('transparent');
    // NavigationBar.setButtonStyleAsync('dark');
    // NavigationBar.setVisibilityAsync('visible');
  }, []);

  // Hide bars and set up listeners
  useEffect(() => {
    const navigationConfig = async () => {
      if (Platform.OS === "android") {
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setVisibilityAsync("hidden");
      }
    };

    if (Platform.OS !== "web") {
      setStatusBarHidden(true, "none");
      setSystemStatusBarVisible(false);
    }

    if (Platform.OS === "android") {
      navigationConfig();

      const navigationBarListener = NavigationBar.addVisibilityListener(({ visibility }) => {
        setSystemNavigationBarVisible(visibility === "visible");
        if (visibility === "visible") {
          navigationConfig();
        }
      });

      const appStateListener = AppState.addEventListener("change", nextAppState => {
        setSystemNavigationBarVisible(nextAppState !== "active");
        if (nextAppState !== "active") {
          navigationConfig();
        }
      });

      return () => {
        navigationBarListener.remove();
        appStateListener.remove();
      };
    }
    return undefined;
  }, []);

  const onLayout = useCallback((event: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = event.nativeEvent.layout;
    if (!isSystemStatusBarVisible && !isSystemNavigationBarVisible) {
      setScreenDimensions({ height, width });
    }
  }, [isSystemNavigationBarVisible, isSystemStatusBarVisible]);

  if (!loaded) {
    return null;
  }

  // Simplified layout for web
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" hidden />
        <RootLayoutNav />
      </View>
    );
  }

  return (
    <View
      style={{ height: screenDimensions.height, width: screenDimensions.width, overflow: "hidden" }}
      onLayout={onLayout}
    >
      <StatusBar style="dark" hidden />
      <RootLayoutNav />
    </View>
  );
  // return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="debug" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
