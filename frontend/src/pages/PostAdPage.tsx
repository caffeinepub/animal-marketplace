import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateListing, useGetMobileNumber } from '../hooks/useQueries';
import { AnimalCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Camera,
  FolderOpen,
  MapPin,
  ChevronDown,
  X,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import LocationPickerModal from '../components/LocationPickerModal';

const STEPS = [
  { id: 1, name: 'Details' },
  { id: 2, name: 'Photos' },
  { id: 3, name: 'Price' },
  { id: 4, name: 'Location' },
  { id: 5, name: 'Review' },
];

const CATEGORIES = [
  { value: AnimalCategory.cow, label: '🐄 Cow' },
  { value: AnimalCategory.buffalo, label: '🐃 Buffalo' },
  { value: AnimalCategory.goat, label: '🐐 Goat' },
  { value: AnimalCategory.sheep, label: '🐑 Sheep' },
  { value: AnimalCategory.dog, label: '🐕 Dog' },
  { value: AnimalCategory.cat, label: '🐈 Cat' },
  { value: AnimalCategory.bird, label: '🐦 Bird' },
  { value: AnimalCategory.fish, label: '🐟 Fish' },
  { value: AnimalCategory.reptile, label: '🦎 Reptile' },
  { value: AnimalCategory.smallAnimal, label: '🐹 Small Animal' },
  { value: AnimalCategory.other, label: '🐾 Other' },
];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function PostAdPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createListing = useCreateListing();
  const { data: mobileNumber } = useGetMobileNumber();

  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AnimalCategory | ''>('');
  const [photoDataUrls, setPhotoDataUrls] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [location, setLocation] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <h2 className="text-xl font-bold text-gray-800">Login Required</h2>
        <p className="text-gray-500 text-center">Please login to post an ad.</p>
        <Button onClick={() => navigate({ to: '/signup' })}>Login / Sign Up</Button>
      </div>
    );
  }

  if (!mobileNumber) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <h2 className="text-xl font-bold text-gray-800">Complete Your Profile</h2>
        <p className="text-gray-500 text-center">Please complete sign-up with your mobile number before posting an ad.</p>
        <Button onClick={() => navigate({ to: '/signup' })}>Complete Sign Up</Button>
      </div>
    );
  }

  const handlePhotoSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 5 - photoDataUrls.length;
    if (remaining <= 0) return;
    const newFiles = Array.from(files).slice(0, remaining);

    setIsProcessingFiles(true);
    try {
      const dataUrls = await Promise.all(newFiles.map(readFileAsDataURL));
      setPhotoDataUrls((prev) => [...prev, ...dataUrls]);
    } catch {
      toast.error('Failed to read image files. Please try again.');
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoDataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!title.trim()) { toast.error('Please enter a title'); return false; }
      if (!description.trim()) { toast.error('Please enter a description'); return false; }
      if (!category) { toast.error('Please select a category'); return false; }
    }
    if (step === 3) {
      if (!price || isNaN(Number(price)) || Number(price) < 0) {
        toast.error('Please enter a valid price');
        return false;
      }
    }
    if (step === 4) {
      if (!location.trim()) { toast.error('Please select a location'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handlePostNow = () => {
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setPaymentModalOpen(false);
    setIsSubmitting(true);
    try {
      await createListing.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(Number(price))),
        category: category as AnimalCategory,
        location: location.trim(),
        photoUrls: photoDataUrls,
        isVip,
      });

      toast.success('🎉 Ad posted! Awaiting admin approval.', { duration: 5000 });
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to post ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label || '';

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Step Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          {currentStep > 1 ? (
            <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          ) : (
            <button onClick={() => navigate({ to: '/' })} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">
              {currentStep === 1 && 'Ad Details'}
              {currentStep === 2 && 'Upload your photos'}
              {currentStep === 3 && 'Set your price'}
              {currentStep === 4 && 'Confirm your location'}
              {currentStep === 5 && 'Review your details'}
            </h1>
          </div>
          <span className="text-xs text-gray-400 font-medium">{currentStep}/5</span>
        </div>

        {/* Step Progress Bar */}
        <div className="flex px-4 pb-3 gap-1">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step.id <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Step 1: Details */}
        {currentStep === 1 && (
          <div className="px-4 py-5 space-y-5">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Ad Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Healthy Murrah Buffalo for sale"
                maxLength={100}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you are selling. Include condition, features and reason for selling."
                rows={5}
                maxLength={2000}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AnimalCategory)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select animal category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-400">* Required Fields</p>
          </div>
        )}

        {/* Step 2: Photos */}
        {currentStep === 2 && (
          <div className="px-4 py-5">
            {/* Illustration */}
            <div className="flex flex-col items-center py-6">
              <div className="flex items-end gap-2 mb-4">
                <div className="w-16 h-16 bg-yellow-100 border-4 border-yellow-400 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="w-20 h-20 bg-yellow-100 border-4 border-yellow-400 rounded-lg flex items-center justify-center -mb-1">
                  <ImageIcon className="h-10 w-10 text-yellow-600" />
                </div>
                <div className="w-16 h-16 bg-yellow-100 border-4 border-yellow-400 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <p className="text-center text-base font-semibold text-gray-800 max-w-xs">
                Uploading more photos increases your chance of closing a deal
              </p>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoSelect(e.target.files)}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoSelect(e.target.files)}
            />

            {photoDataUrls.length < 5 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessingFiles}
                  className="bg-primary text-white rounded-xl flex flex-col items-center justify-center py-8 gap-3 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  <Camera className="h-10 w-10" />
                  <span className="text-sm font-bold tracking-wide">TAKE A PICTURE</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFiles}
                  className="bg-primary text-white rounded-xl flex flex-col items-center justify-center py-8 gap-3 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  <FolderOpen className="h-10 w-10" />
                  <span className="text-sm font-bold tracking-wide">FOLDERS</span>
                </button>
              </div>
            )}

            {isProcessingFiles && (
              <div className="flex items-center justify-center gap-2 py-3 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing photos...</span>
              </div>
            )}

            {/* Photo Previews */}
            {photoDataUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photoDataUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] font-semibold text-center py-0.5">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {photoDataUrls.length === 0 && !isProcessingFiles && (
              <p className="text-center text-xs text-gray-400 mt-2">No photos added yet (optional)</p>
            )}
            {photoDataUrls.length > 0 && (
              <p className="text-center text-xs text-gray-400 mt-2">{photoDataUrls.length}/5 photos added</p>
            )}
          </div>
        )}

        {/* Step 3: Price */}
        {currentStep === 3 && (
          <div className="px-4 py-5 space-y-5">
            <div>
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                Price (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">VIP Ad</p>
                  <p className="text-xs text-gray-500 mt-0.5">Feature your ad at the top of search results</p>
                </div>
                <Switch
                  checked={isVip}
                  onCheckedChange={setIsVip}
                />
              </div>
              {isVip && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className="text-xs text-yellow-700 font-medium">
                    ✨ VIP ads get 5x more visibility and appear at the top!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {currentStep === 4 && (
          <div className="px-4 py-5">
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">Location</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {location || 'Select your location'}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {location && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">{location}</p>
              </div>
            )}

            <LocationPickerModal
              isOpen={locationModalOpen}
              onClose={() => setLocationModalOpen(false)}
              onSelect={(loc) => {
                setLocation(loc);
                setLocationModalOpen(false);
              }}
            />
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="px-4 py-5 space-y-4">
            {/* Photos preview */}
            {photoDataUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photoDataUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-gray-200"
                  />
                ))}
              </div>
            )}

            {/* Details */}
            <div className="space-y-3">
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Title</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{title}</p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Description</p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-3">{description}</p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Category</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{categoryLabel}</p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Price</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ₹{Number(price).toLocaleString()}
                  {isVip && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      VIP
                    </span>
                  )}
                </p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Location</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Photos</p>
                <p className="text-sm text-gray-700 mt-1">{photoDataUrls.length} photo(s) added</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        {currentStep < 5 ? (
          <Button
            onClick={handleNext}
            className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90"
          >
            NEXT
          </Button>
        ) : (
          <Button
            onClick={handlePostNow}
            disabled={isSubmitting}
            className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Posting...
              </>
            ) : (
              'Post Now'
            )}
          </Button>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
        isSubmitting={isSubmitting}
        isVip={isVip}
      />
    </div>
  );
}
