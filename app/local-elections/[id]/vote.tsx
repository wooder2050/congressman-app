import { Calendar, Clock, FileText, MapPin, Vote } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';

const SCHEDULES = [
  { label: '사전투표', date: '2026-05-29 ~ 30', time: '오전 6시 ~ 오후 6시' },
  { label: '본투표', date: '2026-06-03 (수)', time: '오전 6시 ~ 오후 6시' },
];

const BALLOTS = [
  { name: '광역단체장', desc: '시·도지사 (서울특별시장 등 17명)' },
  { name: '기초단체장', desc: '시장·군수·구청장' },
  { name: '교육감', desc: '시·도 교육감' },
  { name: '광역의원', desc: '시·도의회 의원 (지역구·비례)' },
  { name: '기초의원', desc: '구·시·군의회 의원 (지역구·비례)' },
];

export default function VoteGuideScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{
        padding: 16,
        paddingBottom: insets.bottom + 24,
        gap: 12,
      }}
    >
      {/* 일정 */}
      <Card>
        <View className="flex-row items-center gap-lawmake-sm">
          <Calendar size={18} color="#EF4444" />
          <Text className="text-lawmake-headline text-neutral-900">투표 일정</Text>
        </View>
        <View className="mt-lawmake-md gap-lawmake-sm">
          {SCHEDULES.map((s) => (
            <View
              key={s.label}
              className="rounded-lawmake-md bg-error-light px-lawmake-md py-lawmake-sm"
            >
              <Text className="text-lawmake-subhead font-bold text-error-dark">{s.label}</Text>
              <View className="mt-lawmake-xs flex-row items-center gap-lawmake-xs">
                <Calendar size={12} color="#9F1239" />
                <Text className="text-lawmake-footnote text-error-dark">{s.date}</Text>
              </View>
              <View className="mt-lawmake-xs flex-row items-center gap-lawmake-xs">
                <Clock size={12} color="#9F1239" />
                <Text className="text-lawmake-footnote text-error-dark">{s.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* 투표용지 */}
      <Card>
        <View className="flex-row items-center gap-lawmake-sm">
          <FileText size={18} color="#2563EB" />
          <Text className="text-lawmake-headline text-neutral-900">
            투표용지 (최대 7장)
          </Text>
        </View>
        <Text className="mt-lawmake-sm text-lawmake-footnote text-neutral-600">
          유권자는 자신의 선거구에 따라 최대 7장의 투표용지를 받습니다.
        </Text>
        <View className="mt-lawmake-md gap-lawmake-sm">
          {BALLOTS.map((b, i) => (
            <View key={b.name} className="flex-row gap-lawmake-md">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-info-light">
                <Text className="text-lawmake-caption font-bold text-info-dark">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lawmake-body font-semibold text-neutral-900">
                  {b.name}
                </Text>
                <Text className="text-lawmake-caption text-neutral-500">{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* 투표 장소 */}
      <Card>
        <View className="flex-row items-center gap-lawmake-sm">
          <MapPin size={18} color="#16A34A" />
          <Text className="text-lawmake-headline text-neutral-900">투표 장소</Text>
        </View>
        <View className="mt-lawmake-sm gap-lawmake-xs">
          <Text className="text-lawmake-footnote leading-5 text-neutral-700">
            • <Text className="font-semibold">사전투표</Text>: 전국 어느 사전투표소든 가능
          </Text>
          <Text className="text-lawmake-footnote leading-5 text-neutral-700">
            • <Text className="font-semibold">본투표</Text>: 본인 주소지 관할 투표소만 가능
          </Text>
          <Text className="text-lawmake-footnote leading-5 text-neutral-700">
            • 자세한 위치는 중앙선거관리위원회 홈페이지 또는 본인의 투표 안내문 참고
          </Text>
        </View>
      </Card>

      {/* 준비물 */}
      <Card>
        <View className="flex-row items-center gap-lawmake-sm">
          <Vote size={18} color="#8B5CF6" />
          <Text className="text-lawmake-headline text-neutral-900">준비물</Text>
        </View>
        <View className="mt-lawmake-sm gap-lawmake-xs">
          <Text className="text-lawmake-footnote leading-5 text-neutral-700">
            • 신분증 (주민등록증, 운전면허증, 여권 등 사진이 부착된 관공서 발급 증명서)
          </Text>
          <Text className="text-lawmake-footnote leading-5 text-neutral-700">
            • 모바일 신분증 사용 가능
          </Text>
        </View>
      </Card>

      <Text className="mt-lawmake-sm px-lawmake-sm text-lawmake-caption text-neutral-400">
        ※ 본 안내는 일반 정보이며, 정확한 사항은 중앙선거관리위원회 공식 안내를 확인해주세요.
      </Text>
    </ScrollView>
  );
}
