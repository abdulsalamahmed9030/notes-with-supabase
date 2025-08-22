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
      fetchNotes(); // refresh
    }
  }

  useEffect(() => {
    fetchNotes();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchNotes();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p>Loading notes...</p>;
  if (notes.length === 0) return <p>No notes yet 📝</p>;

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="border rounded p-2 shadow-sm bg-white flex justify-between items-start"
        >
          {editingId === note.id ? (
            <div className="flex-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border p-1 rounded w-full"
              />
              <div className="space-x-2 mt-1">
                <button
                  onClick={() => updateNote(note.id, editContent)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                  className="px-2 py-1 bg-gray-300 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <p>{note.content}</p>
              <span className="text-xs text-gray-500">
                {new Date(note.created_at).toLocaleString()}
              </span>
            </div>
          )}

          {editingId !== note.id && (
            <button
              onClick={() => {
                setEditingId(note.id);
                setEditContent(note.content);
              }}
              className="ml-2 text-sm text-blue-500 hover:underline"
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
