import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { SheetLayoutFullScreen } from "../../explorer/categories/sheet-layout";

export default function SheetLayoutFullScreenRoute() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  const initialKey =
    view === "top" || view === "bottom" || view === "fullH" || view === "fullB"
      ? view
      : "top";
  return (
    <>
      <Stack.Screen
        options={{
          title: "SheetLayout",
          headerShown: false,
        }}
      />
      <SheetLayoutFullScreen initialKey={initialKey} />
    </>
  );
}
