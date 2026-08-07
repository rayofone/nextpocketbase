"use client";

import { FormEvent, useState } from "react";
import { AUTH_COLLECTION } from "@/lib/pocketbase";
import { useAuth } from "@/components/AuthProvider";

type Mode = "signin" | "signup" | "forgot";

export default function AuthForms() {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "(not set)";
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword("");
    setPasswordConfirm("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else if (mode === "signup") {
        if (password !== passwordConfirm) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        await signUp(email, password, passwordConfirm);
      } else {
        await requestPasswordReset(email);
        setInfo(
          "If that email exists, PocketBase sent a reset link. Check your inbox (and SMTP settings in admin).",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="playground auth-shell">
      <header className="header">
        <div>
          <p className="eyebrow">PocketBase template</p>
          <h1>Sign in</h1>
          <p className="lede">
            Authenticate against the PocketBase{" "}
            <code>{AUTH_COLLECTION}</code> collection with email and password.
          </p>
        </div>
        <dl className="meta auth-meta">
          <div>
            <dt>URL</dt>
            <dd>
              <code>{pbUrl}</code>
            </dd>
          </div>
          <div>
            <dt>Auth collection</dt>
            <dd>
              <code>{AUTH_COLLECTION}</code>
            </dd>
          </div>
        </dl>
      </header>

      <section className="panel">
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={`auth-tab${mode === "signin" ? " active" : ""}`}
            onClick={() => switchMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={`auth-tab${mode === "signup" ? " active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Sign up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "forgot"}
            className={`auth-tab${mode === "forgot" ? " active" : ""}`}
            onClick={() => switchMode("forgot")}
          >
            Forgot password
          </button>
        </div>

        {error ? <p className="banner banner-error">{error}</p> : null}
        {info ? <p className="banner banner-info">{info}</p> : null}

        <form className="form" onSubmit={(e) => void handleSubmit(e)}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          {mode !== "forgot" ? (
            <label>
              Password
              <input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </label>
          ) : null}

          {mode === "signup" ? (
            <label>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </label>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy || !email.trim()}
          >
            {busy
              ? "Working…"
              : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </button>
        </form>
      </section>

      <section className="setup">
        <h2>Auth setup</h2>
        <ol>
          <li>
            In PocketBase admin, open the <code>{AUTH_COLLECTION}</code> auth
            collection (created by default).
          </li>
          <li>
            Allow public create for sign-up (or keep invite-only and create users
            in admin).
          </li>
          <li>
            For forgot password, configure SMTP under Settings → Mail settings,
            and set the users collection password-reset mail template link to{" "}
            <code>http://localhost:3000/reset-password?token=&#123;TOKEN&#125;</code>{" "}
            (use your real app origin in production).
          </li>
          <li>
            Lock down <code>items</code> API rules to authenticated users, e.g.{" "}
            <code>@request.auth.id != &quot;&quot;</code>.
          </li>
        </ol>
      </section>
    </div>
  );
}
