import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { PawPrint } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    try {
      await saveProfile({ displayName: displayName.trim(), bio: bio.trim() });
      toast.success('Welcome to PawMarket! Your profile has been created.');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">Welcome to PawMarket!</DialogTitle>
          </div>
          <DialogDescription>
            Set up your profile to start buying and selling animals. Your display name will be visible to other users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="e.g. John Smith"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea
              id="bio"
              placeholder="Tell others a bit about yourself and the animals you work with..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !displayName.trim()}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
