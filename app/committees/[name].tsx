import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCommitteeDetail, getCommitteeMinutes } from '@/api/committees';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatPercent } from '@/lib/format';
import { Linking } from 'react-native';
import { useState } from 'react';

const CURRENT_TERM = 22;

export default function CommitteeDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [minutesPage, setMinutesPage] = useState(1);

  const {
    data: detail,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getCommitteeDetail, [{ name, termId: CURRENT_TERM }]);

  const { data: minutes } = useLawmakeQuery(getCommitteeMinutes, [
    { name, termId: CURRENT_TERM, page: minutesPage },
  ]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!detail) return <EmptyState title="위원회 정보를 찾을 수 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Header */}
      <View className="bg-white px-5 pb-4 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-2 text-lg font-bold text-neutral-900">{detail.name}</Text>

        <View className="mt-3 flex-row gap-4">
          <View>
            <Text className="text-xs text-neutral-400">법안 수</Text>
            <Text className="text-base font-bold text-neutral-900">
              {detail.billTotal}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-400">가결</Text>
            <Text className="text-base font-bold text-green-600">
              {detail.billPassed}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-400">가결률</Text>
            <Text className="text-base font-bold text-primary">
              {formatPercent(detail.passRate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Members */}
      <View className="mt-3 px-5">
        <SectionHeader title={`위원 (${detail.members.length}명)`} />
        <View className="mt-2 gap-1">
          {detail.members.map((m) => (
            <Pressable
              key={m.memberId}
              className="flex-row items-center gap-3 rounded-xl bg-white px-4 py-2.5 active:bg-neutral-50"
              onPress={() => router.push(`/members/${m.memberId}`)}
            >
              <View
                className="h-9 w-9 overflow-hidden rounded-full bg-neutral-100"
                style={{ borderWidth: 1.5, borderColor: m.partyColor }}
              >
                <Image
                  source={{ uri: m.photoUrl }}
                  style={{ width: 33, height: 33 }}
                  contentFit="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
                <Text className="text-[11px] text-neutral-400">{m.partyName}</Text>
              </View>
              {m.role && m.role !== '위원' && (
                <Badge label={m.role} color="#2563EB" textColor="#FFFFFF" />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Upcoming Schedules */}
      {detail.upcomingSchedules.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title="예정 회의" />
          <View className="mt-2 gap-2">
            {detail.upcomingSchedules.map((s, i) => (
              <Card key={i}>
                <Text className="text-sm font-medium text-neutral-800">{s.title}</Text>
                <Text className="mt-0.5 text-xs text-neutral-400">
                  {formatDate(s.meetingDate)} {s.meetingTime}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Meeting Minutes */}
      {minutes && minutes.items.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title="회의록" />
          <View className="mt-2 gap-2">
            {minutes.items.map((m) => (
              <Card key={m.id}>
                <Text className="text-sm font-semibold text-neutral-800">
                  {m.title}
                </Text>
                <Text className="mt-0.5 text-xs text-neutral-400">
                  {formatDate(m.confDate)} | {m.conferNum}
                </Text>
                {m.agendas.length > 0 && (
                  <View className="mt-2 gap-1">
                    {m.agendas.slice(0, 3).map((a, i) => (
                      <View key={i} className="flex-row items-center gap-2">
                        <Text
                          className="flex-1 text-xs text-neutral-500"
                          numberOfLines={1}
                        >
                          {a.subName}
                        </Text>
                        {a.vodLinkUrl && (
                          <Pressable
                            onPress={() => Linking.openURL(a.vodLinkUrl!)}
                            hitSlop={8}
                          >
                            <Text className="text-[10px] text-primary">영상</Text>
                          </Pressable>
                        )}
                        {a.pdfLinkUrl && (
                          <Pressable
                            onPress={() => Linking.openURL(a.pdfLinkUrl!)}
                            hitSlop={8}
                          >
                            <Text className="text-[10px] text-primary">PDF</Text>
                          </Pressable>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </View>

          {/* Pagination */}
          {minutes.totalPages > 1 && (
            <View className="mt-3 flex-row items-center justify-center gap-3">
              <Pressable
                disabled={minutesPage <= 1}
                onPress={() => setMinutesPage((p) => p - 1)}
              >
                <Text
                  className={`text-sm font-medium ${minutesPage <= 1 ? 'text-neutral-300' : 'text-primary'}`}
                >
                  이전
                </Text>
              </Pressable>
              <Text className="text-xs text-neutral-400">
                {minutesPage} / {minutes.totalPages}
              </Text>
              <Pressable
                disabled={minutesPage >= minutes.totalPages}
                onPress={() => setMinutesPage((p) => p + 1)}
              >
                <Text
                  className={`text-sm font-medium ${minutesPage >= minutes.totalPages ? 'text-neutral-300' : 'text-primary'}`}
                >
                  다음
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
