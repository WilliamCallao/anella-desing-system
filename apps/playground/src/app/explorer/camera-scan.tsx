import React from "react";
import { Stack } from "expo-router";
import { CameraScanDemo } from "../../explorer/categories/camara";

export default function CameraScanRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Escanear QR",
          headerShown: false,
        }}
      />
      <CameraScanDemo />
    </>
  );
}