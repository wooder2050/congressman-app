import { ExternalLink, Megaphone } from 'lucide-react-native';
import { Linking, Pressable, Text, View } from 'react-native';

interface Props {
  sido?: string;
}

const NEC_URL =
  'https://info.nec.go.kr/main/showDocument.xhtml?electionId=0020260603&secondMenuId=CPRI03&topMenuId=CP';
const NEC_LIBRARY_URL = 'https://library.nec.go.kr/neweps/3/1/paper.do';
const NEC_WINNER_API_URL = 'https://www.data.go.kr/data/15000864/openapi.do';

export function LocalProportionalNotice({ sido }: Props) {
  return (
    <View className="gap-lawmake-md rounded-lawmake-lg border border-warning-light bg-warning-light/40 p-lawmake-md">
      <View>
        <View className="flex-row items-center gap-lawmake-xs">
          <Megaphone size={14} color="#92400E" />
          <Text className="text-lawmake-caption font-bold text-warning-dark">데이터 안내</Text>
        </View>
        <Text className="mt-lawmake-xs text-lawmake-callout font-bold text-neutral-900">
          {sido ? `${sido} 기초의원 비례대표 후보자 명부` : '기초의원 비례대표 후보자 명부'}는
          현재 lawmake에서 표시할 수 없습니다
        </Text>
      </View>

      <Text className="text-lawmake-footnote leading-5 text-neutral-600">
        선거 자체는 정상적으로 시행됩니다. 다만 중앙선거관리위원회 공공데이터 OpenAPI
        (PofelcddInfoInqireService)에서 기초의원 비례대표 후보자 명부가 정책적으로 제공되지
        않습니다. 2018·2022·2026 모두 동일하게 데이터가 비어있는 응답이 반환됩니다.
      </Text>

      <View className="gap-lawmake-sm">
        <Pressable
          onPress={() => Linking.openURL(NEC_URL)}
          className="flex-row items-center justify-between rounded-lawmake-md border border-neutral-200 bg-surface-primary px-lawmake-md py-lawmake-sm active:bg-neutral-50"
        >
          <View className="flex-1 pr-lawmake-sm">
            <Text className="text-lawmake-footnote font-semibold text-primary">
              NEC 선거통계시스템 — 후보자 명부
            </Text>
            <Text className="mt-0.5 text-lawmake-caption text-neutral-500">
              후보자 명부 &gt; 기초의원비례대표선거 &gt; 시도·구시군
            </Text>
          </View>
          <ExternalLink size={14} color="#6B7280" />
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(NEC_LIBRARY_URL)}
          className="flex-row items-center justify-between rounded-lawmake-md border border-neutral-200 bg-surface-primary px-lawmake-md py-lawmake-sm active:bg-neutral-50"
        >
          <View className="flex-1 pr-lawmake-sm">
            <Text className="text-lawmake-footnote font-semibold text-primary">
              중앙선관위 선거공보 도서관
            </Text>
            <Text className="mt-0.5 text-lawmake-caption text-neutral-500">
              정당·후보자별 공식 공보(PDF) 열람
            </Text>
          </View>
          <ExternalLink size={14} color="#6B7280" />
        </Pressable>
      </View>

      <Text className="text-lawmake-caption leading-4 text-neutral-500">
        ※ 6월 3일 본투표 후 NEC가 별도{' '}
        <Text
          onPress={() => Linking.openURL(NEC_WINNER_API_URL)}
          className="text-primary underline"
        >
          당선인 정보 API
        </Text>
        를 통해 비례 당선인을 공개하면 결과를 자동 반영할 예정입니다.
      </Text>
    </View>
  );
}
