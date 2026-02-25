import { useMemo } from "react";
import {
  useGetAllMobileNumbers,
  useGetAllListingsAdmin,
  useApproveListing,
} from "../hooks/useQueries";
import { ListingStatus, AnimalCategory } from "../backend";
import { Principal } from "@dfinity/principal";
import {
  Users,
  Package,
  MapPin,
  AlertCircle,
  Loader2,
  ImageOff,
  CheckCircle2,
  Eye,
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
import { Button } from "@/components/ui/button";

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
        Live
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

  const sortedEntries = useMemo(() => {
    if (!mobileNumbers) return [];
    return [...mobileNumbers].sort((a, b) =>
      a[0].toString().localeCompare(b[0].toString())
    );
  }, [mobileNumbers]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-primary" />
        <h2 className="text-xl font-display font-bold text-foreground">
          Registered Users
        </h2>
        {!isLoading && mobileNumbers && (
          <Badge variant="secondary" className="ml-1">
            {mobileNumbers.length}
          </Badge>
        )}
      </div>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
              <span>Loading users…</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-12 gap-2 text-destructive">
              <AlertCircle size={20} />
              <span>Failed to load users.</span>
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No registered users yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold text-foreground w-12">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Principal ID
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Mobile Number
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.map(([principal, mobile], idx) => (
                    <TableRow
                      key={principal.toString()}
                      className="hover:bg-muted/20 transition-colors"
                    >
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

// ─── Section: All Animal Ads ──────────────────────────────────────────────────

function AllAnimalAdsSection() {
  const { data: listings, isLoading, isError } = useGetAllListingsAdmin();
  const approveMutation = useApproveListing();

  const sortedListings = useMemo(() => {
    if (!listings) return [];
    return [...listings].sort((a, b) => {
      // Pending first, then by timestamp descending
      if (a.status === ListingStatus.pending && b.status !== ListingStatus.pending) return -1;
      if (b.status === ListingStatus.pending && a.status !== ListingStatus.pending) return 1;
      return Number(b.timestamp) - Number(a.timestamp);
    });
  }, [listings]);

  const handleMarkAsLive = (listingId: bigint) => {
    approveMutation.mutate(listingId);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Package size={20} className="text-primary" />
        <h2 className="text-xl font-display font-bold text-foreground">
          All Animal Ads
        </h2>
        {!isLoading && listings && (
          <Badge variant="secondary" className="ml-1">
            {listings.length}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading listings…</span>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-16 gap-2 text-destructive">
          <AlertCircle size={20} />
          <span>Failed to load listings.</span>
        </div>
      ) : sortedListings.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          No animal ads submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedListings.map((listing) => {
            const isApproved = listing.status === ListingStatus.approved;
            const isApprovingThis =
              approveMutation.isPending &&
              approveMutation.variables === listing.id;

            return (
              <Card
                key={listing.id.toString()}
                className="border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {listing.photoUrls && listing.photoUrls.length > 0 ? (
                        <img
                          src={listing.photoUrls[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageOff size={28} className="text-muted-foreground" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-base leading-tight">
                            {listing.title}
                          </h3>
                          <StatusBadge status={listing.status} />
                          {listing.isVip && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-xs">
                              VIP
                            </Badge>
                          )}
                        </div>
                        <span className="font-bold text-primary text-lg shrink-0">
                          {formatPrice(listing.price)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Package size={13} />
                          {categoryLabel(listing.category)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {listing.location}
                        </span>
                        <span
                          className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded"
                          title={listing.owner.toString()}
                        >
                          {truncatePrincipal(listing.owner)}
                        </span>
                      </div>

                      {/* Mark as Live button */}
                      {!isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsLive(listing.id)}
                          disabled={isApprovingThis}
                          className="bg-primary hover:bg-primary/90 text-white gap-1.5"
                        >
                          {isApprovingThis ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Marking Live…
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              Mark as Live
                            </>
                          )}
                        </Button>
                      )}

                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
                          <Eye size={14} />
                          Live — visible to everyone
                        </span>
                      )}
                    </div>
                  </div>
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

export default function OwnerViewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Eye size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Owner View
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage registered users and all animal listings
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-10">
        <RegisteredUsersSection />
        <AllAnimalAdsSection />
      </div>
    </div>
  );
}
