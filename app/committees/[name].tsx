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
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Header */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md pt-lawmake-md">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lawmake-footnote text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-lawmake-sm text-lawmake-title2 font-bold text-neutral-900">{detail.name}</Text>

        <View className="mt-lawmake-sm flex-row gap-lawmake-md">
          <View>
            <Text className="text-lawmake-caption text-neutral-400">법안 수</Text>
            <Text className="text-lawmake-callout font-bold text-neutral-900">
              {detail.billTotal}
            </Text>
          </View>
          <View>
            <Text className="text-lawmake-caption text-neutral-400">가결</Text>
            <Text className="text-lawmake-callout font-bold text-success">
              {detail.billPassed}
            </Text>
          </View>
          <View>
            <Text className="text-lawmake-caption text-neutral-400">가결률</Text>
            <Text className="text-lawmake-callout font-bold text-primary">
              {formatPercent(detail.passRate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Members */}
      <View className="mt-lawmake-sm px-lawmake-lg">
        <SectionHeader title={`위원 (${detail.members.length}명)`} />
        <View className="mt-lawmake-sm gap-1">
          {detail.members.map((m) => (
            <Pressable
              key={m.memberId}
              className="flex-row items-center gap-lawmake-sm rounded-lawmake-lg bg-surface-primary px-lawmake-md py-lawmake-sm active:bg-neutral-50"
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
                <Text className="text-lawmake-footnote font-medium text-neutral-800">{m.name}</Text>
                <Text className="text-lawmake-caption text-neutral-400">{m.partyName}</Text>
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
        <View className="mt-lawmake-lg px-lawmake-lg">
          <SectionHeader title="예정 회의" />
          <View className="mt-lawmake-sm gap-lawmake-sm">
            {detail.upcomingSchedules.map((s, i) => (
              <Card key={i}>
                <Text className="text-lawmake-footnote font-medium text-neutral-800">{s.title}</Text>
                <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">
                  {formatDate(s.meetingDate)} {s.meetingTime}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Meeting Minutes */}
      {minutes && minutes.items.length > 0 && (
        <View className="mt-lawmake-lg px-lawmake-lg">
          <SectionHeader title="회의록" />
          <View className="mt-lawmake-sm gap-lawmake-sm">
            {minutes.items.map((m) => (
              <Card key={m.id}>
                <Text className="text-lawmake-footnote font-semibold text-neutral-800">
                  {m.title}
                </Text>
                <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">
                  {formatDate(m.confDate)} | {m.conferNum}
                </Text>
                {m.agendas.length > 0 && (
                  <View className="mt-lawmake-sm gap-1">
                    {m.agendas.slice(0, 3).map((a, i) => (
                      <View key={i} className="flex-row items-center gap-lawmake-sm">
                        <Text
                          className="flex-1 text-lawmake-caption text-neutral-500"
                          numberOfLines={1}
                        >
                          {a.subName}
                        </Text>
                        {a.vodLinkUrl && (
                          <Pressable
                            onPress={() => Linking.openURL(a.vodLinkUrl!)}
                            hitSlop={8}
                          >
                            <Text className="text-lawmake-caption text-primary">영상</Text>
                          </Pressable>
                        )}
                        {a.pdfLinkUrl && (
                          <Pressable
                            onPress={() => Linking.openURL(a.pdfLinkUrl!)}
                            hitSlop={8}
                          >
                            <Text className="text-lawmake-caption text-primary">PDF</Text>
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
            <View className="mt-lawmake-sm flex-row items-center justify-center gap-lawmake-sm">
              <Pressable
                disabled={minutesPage <= 1}
                onPress={() => setMinutesPage((p) => p - 1)}
              >
                <Text
                  className={`text-lawmake-footnote font-medium ${minutesPage <= 1 ? 'text-neutral-300' : 'text-primary'}`}
                >
                  이전
                </Text>
              </Pressable>
              <Text className="text-lawmake-caption text-neutral-400">
                {minutesPage} / {minutes.totalPages}
              </Text>
              <Pressable
                disabled={minutesPage >= minutes.totalPages}
                onPress={() => setMinutesPage((p) => p + 1)}
              >
                <Text
                  className={`text-lawmake-footnote font-medium ${minutesPage >= minutes.totalPages ? 'text-neutral-300' : 'text-primary'}`}
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
