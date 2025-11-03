"use client";

import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";
import { useAuth } from "@/context/authContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Page: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("Login failed. Please try again.");
        return;
      }

      const data = await res.json();
      if (data?.access_token) {
        console.log("Login successful:", data);
        login(data.access_token);
        router.push("/");
      } else {
        alert("Invalid response from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="flex justify-center items-start pt-24 bg-white overflow-x-hidden h-[600px]">
      <div className="w-full max-w-md border-2 border-teal-600 p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-900 via-teal-500 to-teal-700">
          Login
        </h2>

        <form className="space-y-4 mt-4" onSubmit={handleLogin}>
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-teal-500 hover:underline">
            Signup here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;
