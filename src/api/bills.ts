import { apiFetch } from '@/api/client';
import type { Bill, BillDetail, BillSummary } from '@/types';

export async function getBills(params: {
  termId?: number;
  memberId?: string;
  role?: string;
  status?: string;
  search?: string;
  month?: string;
  committee?: string;
  topic?: string;
  page?: number;
  limit?: number;
}): Promise<{ bills: Bill[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.termId) searchParams.set('termId', String(params.termId));
  if (params.memberId) searchParams.set('memberId', params.memberId);
  if (params.role) searchParams.set('role', params.role);
  if (params.status) searchParams.set('status', params.status);
  if (params.month) searchParams.set('month', params.month);
  if (params.search) searchParams.set('search', params.search);
  if (params.committee) searchParams.set('committee', params.committee);
  if (params.topic) searchParams.set('topic', params.topic);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  return apiFetch(`/api/bills?${searchParams.toString()}`);
}
Object.defineProperty(getBills, 'queryKey', { value: 'bills' });

export async function getBill(id: string): Promise<BillDetail | null> {
  return apiFetch(`/api/bills/${id}`);
}
Object.defineProperty(getBill, 'queryKey', { value: 'bill' });

export async function getBillSummary(termId: number): Promise<BillSummary> {
  return apiFetch(`/api/bills/summary?termId=${termId}`);
}
Object.defineProperty(getBillSummary, 'queryKey', { value: 'billSummary' });

export async function getBillTopics(
  termId: number
): Promise<{ topic: string; count: number }[]> {
  return apiFetch(`/api/bills/topics?termId=${termId}`);
}
Object.defineProperty(getBillTopics, 'queryKey', { value: 'billTopics' });

export async function getBillCommittees(termId: number): Promise<string[]> {
  return apiFetch(`/api/bills/committees?termId=${termId}`);
}
Object.defineProperty(getBillCommittees, 'queryKey', { value: 'billCommittees' });
