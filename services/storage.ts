import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_KEY = "notes";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const getNotes = async (): Promise<Note[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch notes.", e);
    return [];
  }
};

export const saveNotes = async (notes: Note[]) => {
  try {
    const jsonValue = JSON.stringify(notes);
    await AsyncStorage.setItem(NOTES_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save notes.", e);
  }
};
