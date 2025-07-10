"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from "@/config";
import { isAdmin } from "@/libs/auth-utils";

interface AuthButtonsProps {
  className?: string;
}

export default function AuthButtons({ className = "" }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex gap-2">
        <button className="btn btn-ghost btn-sm loading">Loading</button>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-content">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user?.name || "User"}
                  className="w-10 h-10 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-lg font-bold">
                  {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                </span>
              )}
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 z-[1000]"
          >
            <li>
              <Link href={config.auth.callbackUrl} className="justify-between">
                Dashboard
                <span className="badge">New</span>
              </Link>
            </li>
            <li>
              <Link href="/test">Test Page</Link>
            </li>
            <li>
              <Link href="/customer">Customer Portal</Link>
            </li>
            {isAdmin(session?.user) && (
              <li>
                <Link href="/admin">Admin Panel</Link>
              </li>
            )}
            <li>
              <a>Settings</a>
            </li>
            <li>
              <Link href="/profile">Profile</Link>
            </li>
            <li>
              <a onClick={() => signOut({ callbackUrl: "/" })}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Link href="/login" className="btn btn-ghost btn-sm">
        Sign in
      </Link>
      <Link href="/register" className="btn btn-primary btn-sm">
        Register
      </Link>
    </div>
  );
}
