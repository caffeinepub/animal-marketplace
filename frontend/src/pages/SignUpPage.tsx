import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UserPlus, Loader2, AlertCircle, Wifi } from "lucide-react";
import { useSignUp } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { actor, isFetching: actorFetching } = useActor();
  const signUpMutation = useSignUp();

  // Actor is ready when it exists and is not still initializing
  const actorReady = !!actor && !actorFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!actorReady) {
      setFormError("Connection not ready. Please wait a moment and try again.");
      return;
    }

    if (!displayName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    const digitsOnly = mobileNumber.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      await signUpMutation.mutateAsync({ displayName: displayName.trim(), mobileNumber });
      navigate({ to: "/" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      // Replace raw "Actor not available" with a friendly message
      if (message.toLowerCase().includes("actor not available")) {
        setFormError("Connection not ready. Please wait a moment and try again.");
      } else {
        setFormError(message);
      }
    }
  };

  // Determine the error to display — prefer form error, then mutation error
  const displayError = formError || (signUpMutation.isError
    ? (() => {
        const msg = signUpMutation.error instanceof Error
          ? signUpMutation.error.message
          : "Something went wrong. Please try again.";
        return msg.toLowerCase().includes("actor not available")
          ? "Connection not ready. Please wait a moment and try again."
          : msg;
      })()
    : null);

  const isSubmitting = signUpMutation.isPending;
  const isButtonDisabled = isSubmitting || !actorReady;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo & Branding */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-lg mb-4">
          <img
            src="/assets/generated/app-logo.dim_64x64.png"
            alt="Animal Pashu Bazar Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-foreground font-display">Animal Pashu Bazar</h1>
        <p className="text-muted-foreground mt-1 text-sm">Create your account to buy &amp; sell animals</p>
      </div>

      {/* Sign Up Card */}
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-card p-8">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Create Account</h2>
        </div>

        {/* Connection initializing notice */}
        {actorFetching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-4">
            <Wifi className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Connecting to the network…</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1.5">
              Full Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setFormError(null);
                signUpMutation.reset();
              }}
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-foreground mb-1.5">
              Mobile Number
            </label>
            <input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value);
                setFormError(null);
                signUpMutation.reset();
              }}
              placeholder="Enter your 10-digit mobile number"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              disabled={isSubmitting}
              autoComplete="tel"
              maxLength={15}
            />
          </div>

          {/* Inline Error */}
          {displayError && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account…
              </>
            ) : actorFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => navigate({ to: "/" })}
            className="text-primary hover:underline font-medium"
          >
            Go to Home
          </button>
        </p>
      </div>
    </div>
  );
}
