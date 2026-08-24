import React from "react";
import { Stack } from "expo-router";
import { SheetLayoutFullScreen } from "../../explorer/categories/sheet-layout";

export default function SheetLayoutFullScreenRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "SheetLayout",
          headerShown: false,
        }}
      />
      <SheetLayoutFullScreen />
    </>
  );
}
