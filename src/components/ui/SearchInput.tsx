import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';

type SearchInputProps = TextInputProps & {
  onClear?: () => void;
  className?: string;
};

export function SearchInput({ value, onClear, className, ...props }: SearchInputProps) {
  return (
    <View
      className={`flex-row items-center rounded-xl border border-neutral-200 bg-white px-3 ${className ?? ''}`}
    >
      <Search size={18} color="#a3a3a3" />
      <TextInput
        className="ml-2 flex-1 py-2.5 text-sm text-neutral-800"
        placeholderTextColor="#a3a3a3"
        value={value}
        returnKeyType="search"
        {...props}
      />
      {value ? (
        <Pressable onPress={onClear} hitSlop={8}>
          <X size={16} color="#a3a3a3" />
        </Pressable>
      ) : null}
    </View>
  );
}
