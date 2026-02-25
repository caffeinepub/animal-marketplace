import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetCallerUserProfile,
  useGetMyListings,
  useSaveCallerUserProfile,
  useDeactivateListing,
} from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ChevronRight,
  Package,
  Heart,
  Settings,
  HelpCircle,
  Globe,
  LogOut,
  Edit,
  CheckCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Listing } from '../backend';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: myListings = [], isLoading: listingsLoading } = useGetMyListings();
  const saveProfile = useSaveCallerUserProfile();
  const deactivateListing = useDeactivateListing();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [myAdsOpen, setMyAdsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const openEditProfile = () => {
    setDisplayName(userProfile?.displayName || '');
    setBio(userProfile?.bio || '');
    setEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    try {
      await saveProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        contactInfo: null,
        mobileNumber: userProfile?.mobileNumber ?? null,
      });
      toast.success('Profile updated!');
      setEditProfileOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setSettingsOpen(false);
    navigate({ to: '/' });
  };

  const handleDeactivate = async (listing: Listing) => {
    try {
      await deactivateListing.mutateAsync(listing.id);
      toast.success('Ad deactivated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate');
    }
  };

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 bg-white">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <Settings className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Sign in to your account</h2>
        <p className="text-gray-500 text-center">Login to manage your ads, profile, and more.</p>
        <Button onClick={() => navigate({ to: '/signup' })} className="w-full max-w-xs rounded-xl">
          Login / Sign Up
        </Button>
      </div>
    );
  }

  const initials = userProfile?.displayName
    ? userProfile.displayName.slice(0, 2).toUpperCase()
    : identity.getPrincipal().toString().slice(0, 2).toUpperCase();

  const displayNameText = userProfile?.displayName || 'User';
  const mobileText = userProfile?.mobileNumber ? `+91 ${userProfile.mobileNumber}` : 'No phone added';

  const menuItems = [
    {
      icon: Package,
      title: 'Buy Packages',
      subtitle: 'Boost your ads with premium packages',
      onClick: () => setPackagesOpen(true),
      showChevron: true,
    },
    {
      icon: Heart,
      title: 'Wishlist',
      subtitle: 'View your liked items here',
      onClick: () => setWishlistOpen(true),
      showChevron: true,
    },
    {
      icon: Settings,
      title: 'Settings',
      subtitle: 'Privacy and logout',
      onClick: () => setSettingsOpen(true),
      showChevron: true,
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onClick: () => navigate({ to: '/helpline' }),
      showChevron: true,
    },
    {
      icon: Globe,
      title: 'Select Language',
      subtitle: 'English',
      onClick: () => setLanguageOpen(true),
      showChevron: true,
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Profile Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-md">
              {initials}
            </div>
            <button
              onClick={openEditProfile}
              className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1 shadow-sm"
            >
              <Edit className="h-3 w-3 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{displayNameText}</h2>
            <p className="text-sm text-gray-500">{mobileText}</p>
            {userProfile?.mobileNumber && (
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Verified</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setMyAdsOpen(true)}
            className="text-xs text-primary font-medium border border-primary rounded-xl px-3 py-1.5"
          >
            My Ads
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.title}>
              <button
                onClick={item.onClick}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                </div>
                {item.showChevron && <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />}
              </button>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          );
        })}
      </div>

      {/* Version */}
      <div className="px-4 py-4 border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400 text-center">Animal Pashu Bazar — Version 54</p>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-1 rounded-xl bg-white"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell buyers about yourself..."
                rows={3}
                className="mt-1 rounded-xl bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saveProfile.isPending} className="rounded-xl">
              {saveProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* My Ads Dialog */}
      <Dialog open={myAdsOpen} onOpenChange={setMyAdsOpen}>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>My Ads</DialogTitle>
          </DialogHeader>
          {listingsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : myListings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No ads posted yet.</p>
              <Button
                className="mt-4 rounded-xl"
                onClick={() => {
                  setMyAdsOpen(false);
                  navigate({ to: '/post-ad' });
                }}
              >
                Post Your First Ad
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((listing) => (
                <div key={String(listing.id)} className="border border-gray-200 rounded-xl p-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{listing.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">₹{Number(listing.price).toLocaleString()}</p>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${
                          listing.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : listing.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {String(listing.status).charAt(0).toUpperCase() + String(listing.status).slice(1)}
                      </span>
                    </div>
                    {listing.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivate(listing)}
                        disabled={deactivateListing.isPending}
                        className="text-xs shrink-0 rounded-xl"
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">Manage your account settings and preferences.</p>
            <Separator />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={languageOpen} onOpenChange={setLanguageOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Select Language</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="font-medium text-gray-900">English</span>
              <CheckCircle className="h-5 w-5 text-primary" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wishlist Dialog */}
      <Dialog open={wishlistOpen} onOpenChange={setWishlistOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Wishlist</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-gray-500">
            <Heart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">Your wishlist is empty.</p>
            <p className="text-xs text-gray-400 mt-1">Save ads you like to view them here.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Packages Dialog */}
      <Dialog open={packagesOpen} onOpenChange={setPackagesOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Buy Packages</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900">VIP Ad Boost</p>
                  <p className="text-xs text-gray-500 mt-0.5">Feature your ad at the top</p>
                </div>
                <span className="text-xl font-bold text-primary">₹99</span>
              </div>
              <Button
                size="sm"
                className="w-full rounded-xl"
                onClick={() => {
                  setPackagesOpen(false);
                  navigate({ to: '/post-ad' });
                }}
              >
                Post a VIP Ad
              </Button>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900">Premium Pack</p>
                  <p className="text-xs text-gray-500 mt-0.5">5 VIP ads + priority support</p>
                </div>
                <span className="text-xl font-bold text-gray-700">₹399</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => toast.info('Coming soon!')}
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
