import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { AnimalCategory, type Listing, type UserProfile, type Message } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      contactInfo,
    }: {
      displayName: string;
      bio: string;
      contactInfo?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(displayName, bio, contactInfo ?? null, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetProfile(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['profile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// ─── Sign Up & Mobile Number ──────────────────────────────────────────────────

export function useGetMobileNumber() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string | null>({
    queryKey: ['mobileNumber'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMobileNumber();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useSignUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      mobileNumber,
    }: {
      displayName: string;
      mobileNumber: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.signUp(displayName, mobileNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileNumber'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Listings ────────────────────────────────────────────────────────────────

export function useGetListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getListings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetListing(id: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Listing | null>({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getListing(BigInt(id));
    },
    enabled: !!actor && !actorFetching && id !== undefined,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      price: bigint;
      category: AnimalCategory;
      location: string;
      photoUrls: string[];
      isVip: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(
        data.title,
        data.description,
        data.price,
        data.category,
        data.location,
        data.photoUrls,
        data.isVip,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      listingId: bigint;
      title: string;
      description: string;
      price: bigint;
      category: AnimalCategory;
      location: string;
      photoUrls: string[];
      isActive: boolean;
      isVip: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateListing(
        data.listingId,
        data.title,
        data.description,
        data.price,
        data.category,
        data.location,
        data.photoUrls,
        data.isActive,
        data.isVip,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export function useListConversations() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Principal[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConversations();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 10000,
  });
}

export function useGetConversation(otherPrincipal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Message[]>({
    queryKey: ['conversation', otherPrincipal],
    queryFn: async () => {
      if (!actor || !otherPrincipal) return [];
      return actor.getConversation(Principal.fromText(otherPrincipal));
    },
    enabled: !!actor && !actorFetching && !!identity && !!otherPrincipal,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      recipient: string;
      listingId?: bigint;
      text: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(
        Principal.fromText(data.recipient),
        data.listingId ?? null,
        data.text
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.recipient] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
