import { apiFetch } from '@/api/client';
import type { UserPreference } from '@/types';

export async function getUserPreferences(): Promise<UserPreference | null> {
  return apiFetch<UserPreference>('/api/user/preferences', { requireAuth: true });
}
Object.defineProperty(getUserPreferences, 'queryKey', { value: 'userPreferences' });

export async function updateUserPreferences(body: {
  displayName?: string;
  district?: string | null;
  interests?: string[];
}): Promise<UserPreference> {
  return apiFetch('/api/user/preferences', {
    method: 'PATCH',
    body,
    requireAuth: true,
  });
}

export async function addBillBookmark(billId: string): Promise<UserPreference> {
  return apiFetch(`/api/user/preferences/bookmarks/bills/${encodeURIComponent(billId)}`, {
    method: 'POST',
    requireAuth: true,
  });
}

export async function removeBillBookmark(billId: string): Promise<UserPreference> {
  return apiFetch(`/api/user/preferences/bookmarks/bills/${encodeURIComponent(billId)}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}

export async function addMemberBookmark(memberId: string): Promise<UserPreference> {
  return apiFetch(`/api/user/preferences/bookmarks/members/${encodeURIComponent(memberId)}`, {
    method: 'POST',
    requireAuth: true,
  });
}

export async function removeMemberBookmark(memberId: string): Promise<UserPreference> {
  return apiFetch(`/api/user/preferences/bookmarks/members/${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}

export async function addBreakingNewsBookmark(newsId: string): Promise<UserPreference> {
  return apiFetch(`/api/user/preferences/bookmarks/breaking-news/${encodeURIComponent(newsId)}`, {
    method: 'POST',
    requireAuth: true,
  });
}

export async function removeBreakingNewsBookmark(newsId: string): Promise<UserPreference> {
  return apiFetch(`/api/user/preferences/bookmarks/breaking-news/${encodeURIComponent(newsId)}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
