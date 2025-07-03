"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../login/login.css"; 

export default function ChangePasswordPage() {
  // State for new password input
  const [password, setPassword] = useState("");
  // State for confirm password input
  const [confirm, setConfirm] = useState("");
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State for success message
  const [success, setSuccess] = useState(false);
  // State for error message
  const [errorMsg, setErrorMsg] = useState("");
  // Next.js router for navigation
  const router = useRouter();
  // Get search params from URL
  const searchParams = useSearchParams();
  // Get userId from query string
  const userId = searchParams.get("userId");

  // Handle form submission for password change
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    // Validate input fields
    if (!password || !confirm) {
      setErrorMsg("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    // Send password change request to API
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      // Redirect to login after success
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "Error changing password.");
    }
  };

  // If userId is missing, show error message
  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center text-red-600">
        User not found.
      </div>
    );
  }

  // Render password change form
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