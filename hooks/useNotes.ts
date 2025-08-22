import React, { useState, useEffect } from "react";
import { getNotes, saveNotes } from "../services/storage";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const storedNotes = await getNotes();
      setNotes(storedNotes);
      // setLoading(false);
    };
    fetchNotes();
  }, []);

  const refetchNotes = async () => {
    const storedNotes = await getNotes();
    setNotes(storedNotes);
  };

  const addNote = (note: Note) => {
    const newNotes = [note, ...notes];
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  const updateNote = (updatedNote: Note) => {
    const newNotes = notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  const deleteNote = (id: string) => {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  // return { notes, loading, addNote, updateNote, deleteNote };
  return { notes, addNote, updateNote, deleteNote, refetchNotes };
};
