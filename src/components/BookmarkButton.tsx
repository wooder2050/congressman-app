import { Bookmark, BookmarkCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import {
  useToggleBillBookmark,
  useToggleBreakingNewsBookmark,
  useToggleMemberBookmark,
} from '@/hooks/useBookmarks';
import { useAuth } from '@/lib/auth-context';

interface Props {
  type: 'bill' | 'member' | 'breaking-news';
  id: string;
  size?: number;
}

export function BookmarkButton({ type, id, size = 22 }: Props) {
  const { session } = useAuth();

  // hooks는 항상 호출되어야 하므로 분기 안에서 호출하지 않고 모두 호출
  const billState = useToggleBillBookmark(type === 'bill' ? id : '');
  const memberState = useToggleMemberBookmark(type === 'member' ? id : '');
  const breakingNewsState = useToggleBreakingNewsBookmark(
    type === 'breaking-news' ? id : '',
  );
  const state =
    type === 'bill' ? billState : type === 'member' ? memberState : breakingNewsState;

  // 비로그인 시 버튼 자체를 보여주지 않음 (유저 결정)
  if (!session) return null;

  const handlePress = () => {
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
