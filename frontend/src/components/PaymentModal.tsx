import { useState } from 'react';
import { Copy, Check, QrCode, IndianRupee, Loader2, AlertCircle, Tag, CheckCircle2, Crown, Zap } from 'lucide-react';
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

  // Determine effective price
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

    // Check for admin free code first (works for both VIP and regular)
    if (trimmed === ADMIN_FREE_CODE) {
      setAdminFreeApplied(true);
      setPromoApplied(false);
      setPromoMessage({
        type: 'success',
        text: 'Special code applied — your ad is free! Click "Publish My Ad" to post instantly.',
      });
      return;
    }

    // Regular promo codes only apply to non-VIP ads
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
      // fallback: select text
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
      <DialogContent className="sm:max-w-md w-full" onInteractOutside={(e) => { if (isSubmitting) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-display text-xl">
            {isVip ? (
              <Crown className="w-5 h-5 text-amber-500" />
            ) : (
              <IndianRupee className="w-5 h-5 text-primary" />
            )}
            {isVip ? 'VIP Ad Posting Fee' : 'Posting Fee Required'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
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
                : 'bg-primary/10 border border-primary/20'
            }`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground font-semibold text-base">
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
                  <span className="text-muted-foreground line-through text-base font-medium">₹{basePrice}</span>
                )}
                <span className={`font-bold text-2xl font-display ${
                  adminFreeApplied ? 'text-green-600' : isVip ? 'text-amber-600' : 'text-primary'
                }`}>
                  ₹{effectivePrice}
                </span>
              </div>
            </div>

            {/* Promo Code Section — available for all ads */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
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
                  className="flex-1 uppercase placeholder:normal-case"
                  disabled={isCodeApplied}
                />
                <Button
                  type="button"
                  variant={isCodeApplied ? 'outline' : 'secondary'}
                  onClick={isCodeApplied ? handleRemovePromo : handleApplyPromo}
                  className="shrink-0"
                >
                  {isCodeApplied ? 'Remove' : 'Apply'}
                </Button>
              </div>

              {/* Promo feedback message */}
              {promoMessage && (
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  promoMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-destructive/10 border border-destructive/20 text-destructive'
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

                {/* Free Ad Banner */}
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-green-300">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-semibold text-foreground text-base">Special code applied!</p>
                    <p className="text-sm text-muted-foreground">
                      Your ad is free. Click the button below to publish it instantly — no payment needed.
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                {/* Publish button — skips payment entirely */}
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="button"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing your ad...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Publish My Ad — Free
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Separator />

                {/* QR Code Section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <QrCode className="w-4 h-4 text-primary" />
                    Scan to Pay via UPI
                  </div>
                  <div className={`rounded-xl p-3 bg-white shadow-sm ${isVip ? 'border-2 border-amber-300' : 'border-2 border-border'}`}>
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code for payment"
                      width={220}
                      height={220}
                      className="block"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code
                  </p>
                </div>

                <Separator />

                {/* UPI ID Copy Section */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground text-center">Or pay directly to UPI ID</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3 border border-border">
                    <span className="flex-1 font-mono text-sm text-foreground select-all">{UPI_ID}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors shrink-0"
                      aria-label="Copy UPI ID"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Amount: <strong>₹{effectivePrice}</strong> · Note: Pashu Mandi Posting Fee
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="button"
                    className={`w-full ${isVip ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                    size="lg"
                    onClick={handlePayNow}
                  >
                    Pay Now — ₹{effectivePrice}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-5">
            {/* Instructions */}
            <div className={`rounded-xl p-4 space-y-2 ${isVip ? 'bg-amber-50 border border-amber-200' : 'bg-primary/5 border border-primary/20'}`}>
              <p className="font-semibold text-foreground text-sm">Complete your payment</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Pay <strong className="text-foreground">₹{effectivePrice}</strong> to <span className="font-mono text-foreground">{UPI_ID}</span></li>
                <li>Once payment is successful, click the button below</li>
              </ol>
            </div>

            <div className="bg-muted rounded-lg px-4 py-3 border border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">UPI ID</span>
              <span className="font-mono text-sm font-medium text-foreground">{UPI_ID}</span>
            </div>

            {isVip && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm text-amber-700 font-medium">VIP Ad — paying ₹{VIP_PRICE} for premium placement</span>
              </div>
            )}

            {!isVip && promoApplied && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-sm text-green-700 font-medium">Promo code applied — paying ₹{DISCOUNTED_PRICE} (was ₹{REGULAR_PRICE})</span>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                className={`w-full ${isVip ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                size="lg"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing your ad...
                  </span>
                ) : (
                  'I Have Paid – Publish My Ad'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('payment')}
                disabled={isSubmitting}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
