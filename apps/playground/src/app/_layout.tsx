import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <Stack />
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}
