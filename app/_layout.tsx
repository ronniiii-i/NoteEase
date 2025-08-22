import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "NoteEase", headerShown: false }}
        />
        <Stack.Screen
          name="note"
          options={{ title: "Note", presentation: "modal" }}
        />
        <Stack.Screen
          name="create-note"
          options={{ title: "New Note", presentation: "modal" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
