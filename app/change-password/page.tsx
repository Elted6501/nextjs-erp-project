"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../login/login.css"; // Uses the same styles as login

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!password || !confirm) {
      setErrorMsg("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "Error changing password.");
    }
  };

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center text-red-600">
        User not found.
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="mb-4">Set your new password</h2>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {errorMsg && (
            <div className="text-red-600 text-sm">{errorMsg}</div>
          )}
          <button
            type="submit"
            className={`login-button ${loading ? "glow" : ""}`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Change password"}
          </button>
          {success && (
            <div className="text-green-600 text-center mt-2">
              Password changed! Redirecting to login...
            </div>
          )}
        </form>
      </div>
    </div>
  );
}