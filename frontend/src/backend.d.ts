import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface PublicUserProfile {
    bio: string;
    displayName: string;
    registrationTimestamp: Time;
}
export type ListingId = bigint;
export interface Listing {
    id: ListingId;
    status: ListingStatus;
    title: string;
    photoUrls: Array<string>;
    owner: Principal;
    description: string;
    isActive: boolean;
    timestamp: Time;
    category: AnimalCategory;
    isVip: boolean;
    price: bigint;
    location: string;
}
export interface Message {
    listingId?: ListingId;
    text: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    bio: string;
    lastLoginTime: bigint;
    contactInfo?: string;
    displayName: string;
    mobileNumber?: string;
    registrationTimestamp: Time;
}
export enum AnimalCategory {
    cat = "cat",
    cow = "cow",
    dog = "dog",
    other = "other",
    bird = "bird",
    fish = "fish",
    goat = "goat",
    sheep = "sheep",
    reptile = "reptile",
    buffalo = "buffalo",
    smallAnimal = "smallAnimal"
}
export enum ListingStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveListing(listingId: ListingId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: bigint, category: AnimalCategory, location: string, photoUrls: Array<string>, isVip: boolean): Promise<ListingId>;
    deleteListing(listingId: ListingId): Promise<void>;
    deleteListingAdmin(listingId: ListingId): Promise<boolean>;
    getAllListings(): Promise<Array<Listing>>;
    getAllListingsAdmin(): Promise<Array<Listing>>;
    getAllMobileNumbers(): Promise<Array<[Principal, string]>>;
    getAllUsersWithActivity(): Promise<Array<[Principal, string, bigint]>>;
    getApprovedListingsCount(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(other: Principal): Promise<Array<Message>>;
    getListings(): Promise<Array<Listing>>;
    getMobileNumber(): Promise<string | null>;
    getMyProfile(): Promise<UserProfile | null>;
    getPendingListings(): Promise<Array<Listing>>;
    getPendingListingsCount(): Promise<bigint>;
    getProfile(principal: Principal): Promise<PublicUserProfile | null>;
    getTotalListingsCount(): Promise<bigint>;
    getTotalLoginsCount(): Promise<bigint>;
    getTotalUsersCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listConversations(): Promise<Array<Principal>>;
    rejectListing(listingId: ListingId): Promise<void>;
    saveCallerUserProfile(displayName: string, bio: string, contactInfo: string | null, mobileNumber: string | null): Promise<void>;
    sendMessage(recipient: Principal, listingId: ListingId | null, text: string): Promise<void>;
    signUp(displayName: string, mobileNumber: string): Promise<string>;
    updateListing(listingId: ListingId, title: string, description: string, price: bigint, category: AnimalCategory, location: string, photoUrls: Array<string>, isActive: boolean, isVip: boolean): Promise<void>;
    upsertProfile(displayName: string, bio: string, contactInfo: string | null): Promise<void>;
}
