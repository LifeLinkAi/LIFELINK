"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/features/auth/authSlice";

/**
 * useAuthGuard
 *
 * Call this hook inside any layout or page that requires authentication.
 *
 * @param requiredRole  - Optional role string (e.g. "Donor"). When provided, the
 *                        user is also redirected if their role doesn't match.
 *
 * Returns:
 *   { ready: boolean }  — `false` while the guard is still bootstrapping (use
 *                          this to show a loading skeleton instead of a flash).
 */
export function useAuthGuard(requiredRole?: string) {
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ── 1. Hydrate Redux from localStorage if not already authenticated ──
    if (!isAuthenticated) {
      try {
        const token    = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");

        if (token && userJson) {
          const stored = JSON.parse(userJson);
          dispatch(setUser(stored));
          // After dispatching, allow a re-render so the selector updates.
          // The next effect run will have isAuthenticated = true.
          return;
        }
      } catch {
        // Malformed data — fall through to redirect
      }

      // No valid token → go to login
      router.replace("/login");
      return;
    }

    // ── 2. Role check ─────────────────────────────────────────────────────
    if (requiredRole && user?.role !== requiredRole) {
      // Authenticated but wrong role → send to their own dashboard
      const roleMap: Record<string, string> = {
        Admin:    "/admin/dashboard",
        Hospital: "/hospital/dashboard",
        Donor:    "/donor/dashboard",
        Patient:  "/patient/dashboard",
      };
      router.replace(roleMap[user?.role ?? ""] ?? "/login");
      return;
    }

    // ── 3. All checks passed ──────────────────────────────────────────────
    setReady(true);
  }, [isAuthenticated, user, requiredRole, dispatch, router]);

  return { ready };
}
