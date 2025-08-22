import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useNotes } from "../hooks/useNotes";
import { ThemedView } from "../components/Themed";
import RenderHTML from "react-native-render-html";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { TextInput } from "react-native-gesture-handler";
// import {  } from "react-native-webview";

const tagsStyles = {
  p: {
    marginBottom: 10,
    color: "#333",
    fontSize: 16,
  },
  strong: {
    fontWeight: "bold" as const,
  },
  em: {
    fontStyle: "italic" as const,
  },
  u: {
    textDecorationLine: "underline" as const,
  },
};

const editorHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: sans-serif; padding: 10px; margin: 0; }
    #editor { outline: none; min-height: 200px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; }
  </style>
</head>
<body>
  <div id="editor" contenteditable="true"></div>
  <script>
    const editor = document.getElementById('editor');
    editor.addEventListener('input', () => {
      window.ReactNativeWebView.postMessage(editor.innerHTML);
    });
    function format(command, value) {
      document.execCommand(command, false, value);
    }
    function setHTML(content) {
      editor.innerHTML = content;
      // Move cursor to the end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      editor.focus();
    }
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SET_CONTENT') {
        setHTML(event.data.content);
      }
    });
  </script>
</body>
</html>
`;

export default function NoteScreen() {
  const { id } = useLocalSearchParams();
  const { notes, updateNote, deleteNote } = useNotes();
  const { width } = useWindowDimensions();
  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [isEditing, setIsEditing] = useState(false);
  const webviewRef = React.useRef<WebView>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  useEffect(() => {
    if (isEditing && webviewRef.current && note) {
      // Inject the existing note content into the WebView
      const script = `
        window.postMessage({ type: 'SET_CONTENT', content: \`${note.content.replace(
          /`/g,
          "\\`"
        )}\` });
        true;
      `;
      webviewRef.current.injectJavaScript(script);
    }
  }, [isEditing, note]);

  const handleSave = () => {
    if (note) {
      updateNote({ ...note, title: title.trim(), content });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          if (note) {
            deleteNote(note.id);
            router.back();
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Note not found.</Text>
      </View>
    );
  }

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    setContent(event.nativeEvent.data);
  };

  const applyFormat = (command: string) => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`format('${command}'); true;`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{note.date}</Text>
          <View style={styles.actions}>
            {isEditing ? (
              <TouchableOpacity
                onPress={handleSave}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.scrollContainer}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
              />
              <View style={styles.toolbar}>
                <TouchableOpacity
                  onPress={() => applyFormat("bold")}
                  style={styles.toolButton}
                >
                  <Text style={styles.toolText}>B</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => applyFormat("italic")}
                  style={styles.toolButton}
                >
                  <Text style={styles.toolText}>I</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => applyFormat("underline")}
                  style={styles.toolButton}
                >
                  <Text style={styles.toolText}>U</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.editorContainer}>
                <WebView
                  ref={webviewRef}
                  style={styles.webview}
                  originWhitelist={["*"]}
                  source={{ html: editorHtml }}
                  onMessage={handleWebViewMessage}
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{note.title || "Untitled Note"}</Text>
              <RenderHTML
                contentWidth={width}
                source={{ html: content }}
                tagsStyles={tagsStyles}
              />
            </>
          )}
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#EAEAEA",
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: "#333",
  },
  dateText: {
    fontSize: 14,
    color: "#888",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 50,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 200,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  toolbar: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  toolButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  toolText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
