import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

const ELECTION_ID = 'local-2026';
const ELECTION_DATE = new Date('2026-06-03T00:00:00');

function getDDay(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((ELECTION_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return 'D-Day';
  return `D+${Math.abs(diff)}`;
}

export function LocalElectionBanner() {
  const router = useRouter();
  const dday = getDDay();

  return (
    <Pressable
      onPress={() => router.push(`/local-elections/${ELECTION_ID}`)}
      className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50 active:bg-rose-100"
    >
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        <View className="rounded-lg bg-rose-500 px-2.5 py-1">
          <Text className="text-xs font-bold text-white">{dday}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-neutral-900" numberOfLines={1}>
            6·3 전국동시지방선거
          </Text>
          <Text className="mt-0.5 text-[11px] text-neutral-500" numberOfLines={1}>
            광역단체장 · 기초단체장 · 교육감 · 광역·기초의원
          </Text>
        </View>
        <ChevronRight size={18} color="#F43F5E" />
      </View>
    </Pressable>
  );
}
