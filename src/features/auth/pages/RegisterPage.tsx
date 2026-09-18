import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerOwnerService } from "../services/register-owner.service";

export function RegisterPage() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("Thailand");
  const [currency, setCurrency] = useState("THB");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerOwnerService.execute({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        password,
        country: country.trim(),
        currency: currency.trim().toUpperCase(),
      });

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Create Your Company</h1>
          <p className="mt-1 text-sm text-gray-500">Create your E&P Smart POS account first. You will sign in after registration.</p>
        </div>

        <input placeholder="Business Name" autoComplete="organization" value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="w-full rounded-lg border p-2" required />
        <input placeholder="Owner Name" autoComplete="name" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} className="w-full rounded-lg border p-2" required />
        <input type="email" placeholder="Email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border p-2" required />
        <input type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border p-2" required />
        <input type="password" placeholder="Confirm Password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border p-2" required />
        <input placeholder="Country" autoComplete="country-name" value={country} onChange={(event) => setCountry(event.target.value)} className="w-full rounded-lg border p-2" required />
        <input placeholder="Currency" maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-lg border p-2 uppercase" required />

        {error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-600 p-2 text-white disabled:opacity-50">
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")} className="font-medium text-blue-600 hover:underline">
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}
