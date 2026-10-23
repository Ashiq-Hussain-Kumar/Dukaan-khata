import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../utils/api";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState(
    "Please wait while we confirm your email address."
  );
 console.log(message);
 
 
  const requestStarted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Your verification link is missing its token.");
      return;
    }

    if (requestStarted.current) return;
    requestStarted.current = true;

    const verifyEmail = async () => {
      try {
       await api.post("/shopkeepers/verify", { token }, { noRefresh: true });

        setStatus("success");
        setMessage(
          "Your email address has been verified successfully. You're all set to log in!"
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    };

    void verifyEmail();
  }, [token]);

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        {/* Status icon */}
        <div
          className={`mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-emerald-400/10 text-emerald-400"
              : isError
                ? "bg-rose-400/10 text-rose-400"
                : "bg-indigo-400/10 text-indigo-400"
          }`}
        >
          {status === "loading" && (
            <svg
              className="h-10 w-10 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          )}

          {isSuccess && (
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d="m5 12 4 4L19 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {isError && (
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

       
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
          Shopkeeper Account
        </p>

        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {status === "loading" && "Verifying email"}
          {isSuccess && "You're verified!"}
          {isError && "Verification failed"}
        </h1>

        <p
          role="status"
          aria-live="polite"
          className="mx-auto mb-8 max-w-sm text-sm leading-7 text-slate-300 sm:text-base"
        >
          {status === "loading"
            ? "We're checking your verification link. This will only take a moment."
            : message}
        </p>

        
        <div className="mb-8">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${
              status === "loading"
                ? "bg-indigo-400/10 text-indigo-300"
                : isSuccess
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-rose-400/10 text-rose-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                status === "loading"
                  ? "animate-pulse bg-indigo-400"
                  : isSuccess
                    ? "bg-emerald-400"
                    : "bg-rose-400"
              }`}
            />
            {status === "loading"
              ? "Checking your email"
              : isSuccess
                ? "Email verified successfully"
                : "Action required"}
          </span>
        </div>

        
        {isSuccess && (
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Go to Login
            <span aria-hidden="true">→</span>
          </Link>
        )}

        {isError && (
          <Link
            to="/register"
            className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Return to Registration
          </Link>
        )}

        {status === "loading" && (
          <p className="text-xs text-slate-400">
            Please don't close this page.
          </p>
        )}

        <div className="mt-9 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-400">
            Secure account verification · Shopkeeper
          </p>
        </div>
      </section>
    </main>
  );
}