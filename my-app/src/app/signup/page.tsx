"use client";
import {useRouter}  from "next/navigation";
import React, { useState } from "react";
import { API_URL } from '@/config/api';

const Page = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const handleSignup = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Basic validation
    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
        }

    // Call API or further processing here
    const userData = {
      email: email,
      password: password,
      name: username
    };
    const res =await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
    if (!res.ok) {
      alert("Signup failed. Please try again.");
        return;
    }
    else{
    const data = await res.json();
    console.log("Signup successful:", data);
    router.push('/login'); // Redirect to login page after successful signup
}


    // Reset form fields after submission
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex justify-center items-start pt-24 bg-white overflow-x-hidden h-[600px]">
      <div className="w-full max-w-md border-3 border-teal-600 p-8 rounded-lg shadow-md text-center">
        <h2 className="mb-6 text-3xl font-bold bg-gradient-to-r from-teal-900 via-teal-500 to-teal-800 bg-clip-text text-transparent">
          Signup
        </h2>

        <form className="space-y-4">
          <div className="text-left">
            <label className="block mb-1 text-xl font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="text-left">
            <label className="block mb-1 text-xl font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="text-left">
            <label className="block mb-1 text-xl font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <button
            onClick={handleSignup}
            className="w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            Signup
          </button>
        </form>

        <div className="mt-6 text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-teal-500 hover:underline">
            Login here
          </a>
          </div>
      </div>
    </div>
  );
};

export default Page;
