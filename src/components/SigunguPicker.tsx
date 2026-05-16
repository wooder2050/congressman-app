import { MapPin, X } from 'lucide-react-native';
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
  /** chip이 이 개수 초과면 끝에 "전체 N개 +" → bottom sheet picker 노출 */
  pickerThreshold?: number;
}

/**
 * 시군구 chip row + bottom sheet picker 공용 컴포넌트.
 * regions/[sido]와 regions/[sido]/[type] 두 화면에서 사용.
 */
export function SigunguPicker({
  sigunguList,
  filter,
  onChange,
  hasMine,
  myDistrictLabel,
  pickerThreshold = 8,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const chips = [
    { id: undefined as SigunguFilterValue, label: '전체' },
    ...(hasMine && myDistrictLabel
      ? [{ id: 'mine' as const, label: `내 시군구 (${myDistrictLabel})` }]
      : []),
    ...sigunguList.map((s) => ({ id: s, label: s })),
  ];

  return (
    <View className="bg-surface-primary pb-lawmake-sm">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
        data={chips}
        keyExtractor={(item) => String(item.id ?? 'all')}
        renderItem={({ item }) => {
          const active = filter === item.id;
          const isMine = item.id === 'mine';
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
        ListFooterComponent={
          sigunguList.length > pickerThreshold ? (
            <Pressable
              onPress={() => setPickerOpen(true)}
              className="ml-lawmake-xs flex-row items-center gap-lawmake-xs rounded-full border border-neutral-300 bg-surface-primary px-lawmake-md py-1"
            >
              <Text className="text-lawmake-caption font-medium text-neutral-700">
                전체 {sigunguList.length}개 +
              </Text>
            </Pressable>
          ) : null
        }
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
              data={chips}
              keyExtractor={(item) => String(item.id ?? 'all')}
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => {
                const active = filter === item.id;
                const isMine = item.id === 'mine';
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
