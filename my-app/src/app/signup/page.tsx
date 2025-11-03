"use client";

import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Page: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const userData = { name: username, email, password };

      const res = await fetch(`${API_URL}/api/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        alert("Signup failed. Please try again.");
        return;
      }

      const data = await res.json();
      console.log("Signup successful:", data);
      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setUsername("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="flex justify-center items-start pt-24 bg-white overflow-x-hidden h-[600px]">
      <div className="w-full max-w-md border-2 border-teal-600 p-8 rounded-lg shadow-md text-center">
        <h2 className="mb-6 text-3xl font-bold bg-gradient-to-r from-teal-900 via-teal-500 to-teal-800 bg-clip-text text-transparent">
          Signup
        </h2>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="text-left">
            <label
              htmlFor="username"
              className="block mb-1 text-xl font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="text-left">
            <label
              htmlFor="email"
              className="block mb-1 text-xl font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="text-left">
            <label
              htmlFor="password"
              className="block mb-1 text-xl font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            Signup
          </button>
        </form>

        <div className="mt-6 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-teal-500 hover:underline">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;
