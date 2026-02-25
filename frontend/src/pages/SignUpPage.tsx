import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSignUp } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const signUpMutation = useSignUp();

  const [displayName, setDisplayName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    // Basic client-side validation
    const cleaned = mobileNumber.replace(/\D/g, "");
    if (!displayName.trim()) {
      setInlineError("Please enter your full name.");
      return;
    }
    if (cleaned.length < 10) {
      setInlineError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      await signUpMutation.mutateAsync({ displayName, mobileNumber });
      // Successful sign-up — navigate home without showing any error
      navigate({ to: "/" });
    } catch (err) {
      // Display the exact error message from the backend or mutation
      const message =
        err instanceof Error && err.message
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setInlineError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <img
            src="/assets/generated/goat-logo.dim_64x64.png"
            alt="Pashu Mandi"
            className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
          />
          <h1 className="text-3xl font-bold text-foreground font-display">
            Pashu Mandi
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your account to buy &amp; sell animals
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-card-foreground">
              Create Account
            </h2>
          </div>

          {/* Not logged in warning */}
          {!identity && (
            <div className="mb-5 flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/30 px-4 py-3 text-sm text-warning-foreground">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
              <span>
                You must be logged in with Internet Identity before creating an
                account.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setInlineError(null);
                }}
                disabled={signUpMutation.isPending}
                autoComplete="name"
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="e.g. 9876543210"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setInlineError(null);
                }}
                disabled={signUpMutation.isPending}
                autoComplete="tel"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your 10-digit mobile number (digits only).
              </p>
            </div>

            {/* Inline error message — shows actual backend/network error text */}
            {inlineError && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{inlineError}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={signUpMutation.isPending || !identity}
            >
              {signUpMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="text-primary font-medium hover:underline"
            >
              Go to Home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
