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
      <Stack.Screen
        name="candidatos"
        options={{
          title: "Candidatos",
        }}
      />
      <Stack.Screen
        name="cronograma"
        options={{
          title: "Cronograma",
        }}
      />
      <Stack.Screen
        name="electores"
        options={{
          title: "Electores",
        }}
      />
      <Stack.Screen
        name="miembrosmesa"
        options={{
          title: "Miembros de Mesa",
        }}
      />
    </Stack>
  );
}
