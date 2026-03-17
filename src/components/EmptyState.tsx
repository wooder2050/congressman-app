import { Inbox, type LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  const IconComponent = icon ?? Inbox;
  return (
    <View className={`flex-1 items-center justify-center px-8 py-20 ${className ?? ''}`}>
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
        <IconComponent size={28} color="#a3a3a3" />
      </View>
      {title && (
        <Text className="text-center text-base font-semibold text-neutral-700">
          {title}
        </Text>
      )}
      {description && (
        <Text className="mt-1.5 text-center text-sm leading-5 text-neutral-400">
          {description}
        </Text>
      )}
    </View>
  );
}
