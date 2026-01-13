"use client"
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/context/authContext';
import { API_URL } from '@/config/api';

const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handlelogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    const userData = { email, password };
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      alert("Login failed. Please try again.");
      return;
    } else {
      const data = await res.json();
      console.log("Login successful:", data);
      login(data.access_token);
      router.push('/');
    }
    setEmail('');
    setPassword('');
  };

  return (
    <div className='min-h-screen flex justify-center items-start pt-24 bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300'>
      <div className='w-full max-w-md bg-white dark:bg-slate-900 border border-teal-200 dark:border-slate-700 p-8 rounded-2xl shadow-xl'>
        <h2 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 mb-6 text-center'>Login</h2>
        <form className='space-y-5' onSubmit={handlelogin}>
          <div>
            <label className='block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors'
              required
            />
          </div>
          <div>
            <label className='block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl'
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-slate-600 dark:text-slate-400 text-sm">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
            Sign up here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;