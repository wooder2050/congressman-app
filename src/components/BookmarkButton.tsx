import { useRouter } from 'expo-router';
import { Bookmark, BookmarkCheck } from 'lucide-react-native';
import { Alert, Pressable, View } from 'react-native';

import { useToggleBillBookmark, useToggleMemberBookmark } from '@/hooks/useBookmarks';
import { useAuth } from '@/lib/auth-context';

interface Props {
  type: 'bill' | 'member';
  id: string;
  size?: number;
}

export function BookmarkButton({ type, id, size = 22 }: Props) {
  const router = useRouter();
  const { session } = useAuth();

  // hooks는 항상 호출되어야 하므로 분기 안에서 호출하지 않고 둘 다 호출
  const billState = useToggleBillBookmark(type === 'bill' ? id : '');
  const memberState = useToggleMemberBookmark(type === 'member' ? id : '');
  const state = type === 'bill' ? billState : memberState;

  const handlePress = () => {
    if (!session) {
      Alert.alert('로그인이 필요합니다', '즐겨찾기 기능은 로그인 후 사용할 수 있습니다.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인', onPress: () => router.push('/sign-in' as never) },
      ]);
      return;
    }
    state.toggle();
  };

  const Icon = state.isBookmarked ? BookmarkCheck : Bookmark;
  const color = state.isBookmarked ? '#2563EB' : '#9CA3AF';

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      disabled={state.isPending}
      className="active:opacity-50"
    >
      <View>
        <Icon size={size} color={color} />
      </View>
    </Pressable>
  );
}
