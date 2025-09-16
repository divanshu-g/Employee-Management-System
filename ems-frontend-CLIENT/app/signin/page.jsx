"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAnimate(true);
    // Could add checks if user already logged in via session here (optional)
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login API sets session cookie
      const loginRes = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        setError(errData.message || "Login failed");
        setLoading(false);
        return;
      }

      // After login, fetch user profile to get roles from session
      const profileRes = await fetch("http://localhost:8080/api/auth/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!profileRes.ok) {
        setError("Failed to fetch user profile");
        setLoading(false);
        return;
      }

      const userProfile = await profileRes.json();

      // Check roles for redirect - allow only superAdmin or subAdmin
      const roles = userProfile.roles || [];
      if (roles.includes("employee")) {
        setLoading(false);
        router.push("/dashboard"); // Next.js router redirect to dashboard
      } else {
        setError("Access denied: Only Employees are allowed");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error, please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-sans">
      {/* Left: Login form */}
      <div
        className={`w-full md:w-1/2 flex items-center justify-center px-6 py-12
        ${animate ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"} transition-all duration-700 ease-in`}
      >
        <div className="max-w-md w-full space-y-8">
          <LinkBack />
          <h2 className="text-3xl font-bold mb-2 text-white">Sign In As Employee</h2>
          <p className="mb-6 text-gray-300">Enter your email and password to sign in!</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-md border border-gray-700 bg-gray-800 text-gray-200 px-4 py-3 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-gray-700 bg-gray-800 text-gray-200 px-4 py-3 text-base pr-12 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825a10.05 10.05 0 01-3.75 0M9.88 15.88A4.5 4.5 0 0112 9.75m0 0a4.5 4.5 0 013.75 6.38M6.343 6.343A9.969 9.969 0 0112 4.5c4.486 0 8.272 3.106 9.32 7.5a10.002 10.002 0 01-3.68 4.808M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 8c-4.97 0-9-4.03-9-9a9 9 0 0118 0c0 4.97-4.03 9-9 9z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="keepLoggedIn" type="checkbox" className="accent-blue-500 focus:ring-blue-500" />
                <label htmlFor="keepLoggedIn" className="ml-2 text-sm text-gray-400">
                  Keep me logged in
                </label>
              </div>
              <a href="/reset-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm font-bold text-base ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing In..." : "Sign in"}
            </button>
          </form>

          {error && <div className="mt-4 text-red-400 font-bold text-center">{error}</div>}
        </div>
      </div>

      {/* Right: Branding/Info */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gray-900 border-l border-gray-800">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center mb-4 animate-pulse">
            <svg width="42" height="42" className="mr-2" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="6" height="18" rx="3" fill="#3B82F6" />
              <rect x="10" y="8" width="6" height="13" rx="3" fill="#2563EB" />
              <rect x="17" y="14" width="4" height="7" rx="2" fill="#6366F1" />
            </svg>
            <span className="text-2xl font-bold text-blue-400">Nexsus-HR</span>
          </div>
          <p className="text-blue-200 text-lg mb-1">Modern HR Platform</p>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Enterprise-grade employee management, timesheets, and secure admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}


function LinkBack() {
  return (
    <a
      href="/"
      className="inline-flex items-center mb-8 text-sm text-gray-400 hover:text-gray-200 transition-colors"
    >
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="mr-2"
      >
        <path d="M15 19l-7-7 7-7" />
      </svg>
      Back to dashboard
    </a>
  );
}
