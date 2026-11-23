"use client";

import { useEffect } from "react";
import { startSync } from "@/lib/sync";
import { useAuth } from "./AuthProvider";

// Runs the cloud sync in the background for signed-in Pro and trial users. Renders nothing.
export default function SyncManager() {
  const { status, can } = useAuth();
  const wanted = status === "signedIn" && can("sync");
  useEffect(() => (wanted ? startSync() : undefined), [wanted]);
  return null;
}
