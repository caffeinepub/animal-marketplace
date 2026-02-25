import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useGetListings,
  useUpdateListing,
} from '../hooks/useQueries';
import ListingCard from '../components/ListingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User, Edit3, LogIn, Plus, PowerOff, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { type Listing } from '../backend';

export default function UserDashboardPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: allListings = [], isLoading: listingsLoading } = useGetListings();
  const { mutateAsync: saveProfile, isPending: savingProfile } = useSaveCallerUserProfile();
  const { mutateAsync: updateListing, isPending: updatingListing } = useUpdateListing();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  const myPrincipal = identity?.getPrincipal().toString();
  const myListings = allListings.filter(
    (l) => l.owner.toString() === myPrincipal && l.isActive
  );

  const startEditing = () => {
    setEditName(profile?.displayName ?? '');
    setEditBio(profile?.bio ?? '');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await saveProfile({
        displayName: editName.trim(),
        bio: editBio.trim(),
        contactInfo: null,
        mobileNumber: null,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleDeactivateListing = async (listing: Listing) => {
    try {
      await updateListing({
        listingId: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        location: listing.location,
        photoUrls: listing.photoUrls,
        isActive: false,
        isVip: listing.isVip,
      });
      toast.success('Listing deactivated.');
    } catch {
      toast.error('Failed to deactivate listing.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <User className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Sign in to view your dashboard
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Log in to manage your profile and listings.
        </p>
        <Button onClick={login} disabled={isLoggingIn} className="gap-2">
          {isLoggingIn ? (
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {profileLoading ? (
                <Skeleton className="h-7 w-48 inline-block" />
              ) : (
                <>Welcome back, {profile?.displayName ?? 'there'}!</>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your profile and listings from here.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground text-lg mb-4">My Profile</h2>

            {profileLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">
                    Display Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBio">Bio</Label>
                  <Textarea
                    id="editBio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    placeholder="Tell others about yourself..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1" disabled={savingProfile}>
                    {savingProfile ? (
                      <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={savingProfile}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-4">
                  {profile?.displayName?.charAt(0)?.toUpperCase() ?? <User className="w-8 h-8" />}
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">
                  {profile?.displayName ?? 'Anonymous'}
                </h3>
                {profile?.bio && (
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                {profile?.registrationTimestamp && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Member since{' '}
                    {new Date(Number(profile.registrationTimestamp / BigInt(1_000_000))).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2 w-full"
                  onClick={startEditing}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-xl p-4 mt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </p>
            <Link to="/post-ad" className="block">
              <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                <Plus className="w-4 h-4" />
                Post a New Ad
              </Button>
            </Link>
            <Link to="/messages" className="block">
              <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                <User className="w-4 h-4" />
                My Messages
              </Button>
            </Link>
          </div>
        </div>

        {/* My Ads Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              My Ads
            </h2>
            <Link to="/post-ad">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Post New Ad
              </Button>
            </Link>
          </div>

          {listingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : myListings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-4">You have no active listings yet.</p>
              <Link to="/post-ad">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Post Your First Ad
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myListings.map((listing) => (
                <div key={listing.id.toString()} className="relative group">
                  <ListingCard listing={listing} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5 shadow-xs text-xs h-8"
                        >
                          <PowerOff className="w-3 h-3" />
                          Deactivate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate Listing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will hide "{listing.title}" from the marketplace. You can reactivate it later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeactivateListing(listing)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {updatingListing ? 'Deactivating...' : 'Deactivate'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
