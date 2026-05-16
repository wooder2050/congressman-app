import { ChevronRight, MapPin, X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SigunguFilterValue } from '@/hooks/useSigunguFilter';

interface Props {
  sigunguList: readonly string[];
  filter: SigunguFilterValue;
  onChange: (next: SigunguFilterValue) => void;
  hasMine: boolean;
  myDistrictLabel?: string;
  /** chip row에 노출되는 시군구 chip 최대 개수. 초과분은 picker로만 접근. */
  visibleCount?: number;
}

interface ChipItem {
  id: SigunguFilterValue;
  label: string;
  kind: 'all' | 'mine' | 'picker' | 'sigungu';
}

/**
 * 시군구 chip row + bottom sheet picker 공용 컴포넌트.
 *
 * chip row 레이아웃: [전체] [내 시군구] [+ 전체 N개] [상위 visibleCount개 시군구]
 * - "+ 전체 N개" 버튼이 시군구 chip 앞에 위치 → 큰 지역에서도 발견성 보장
 * - 선택된 sigungu가 상위 N개 밖이면 chip row 앞쪽에 끌어와 항상 보이게 함
 */
export function SigunguPicker({
  sigunguList,
  filter,
  onChange,
  hasMine,
  myDistrictLabel,
  visibleCount = 8,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // public prop이라 비정상 값(0, 음수) 방어
  const safeVisibleCount = Math.max(1, visibleCount);

  // 상위 N개 + 현재 선택된 chip 우선
  const visibleSigungu = (() => {
    const head = sigunguList.slice(0, safeVisibleCount);
    if (
      typeof filter === 'string' &&
      filter !== 'mine' &&
      sigunguList.includes(filter) &&
      !head.includes(filter)
    ) {
      // 선택된 chip이 상위 N개 밖이면 앞쪽에 끌어옴
      return [filter, ...head.slice(0, safeVisibleCount - 1)];
    }
    return head;
  })();

  const showsPicker = sigunguList.length > visibleSigungu.length;

  const chips: ChipItem[] = [
    { id: undefined as SigunguFilterValue, label: '전체', kind: 'all' },
    ...(hasMine && myDistrictLabel
      ? [
          {
            id: 'mine' as const,
            label: `내 시군구 (${myDistrictLabel})`,
            kind: 'mine' as const,
          },
        ]
      : []),
    ...(showsPicker
      ? [
          {
            id: undefined as SigunguFilterValue,
            label: `전체 ${sigunguList.length}개`,
            kind: 'picker' as const,
          },
        ]
      : []),
    ...visibleSigungu.map(
      (s) => ({ id: s, label: s, kind: 'sigungu' as const }) satisfies ChipItem,
    ),
  ];

  return (
    <View className="bg-surface-primary pb-lawmake-sm">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
        data={chips}
        keyExtractor={(item, idx) => `${item.kind}-${item.id ?? idx}`}
        renderItem={({ item }) => {
          if (item.kind === 'picker') {
            return (
              <Pressable
                onPress={() => setPickerOpen(true)}
                className="flex-row items-center gap-lawmake-xs rounded-full border border-neutral-300 bg-surface-primary px-lawmake-md py-1"
              >
                <Text className="text-lawmake-caption font-medium text-neutral-700">
                  {item.label}
                </Text>
                <ChevronRight size={12} color="#525252" />
              </Pressable>
            );
          }

          const active = filter === item.id;
          const isMine = item.kind === 'mine';
          return (
            <Pressable
              onPress={() => onChange(item.id)}
              className={`flex-row items-center gap-lawmake-xs rounded-full border px-lawmake-md py-1 ${
                active
                  ? 'border-neutral-900 bg-neutral-900'
                  : isMine
                    ? 'border-primary bg-primary-light'
                    : 'border-neutral-200 bg-surface-primary'
              }`}
            >
              {isMine && <MapPin size={12} color={active ? '#FFFFFF' : '#2563EB'} />}
              <Text
                className={`text-lawmake-caption font-medium ${
                  active ? 'text-white' : isMine ? 'text-primary' : 'text-neutral-600'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="rounded-t-lawmake-xl bg-surface-primary"
            style={{ maxHeight: '80%', paddingBottom: insets.bottom + 8 }}
          >
            <View className="flex-row items-center justify-between border-b border-neutral-100 px-lawmake-lg py-lawmake-md">
              <Text className="text-lawmake-headline font-bold text-neutral-900">
                시군구 선택
              </Text>
              <Pressable onPress={() => setPickerOpen(false)} hitSlop={8}>
                <X size={20} color="#525252" />
              </Pressable>
            </View>
            <FlatList
              data={[
                { id: undefined as SigunguFilterValue, label: '전체', kind: 'all' as const },
                ...(hasMine && myDistrictLabel
                  ? [
                      {
                        id: 'mine' as const,
                        label: `내 시군구 (${myDistrictLabel})`,
                        kind: 'mine' as const,
                      },
                    ]
                  : []),
                ...sigunguList.map(
                  (s) =>
                    ({ id: s, label: s, kind: 'sigungu' as const }) satisfies ChipItem,
                ),
              ]}
              keyExtractor={(item, idx) => `${item.kind}-${item.id ?? idx}`}
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => {
                const active = filter === item.id;
                const isMine = item.kind === 'mine';
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.id);
                      setPickerOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-lawmake-lg py-lawmake-md active:bg-neutral-50 ${
                      active ? 'bg-primary-light' : ''
                    }`}
                  >
                    <View className="flex-row items-center gap-lawmake-sm">
                      {isMine && <MapPin size={14} color="#2563EB" />}
                      <Text
                        className={`text-lawmake-body ${
                          active ? 'font-bold text-primary' : 'text-neutral-900'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {active && (
                      <Text className="text-lawmake-caption font-semibold text-primary">
                        선택됨
                      </Text>
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
