import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View, type ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tapLight } from '@/lib/haptics';
import { markOnboardingCompleted } from '@/lib/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  {
    title: '제22대 국회를\n한눈에',
    description: '국회의원 · 법안 · 표결 등\n의정활동을 빠르게 확인하세요.',
  },
  {
    title: '의원 · 법안 · 표결\n추적',
    description: '297명 의원과 18,000건의 법안,\n매일 업데이트되는 표결을 추적합니다.',
  },
  {
    title: '매주 업데이트되는\n국회 소식',
    description: '주간뉴스로 정리된\n핵심 입법 동향을 받아보세요.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const finish = async () => {
    await markOnboardingCompleted();
    router.replace('/');
  };

  const onNext = () => {
    tapLight();
    if (index < PAGES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  const onSkip = () => {
    tapLight();
    finish();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) {
      setIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View className="flex-1 bg-surface-primary" style={{ paddingTop: insets.top }}>
      {/* Skip */}
      <View className="flex-row justify-end px-lawmake-lg pt-lawmake-md">
        <Pressable onPress={onSkip} hitSlop={12} className="px-lawmake-sm py-lawmake-xs">
          <Text className="text-lawmake-subhead text-neutral-500">건너뛰기</Text>
        </Pressable>
      </View>

      {/* Pages */}
      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View
            style={{ width: SCREEN_WIDTH }}
            className="items-center justify-center px-lawmake-xl"
          >
            <Text className="text-center text-lawmake-large text-neutral-900">
              {item.title}
            </Text>
            <Text className="mt-lawmake-lg text-center text-lawmake-callout text-neutral-500">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Indicator dots */}
      <View className="flex-row items-center justify-center gap-lawmake-sm">
        {PAGES.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${
              i === index ? 'w-6 bg-primary' : 'w-2 bg-neutral-200'
            }`}
          />
        ))}
      </View>

      {/* Next / Start */}
      <View
        className="px-lawmake-lg"
        style={{ paddingTop: 24, paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={onNext}
          className="items-center justify-center rounded-lawmake-lg bg-primary py-lawmake-md active:bg-primary-dark"
        >
          <Text className="text-lawmake-headline font-semibold text-white">
            {index === PAGES.length - 1 ? '시작하기' : '다음'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
