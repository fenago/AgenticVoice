"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import config from "@/config";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleEmailRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // With NextAuth Email provider, registration is the same as signin
      // A new user will automatically be created if they don't exist
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: config.auth.callbackUrl,
      });

      if (result?.error) {
        setMessage({ type: "error", text: "An error occurred. Please try again." });
      } else {
        setMessage({ 
          type: "success", 
          text: "Check your email! We've sent you a magic link to complete your registration." 
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegistration = () => {
    signIn("google", { callbackUrl: config.auth.callbackUrl });
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-base-100 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Create your account</h2>
          <p className="mt-2 text-sm text-base-content opacity-60">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary-focus">
              Sign in
            </Link>
          </p>
        </div>

        {message && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
            <div className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-6 h-6 mx-2 stroke-current"
              >
                {message.type === "success" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                )}
              </svg>
              <label>{message.text}</label>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailRegistration}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input input-bordered w-full"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`btn btn-primary w-full ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Register with Email"}
            </button>
          </div>

          <div className="divider">OR</div>

          <div>
            <button
              type="button"
              onClick={handleGoogleRegistration}
              className="btn btn-outline w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="24px"
                height="24px"
                className="mr-2"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Register with Google
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm">
            By registering, you agree to our{" "}
            <Link href="/tos" className="text-primary hover:text-primary-focus">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-primary hover:text-primary-focus">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
