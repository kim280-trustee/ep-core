import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService, useAuth } from "@/core/auth";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const locationState = location.state as LoginLocationState | null;
  const requestedPath = locationState?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await authService.signIn(email.trim(), password);

      if (signInError) {
        throw signInError;
      }

      const session = await authService.getSession();

      if (!session?.user) {
        throw new Error("Sign-in did not create an active session. Please try again.");
      }

      const destination = await authService.getLoginDestination(session.user.id);

      if (!destination) {
        await authService.signOut();
        await refreshUser();
        throw new Error(
          "This email is not linked to an E&P Learning student, teacher, or parent account. Contact your school administrator.",
        );
      }

      const requestedPathMatchesRole =
        (destination === "/teacher" &&
          (requestedPath === "/teacher" || requestedPath?.startsWith("/teacher/"))) ||
        (destination === "/learning" &&
          (requestedPath === "/learning" || requestedPath?.startsWith("/learning/"))) ||
        (destination === "/parent" &&
          (requestedPath === "/parent" || requestedPath?.startsWith("/parent/")));

      await refreshUser();
      navigate(
        requestedPathMatchesRole ? requestedPath! : destination,
        { replace: true },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <p className="text-sm font-bold tracking-wide text-slate-500">E&P TECHNOLOGIES</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Sign in to E&P Learning</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Continue to your teacher, student, or parent portal.
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Email address</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </label>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm leading-5 text-slate-500">
          Need an account? Contact your school administrator.
        </p>
      </form>
    </div>
  );
}
