import React from "react";
import { Stack } from "expo-router";
import { CameraCaptureDemo } from "../../explorer/categories/camara";

export default function CameraCaptureRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Cámara",
          headerShown: false,
        }}
      />
      <CameraCaptureDemo />
    </>
  );
}