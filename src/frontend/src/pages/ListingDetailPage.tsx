import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetListing, useGetProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PhotoGallery from '../components/PhotoGallery';
import { CATEGORY_LABELS, CATEGORY_COLORS, formatPrice } from '../components/ListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, MessageCircle, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Principal } from '@dfinity/principal';

export default function ListingDetailPage() {
  const { id } = useParams({ from: '/listing/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: listing, isLoading, error } = useGetListing(id);
  const ownerPrincipal = listing?.owner?.toString();

  // Convert owner string to Principal object for useGetProfile
  const ownerPrincipalObj = (() => {
    if (!ownerPrincipal) return undefined;
    try {
      return Principal.fromText(ownerPrincipal);
    } catch {
      return undefined;
    }
  })();

  const { data: sellerProfile } = useGetProfile(ownerPrincipalObj);

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate({ to: '/signup' });
      return;
    }
    // Navigate to messages page; the messages page handles principal-based routing
    navigate({ to: '/messages' });
  };

  const formatTimestamp = (ts: bigint) => {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[16/9] rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg mb-4">Listing not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: '/' })}>
          Back to Browse
        </Button>
      </div>
    );
  }

  const isOwnListing = identity?.getPrincipal().toString() === ownerPrincipal;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Photo Gallery */}
        <div>
          <PhotoGallery photos={listing.photoUrls} title={listing.title} />
        </div>

        {/* Details */}
        <div className="space-y-5">
          {/* Category badge */}
          <span className={cn(
            'inline-flex text-xs font-medium px-3 py-1 rounded-full border',
            CATEGORY_COLORS[listing.category]
          )}>
            {CATEGORY_LABELS[listing.category]}
          </span>

          {/* Title & Price */}
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
              {listing.title}
            </h1>
            <p className="font-display text-3xl font-bold text-primary mt-2">
              {formatPrice(listing.price)}
            </p>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Posted {formatTimestamp(listing.timestamp)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h2 className="font-semibold text-sm text-foreground mb-2">Description</h2>
            <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Seller info */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {sellerProfile?.displayName?.charAt(0)?.toUpperCase() ?? <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">
                {sellerProfile?.displayName ?? 'Anonymous Seller'}
              </p>
              {sellerProfile?.bio && (
                <p className="text-xs text-muted-foreground line-clamp-1">{sellerProfile.bio}</p>
              )}
            </div>
          </div>

          {/* Contact button */}
          {!isOwnListing && (
            <Button
              onClick={handleContactSeller}
              size="lg"
              className="w-full gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Seller
            </Button>
          )}

          {isOwnListing && (
            <div className="bg-accent/30 border border-accent rounded-xl p-3 text-sm text-accent-foreground text-center">
              This is your listing. Manage it from your{' '}
              <button
                onClick={() => navigate({ to: '/profile' })}
                className="font-semibold underline"
              >
                Profile
              </button>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
