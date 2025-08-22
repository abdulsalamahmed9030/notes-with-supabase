"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestPage() {
  const [message, setMessage] = useState("Checking connection...");

  useEffect(() => {
    async function check() {
      const { data, error } = await supabase.from("notes").select("*").limit(1);
      if (error) {
        setMessage("❌ Error: " + error.message);
      } else {
        setMessage("✅ Supabase connected! Found " + data.length + " notes.");
      }
    }
    check();
  }, []);

  return (
    <div style={{ fontSize: "24px", padding: "20px" }}>
      {message}
    </div>
  );
}
