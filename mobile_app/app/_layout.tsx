import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Atrás",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Iniciar Sesión",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="mapa"
        options={{
          title: "Centros de Votación",
        }}
      />
    </Stack>
  );
}
