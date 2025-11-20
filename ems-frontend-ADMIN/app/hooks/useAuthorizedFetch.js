"use client";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

export function useAuthorizedFetch() {
  const { data: session } = useSession();

  const authorizedFetch = useCallback(
    async (url, options = {}) => {
      if (!session?.accessToken) {
        throw new Error("Unauthorized: No access token available.");
      }

      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Request failed");
      }

      return res.json();
    },
    [session?.accessToken] 
  );

  return { authorizedFetch };
}
