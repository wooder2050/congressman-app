import { Pressable, Text } from 'react-native';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
};

export function FilterChip({ label, selected, onPress, className }: FilterChipProps) {
  return (
    <Pressable
      className={`rounded-full border px-3.5 py-1.5 ${
        selected
          ? 'border-primary bg-primary-light'
          : 'border-neutral-200 bg-white active:bg-neutral-50'
      } ${className ?? ''}`}
      onPress={onPress}
    >
      <Text
        className={`text-xs font-medium ${selected ? 'text-primary' : 'text-neutral-600'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
