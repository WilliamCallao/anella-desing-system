import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ToastProvider } from "@william-callao/antonella-ui";
import { background } from "@william-callao/antonella-theme";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <ToastProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: background.surface },
              headerTintColor: "#000000",
              headerTitleStyle: { fontWeight: "600" },
              headerShadowVisible: false,
            }}
          />
        </ToastProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}
