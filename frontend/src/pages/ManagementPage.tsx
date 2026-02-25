import { useMemo } from "react";
import { useGetAllMobileNumbers, useGetAllListingsAdmin } from "../hooks/useQueries";
import { ListingStatus, AnimalCategory } from "../backend";
import { Principal } from "@dfinity/principal";
import {
  Users,
  Package,
  Phone,
  MapPin,
  Tag,
  AlertCircle,
  Loader2,
  ImageOff,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncatePrincipal(principal: Principal | string): string {
  const str = typeof principal === "string" ? principal : principal.toString();
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}…${str.slice(-4)}`;
}

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function categoryLabel(cat: AnimalCategory): string {
  const labels: Record<AnimalCategory, string> = {
    [AnimalCategory.cow]: "Cow",
    [AnimalCategory.buffalo]: "Buffalo",
    [AnimalCategory.goat]: "Goat",
    [AnimalCategory.sheep]: "Sheep",
    [AnimalCategory.dog]: "Dog",
    [AnimalCategory.cat]: "Cat",
    [AnimalCategory.bird]: "Bird",
    [AnimalCategory.fish]: "Fish",
    [AnimalCategory.reptile]: "Reptile",
    [AnimalCategory.smallAnimal]: "Small Animal",
    [AnimalCategory.other]: "Other",
  };
  return labels[cat] ?? String(cat);
}

function StatusBadge({ status }: { status: ListingStatus }) {
  if (status === ListingStatus.approved) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        Approved
      </Badge>
    );
  }
  if (status === ListingStatus.rejected) {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
      Pending
    </Badge>
  );
}

// ─── Section: Registered Users ────────────────────────────────────────────────

function RegisteredUsersSection() {
  const { data: mobileNumbers, isLoading, isError } = useGetAllMobileNumbers();

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Registered Users
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${mobileNumbers?.length ?? 0} users with phone numbers`}
          </p>
        </div>
      </div>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
              <span>Loading users…</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-12 gap-3 text-destructive">
              <AlertCircle size={20} />
              <span>Failed to load users. Please try again.</span>
            </div>
          ) : !mobileNumbers || mobileNumbers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Users size={32} className="opacity-30" />
              <span>No registered users found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold text-foreground w-12">#</TableHead>
                    <TableHead className="font-semibold text-foreground">Principal ID</TableHead>
                    <TableHead className="font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} />
                        Phone Number
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mobileNumbers.map(([principal, mobile], idx) => (
                    <TableRow key={principal.toString()} className="hover:bg-muted/20">
                      <TableCell className="text-muted-foreground text-sm">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-mono text-xs bg-muted px-2 py-1 rounded text-foreground"
                          title={principal.toString()}
                        >
                          {truncatePrincipal(principal)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {mobile}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

// ─── Section: All Listings ────────────────────────────────────────────────────

function AllListingsSection() {
  const { data: listings, isLoading, isError } = useGetAllListingsAdmin();

  const sortedListings = useMemo(() => {
    if (!listings) return [];
    return [...listings].sort((a, b) => {
      // Sort by timestamp descending (newest first)
      return Number(b.timestamp) - Number(a.timestamp);
    });
  }, [listings]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Package size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            All Animal Listings
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${sortedListings.length} total listings`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading listings…</span>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-16 gap-3 text-destructive">
          <AlertCircle size={24} />
          <span>Failed to load listings. Please try again.</span>
        </div>
      ) : sortedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <Package size={40} className="opacity-30" />
          <span>No listings found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedListings.map((listing) => {
            const firstPhoto = listing.photoUrls?.[0] ?? null;
            return (
              <Card
                key={listing.id.toString()}
                className="border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-muted flex items-center justify-center overflow-hidden">
                  {firstPhoto ? (
                    <img
                      src={firstPhoto}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-1"
                    style={{ display: firstPhoto ? "none" : "flex" }}
                  >
                    <ImageOff size={28} className="opacity-40" />
                    <span className="text-xs opacity-60">No photo</span>
                  </div>
                  {/* VIP badge */}
                  {listing.isVip && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                      VIP
                    </span>
                  )}
                  {/* Status badge overlay */}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={listing.status} />
                  </div>
                </div>

                <CardContent className="p-4 flex flex-col gap-2">
                  {/* Title */}
                  <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                    {listing.title}
                  </h3>

                  {/* Category + Price */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag size={12} />
                      {categoryLabel(listing.category)}
                    </span>
                    <span className="font-bold text-primary text-sm">
                      {formatPrice(listing.price)}
                    </span>
                  </div>

                  {/* Location */}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    {listing.location}
                  </span>

                  {/* Seller principal */}
                  <div className="pt-1 border-t border-border mt-1">
                    <span className="text-xs text-muted-foreground">Seller: </span>
                    <span
                      className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground"
                      title={listing.owner.toString()}
                    >
                      {truncatePrincipal(listing.owner)}
                    </span>
                  </div>

                  {/* Listing ID */}
                  <span className="text-xs text-muted-foreground">
                    ID: #{listing.id.toString()}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
            Management Dashboard
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Review registered users and all animal listings on the platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
        <RegisteredUsersSection />
        <AllListingsSection />
      </div>
    </div>
  );
}
