import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import type { Listing, UserProfile, AnimalCategory, ListingId } from "../backend";
import { Principal } from "@dfinity/principal";

// ─── Management Principal ─────────────────────────────────────────────────────

const MANAGEMENT_PRINCIPAL = "rhoqt-xhqg1-66ofc-khas4-fm4w6-73h56-vt55b-5bfnp-adgps-qxwoy-iqe";

export function useIsManagementUser(): boolean {
  const { identity, loginStatus } = useInternetIdentity();

  try {
    if (loginStatus === "initializing" || loginStatus === "logging-in" || !identity) {
      return false;
    }
    return identity.getPrincipal().toText().trim() === MANAGEMENT_PRINCIPAL;
  } catch {
    return false;
  }
}

// ─── Owner Principal ──────────────────────────────────────────────────────────

const OWNER_PRINCIPAL = "rhoqt-xhqg1-66ofc-khas4-fm4w6-73h56-vt55b-5bfnp-adgps-qxwoy-iqe";

export function useIsOwnerUser(): boolean {
  const { identity, loginStatus } = useInternetIdentity();

  try {
    if (loginStatus === "initializing" || loginStatus === "logging-in" || !identity) {
      return false;
    }
    return identity.getPrincipal().toText().trim() === OWNER_PRINCIPAL;
  } catch {
    return false;
  }
}

// ─── Cattle Tracker Principal ─────────────────────────────────────────────────

const CATTLE_TRACKER_PRINCIPAL = "rhoqt-xhqg1-66ofc-khas4-fm4w6-73h56-vt55b-5bfnp-adgps-qxwoy-iqe";

export function useIsCattleTrackerUser(): boolean {
  const { identity, loginStatus } = useInternetIdentity();

  try {
    if (loginStatus === "initializing" || loginStatus === "logging-in" || !identity) {
      return false;
    }
    return identity.getPrincipal().toText().trim() === CATTLE_TRACKER_PRINCIPAL;
  } catch {
    return false;
  }
}

export function useIsAuthLoading(): boolean {
  const { loginStatus } = useInternetIdentity();
  return loginStatus === "initializing" || loginStatus === "logging-in";
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anonymous";

  const query = useQuery<boolean>({
    queryKey: ["isAdmin", principalStr],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await actor.isAdmin();
        return result === true;
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    initialData: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isAdmin: query.data === true,
    isLoading: actorFetching || (query.isLoading && !query.isFetched),
  };
}

export function useGetPendingListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ["pendingListings"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPendingListings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllListingsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ["allListingsAdmin"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllListingsAdmin();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMobileNumbers() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, string][]>({
    queryKey: ["allMobileNumbers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllMobileNumbers();
        return result as [Principal, string][];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsersWithActivity() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, string, bigint][]>({
    queryKey: ["allUsersWithActivity"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllUsersWithActivity();
        return result as [Principal, string, bigint][];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalLoginsCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["totalLoginsCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getTotalLoginsCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalListingsCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["totalListingsCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getTotalListingsCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingListingsCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["pendingListingsCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getPendingListingsCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetApprovedListingsCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["approvedListingsCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getApprovedListingsCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalUsersCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["totalUsersCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getTotalUsersCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteListingAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.deleteListingAdmin(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allListingsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["totalListingsCount"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListingsCount"] });
      queryClient.invalidateQueries({ queryKey: ["approvedListingsCount"] });
    },
  });
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export function useGetListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ["listings"],
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
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      const all = await actor.getListings();
      return all.find((l) => l.id.toString() === id) ?? null;
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

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
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.createListing(
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
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      queryClient.invalidateQueries({ queryKey: ["allListingsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      queryClient.invalidateQueries({ queryKey: ["totalListingsCount"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListingsCount"] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

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
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.updateListing(
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
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      queryClient.invalidateQueries({ queryKey: ["allListingsAdmin"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      queryClient.invalidateQueries({ queryKey: ["allListingsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["totalListingsCount"] });
    },
  });
}

export function useApproveListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.approveListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["allListingsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      queryClient.invalidateQueries({ queryKey: ["approvedListingsCount"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListingsCount"] });
    },
  });
}

export function useRejectListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: ListingId) => {
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.rejectListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["allListingsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      queryClient.invalidateQueries({ queryKey: ["approvedListingsCount"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListingsCount"] });
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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

export function useGetPublicProfile(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["publicProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

// Alias for backward compatibility
export const useGetProfile = useGetPublicProfile;

export function useGetMyProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMyProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      bio: string;
      contactInfo: string | null;
      mobileNumber: string | null;
    }) => {
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.saveCallerUserProfile(
        params.displayName,
        params.bio,
        params.contactInfo,
        params.mobileNumber
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useUpsertProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      bio: string;
      contactInfo: string | null;
    }) => {
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.upsertProfile(params.displayName, params.bio, params.contactInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ─── Mobile Number ────────────────────────────────────────────────────────────

/**
 * Fetches the caller's own mobile number from the backend.
 * Used by PostAdPage to check whether the user has completed sign-up.
 */
export function useGetMobileNumber() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["mobileNumber"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMobileNumber();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useGetConversation(otherPrincipal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["conversation", otherPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !otherPrincipal) return [];
      try {
        return await actor.getConversation(otherPrincipal);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!otherPrincipal,
    refetchInterval: 5000,
  });
}

export function useListConversations() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.listConversations();
        return result as Principal[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      recipient: Principal;
      listingId: bigint | null;
      text: string;
    }) => {
      if (!actor) throw new Error("Connection not ready. Please wait a moment and try again.");
      return actor.sendMessage(params.recipient, params.listingId, params.text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.recipient.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export function useSignUp() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { displayName: string; mobileNumber: string }) => {
      // Guard: actor must be available before calling the backend
      if (!actor || actorFetching) {
        throw new Error("Connection not ready. Please wait a moment and try again.");
      }
      return actor.signUp(params.displayName, params.mobileNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["mobileNumber"] });
      queryClient.invalidateQueries({ queryKey: ["totalUsersCount"] });
    },
  });
}

export function useGetMyListings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Listing[]>({
    queryKey: ["myListings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        const all = await actor.getListings();
        const myPrincipal = identity.getPrincipal().toString();
        return all.filter((l) => l.owner.toString() === myPrincipal);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
