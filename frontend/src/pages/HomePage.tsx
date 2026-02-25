import { useState, useMemo } from 'react';
import { useGetListings } from '../hooks/useQueries';
import ListingCard from '../components/ListingCard';
import { AnimalCategory } from '../backend';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, X, Crown } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const ALL_CATEGORIES = 'all';

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

export default function HomePage() {
  const { data: listings = [], isLoading } = useGetListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [locationFilter, setLocationFilter] = useState('');

  const activeListings = useMemo(
    () => listings.filter((l) => l.isActive),
    [listings]
  );

  // Separate VIP listings for the Featured Animals section
  const featuredListings = useMemo(
    () => activeListings.filter((l) => l.isVip),
    [activeListings]
  );

  const filteredListings = useMemo(() => {
    return activeListings.filter((listing) => {
      const matchesSearch =
        !searchQuery ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES || listing.category === selectedCategory;

      const matchesLocation =
        !locationFilter ||
        listing.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [activeListings, searchQuery, selectedCategory, locationFilter]);

  const hasFilters = searchQuery || selectedCategory !== ALL_CATEGORIES || locationFilter;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(ALL_CATEGORIES);
    setLocationFilter('');
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="aspect-[3/1] md:aspect-[4/1] max-h-80 w-full overflow-hidden">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt="Buy and sell animals on Pashu Mandi"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center">
            <div className="container mx-auto px-4">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
                Buy &amp; Sell Animals<br />on Pashu Mandi
              </h1>
              <p className="text-white/90 text-base md:text-lg drop-shadow max-w-md">
                Browse thousands of listings from trusted sellers near you.
              </p>
              <Link to="/post-ad">
                <Button className="mt-4 bg-white text-primary hover:bg-white/90 font-semibold" size="lg">
                  Post Your Ad
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-card border-b border-border sticky top-16 z-40 shadow-xs">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search animals, breeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
                <SelectSeparator />
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

            {/* Location Filter */}
            <div className="relative w-full sm:w-44">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Reset */}
            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={resetFilters} title="Clear filters">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Animals Section — only shown when VIP listings exist and no filters active */}
      {!isLoading && featuredListings.length > 0 && !hasFilters && (
        <section className="container mx-auto px-4 pt-8 pb-2">
          {/* Section heading */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Featured Animals
              </h2>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full whitespace-nowrap">
              Premium Listings
            </span>
          </div>

          {/* Horizontally scrollable row on mobile, grid on larger screens */}
          <div className="flex gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredListings.map((listing) => (
              <div key={listing.id.toString()} className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink">
                <ListingCard listing={listing} className="h-full" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Listings Grid */}
      <section className="container mx-auto px-4 py-8">
        {/* All listings heading — only show when featured section is visible */}
        {!isLoading && featuredListings.length > 0 && !hasFilters && activeListings.length > featuredListings.length && (
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-display text-xl font-bold text-foreground">All Listings</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img
              src="/assets/generated/empty-state.dim_400x300.png"
              alt="No listings found"
              className="w-48 h-36 object-contain mb-6 opacity-70"
            />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {hasFilters ? 'No listings match your filters' : 'No listings yet'}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {hasFilters
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Be the first to post an animal listing on Pashu Mandi!'}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            ) : (
              <Link to="/post-ad">
                <Button>Post Your Ad</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id.toString()} listing={listing} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
