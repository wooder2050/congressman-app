import { useRouter } from 'expo-router';
import { CheckSquare } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 6·3 재보궐선거로 빠르게 진입하는 floating action button.
 */
export function ElectionFAB() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      className="absolute right-5 flex-row items-center gap-2 rounded-full bg-rose-500 px-4 py-3 shadow-lg active:bg-rose-600"
      style={{ bottom: insets.bottom }}
      onPress={() => router.push('/elections/2026-06-03')}
    >
      <CheckSquare size={18} color="#FFFFFF" />
      <Text className="text-sm font-semibold text-white">6·3 재보궐</Text>
    </Pressable>
  );
}
