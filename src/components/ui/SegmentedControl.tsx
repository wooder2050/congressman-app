import { Pressable, Text, View } from 'react-native';

type Segment<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * iOS 스타일 segmented control.
 * - 하나의 background 안에 여러 옵션이 들어가고 활성 항목만 강조
 * - 기존 FilterChip(둥근 칩 형태)과 다름 — 이건 iOS 시스템 segmented 모양
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      className={`flex-row gap-1 rounded-lawmake-md bg-neutral-100 p-1 ${className ?? ''}`}
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            onPress={() => onChange(s.value)}
            className={`flex-1 items-center rounded-lawmake-sm px-lawmake-md py-lawmake-sm ${
              active ? 'bg-surface-primary' : ''
            }`}
            style={
              active
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 2,
                    elevation: 1,
                  }
                : undefined
            }
          >
            <Text
              className={`text-lawmake-callout ${
                active ? 'font-semibold text-neutral-900' : 'text-neutral-600'
              }`}
            >
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
