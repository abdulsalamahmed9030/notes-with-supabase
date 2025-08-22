"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "@/components/AuthForm";
import type { Session } from "@supabase/supabase-js";
import NotesList from "@/components/NotesList";

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

  // Fetch notes
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
        <p className="text-white text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-md">
          <AuthForm onAuth={async () => {}} />
        </div>
      </div>
    );
  }

  // Logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow">
            📝 My Notes
          </h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-white/80 text-gray-800 px-4 py-2 rounded-xl font-medium shadow hover:bg-white transition"
          >
            Logout
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 p-3 rounded-xl border border-gray-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button
            onClick={addNote}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow font-medium transition"
          >
            Add
          </button>
        </div>

        {/* Notes List */}
        <ul className="space-y-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 p-4 rounded-2xl shadow-md flex justify-between items-center hover:shadow-lg transition"
            >
              <span className="text-gray-800 dark:text-gray-100">
                {note.content}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700 transition"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>
      <NotesList />
    </div>
  );
}
