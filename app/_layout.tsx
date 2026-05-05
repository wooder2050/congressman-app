import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { OfflineBanner } from '@/components/OfflineBanner';
import { QueryProvider } from '@/lib/providers';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryProvider>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAFAFA' },
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 17,
            color: '#171717',
          },
          headerTintColor: '#171717',
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="members/[id]"
          options={{ headerShown: true, title: '의원 상세' }}
        />
        <Stack.Screen
          name="members/[id]/history"
          options={{ headerShown: true, title: '역대 활동' }}
        />
        <Stack.Screen
          name="members/[id]/scorecard"
          options={{ headerShown: true, title: '의정활동 성적표' }}
        />
        <Stack.Screen
          name="members/[id]/attendance"
          options={{ headerShown: true, title: '출석 상세' }}
        />
        <Stack.Screen
          name="bills/[id]"
          options={{ headerShown: true, title: '법안 상세' }}
        />
        <Stack.Screen
          name="votes/[id]"
          options={{ headerShown: true, title: '표결 상세' }}
        />
        <Stack.Screen
          name="committees/index"
          options={{ headerShown: true, title: '위원회' }}
        />
        <Stack.Screen
          name="committees/[name]"
          options={{ headerShown: true, title: '위원회 상세' }}
        />
        <Stack.Screen
          name="schedule"
          options={{ headerShown: true, title: '일정' }}
        />
        <Stack.Screen
          name="compare"
          options={{ headerShown: true, title: '의원 비교' }}
        />
        <Stack.Screen
          name="guide"
          options={{ headerShown: true, title: '입법 가이드' }}
        />
        <Stack.Screen
          name="glossary"
          options={{ headerShown: true, title: '용어 사전' }}
        />
        <Stack.Screen
          name="scorecard-ranking"
          options={{ headerShown: true, title: '의정활동 성적표' }}
        />
        <Stack.Screen
          name="property"
          options={{ headerShown: true, title: '부동산 보유 현황' }}
        />
        <Stack.Screen
          name="elections/index"
          options={{ headerShown: true, title: '재보궐선거' }}
        />
        <Stack.Screen
          name="elections/[id]"
          options={{ headerShown: true, title: '선거 상세' }}
        />
        <Stack.Screen
          name="local-elections/[id]/index"
          options={{ headerShown: true, title: '지방선거' }}
        />
        <Stack.Screen
          name="local-elections/[id]/races/index"
          options={{ headerShown: true, title: '선거구 검색' }}
        />
        <Stack.Screen
          name="local-elections/[id]/races/[raceId]"
          options={{ headerShown: true, title: '선거구 상세' }}
        />
        <Stack.Screen
          name="local-elections/[id]/regions/[sido]"
          options={{ headerShown: true, title: '지역별 선거구' }}
        />
        <Stack.Screen
          name="local-elections/[id]/vote"
          options={{ headerShown: true, title: '투표 안내' }}
        />
        <Stack.Screen
          name="about"
          options={{ headerShown: true, title: '앱 정보' }}
        />
        <Stack.Screen
          name="weekly/index"
          options={{ headerShown: true, title: '주간뉴스' }}
        />
        <Stack.Screen
          name="weekly/[id]/index"
          options={{ headerShown: true, title: '주간뉴스' }}
        />
        <Stack.Screen
          name="weekly/[id]/[slug]"
          options={{ headerShown: true, title: '기사' }}
        />
      </Stack>
      <StatusBar style="dark" />
    </QueryProvider>
  );
}
