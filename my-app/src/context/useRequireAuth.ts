"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";

/**
 * Custom hook to protect routes and redirect unauthenticated users to login.
 */
export default function useRequireAuth() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until user state has resolved (null = logged out, undefined = still loading)
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]); // includes all required dependencies

  return user;
}
