// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar backgroundColor="#fff" translucent={false} hidden={false} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
