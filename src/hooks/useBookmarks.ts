import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addBillBookmark,
  addBreakingNewsBookmark,
  addMemberBookmark,
  getUserPreferences,
  removeBillBookmark,
  removeBreakingNewsBookmark,
  removeMemberBookmark,
} from '@/api/user-preferences';
import { useAuth } from '@/lib/auth-context';
import type { UserPreference } from '@/types';

const QUERY_KEY = ['userPreferences'] as const;

export function useUserPreferences() {
  const { session } = useAuth();
  const enabled = !!session;

  return useQuery<UserPreference | null, Error>({
    queryKey: QUERY_KEY,
    queryFn: getUserPreferences,
    enabled,
    staleTime: 60_000,
  });
}

export function useToggleBillBookmark(billId: string) {
  const queryClient = useQueryClient();
  const { data: prefs } = useUserPreferences();
  const isBookmarked = prefs?.bookmarkedBills?.includes(billId) ?? false;

  const mutation = useMutation({
    mutationFn: async () =>
      isBookmarked ? removeBillBookmark(billId) : addBillBookmark(billId),
    onSuccess: (data) => {
      queryClient.setQueryData<UserPreference | null>(QUERY_KEY, data);
    },
  });

  return { isBookmarked, toggle: mutation.mutate, isPending: mutation.isPending };
}

export function useToggleMemberBookmark(memberId: string) {
  const queryClient = useQueryClient();
  const { data: prefs } = useUserPreferences();
  const isBookmarked = prefs?.bookmarkedMembers?.includes(memberId) ?? false;

  const mutation = useMutation({
    mutationFn: async () =>
      isBookmarked ? removeMemberBookmark(memberId) : addMemberBookmark(memberId),
    onSuccess: (data) => {
      queryClient.setQueryData<UserPreference | null>(QUERY_KEY, data);
    },
  });

  return { isBookmarked, toggle: mutation.mutate, isPending: mutation.isPending };
}

export function useToggleBreakingNewsBookmark(newsId: string) {
  const queryClient = useQueryClient();
  const { data: prefs } = useUserPreferences();
  const isBookmarked = prefs?.bookmarkedBreakingNews?.includes(newsId) ?? false;

  const mutation = useMutation({
    mutationFn: async () =>
      isBookmarked
        ? removeBreakingNewsBookmark(newsId)
        : addBreakingNewsBookmark(newsId),
    onSuccess: (data) => {
      queryClient.setQueryData<UserPreference | null>(QUERY_KEY, data);
    },
  });

  return { isBookmarked, toggle: mutation.mutate, isPending: mutation.isPending };
}
