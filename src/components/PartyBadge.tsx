import { Text, View } from 'react-native';

type PartyBadgeProps = {
  name: string;
  color: string;
  size?: 'sm' | 'md';
  className?: string;
};

export function PartyBadge({ name, color, size = 'sm', className }: PartyBadgeProps) {
  return (
    <View className={`flex-row items-center gap-1 ${className ?? ''}`}>
      <View
        className={`rounded-full ${size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'}`}
        style={{ backgroundColor: color }}
      />
      <Text
        className={`font-medium text-neutral-600 ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}
      >
        {name}
      </Text>
    </View>
  );
}
