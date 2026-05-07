import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'lawmake.onboarding.completed.v1';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, '1');
  } catch {
    // ignore
  }
}
