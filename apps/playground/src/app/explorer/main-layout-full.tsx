import React from "react";
import { Stack } from "expo-router";
import { MainLayoutFullScreen } from "../../explorer/categories/main-layout";

export default function MainLayoutFullScreenRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "MainLayout",
          headerShown: false,
        }}
      />
      <MainLayoutFullScreen />
    </>
  );
}
