import React, {  ReactNode, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  BookOpen,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { useAuthContext } from "../context/Authcontext";
import { api, ApiRequestError } from "../utils/api";


export default function Login():ReactNode {
  const navigate = useNavigate();
  const {login,isAuthenticated} = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
const [resending, setResending] = useState(false);
const [resendMessage, setResendMessage] = useState("");


  if(isAuthenticated){
  return <Navigate to="/dashboard" replace={true} />;
     
    }

     const handleResend = async () => {
  if (resending) return;
  setResending(true);
  setResendMessage("");
  try {
    await api.post("/shopkeepers/resend-verification", { email: email.trim() }, { noRefresh: true });
    setResendMessage("A new verification link has been sent. Check your email.");
  } catch (err) {
    setResendMessage(err instanceof Error ? err.message : "Could not send the email.");
  } finally {
    setResending(false);
  }
};
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    
    setLoading(true);

   
try {
  const data = await api.post<{
    userId: string;
    userName: string;
    userDetails?: Record<string, unknown> | null;
  }>(
    "/shopkeepers/login",
    { email: email.trim(), password },
    { noRefresh: true }
  );

  if (!data?.userId) {
    throw new Error("Login succeeded, but the user information is missing.");
  }

  login(data.userId, data.userName, data.userDetails ?? null);
  navigate("/dashboard", { replace: true });
} catch (err) {
  if (err instanceof ApiRequestError && err.status === 403) {
    setNeedsVerification(true);
  }
  setError(err instanceof Error ? err.message : "Unable to connect to the server. Please try again.");
}finally {
  setLoading(false);
}

  };

  const inputClass =
    "w-full rounded-xl border border-[#EDEEF2] bg-white py-3 pl-11 pr-12 text-sm text-[#111827] outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-4 py-10">
      <div className="w-full max-w-md">
        
        <Link
          to="/login"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <BookOpen size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Dukaan Khata
            </h1>
            <p className="text-xs text-gray-500">
              Your shop, managed simply
            </p>
          </div>
        </Link>

       
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[#111827]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to manage your shop and accounts.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}  
            </div>
          )}
          {needsVerification && (
  <div className="mb-5 text-sm">
    <button
      type="button"
      onClick={handleResend}
      disabled={resending}
      className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-60 cursor-pointer"
    >
      {resending ? "Sending..." : "Resend verification email"}
    </button>
    {resendMessage && <p className="mt-2 text-gray-600">{resendMessage}</p>}
  </div>
)}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#111827]"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setError("");
                    setNeedsVerification(false);
                    setResendMessage("");
                  }}
                  className={inputClass}
                  required
                />
              </div>
            </div>

           
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#111827]"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className={inputClass}
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#EDEEF2]" />
            <span className="text-xs text-gray-400">NEW TO DUKAAN KHATA?</span>
            <div className="h-px flex-1 bg-[#EDEEF2]" />
          </div>

          <Link
            to="/register"
            className="flex w-full items-center justify-center rounded-xl border border-[#EDEEF2] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FB]"
          >
            Create an account
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Dukaan Khata
        </p>
      </div>
    </div>
  );
}
