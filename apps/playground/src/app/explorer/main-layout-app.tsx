import React from "react";
import { Stack } from "expo-router";
import { MainLayoutApp } from "../../explorer/categories/main-layout-app";

export default function MainLayoutAppRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "AppLayout Demo",
          headerShown: false,
        }}
      />
      <MainLayoutApp />
    </>
  );
}
