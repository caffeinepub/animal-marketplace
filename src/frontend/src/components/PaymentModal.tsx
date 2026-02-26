import { useState } from 'react';
import { Copy, Check, IndianRupee, Loader2, AlertCircle, Tag, CheckCircle2, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const UPI_ID = '8431207776king@ybl';
const REGULAR_PRICE = 199;
const VIP_PRICE = 500;
const DISCOUNTED_PRICE = 99;

// Valid promo codes (client-side check)
const VALID_PROMO_CODES = ['PASHU99', 'MANDI99', 'SAVE100', 'LAUNCH99', 'PASHU50'];
const ADMIN_FREE_CODE = 'FREEADMIN';

type ModalStep = 'payment' | 'confirm';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
  isVip?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirmPayment,
  isSubmitting,
  submitError,
  isVip = false,
}: PaymentModalProps) {
  const [step, setStep] = useState<ModalStep>('payment');
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [adminFreeApplied, setAdminFreeApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const basePrice = isVip ? VIP_PRICE : REGULAR_PRICE;

  let effectivePrice: number;
  if (adminFreeApplied) {
    effectivePrice = 0;
  } else if (!isVip && promoApplied) {
    effectivePrice = DISCOUNTED_PRICE;
  } else {
    effectivePrice = basePrice;
  }

  const upiString = `upi://pay?pa=${UPI_ID}&am=${effectivePrice}&cu=INR&tn=PashuMandiPostingFee`;
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(upiString)}&choe=UTF-8`;

  const handleApplyPromo = () => {
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) {
      setPromoMessage({ type: 'error', text: 'Please enter a promo code.' });
      return;
    }

    if (trimmed === ADMIN_FREE_CODE) {
      setAdminFreeApplied(true);
      setPromoApplied(false);
      setPromoMessage({
        type: 'success',
        text: 'Special code applied — your ad is free! Click "Publish My Ad" to post instantly.',
      });
      return;
    }

    if (isVip) {
      setPromoApplied(false);
      setAdminFreeApplied(false);
      setPromoMessage({ type: 'error', text: 'This promo code is not valid for VIP Ads.' });
      return;
    }

    if (VALID_PROMO_CODES.includes(trimmed)) {
      setPromoApplied(true);
      setAdminFreeApplied(false);
      setPromoMessage({ type: 'success', text: 'Promo code applied! New price: ₹99' });
    } else {
      setPromoApplied(false);
      setAdminFreeApplied(false);
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Please try again.' });
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setAdminFreeApplied(false);
    setPromoCode('');
    setPromoMessage(null);
  };

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePayNow = () => {
    setStep('confirm');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setStep('payment');
    setPromoCode('');
    setPromoApplied(false);
    setAdminFreeApplied(false);
    setPromoMessage(null);
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirmPayment();
  };

  const isCodeApplied = promoApplied || adminFreeApplied;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="sm:max-w-md w-full rounded-2xl bg-white"
        onInteractOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-display text-xl">
            {isVip ? (
              <Crown className="w-5 h-5 text-amber-500" />
            ) : (
              <IndianRupee className="w-5 h-5 text-primary" />
            )}
            {isVip ? 'VIP Ad Posting Fee' : 'Posting Fee Required'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {isVip
              ? 'Your VIP ad will be featured at the top with a gold border and Verified badge.'
              : 'A one-time fee is required to publish your ad on Pashu Mandi.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'payment' && (
          <div className="space-y-5">
            {/* Fee Banner */}
            <div className={`rounded-xl px-5 py-4 flex items-center justify-between ${
              isVip
                ? 'bg-amber-50 border-2 border-amber-300'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-900 font-semibold text-base">
                  {isVip ? 'VIP Posting Fee' : 'Posting Fee'}
                </span>
                {isVip && (
                  <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Featured · Gold Border · Verified Badge
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(promoApplied || adminFreeApplied) && (
                  <span className="text-gray-400 line-through text-base font-medium">₹{basePrice}</span>
                )}
                <span className={`font-bold text-2xl font-display ${
                  adminFreeApplied ? 'text-green-600' : isVip ? 'text-amber-600' : 'text-primary'
                }`}>
                  ₹{effectivePrice}
                </span>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                <Tag className="w-4 h-4 text-primary" />
                Have a promo code?
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    if (promoMessage) setPromoMessage(null);
                    if (isCodeApplied) {
                      setPromoApplied(false);
                      setAdminFreeApplied(false);
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyPromo(); }}
                  className="flex-1 uppercase placeholder:normal-case rounded-xl bg-white"
                  disabled={isCodeApplied}
                />
                <Button
                  type="button"
                  variant={isCodeApplied ? 'outline' : 'secondary'}
                  onClick={isCodeApplied ? handleRemovePromo : handleApplyPromo}
                  className="shrink-0 rounded-xl"
                >
                  {isCodeApplied ? 'Remove' : 'Apply'}
                </Button>
              </div>

              {promoMessage && (
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                  promoMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  {promoMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{promoMessage.text}</span>
                </div>
              )}
            </div>

            {/* Admin Free Code: bypass payment entirely */}
            {adminFreeApplied ? (
              <>
                <Separator />
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Free Ad Activated!</p>
                    <p className="text-sm text-gray-500 mt-1">Your ad will be published for free.</p>
                  </div>
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold rounded-xl bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    'Publish My Ad — Free'
                  )}
                </Button>
                {submitError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{submitError}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <Separator />

                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-medium text-gray-700">Scan QR to Pay</p>
                  <div className="rounded-2xl overflow-hidden border-2 border-gray-200 p-2 bg-white">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-[180px] h-[180px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <span className="flex-1 text-sm font-mono text-gray-800 truncate">{UPI_ID}</span>
                  <button
                    onClick={handleCopyUpiId}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Copy UPI ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>

                <Button
                  onClick={handlePayNow}
                  className="w-full h-12 text-base font-semibold rounded-xl"
                >
                  I've Paid ₹{effectivePrice} — Continue
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Confirm Payment</p>
              <p className="text-xs text-amber-700">
                Please confirm that you have completed the UPI payment of ₹{effectivePrice} to{' '}
                <span className="font-mono font-semibold">{UPI_ID}</span>.
              </p>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{submitError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('payment')}
                disabled={isSubmitting}
                className="flex-1 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  'Yes, Publish My Ad'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
