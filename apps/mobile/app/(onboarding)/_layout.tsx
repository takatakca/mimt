import { Stack } from "expo-router";
import { colors } from "../../src/theme";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerTransparent: true,
        headerTintColor: colors.white,
        contentStyle: { backgroundColor: colors.navy },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      {/* Onboarding steps after sign-in cannot be skipped by going back. */}
      <Stack.Screen name="address" options={{ headerBackVisible: false, gestureEnabled: false }} />
      <Stack.Screen name="notice" options={{ headerBackVisible: false, gestureEnabled: false }} />
      <Stack.Screen name="done" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}
