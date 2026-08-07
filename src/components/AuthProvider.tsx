"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_COLLECTION, getPocketBase } from "@/lib/pocketbase";
import { errorMessage } from "@/lib/errors";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (
    token: string,
    password: string,
    passwordConfirm: string,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pb = getPocketBase();
    let cancelled = false;

    async function restoreSession() {
      if (pb.authStore.isValid) {
        try {
          await pb.collection(AUTH_COLLECTION).authRefresh<AuthUser>();
        } catch {
          pb.authStore.clear();
        }
      }
      if (!cancelled) {
        setUser((pb.authStore.record as AuthUser | null) ?? null);
        setReady(true);
      }
    }

    void restoreSession();

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser((record as AuthUser | null) ?? null);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const pb = getPocketBase();
    try {
      await pb
        .collection(AUTH_COLLECTION)
        .authWithPassword<AuthUser>(email.trim(), password);
    } catch (err) {
      throw new Error(errorMessage(err, "Sign in failed."));
    }
  }

  async function signUp(
    email: string,
    password: string,
    passwordConfirm: string,
  ) {
    const pb = getPocketBase();
    const trimmed = email.trim();
    try {
      await pb.collection(AUTH_COLLECTION).create({
        email: trimmed,
        password,
        passwordConfirm,
      });
      await pb
        .collection(AUTH_COLLECTION)
        .authWithPassword<AuthUser>(trimmed, password);
    } catch (err) {
      throw new Error(errorMessage(err, "Sign up failed."));
    }
  }

  function signOut() {
    getPocketBase().authStore.clear();
  }

  async function requestPasswordReset(email: string) {
    const pb = getPocketBase();
    try {
      await pb.collection(AUTH_COLLECTION).requestPasswordReset(email.trim());
    } catch (err) {
      throw new Error(errorMessage(err, "Could not send reset email."));
    }
  }

  async function confirmPasswordReset(
    token: string,
    password: string,
    passwordConfirm: string,
  ) {
    const pb = getPocketBase();
    try {
      await pb
        .collection(AUTH_COLLECTION)
        .confirmPasswordReset(token, password, passwordConfirm);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not reset password."));
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
