import { apiFetch } from '@/api/client';
import type { AssemblyTerm } from '@/types';

export async function getTerms(): Promise<AssemblyTerm[]> {
  return apiFetch('/api/terms');
}
Object.defineProperty(getTerms, 'queryKey', { value: 'terms' });
