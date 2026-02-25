import { useState, useRef } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateListing, useGetMobileNumber } from '../hooks/useQueries';
import { AnimalCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, ImagePlus, UserPlus, X, Camera, Crown, Clock } from 'lucide-react';
import { toast } from 'sonner';
import PaymentModal from '../components/PaymentModal';

const PET_CATEGORIES: AnimalCategory[] = [
  AnimalCategory.dog,
  AnimalCategory.cat,
  AnimalCategory.bird,
  AnimalCategory.fish,
  AnimalCategory.reptile,
  AnimalCategory.smallAnimal,
  AnimalCategory.other,
];

const FARM_CATEGORIES: AnimalCategory[] = [
  AnimalCategory.cow,
  AnimalCategory.buffalo,
  AnimalCategory.goat,
  AnimalCategory.sheep,
];

const CATEGORY_LABELS: Record<AnimalCategory, string> = {
  [AnimalCategory.dog]: '🐕 Dogs',
  [AnimalCategory.cat]: '🐈 Cats',
  [AnimalCategory.bird]: '🦜 Birds',
  [AnimalCategory.fish]: '🐟 Fish',
  [AnimalCategory.reptile]: '🦎 Reptiles',
  [AnimalCategory.smallAnimal]: '🐹 Small Animals',
  [AnimalCategory.other]: '🐾 Other',
  [AnimalCategory.cow]: '🐄 Cow',
  [AnimalCategory.buffalo]: '🐃 Buffalo',
  [AnimalCategory.goat]: '🐐 Goat',
  [AnimalCategory.sheep]: '🐑 Sheep',
};

const MAX_PHOTOS = 5;

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

interface PendingListingData {
  title: string;
  description: string;
  price: bigint;
  category: AnimalCategory;
  location: string;
  photoUrls: string[];
  isVip: boolean;
}

export default function PostAdPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();
  const { mutateAsync: createListing, isPending } = useCreateListing();
  const { data: mobileNumber, isLoading: mobileLoading } = useGetMobileNumber();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<AnimalCategory | ''>('');
  const [location, setLocation] = useState('');
  const [photoDataUrls, setPhotoDataUrls] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isVip, setIsVip] = useState(false);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingListingData, setPendingListingData] = useState<PendingListingData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const totalAfter = photoDataUrls.length + files.length;
    if (totalAfter > MAX_PHOTOS) {
      setPhotoError(`You can upload a maximum of ${MAX_PHOTOS} photos. Please remove some before adding more.`);
      e.target.value = '';
      return;
    }

    setPhotoError('');
    setIsProcessingFiles(true);

    try {
      const dataUrls = await Promise.all(files.map(readFileAsDataURL));
      setPhotoDataUrls((prev) => [...prev, ...dataUrls]);
    } catch {
      toast.error('Failed to read one or more image files. Please try again.');
    } finally {
      setIsProcessingFiles(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotoDataUrls((prev) => prev.filter((_, i) => i !== index));
    setPhotoError('');
  };

  // Step 1: Validate form and open payment modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price || !category || !location.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    if (photoDataUrls.length === 0) {
      setPhotoError('Please upload at least one photo.');
      return;
    }

    // Store form data and open payment modal
    setPendingListingData({
      title: title.trim(),
      description: description.trim(),
      price: BigInt(Math.round(priceNum)),
      category: category as AnimalCategory,
      location: location.trim(),
      photoUrls: photoDataUrls,
      isVip,
    });
    setSubmitError(null);
    setIsPaymentModalOpen(true);
  };

  // Step 2: Called after user confirms payment in modal
  const handleConfirmPayment = async () => {
    if (!pendingListingData) return;

    setSubmitError(null);
    try {
      await createListing(pendingListingData);
      setIsPaymentModalOpen(false);
      setPendingListingData(null);
      toast.success(
        'Your ad has been submitted and is pending admin approval. It will appear publicly once approved.',
        { duration: 6000 }
      );
      navigate({ to: '/' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to post listing. Please try again.';
      setSubmitError(message);
    }
  };

  const handleCloseModal = () => {
    if (isPending) return;
    setIsPaymentModalOpen(false);
    setSubmitError(null);
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <ImagePlus className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Sign in to post an ad
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You need to be logged in to create a listing on Pashu Mandi.
        </p>
        <Button onClick={login} disabled={isLoggingIn} className="gap-2">
          {isLoggingIn ? (
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoggingIn ? 'Logging in...' : 'Login to Post'}
        </Button>
      </div>
    );
  }

  // Logged in but no mobile number — prompt sign-up
  if (!mobileLoading && !mobileNumber) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5">
          <UserPlus className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Complete your sign-up first
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You need to create an account with your name and mobile number before posting an ad. It only takes a moment!
        </p>
        <Button asChild className="gap-2">
          <Link to="/signup">
            <UserPlus className="w-4 h-4" />
            Create Account
          </Link>
        </Button>
      </div>
    );
  }

  const postingFee = isVip ? 500 : 199;

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Post an Ad</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to list your animal for sale.
          </p>
        </div>

        {/* Pending approval notice */}
        <div className="mb-6 flex items-start gap-3 rounded-xl px-5 py-3 bg-blue-50 border border-blue-200">
          <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Admin Approval Required</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All new ads are reviewed by our admin before going live. This usually takes a short time.
            </p>
          </div>
        </div>

        {/* Posting fee notice */}
        <div className={`mb-6 flex items-center gap-3 rounded-xl px-5 py-3 transition-all duration-200 ${
          isVip
            ? 'bg-amber-50 border-2 border-amber-300'
            : 'bg-primary/5 border border-primary/20'
        }`}>
          <span className="text-2xl">{isVip ? '👑' : '💳'}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Posting Fee:{' '}
              <span className={isVip ? 'text-amber-600' : 'text-primary'}>
                ₹{postingFee}
              </span>
              {isVip && (
                <span className="ml-2 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  VIP
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {isVip
                ? 'Your ad will be featured at the top with a gold border and Verified badge.'
                : 'A one-time fee of ₹199 is required to publish your ad. Payment via UPI.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Murrah Buffalo, 5 years old"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={(v) => setCategory(v as AnimalCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pets</SelectLabel>
                      {PET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Farm Animals</SelectLabel>
                      {FARM_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₹</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min={0}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. Lahore, Punjab"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the animal — age, breed, health, reason for selling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/1000
              </p>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Photos</h2>
              <span className="text-xs text-muted-foreground">
                {photoDataUrls.length}/{MAX_PHOTOS} photos
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload button */}
            {photoDataUrls.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isProcessingFiles}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingFiles ? (
                  <span className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Camera className="w-8 h-8" />
                )}
                <div className="text-center">
                  <p className="font-medium text-sm">
                    {isProcessingFiles ? 'Processing...' : 'Upload Photos'}
                  </p>
                  <p className="text-xs mt-0.5">
                    JPEG, PNG or WebP · Max {MAX_PHOTOS} photos
                  </p>
                </div>
              </button>
            )}

            {/* Photo previews */}
            {photoDataUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {photoDataUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] font-semibold text-center py-0.5">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoError && (
              <p className="text-sm text-destructive">{photoError}</p>
            )}
          </div>

          {/* VIP Ad Option */}
          <div className={`rounded-xl p-5 border-2 transition-all duration-200 cursor-pointer ${
            isVip
              ? 'bg-amber-50 border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]'
              : 'bg-card border-border hover:border-amber-300'
          }`}
            onClick={() => setIsVip((v) => !v)}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                id="isVip"
                checked={isVip}
                onCheckedChange={(checked) => setIsVip(!!checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="isVip"
                  className="flex items-center gap-2 font-semibold text-foreground cursor-pointer mb-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  Make this a VIP Ad
                  <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    ₹500
                  </span>
                </label>
                <p className="text-sm text-muted-foreground">
                  VIP ads appear at the top of the listings with a gold border, crown icon, and "Verified" badge — get more visibility and sell faster.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || isProcessingFiles}
          >
            {isPending ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Submitting...
              </>
            ) : (
              `Continue to Payment — ₹${postingFee}`
            )}
          </Button>
        </form>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        onConfirmPayment={handleConfirmPayment}
        isSubmitting={isPending}
        submitError={submitError}
        isVip={isVip}
      />
    </>
  );
}
