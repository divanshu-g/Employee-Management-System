"use client";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

export function useAuthorizedFetch() {
  const { data: session, status } = useSession();

  const authorizedFetch = useCallback(
    async (url, options = {}) => {
      // Add debugging

      if (status === "loading") {
        throw new Error("Session is still loading");
      }

      if (status === "unauthenticated" || !session) {
        throw new Error("Unauthorized: No active session");
      }

      if (!session.accessToken) {
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
          throw new Error("Unauthorized: Invalid or expired token");
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed with status ${res.status}`);
      }

      return res.json();
    },
    [session, status]
  );

  return { authorizedFetch, isLoading: status === "loading" };
}