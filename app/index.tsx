import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useNotes } from "../hooks/useNotes";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "../components/Themed";

export default function HomeScreen() {
  const { notes, deleteNote, refetchNotes } = useNotes();

  useFocusEffect(
    React.useCallback(() => {
      refetchNotes();
    }, [refetchNotes])
  );
  const handleDelete = (id: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => deleteNote(id),
        style: "destructive",
      },
    ]);
  };

  const renderItem = ({
    item,
  }: {
    item: { id: string; title: string; content: string; date: string };
  }) => (
    <Link href={{ pathname: `/note`, params: { id: item.id } }} asChild>
      <TouchableOpacity style={styles.noteItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.noteTitle}>{item.title || "Untitled Note"}</Text>
          <Text style={styles.noteDate}>{item.date}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <Text style={styles.header}>My Notes</Text>
        {notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No notes yet. Create your first note!
            </Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        )}
        <Link href="/create-note" asChild>
          <TouchableOpacity style={styles.fab}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  noteItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  noteDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 30,
    color: "#fff",
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 24,
    color: "#FF3B30",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});
