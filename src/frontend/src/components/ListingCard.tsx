import { Link } from '@tanstack/react-router';
import { type Listing, AnimalCategory } from '../backend';
import { MapPin, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export const CATEGORY_LABELS: Record<AnimalCategory, string> = {
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

export const CATEGORY_COLORS: Record<AnimalCategory, string> = {
  [AnimalCategory.dog]: 'bg-blue-100 text-blue-800 border-blue-200',
  [AnimalCategory.cat]: 'bg-sky-100 text-sky-800 border-sky-200',
  [AnimalCategory.bird]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [AnimalCategory.fish]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [AnimalCategory.reptile]: 'bg-teal-100 text-teal-800 border-teal-200',
  [AnimalCategory.smallAnimal]: 'bg-violet-100 text-violet-800 border-violet-200',
  [AnimalCategory.other]: 'bg-muted text-muted-foreground border-border',
  [AnimalCategory.cow]: 'bg-blue-50 text-blue-700 border-blue-200',
  [AnimalCategory.buffalo]: 'bg-slate-100 text-slate-700 border-slate-200',
  [AnimalCategory.goat]: 'bg-sky-50 text-sky-700 border-sky-200',
  [AnimalCategory.sheep]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export function formatPrice(price: bigint): string {
  return '₹' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function ListingCard({ listing, className }: ListingCardProps) {
  const primaryPhoto = listing.photoUrls[0];
  const isVip = listing.isVip;

  return (
    <Link
      to="/listing/$id"
      params={{ id: listing.id.toString() }}
      className={cn(
        'group block bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5',
        isVip
          ? 'border-2 border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.3),0_4px_16px_rgba(251,191,36,0.2)] hover:shadow-[0_0_0_1px_rgba(251,191,36,0.5),0_8px_24px_rgba(251,191,36,0.3)]'
          : 'border border-border shadow-card hover:shadow-card-hover',
        className
      )}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted overflow-hidden relative rounded-t-2xl">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/generated/empty-state.dim_400x300.png';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <img
              src="/assets/generated/empty-state.dim_400x300.png"
              alt="No photo"
              className="w-24 h-24 object-contain opacity-40"
            />
          </div>
        )}

        {/* Category badge */}
        <span className={cn(
          'absolute top-2 left-2 text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm',
          CATEGORY_COLORS[listing.category]
        )}>
          {CATEGORY_LABELS[listing.category]}
        </span>

        {/* VIP Verified badge */}
        {isVip && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>

      {/* VIP gold accent bar */}
      {isVip && (
        <div className="h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />
      )}

      {/* Content */}
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {listing.description}
        </p>
        <div className="flex items-center justify-between">
          <span className={cn(
            'font-bold text-base',
            isVip ? 'text-amber-600' : 'text-primary'
          )}>
            {formatPrice(listing.price)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{listing.location}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
