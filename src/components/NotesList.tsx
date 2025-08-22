"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Note = {
  id: string;
  content: string;
  created_at: string;
};

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  async function fetchNotes() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error.message);
      setNotes([]);
    } else {
      setNotes(data || []);
    }

    setLoading(false);
  }

  async function updateNote(id: string, content: string) {
    const { error } = await supabase
      .from("notes")
      .update({ content })
      .eq("id", id);

    if (error) {
      console.error("Error updating note:", error.message);
    } else {
      setEditingId(null);
      setEditContent("");
      fetchNotes();
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) console.error("Error deleting note:", error.message);
    else fetchNotes();
  }

  useEffect(() => {
    fetchNotes();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchNotes();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return (
      <p className="text-center py-12 text-gray-500 italic text-lg">
        ⏳ Loading notes...
      </p>
    );
  if (notes.length === 0)
    return (
      <p className="text-center py-12 text-gray-500 italic text-lg">
        No notes yet 📝
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        📝 My Notes
      </h1>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-gray-100 dark:border-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white dark:hover:from-gray-700 dark:hover:to-gray-800"
          >
            {editingId === note.id ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateNote(note.id, editContent)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-xl font-medium transition"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-lg text-gray-800 dark:text-gray-100 font-medium leading-snug">
                  {note.content}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
            )}

            {editingId !== note.id && (
              <div className="mt-4 flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setEditingId(note.id);
                    setEditContent(note.content);
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-sm font-semibold text-red-600 hover:text-red-800 transition flex items-center gap-1"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
