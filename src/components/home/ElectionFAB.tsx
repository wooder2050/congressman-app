import { useRouter } from 'expo-router';
import { CheckSquare } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tapMedium } from '@/lib/haptics';

/**
 * 6·3 재보궐선거로 빠르게 진입하는 floating action button.
 */
export function ElectionFAB() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      className="absolute right-5 flex-row items-center gap-2 rounded-full bg-primary px-4 py-3 active:bg-primary-dark"
      style={{
        bottom: insets.bottom + 4,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 8,
      }}
      onPress={() => {
        tapMedium();
        router.push('/elections/2026-06-03');
      }}
    >
      <CheckSquare size={18} color="#FFFFFF" />
      <Text className="text-sm font-semibold text-white">6·3 재보궐</Text>
    </Pressable>
  );
}
