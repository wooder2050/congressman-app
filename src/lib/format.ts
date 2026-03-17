import { format, parseISO } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'yyyy.MM.dd'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function formatAmount(amount: number): string {
  if (Math.abs(amount) >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (Math.abs(amount) >= 10000) {
    return `${(amount / 10000).toFixed(0)}만`;
  }
  return formatNumber(amount);
}
