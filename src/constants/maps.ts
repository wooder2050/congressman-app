export const VOTE_RESULT_MAP = {
  passed: { label: '원안가결', color: '#111111', textColor: '#FFFFFF' },
  amended: { label: '수정가결', color: '#6B7280', textColor: '#FFFFFF' },
  rejected: { label: '부결', color: '#DC2626', textColor: '#FFFFFF' },
  discarded: { label: '폐기', color: '#E5E5E5', textColor: '#595959' },
  other: { label: '기타', color: '#F5F5F5', textColor: '#595959' },
} as const;

export const MEMBER_VOTE_RESULT_MAP = {
  yes: { label: '찬성', color: '#16A34A', textColor: '#FFFFFF' },
  no: { label: '반대', color: '#DC2626', textColor: '#FFFFFF' },
  abstain: { label: '기권', color: '#404040', textColor: '#FFFFFF' },
  absent: { label: '불참', color: '#D4D4D4', textColor: '#595959' },
} as const;

export const BILL_STATUS_MAP = {
  passed: { label: '가결', color: '#0F766E', textColor: '#FFFFFF' },
  pending: { label: '계류', color: '#737373', textColor: '#FFFFFF' },
  discarded: { label: '폐기', color: '#D4D4D4', textColor: '#595959' },
  committee: { label: '위원회 심사', color: '#111111', textColor: '#FFFFFF' },
} as const;

export const SCORECARD_GRADE_MAP = {
  S: { label: 'S', color: '#2563EB', bgColor: '#DBEAFE' },
  A: { label: 'A', color: '#16A34A', bgColor: '#DCFCE7' },
  B: { label: 'B', color: '#CA8A04', bgColor: '#FEF9C3' },
  C: { label: 'C', color: '#EA580C', bgColor: '#FED7AA' },
  D: { label: 'D', color: '#DC2626', bgColor: '#FEE2E2' },
} as const;

export const ELECTION_STATUS_MAP = {
  upcoming: { label: '예정', color: '#2563EB', bgColor: '#DBEAFE' },
  active: { label: '진행 중', color: '#16A34A', bgColor: '#DCFCE7' },
  completed: { label: '완료', color: '#6B7280', bgColor: '#F3F4F6' },
} as const;

export const TOPIC_MAP: Record<string, { label: string; emoji: string }> = {
  '경제·산업': { label: '경제·산업', emoji: '💰' },
  '법·사법': { label: '법·사법', emoji: '⚖️' },
  '환경·에너지': { label: '환경·에너지', emoji: '🌱' },
  '노동·고용': { label: '노동·고용', emoji: '💼' },
  '보건·의료': { label: '보건·의료', emoji: '🏥' },
  '교통·물류': { label: '교통·물류', emoji: '🚗' },
  '부동산·주거': { label: '부동산·주거', emoji: '🏠' },
  '복지·돌봄': { label: '복지·돌봄', emoji: '🤝' },
  '육아·교육': { label: '육아·교육', emoji: '👶' },
  '행정·지방자치': { label: '행정·지방자치', emoji: '🏛️' },
  '농업·식품': { label: '농업·식품', emoji: '🌾' },
  '문화·체육': { label: '문화·체육', emoji: '🎭' },
  '과학기술·ICT': { label: '과학기술·ICT', emoji: '📱' },
  '외교·안보': { label: '외교·안보', emoji: '🌐' },
  '안전·치안': { label: '안전·치안', emoji: '🔒' },
};
