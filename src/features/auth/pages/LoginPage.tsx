import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  authService,
} from "@/core/auth";

export function LoginPage() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleLogin(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {

      const {
        error,
      } = await authService.signIn(
        email,
        password,
      );

      if (error) {
        throw error;
      }

      navigate("/");

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Login failed",
      );

    } finally {

      setLoading(false);

    }
  }

  return (

    <div className="flex min-h-screen items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 rounded-lg border p-6"
      >

        <h1 className="text-2xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full rounded border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full rounded border p-2"
        />

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          {loading
            ? "Signing in..."
            : "Login"}
        </button>

      </form>

    </div>

  );
}