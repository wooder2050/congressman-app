import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExternalLink, FileText } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBill } from '@/api/bills';
import { BookmarkButton } from '@/components/BookmarkButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BILL_STATUS_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate } from '@/lib/format';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: bill, isLoading, error, refetch } = useLawmakeQuery(getBill, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!bill) return <EmptyState title="법안 정보를 찾을 수 없습니다" />;

  const statusInfo = BILL_STATUS_MAP[bill.status];

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Header */}
      <View className="bg-white px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text className="text-sm text-primary">뒤로</Text>
          </Pressable>
          <BookmarkButton type="bill" id={id} />
        </View>

        <View className="mt-3 flex-row items-start">
          <Badge
            label={statusInfo.label}
            color={statusInfo.color}
            textColor={statusInfo.textColor}
          />
          {bill.topic && <Badge label={bill.topic} className="ml-1.5" />}
        </View>
        <Text className="mt-2 text-lg font-bold leading-6 text-neutral-900">
          {bill.title}
        </Text>
        <Text className="mt-2 text-xs text-neutral-400">
          {bill.proposerName} | {formatDate(bill.proposedDate)}
        </Text>
      </View>

      {/* AI Summary */}
      {bill.structuredSummary && (
        <View className="mt-3 px-5">
          <SectionHeader title="AI 요약" />
          <Card className="mt-2">
            <View className="gap-3">
              <View>
                <Text className="text-xs font-semibold text-primary">현행</Text>
                <Text className="mt-0.5 text-sm leading-5 text-neutral-700">
                  {bill.structuredSummary.situation}
                </Text>
              </View>
              <View>
                <Text className="text-xs font-semibold text-red-500">문제점</Text>
                <Text className="mt-0.5 text-sm leading-5 text-neutral-700">
                  {bill.structuredSummary.problem}
                </Text>
              </View>
              <View>
                <Text className="text-xs font-semibold text-green-600">개정안</Text>
                <Text className="mt-0.5 text-sm leading-5 text-neutral-700">
                  {bill.structuredSummary.change}
                </Text>
              </View>
              <View>
                <Text className="text-xs font-semibold text-amber-600">기대효과</Text>
                <Text className="mt-0.5 text-sm leading-5 text-neutral-700">
                  {bill.structuredSummary.impact}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Simple Summary */}
      {!bill.structuredSummary && bill.simpleSummary && (
        <View className="mt-3 px-5">
          <SectionHeader title="요약" />
          <Card className="mt-2">
            <Text className="text-sm leading-5 text-neutral-700">
              {bill.simpleSummary}
            </Text>
          </Card>
        </View>
      )}

      {/* Progress */}
      {bill.progress && (
        <View className="mt-5 px-5">
          <SectionHeader title="심사 경과" />
          <Card className="mt-2">
            <View className="gap-3">
              {/* Committee */}
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-3 w-3 rounded-full ${bill.progress.committeeResultDate ? 'bg-green-500' : bill.progress.committeeDate ? 'bg-amber-400' : 'bg-neutral-200'}`}
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-neutral-800">
                    위원회 심사
                  </Text>
                  {bill.progress.committeeDate && (
                    <Text className="text-xs text-neutral-400">
                      접수 {formatDate(bill.progress.committeeDate)}
                      {bill.progress.committeeResult &&
                        ` | ${bill.progress.committeeResult}`}
                    </Text>
                  )}
                </View>
              </View>

              {/* Law Committee */}
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-3 w-3 rounded-full ${bill.progress.lawResult ? 'bg-green-500' : bill.progress.lawSubmitDate ? 'bg-amber-400' : 'bg-neutral-200'}`}
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-neutral-800">
                    법제사법위원회
                  </Text>
                  {bill.progress.lawSubmitDate && (
                    <Text className="text-xs text-neutral-400">
                      회부 {formatDate(bill.progress.lawSubmitDate)}
                      {bill.progress.lawResult && ` | ${bill.progress.lawResult}`}
                    </Text>
                  )}
                </View>
              </View>

              {/* Plenary */}
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-3 w-3 rounded-full ${bill.progress.plenaryDate ? 'bg-green-500' : 'bg-neutral-200'}`}
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-neutral-800">본회의</Text>
                  {bill.progress.plenaryDate && (
                    <Text className="text-xs text-neutral-400">
                      의결 {formatDate(bill.progress.plenaryDate)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Proposers */}
      {bill.proposers && bill.proposers.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title={`발의자 (${bill.proposers.length}명)`} />
          <View className="mt-2 gap-1">
            {bill.proposers.map((p) => (
              <Pressable
                key={p.memberId}
                className="flex-row items-center gap-3 rounded-xl bg-white px-4 py-2.5 active:bg-neutral-50"
                onPress={() => router.push(`/members/${p.memberId}`)}
              >
                <View
                  className="h-9 w-9 overflow-hidden rounded-full bg-neutral-100"
                  style={{ borderWidth: 1.5, borderColor: p.partyColor }}
                >
                  <Image
                    source={{ uri: p.photoUrl }}
                    style={{ width: 33, height: 33 }}
                    contentFit="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-neutral-800">
                    {p.memberName}
                  </Text>
                  <Text className="text-[11px] text-neutral-400">
                    {p.partyName} | {p.district}
                  </Text>
                </View>
                {p.role === 'representative' && (
                  <Badge label="대표발의" color="#2563EB" textColor="#FFFFFF" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Links */}
      <View className="mt-5 flex-row gap-2 px-5">
        {bill.pdfUrl && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => Linking.openURL(bill.pdfUrl!)}
            className="flex-1"
          >
            <View className="flex-row items-center gap-1.5">
              <FileText size={14} color="#525252" />
              <Text className="text-xs font-medium text-neutral-700">PDF 보기</Text>
            </View>
          </Button>
        )}
        {bill.hasVote && (
          <Button
            variant="primary"
            size="sm"
            onPress={() => router.push(`/votes/${bill.id}`)}
            className="flex-1"
          >
            표결 결과 보기
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
