import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSignUp } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();
  const { mutateAsync: signUp, isPending } = useSignUp();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; mobileNumber?: string }>({});

  const validate = (): boolean => {
    const newErrors: { fullName?: string; mobileNumber?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d+$/.test(mobileNumber.trim())) {
      newErrors.mobileNumber = 'Mobile number must contain digits only.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await signUp({ displayName: fullName.trim(), mobileNumber: mobileNumber.trim() });
      toast.success('Account created successfully! Welcome to Pashu Mandi.');
      navigate({ to: '/' });
    } catch (err) {
      toast.error('Failed to create account. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Login required to sign up
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Please log in first to create your Pashu Mandi account.
        </p>
        <Button onClick={login} disabled={isLoggingIn} className="gap-2">
          {isLoggingIn ? (
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Create Account</h1>
        <p className="text-muted-foreground mt-2">
          Join Pashu Mandi to post ads and connect with buyers &amp; sellers.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="e.g. Ahmed Khan"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
              autoComplete="name"
              maxLength={80}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobileNumber"
              type="tel"
              placeholder="e.g. 03001234567"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value);
                if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: undefined }));
              }}
              className={errors.mobileNumber ? 'border-destructive focus-visible:ring-destructive' : ''}
              autoComplete="tel"
              maxLength={15}
            />
            {errors.mobileNumber && (
              <p className="text-sm text-destructive">{errors.mobileNumber}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Digits only, no spaces or dashes (e.g. 03001234567).
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-primary hover:underline font-medium">
            Browse listings
          </Link>
        </p>
      </div>
    </div>
  );
}
