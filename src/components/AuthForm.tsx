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

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    else {
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

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setErrorMsg(error.message);
    else {
      setSuccessMsg("Signup successful! Check your email 📧");
      await onAuth();
    }
    setLoading(false);
  }

  async function handleResetPassword() {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) setErrorMsg(error.message);
    else setSuccessMsg("Password reset link sent! 📧");

    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-400 p-4">
      <form className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 animate-fadeIn" onSubmit={handleLogin}>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center">Secure Notes</h2>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
            className="peer placeholder-transparent border-b-2 border-gray-300 focus:border-blue-500 w-full p-2 text-gray-900 dark:text-gray-100 bg-transparent outline-none transition"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label
            htmlFor="email"
            className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
          >
            Email
          </label>
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type="password"
            id="password"
            className="peer placeholder-transparent border-b-2 border-gray-300 focus:border-blue-500 w-full p-2 text-gray-900 dark:text-gray-100 bg-transparent outline-none transition"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label
            htmlFor="password"
            className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
          >
            Password
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 transition-transform text-white py-2 rounded-xl font-semibold shadow-md"
          >
            {loading ? "Loading..." : "Login"}
          </button>
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:scale-105 transition-transform text-white py-2 rounded-xl font-semibold shadow-md"
          >
            Signup
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={!email || loading}
          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 underline mt-2"
        >
          Forgot password?
        </button>

        {/* Messages */}
        {errorMsg && <p className="text-red-500 text-center">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 text-center">{successMsg}</p>}
      </form>
    </div>
  );
}
