import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

export const tapLight = () => {
  if (!isIOS) return;
  Haptics.selectionAsync().catch(() => undefined);
};

export const tapMedium = () => {
  if (!isIOS) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
};

export const tapSuccess = () => {
  if (!isIOS) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
};
