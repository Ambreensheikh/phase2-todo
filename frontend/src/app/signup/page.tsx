"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Backend model ke mutabiq keys: email, name, hashed_password
      await axios.post("http://localhost:8001/signup", {
        email: email,
        name: name,
        hashed_password: password, 
      });

      alert("Account created successfully! Now please login.");
      router.push("/"); // Login page par wapas bhej dega
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.detail || "Signup failed. Try again.");
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", backgroundColor: "#f3f4f6" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "32px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#1f2937", marginBottom: "24px" }}>Create Account</h1>
        
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", color: "black" }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", color: "black" }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", color: "black" }} />
          </div>

          {error && <p style={{ fontSize: "14px", color: "#dc2626", marginBottom: "16px" }}>{error}</p>}

          <button type="submit" style={{ width: "100%", padding: "10px", color: "white", backgroundColor: "#10b981", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
          Already have an account? <Link href="/" style={{ color: "#4f46e5", fontWeight: "bold" }}>Login here</Link>
        </div>
      </div>
    </main>
  );
}