import { apiFetch } from '@/api/client';
import type { AbsenceDetail, AttendanceRanking, AttendanceRecord } from '@/types';

export async function getAttendance(params: {
  memberId: string;
  termId: number;
}): Promise<AttendanceRecord | null> {
  return apiFetch(`/api/attendance?memberId=${params.memberId}&termId=${params.termId}`);
}
Object.defineProperty(getAttendance, 'queryKey', { value: 'attendance' });

export async function getAbsenceDetails(params: {
  memberId: string;
  termId: number;
}): Promise<AbsenceDetail[]> {
  return apiFetch(
    `/api/attendance/absence?memberId=${params.memberId}&termId=${params.termId}`
  );
}
Object.defineProperty(getAbsenceDetails, 'queryKey', { value: 'absenceDetails' });

export async function getAttendanceRanking(termId: number): Promise<AttendanceRanking> {
  return apiFetch(`/api/stats/attendance-ranking?termId=${termId}`);
}
Object.defineProperty(getAttendanceRanking, 'queryKey', { value: 'attendanceRanking' });
