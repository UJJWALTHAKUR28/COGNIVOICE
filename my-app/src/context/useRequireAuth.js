"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";

export default function useRequireAuth() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  return user;
} 