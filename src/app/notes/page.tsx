"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "@/components/AuthForm";
import type { Session } from "@supabase/supabase-js";

type Note = {
  id: string;
  content: string;
  created_at?: string;
  user_id: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Track auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, authSession) => {
        setSession(authSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch notes for current user
  async function fetchNotes(userId: string) {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotes((data as Note[]) || []);
    }
  }

  // Refresh notes when session changes
  useEffect(() => {
    if (session?.user?.id) {
      void fetchNotes(session.user.id);
    }
  }, [session]);

  // Add a note
  async function addNote() {
    if (!newNote.trim() || !session?.user?.id) return;

    const userId = session.user.id;

    const { error } = await supabase.from("notes").insert([
      {
        content: newNote,
        user_id: userId,
      },
    ]);

    if (!error) {
      setNewNote("");
      await fetchNotes(userId);
    }
  }

  // Delete a note
  async function deleteNote(id: string) {
    if (!session?.user?.id) return;

    const userId = session.user.id;

    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      await fetchNotes(userId);
    }
  }

  // Loading state
  if (loading) {
    return <p className="text-center p-6">Loading...</p>;
  }

  // Not logged in → show auth form
  if (!session) {
    return <AuthForm onAuth={async () => {}} />;
  }

  // Logged in → show notes
  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📝 My Notes</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1 rounded"
          type="text"
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button
          onClick={addNote}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className="border p-2 rounded bg-gray-50 flex justify-between items-center"
          >
            <span>{note.content}</span>
            <button
              onClick={() => deleteNote(note.id)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
