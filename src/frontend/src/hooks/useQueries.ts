import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { AnimalCategory, Listing, ListingId, UserProfile } from '../backend';

// Helper: wait for actor with retry
async function waitForActor(getActor: () => any, maxWaitMs = 3000): Promise<any> {
  const interval = 200;
  const maxAttempts = Math.ceil(maxWaitMs / interval);
  for (let i = 0; i < maxAttempts; i++) {
    const actor = getActor();
    if (actor) return actor;
    await new Promise((res) => setTimeout(res, interval));
  }
  throw new Error('Connection not ready. Please wait a moment and try again.');
}

export function useGetListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(id: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Listing | null>({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      const all = await actor.getListings();
      return all.find((l: Listing) => l.id.toString() === id) ?? null;
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGetPendingListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ['pendingListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ['allListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllListingsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ['allListingsAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListingsAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ['myListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetProfile(principal: any) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['profile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMobileNumber() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ['mobileNumber'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMobileNumber();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversation(other: any) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['conversation', other?.toString()],
    queryFn: async () => {
      if (!actor || !other) return [];
      return actor.getConversation(other);
    },
    enabled: !!actor && !isFetching && !!other,
    refetchInterval: 5000,
  });
}

export function useListConversations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConversations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
  return {
    ...query,
    isAdmin: query.data === true,
    isLoading: isFetching || query.isLoading,
  };
}

export function useIsManagementUser(): boolean {
  return false;
}

export function useIsOwnerUser(): boolean {
  return false;
}

export function useIsCattleTrackerUser(): boolean {
  return false;
}

export function useGetTotalListingsCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ['totalListingsCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalListingsCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingListingsCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ['pendingListingsCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getPendingListingsCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetApprovedListingsCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ['approvedListingsCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getApprovedListingsCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalUsersCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ['totalUsersCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalUsersCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalLoginsCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ['totalLoginsCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalLoginsCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMobileNumbers() {
  const { actor, isFetching } = useActor();
  return useQuery<[any, string][]>({
    queryKey: ['allMobileNumbers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMobileNumbers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsersWithActivity() {
  const { actor, isFetching } = useActor();
  return useQuery<[any, string, bigint][]>({
    queryKey: ['allUsersWithActivity'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersWithActivity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSignUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async ({ displayName, mobileNumber }: { displayName: string; mobileNumber: string }) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.signUp(displayName, mobileNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['mobileNumber'] });
    },
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      price: bigint;
      category: AnimalCategory;
      location: string;
      photoUrls: string[];
      isVip: boolean;
    }) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.createListing(
        params.title,
        params.description,
        params.price,
        params.category,
        params.location,
        params.photoUrls,
        params.isVip
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['pendingListings'] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async (params: {
      listingId: ListingId;
      title: string;
      description: string;
      price: bigint;
      category: AnimalCategory;
      location: string;
      photoUrls: string[];
      isActive: boolean;
      isVip: boolean;
    }) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.updateListing(
        params.listingId,
        params.title,
        params.description,
        params.price,
        params.category,
        params.location,
        params.photoUrls,
        params.isActive,
        params.isVip
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListingsAdmin'] });
    },
  });
}

export function useApproveListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.approveListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['pendingListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListingsAdmin'] });
    },
  });
}

export function useRejectListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.rejectListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['pendingListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListingsAdmin'] });
    },
  });
}

export function useDeactivateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      const listings = await resolvedActor.getListings();
      const found = listings.find((l: Listing) => l.id === listingId);
      if (!found) throw new Error('Listing not found');
      return resolvedActor.updateListing(
        listingId,
        found.title,
        found.description,
        found.price,
        found.category,
        found.location,
        found.photoUrls,
        false,
        found.isVip
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListingsAdmin'] });
    },
  });
}

export function useDeleteListingAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.deleteListingAdmin(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['allListingsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['pendingListings'] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async ({
      recipient,
      listingId,
      text,
    }: {
      recipient: any;
      listingId: ListingId | null;
      text: string;
    }) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.sendMessage(recipient, listingId, text);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.recipient?.toString()] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      contactInfo,
      mobileNumber,
    }: {
      displayName: string;
      bio: string;
      contactInfo: string | null;
      mobileNumber: string | null;
    }) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.saveCallerUserProfile(displayName, bio, contactInfo, mobileNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}

export function useUpsertProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const actorRef = { current: actor };
  actorRef.current = actor;

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      contactInfo,
    }: {
      displayName: string;
      bio: string;
      contactInfo: string | null;
    }) => {
      const resolvedActor = await waitForActor(() => actorRef.current);
      return resolvedActor.upsertProfile(displayName, bio, contactInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}
