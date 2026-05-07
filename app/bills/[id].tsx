import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/format';
import type { Bill } from '@/types';

const BILL_STATUS_TONE: Record<Bill['status'], { label: string; tone: StatusTone }> = {
  passed: { label: '가결', tone: 'success' },
  pending: { label: '계류', tone: 'neutral' },
  discarded: { label: '폐기', tone: 'error' },
  committee: { label: '위원회', tone: 'info' },
};

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const { data: bill, isLoading, error, refetch } = useLawmakeQuery(getBill, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!bill) return <EmptyState title="법안 정보를 찾을 수 없습니다" />;

  const status = BILL_STATUS_TONE[bill.status] ?? BILL_STATUS_TONE.pending;

  return (
    <View className="flex-1 bg-surface-secondary">
      {session && (
        <Stack.Screen
          options={{ headerRight: () => <BookmarkButton type="bill" id={id} /> }}
        />
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Title block */}
        <View className="bg-surface-primary px-lawmake-lg pb-lawmake-xl pt-lawmake-sm">
          <View className="flex-row items-center gap-lawmake-sm">
            <StatusBadge label={status.label} tone={status.tone} />
            {bill.topic && <Badge label={bill.topic} />}
          </View>
          <Text className="mt-lawmake-md text-lawmake-title1 leading-7 text-neutral-900">
            {bill.title}
          </Text>
          <Text className="mt-lawmake-sm text-lawmake-footnote text-neutral-500">
            {bill.proposerName} · {formatDate(bill.proposedDate)}
          </Text>
        </View>

        {/* AI Summary */}
        {bill.structuredSummary && (
          <View className="mt-lawmake-md px-lawmake-lg">
            <Section title="AI 요약">
              <Card>
                <View className="gap-lawmake-md">
                  <SummaryItem
                    label="현행"
                    color="text-primary"
                    text={bill.structuredSummary.situation}
                  />
                  <SummaryItem
                    label="문제점"
                    color="text-error"
                    text={bill.structuredSummary.problem}
                  />
                  <SummaryItem
                    label="개정안"
                    color="text-success"
                    text={bill.structuredSummary.change}
                  />
                  <SummaryItem
                    label="기대효과"
                    color="text-warning-dark"
                    text={bill.structuredSummary.impact}
                  />
                </View>
              </Card>
            </Section>
          </View>
        )}

        {/* Simple Summary */}
        {!bill.structuredSummary && bill.simpleSummary && (
          <View className="mt-lawmake-md px-lawmake-lg">
            <Section title="요약">
              <Card>
                <Text className="text-lawmake-body text-neutral-700">{bill.simpleSummary}</Text>
              </Card>
            </Section>
          </View>
        )}

        {/* Progress */}
        {bill.progress && (
          <View className="mt-lawmake-xl px-lawmake-lg">
            <Section title="심사 경과">
              <Card>
                <View className="gap-lawmake-md">
                  <ProgressStep
                    label="위원회 심사"
                    state={
                      bill.progress.committeeResultDate
                        ? 'done'
                        : bill.progress.committeeDate
                          ? 'active'
                          : 'pending'
                    }
                    detail={
                      bill.progress.committeeDate
                        ? `접수 ${formatDate(bill.progress.committeeDate)}${bill.progress.committeeResult ? ` · ${bill.progress.committeeResult}` : ''}`
                        : undefined
                    }
                  />
                  <ProgressStep
                    label="법제사법위원회"
                    state={
                      bill.progress.lawResult
                        ? 'done'
                        : bill.progress.lawSubmitDate
                          ? 'active'
                          : 'pending'
                    }
                    detail={
                      bill.progress.lawSubmitDate
                        ? `회부 ${formatDate(bill.progress.lawSubmitDate)}${bill.progress.lawResult ? ` · ${bill.progress.lawResult}` : ''}`
                        : undefined
                    }
                  />
                  <ProgressStep
                    label="본회의"
                    state={bill.progress.plenaryDate ? 'done' : 'pending'}
                    detail={
                      bill.progress.plenaryDate
                        ? `의결 ${formatDate(bill.progress.plenaryDate)}`
                        : undefined
                    }
                  />
                </View>
              </Card>
            </Section>
          </View>
        )}

        {/* Proposers */}
        {bill.proposers && bill.proposers.length > 0 && (
          <View className="mt-lawmake-xl px-lawmake-lg">
            <Section title={`발의자 ${bill.proposers.length}명`}>
              <Card className="p-0">
                {bill.proposers.map((p, i) => {
                  const isLast = i === bill.proposers!.length - 1;
                  return (
                    <Pressable
                      key={p.memberId}
                      onPress={() => router.push(`/members/${p.memberId}`)}
                      className={`flex-row items-center gap-lawmake-md px-lawmake-lg py-lawmake-md active:bg-neutral-50 ${
                        !isLast ? 'border-b border-neutral-100' : ''
                      }`}
                    >
                      <View
                        className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100"
                        style={{ borderWidth: 1.5, borderColor: p.partyColor }}
                      >
                        <Image
                          source={{ uri: p.photoUrl }}
                          style={{ width: 37, height: 37 }}
                          contentFit="cover"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lawmake-body text-neutral-900">{p.memberName}</Text>
                        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                          {p.partyName} · {p.district}
                        </Text>
                      </View>
                      {p.role === 'representative' && (
                        <StatusBadge label="대표발의" tone="primary" />
                      )}
                    </Pressable>
                  );
                })}
              </Card>
            </Section>
          </View>
        )}

        {/* Links */}
        <View className="mt-lawmake-xl flex-row gap-lawmake-sm px-lawmake-lg">
          {bill.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => Linking.openURL(bill.pdfUrl!)}
              className="flex-1"
            >
              <View className="flex-row items-center gap-lawmake-xs">
                <FileText size={14} color="#525252" />
                <Text className="text-lawmake-footnote font-medium text-neutral-700">
                  PDF 보기
                </Text>
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
              <View className="flex-row items-center gap-lawmake-xs">
                <ExternalLink size={14} color="#FFFFFF" />
                <Text className="text-lawmake-footnote font-semibold text-white">
                  표결 결과 보기
                </Text>
              </View>
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryItem({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <View>
      <Text className={`text-lawmake-subhead font-semibold ${color}`}>{label}</Text>
      <Text className="mt-lawmake-xs text-lawmake-body text-neutral-700">{text}</Text>
    </View>
  );
}

function ProgressStep({
  label,
  state,
  detail,
}: {
  label: string;
  state: 'done' | 'active' | 'pending';
  detail?: string;
}) {
  const dotClass =
    state === 'done' ? 'bg-success' : state === 'active' ? 'bg-warning' : 'bg-neutral-200';
  return (
    <View className="flex-row items-center gap-lawmake-md">
      <View className={`h-3 w-3 rounded-full ${dotClass}`} />
      <View className="flex-1">
        <Text className="text-lawmake-callout font-medium text-neutral-900">{label}</Text>
        {detail && (
          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">{detail}</Text>
        )}
      </View>
    </View>
  );
}
