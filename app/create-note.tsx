import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { useNotes } from "../hooks/useNotes";
import { router } from "expo-router";
import { ThemedView } from "../components/Themed";
import { WebView } from "react-native-webview";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const editorHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: sans-serif; padding: 10px; }
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
  </script>
</body>
</html>
`;

export default function CreateNoteScreen() {
  const { addNote } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const webviewRef = React.useRef(null);

  const handleSave = () => {
    if (title || content) {
      addNote({
        id: Date.now().toString(),
        title: title.trim(),
        content,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
      router.back();
    }
  };

  const handleWebViewMessage = (event: any) => {
    setContent(event.nativeEvent.data);
  };

  const applyFormat = (command: string) => {
    if (webviewRef.current) {
      (webviewRef.current as any).injectJavaScript(`format('${command}');`);
    }
  };

  useEffect(() => {
    // Inject initial content if needed, but for new note, it's empty
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          value={title}
          onChangeText={setTitle}
        />
        <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
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
        </KeyboardAwareScrollView>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Note</Text>
        </TouchableOpacity>
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
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  scrollContainer: {
    flexGrow: 1,
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
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
