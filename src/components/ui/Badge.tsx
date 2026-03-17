import { Text, View } from 'react-native';

type BadgeProps = {
  label: string;
  color?: string;
  textColor?: string;
  className?: string;
};

export function Badge({
  label,
  color = '#E5E5E5',
  textColor = '#595959',
  className,
}: BadgeProps) {
  return (
    <View
      className={`self-start rounded-md px-2 py-0.5 ${className ?? ''}`}
      style={{ backgroundColor: color }}
    >
      <Text className="text-xs font-medium" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
