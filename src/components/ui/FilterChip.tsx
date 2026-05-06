import { Pressable, Text } from 'react-native';

import { tapLight } from '@/lib/haptics';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
};

export function FilterChip({ label, selected, onPress, className }: FilterChipProps) {
  return (
    <Pressable
      className={`rounded-full px-4 py-2 ${
        selected
          ? 'bg-primary'
          : 'bg-neutral-100 active:bg-neutral-200'
      } ${className ?? ''}`}
      onPress={() => {
        tapLight();
        onPress?.();
      }}
    >
      <Text
        className={`text-[13px] font-semibold ${selected ? 'text-white' : 'text-neutral-700'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
