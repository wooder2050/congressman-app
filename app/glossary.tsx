import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SearchInput } from '@/components/ui/SearchInput';

type GlossaryItem = {
  term: string;
  category: string;
  definition: string;
};

const GLOSSARY_DATA: GlossaryItem[] = [
  // 법안
  {
    term: '의안',
    category: '법안',
    definition: '국회에서 심의할 안건의 총칭. 법률안, 예산안, 동의안 등을 포함합니다.',
  },
  {
    term: '법률안',
    category: '법안',
    definition: '새로운 법률을 만들거나 기존 법률을 개정 또는 폐지하기 위해 국회에 제출하는 안건입니다.',
  },
  {
    term: '대안',
    category: '법안',
    definition: '위원회가 원안을 대체하여 새로 작성한 법률안. 여러 법안을 병합하여 만들기도 합니다.',
  },
  {
    term: '수정안',
    category: '법안',
    definition: '원안의 일부를 수정하여 제출하는 안. 본회의 또는 위원회에서 제출할 수 있습니다.',
  },
  {
    term: '계류',
    category: '법안',
    definition: '법안이 아직 심사 중인 상태. 위원회 또는 본회의에서 처리되지 않고 남아있는 상태입니다.',
  },
  {
    term: '폐기',
    category: '법안',
    definition: '법안이 더 이상 처리되지 않고 없어지는 것. 임기 만료 시 처리되지 않은 법안은 자동 폐기됩니다.',
  },
  // 표결
  {
    term: '원안가결',
    category: '표결',
    definition: '원래 제출된 안 그대로 국회를 통과한 것입니다.',
  },
  {
    term: '수정가결',
    category: '표결',
    definition: '원안에 수정을 거쳐 국회를 통과한 것입니다.',
  },
  {
    term: '부결',
    category: '표결',
    definition: '표결 결과 찬성이 과반수에 미치지 못해 안건이 통과되지 못한 것입니다.',
  },
  {
    term: '기권',
    category: '표결',
    definition: '표결에 참석하였으나 찬성도 반대도 하지 않는 것입니다.',
  },
  {
    term: '재적의원',
    category: '표결',
    definition: '현재 국회의원으로 등록되어 있는 의원의 총수입니다.',
  },
  // 의정활동
  {
    term: '대표발의',
    category: '의정활동',
    definition: '법률안을 주도적으로 작성하고 발의한 의원. 법안의 첫 번째 발의자입니다.',
  },
  {
    term: '공동발의',
    category: '의정활동',
    definition: '대표발의자와 함께 법률안에 이름을 올린 의원. 최소 10인의 찬성이 필요합니다.',
  },
  {
    term: '청가',
    category: '의정활동',
    definition: '의장의 허가를 받아 공식적으로 회의에 불참하는 것입니다.',
  },
  {
    term: '선수',
    category: '의정활동',
    definition: '국회의원에 당선된 횟수. 초선, 재선, 3선 등으로 표현합니다.',
  },
  // 위원회
  {
    term: '상임위원회',
    category: '위원회',
    definition: '국회에 상시적으로 설치된 위원회. 현재 17개의 상임위원회가 있습니다.',
  },
  {
    term: '특별위원회',
    category: '위원회',
    definition: '특정 사안을 처리하기 위해 한시적으로 구성되는 위원회입니다.',
  },
  {
    term: '법제사법위원회',
    category: '위원회',
    definition: '모든 법률안의 체계와 자구(용어)를 심사하는 위원회. 법사위라고 줄여 부릅니다.',
  },
  {
    term: '소위원회',
    category: '위원회',
    definition: '위원회 내에 특정 안건을 심사하기 위해 구성하는 소규모 위원회입니다.',
  },
];

const CATEGORIES = ['전체', '법안', '표결', '의정활동', '위원회'];

export default function GlossaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');

  const filtered = useMemo(() => {
    let list = GLOSSARY_DATA;
    if (category !== '전체') {
      list = list.filter((item) => item.category === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.term.toLowerCase().includes(q) ||
          item.definition.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, search]);

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-md">
        <Text className="text-lawmake-title2 font-bold text-neutral-900">용어 사전</Text>
      </View>

      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm">
        <SearchInput
          placeholder="용어 검색"
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />
      </View>

      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm">
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 6 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.term}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16, paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <Card>
            <View className="flex-row items-center gap-lawmake-sm">
              <Text className="text-lawmake-footnote font-bold text-neutral-900">{item.term}</Text>
              <View className="rounded-lawmake-sm bg-primary-light px-lawmake-xs py-0.5">
                <Text className="text-lawmake-caption font-medium text-primary">
                  {item.category}
                </Text>
              </View>
            </View>
            <Text className="mt-lawmake-xs text-lawmake-footnote leading-5 text-neutral-600">
              {item.definition}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}
