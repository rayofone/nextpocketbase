"use client";

import AuthForms from "@/components/AuthForms";
import CrudPlayground from "@/components/CrudPlayground";
import { useAuth } from "@/components/AuthProvider";

export default function AppShell() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="playground">
        <p className="banner banner-info">Checking session…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForms />;
  }

  return <CrudPlayground />;
}
