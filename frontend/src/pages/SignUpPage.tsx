import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useSignUp } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Phone, User, AlertCircle, Wifi, ChevronRight } from 'lucide-react';
import { SiGoogle, SiFacebook } from 'react-icons/si';
import { toast } from 'sonner';

type Step = 'options' | 'phone-form';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const signUp = useSignUp();

  const [step, setStep] = useState<Step>('options');
  const [displayName, setDisplayName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isActorReady = !!actor && !actorFetching;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleContinueWithPhone = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the Terms and Conditions to continue.');
      return;
    }
    if (!identity) {
      // Need to login first via Internet Identity
      try {
        await login();
      } catch (err: any) {
        toast.error('Login failed. Please try again.');
      }
    } else {
      // Already logged in, go to form
      setStep('phone-form');
    }
  };

  const handleGoogleLogin = () => {
    toast.info('Google login coming soon!');
  };

  const handleFacebookLogin = () => {
    toast.info('Facebook login coming soon!');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!isActorReady) {
      setError('Connection not ready. Please wait a moment and try again.');
      return;
    }

    try {
      await signUp.mutateAsync({
        displayName: displayName.trim(),
        mobileNumber: mobileNumber.trim(),
      });
      toast.success('Account created successfully! 🎉');
      navigate({ to: '/' });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Actor not available') || msg.includes('Connection not ready')) {
        setError('Connection not ready. Please wait a moment and try again.');
      } else {
        setError(msg || 'Failed to create account. Please try again.');
      }
    }
  };

  // If identity exists and we haven't moved to phone-form yet, auto-advance
  if (identity && step === 'options') {
    setStep('phone-form');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start">
      {/* Logo & Branding */}
      <div className="w-full flex flex-col items-center pt-12 pb-6 px-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-lg mb-4 bg-white flex items-center justify-center">
          <img
            src="/assets/generated/app-logo.dim_64x64.png"
            alt="Animal Pashu Bazar"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<span class="text-4xl">🐄</span>';
              }
            }}
          />
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-900 text-center">Animal Pashu Bazar</h1>
        <p className="text-gray-500 text-sm mt-1 text-center">Buy & Sell Animals Across India</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm px-6 flex flex-col gap-4">
        {step === 'options' ? (
          <>
            <p className="text-center text-gray-600 text-sm font-medium mb-2">
              Sign in or create your account
            </p>

            {/* Continue with Phone */}
            <button
              onClick={handleContinueWithPhone}
              disabled={isLoggingIn || isInitializing}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-primary bg-primary text-white font-semibold text-base shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                {isLoggingIn || isInitializing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Phone className="h-5 w-5" />
                )}
                <span>
                  {isLoggingIn
                    ? 'Logging in...'
                    : isInitializing
                    ? 'Connecting...'
                    : 'Continue with Phone'}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-70" />
            </button>

            {/* Continue with Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 font-semibold text-base shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <SiGoogle className="h-5 w-5 text-red-500" />
                <span>Continue with Google</span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-40" />
            </button>

            {/* Continue with Facebook */}
            <button
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 font-semibold text-base shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <SiFacebook className="h-5 w-5 text-blue-600" />
                <span>Continue with Facebook</span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-40" />
            </button>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 mt-2 px-1">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                className="mt-0.5 border-gray-400"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-primary font-semibold underline underline-offset-2">
                  Terms and Conditions
                </Link>
              </label>
            </div>
          </>
        ) : (
          /* Phone Registration Form */
          <div>
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">Complete Your Profile</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your details to get started</p>
            </div>

            {/* Actor not ready banner */}
            {!isActorReady && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <Wifi className="h-4 w-4 text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700">
                  Connecting to the network... Please wait before submitting.
                </p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-sm font-semibold text-gray-700">
                  Your Name
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mobileNumber" className="text-sm font-semibold text-gray-700">
                  Mobile Number
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="pl-9"
                    maxLength={15}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={signUp.isPending || !isActorReady}
                className="w-full h-12 text-base font-semibold mt-2"
              >
                {signUp.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : !isActorReady ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep('options')}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                ← Back
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="flex-1" />
      <p className="text-xs text-gray-400 pb-8 text-center px-6">
        © {new Date().getFullYear()} Animal Pashu Bazar — Secure & Trusted
      </p>
    </div>
  );
}
