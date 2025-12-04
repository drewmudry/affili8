"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth-client";

interface UserPillProps {
  session: Session;
}

export function UserPill({ session }: UserPillProps) {
  const router = useRouter();
  const user = session.user;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user.email?.[0].toUpperCase() || "U";

  return (
    <button
      onClick={handleLogout}
      className="group flex items-center gap-3 rounded-full bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      title="Click to sign out"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-600 text-sm font-medium text-white dark:bg-zinc-500">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="hidden text-left sm:block">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {user.name || "User"}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {user.email}
        </div>
      </div>
    </button>
  );
}

