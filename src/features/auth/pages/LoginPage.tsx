import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService, useAuth } from "@/core/auth";

interface LoginLocationState {
  registered?: boolean;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const registrationMessage = (location.state as LoginLocationState | null)?.registered;

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

      if (signInError) throw signInError;

      await refreshUser();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your E&P Smart POS account.</p>
        </div>

        {registrationMessage && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Your account has been created. Please sign in with your email and password.
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border p-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border p-2"
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 p-2 text-white disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-600">
          New to E&P?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
