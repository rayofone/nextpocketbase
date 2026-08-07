"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ResetPasswordForm({ token }: { token: string }) {
  const { confirmPasswordReset } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token. Open the link from your email.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await confirmPasswordReset(token, password, passwordConfirm);
      setDone(true);
      window.setTimeout(() => router.push("/"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="playground auth-shell">
      <header className="header">
        <div>
          <p className="eyebrow">PocketBase template</p>
          <h1>Reset password</h1>
          <p className="lede">
            Choose a new password for your account, then sign in.
          </p>
        </div>
      </header>

      <section className="panel">
        {!token ? (
          <p className="banner banner-error">
            Missing reset token. Use the link from your password reset email.
          </p>
        ) : null}

        {error ? <p className="banner banner-error">{error}</p> : null}
        {done ? (
          <p className="banner banner-info">
            Password updated. Redirecting to sign in…
          </p>
        ) : null}

        <form className="form" onSubmit={(e) => void handleSubmit(e)}>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={!token || done}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
              disabled={!token || done}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy || !token || done}
          >
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>

        <p className="auth-footer">
          <Link href="/">Back to sign in</Link>
        </p>
      </section>
    </div>
  );
}
