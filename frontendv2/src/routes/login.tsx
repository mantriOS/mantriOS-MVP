import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login, ApiError, setStoredToken } from "@/services/authService";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiPending, setIsApiPending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsApiPending(false);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email/officer ID and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password });
      if (response.token) {
        setStoredToken(response.token);
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      const apiErr = err instanceof ApiError ? err : null;
      const genericErr = err instanceof Error ? err : null;

      if (apiErr) {
        if (apiErr.status === 404) {
          setIsApiPending(true);
          setErrorMessage(
            "Backend Authentication Notice: The FastAPI backend endpoint (POST /api/v1/auth/login) is not yet active on the server."
          );
        } else {
          setErrorMessage(apiErr.message || "Invalid credentials or authorization failure.");
        }
      } else if (genericErr) {
        setErrorMessage(genericErr.message);
      } else {
        setErrorMessage("An unexpected error occurred while connecting to the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <ShieldCheck className="size-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight text-slate-900">
                MantriOS
              </span>
              <span className="text-xs font-medium text-slate-500">
                Government Grievance Cell Portal
              </span>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">
            Official Portal
          </span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Card Container */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Header / Title */}
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Sign in to MantriOS
              </h1>
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                Enter your credentials to access the Grievance Cell management system.
              </p>
            </div>

            {/* Error / Information Alert Area */}
            {errorMessage && (
              <div
                role="alert"
                className={`mt-6 rounded-xl border p-4 text-xs sm:text-sm ${
                  isApiPending
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-red-200 bg-red-50 text-red-900"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isApiPending ? (
                    <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  ) : (
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{errorMessage}</p>
                    {isApiPending && (
                      <div className="mt-3 border-t border-amber-200/60 pt-2.5">
                        <p className="text-[11px] text-amber-700">
                          During backend development, you can proceed directly to the portal dashboard:
                        </p>
                        <Link
                          to="/"
                          className="mt-2 inline-flex items-center gap-1.5 font-semibold text-amber-900 underline hover:text-amber-950"
                        >
                          Enter Portal Workspace <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Official Email / Officer ID
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@kerala.gov.in"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary"
                  aria-required="true"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pr-10 text-sm placeholder:text-slate-400 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Signing in…
                  </span>
                ) : (
                  "Sign in to Portal"
                )}
              </Button>
            </form>
          </div>

          {/* Official Security Notice */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500 shadow-sm">
            <p className="font-medium text-slate-700">Authorized Government Access Only</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Unauthorized access or misuse of this system is strictly prohibited and subject to administrative logging and auditing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <p>© {new Date().getFullYear()} Government of Kerala · Office of the Minister for Higher Education</p>
        </div>
      </footer>
    </div>
  );
}
