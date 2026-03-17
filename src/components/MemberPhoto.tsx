import { Image } from 'expo-image';
import { View } from 'react-native';

type MemberPhotoProps = {
  uri: string;
  size?: number;
  partyColor?: string;
  className?: string;
};

export function MemberPhoto({
  uri,
  size = 48,
  partyColor,
  className,
}: MemberPhotoProps) {
  return (
    <View
      className={`items-center justify-center overflow-hidden rounded-full bg-neutral-100 ${className ?? ''}`}
      style={[
        { width: size, height: size },
        partyColor ? { borderWidth: 2, borderColor: partyColor } : undefined,
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: size - (partyColor ? 4 : 0), height: size - (partyColor ? 4 : 0) }}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
}
