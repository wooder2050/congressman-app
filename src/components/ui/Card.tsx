import { Pressable, PressableProps, StyleSheet, View, ViewProps } from 'react-native';

import { shadow as shadowTokens } from '@/design/tokens';

const styles = StyleSheet.create({
  card: shadowTokens.card,
});

type CardProps = ViewProps & {
  children: React.ReactNode;
};

/**
 * 기본 카드. radius 12, hairline border, subtle shadow.
 * iOS 톤: 강한 그림자보다 border + 살짝의 shadow.
 */
export function Card({ className, style, ...props }: CardProps) {
  return (
    <View
      className={`rounded-lawmake-lg border border-neutral-100 bg-surface-primary p-lawmake-lg ${className ?? ''}`}
      style={[styles.card, style]}
      {...props}
    />
  );
}

type PressableCardProps = PressableProps & {
  children: React.ReactNode;
  className?: string;
};

export function PressableCard({ className, ...props }: PressableCardProps) {
  return (
    <Pressable
      className={`rounded-lawmake-lg border border-neutral-100 bg-surface-primary p-lawmake-lg active:bg-neutral-50 ${className ?? ''}`}
      style={styles.card}
      {...props}
    />
  );
}
