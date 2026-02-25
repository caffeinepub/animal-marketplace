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
export type ListingId = bigint;
export interface Listing {
    id: ListingId;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: bigint, category: AnimalCategory, location: string, photoUrls: Array<string>, isVip: boolean): Promise<ListingId>;
    deleteListing(listingId: ListingId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(other: Principal): Promise<Array<Message>>;
    getListing(listingId: ListingId): Promise<Listing | null>;
    getListings(): Promise<Array<Listing>>;
    getMobileNumber(): Promise<string | null>;
    getMyProfile(): Promise<UserProfile | null>;
    getProfile(principal: Principal): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listConversations(): Promise<Array<Principal>>;
    saveCallerUserProfile(displayName: string, bio: string, contactInfo: string | null, mobileNumber: string | null): Promise<void>;
    sendMessage(recipient: Principal, listingId: ListingId | null, text: string): Promise<void>;
    signUp(displayName: string, mobileNumber: string): Promise<void>;
    updateListing(listingId: ListingId, title: string, description: string, price: bigint, category: AnimalCategory, location: string, photoUrls: Array<string>, isActive: boolean, isVip: boolean): Promise<void>;
    upsertProfile(displayName: string, bio: string, contactInfo: string | null): Promise<void>;
}
