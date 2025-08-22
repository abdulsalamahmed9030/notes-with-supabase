"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthFormProps = {
  onAuth: () => void | Promise<void>;
};

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Logged in successfully ✅");
      await onAuth();
    }

    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Signup successful! Check your email to confirm.");
      await onAuth();
    }

    setLoading(false);
  }

  async function handleResetPassword() {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password", // ⚡ adjust in prod
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Password reset link sent to your email 📧");
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleLogin} // default submit = login
      className="space-y-4 max-w-sm mx-auto"
    >
      <input
        type="email"
        className="border p-2 w-full rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        className="border p-2 w-full rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded flex-1"
        >
          {loading ? "Loading..." : "Login"}
        </button>
        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded flex-1"
        >
          Signup
        </button>
      </div>

      <button
        type="button"
        onClick={handleResetPassword}
        disabled={!email || loading}
        className="text-sm text-blue-600 underline"
      >
        Forgot password?
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-green-600">{successMsg}</p>}
    </form>
  );
}
