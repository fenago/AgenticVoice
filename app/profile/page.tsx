"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import config from "@/config";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  hasAccess: boolean;
  customerId: string;
  priceId: string;
  planName: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push(config.auth.loginUrl);
      return;
    }

    // Fetch user profile data
    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // If no user data, show message
  if (!user) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>User profile could not be found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            User Profile
          </h1>
          <p className="mt-3 text-xl text-base-content opacity-60">
            Manage your account information
          </p>
        </div>

        <div className="bg-base-100 shadow overflow-hidden rounded-lg">
          {/* Profile Header with Avatar */}
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="w-20 h-20 rounded-full bg-primary flex justify-center items-center text-primary-content text-3xl font-bold mr-6">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-20 h-20 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name || "User"}</h2>
              <p className="text-base-content opacity-70">{user.email}</p>
            </div>
          </div>

          {/* Profile Content */}
          <div className="border-t border-base-300">
            <dl>
              <div className="bg-base-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-base-content opacity-70">Full name</dt>
                <dd className="mt-1 text-sm text-base-content sm:col-span-2 sm:mt-0">
                  {user?.name || "Not provided"}
                </dd>
              </div>
              <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-base-content opacity-70">Email address</dt>
                <dd className="mt-1 text-sm text-base-content sm:col-span-2 sm:mt-0">
                  {user?.email}
                </dd>
              </div>
              <div className="bg-base-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-base-content opacity-70">Role</dt>
                <dd className="mt-1 text-sm text-base-content sm:col-span-2 sm:mt-0">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-content">
                    {user?.role || "FREE"}
                  </span>
                </dd>
              </div>
              <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-base-content opacity-70">Subscription</dt>
                <dd className="mt-1 text-sm text-base-content sm:col-span-2 sm:mt-0">
                  {user?.planName || "Free Plan"}
                  {user?.hasAccess ? 
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-success text-success-content">
                      Active
                    </span> : 
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-error text-error-content">
                      Inactive
                    </span>
                  }
                </dd>
              </div>
              <div className="bg-base-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-base-content opacity-70">Account created</dt>
                <dd className="mt-1 text-sm text-base-content sm:col-span-2 sm:mt-0">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="px-4 py-5 sm:px-6 border-t border-base-300 flex flex-wrap gap-4">
            <Link href={config.auth.callbackUrl} className="btn btn-primary">
              Go to Dashboard
            </Link>
            {!user?.hasAccess && (
              <Link href="/#pricing" className="btn btn-outline">
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
