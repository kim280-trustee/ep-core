import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService, useAuth } from "@/core/auth";
import type { LoginDestination } from "@/core/auth";

interface LoginLocationState {
  from?: string;
}

const PORTAL_DETAILS: Record<LoginDestination, { title: string; description: string }> = {
  "/teacher": {
    title: "Teacher Portal",
    description: "Manage classes, lessons, assignments and student progress.",
  },
  "/learning": {
    title: "Student Portal",
    description: "Continue learning and view your assignments and progress.",
  },
  "/parent": {
    title: "Parent Portal",
    description: "View linked students and follow their learning progress.",
  },
  "/school-admin": {
    title: "School Admin Portal",
    description: "Manage school learning operations and academic records.",
  },
};

function isPathWithin(path: string | undefined, root: string): path is string {
  return path === root || Boolean(path?.startsWith(`${root}/`));
}

function getDestinationPath(destination: LoginDestination, requestedPath?: string) {
  return isPathWithin(requestedPath, destination) ? requestedPath : destination;
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
  const [availablePortals, setAvailablePortals] = useState<LoginDestination[]>([]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setLoading(true);
    setError("");
    let sessionEstablished = false;

    try {
      const { error: signInError } = await authService.signIn(normalizedEmail, password);
      if (signInError) throw signInError;

      const session = await authService.getSession();
      if (!session?.user) {
        throw new Error("Sign-in did not create an active session. Please try again.");
      }
      sessionEstablished = true;

      const destinations = await authService.getLoginDestinations(session.user.id);
      if (destinations.length === 0) {
        await authService.signOut();
        sessionEstablished = false;
        await refreshUser();
        throw new Error(
          "This email is not linked to an E&P Learning student, teacher, parent, or school administrator account. Contact your school administrator.",
        );
      }

      const refreshedUser = await refreshUser();
      if (!refreshedUser || refreshedUser.authUserId !== session.user.id) {
        throw new Error(
          "Your sign-in succeeded, but we could not verify your E&P account profile. Please try again or contact your school administrator.",
        );
      }

      if (destinations.length > 1) {
        setAvailablePortals(destinations);
      } else {
        navigate(getDestinationPath(destinations[0], requestedPath), { replace: true });
      }
    } catch (err) {
      if (sessionEstablished) {
        try {
          await authService.signOut();
          await refreshUser();
        } catch {
          // Keep the original authentication/authorization error visible.
        }
      }
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePortalSelection(destination: LoginDestination) {
    if (!availablePortals.includes(destination)) return;
    navigate(getDestinationPath(destination, requestedPath), { replace: true });
  }

  async function handlePortalSignOut() {
    setLoading(true);
    setError("");
    try {
      await authService.signOut();
      await refreshUser();
      setAvailablePortals([]);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not sign you out. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      {availablePortals.length > 1 ? (
        <section
          aria-labelledby="portal-selection-title"
          className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-500">E&P TECHNOLOGIES</p>
            <h1 id="portal-selection-title" className="mt-2 text-2xl font-bold text-slate-950">
              Choose your portal
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This account has access to more than one E&P Learning portal. Select where you want to continue.
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">{email.trim()}</p>
          </div>

          <div className="space-y-3">
            {availablePortals.map((destination) => (
              <button
                key={destination}
                type="button"
                onClick={() => handlePortalSelection(destination)}
                className="w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <span className="block text-base font-semibold text-slate-900">
                  {PORTAL_DETAILS[destination].title}
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">
                  {PORTAL_DETAILS[destination].description}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handlePortalSignOut}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Signing out..." : "Sign out"}
          </button>
        </section>
      ) : (
        <form
          onSubmit={handleLogin}
          aria-busy={loading}
          className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-500">E&P TECHNOLOGIES</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Sign in to E&P Learning</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Continue to your teacher, student, parent, or school administrator portal.
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
              disabled={loading}
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
              disabled={loading}
            />
          </label>

          {error && (
            <div role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
      )}
    </div>
  );
}
