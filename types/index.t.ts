export interface MatrixClientType {
  startClient: () => Promise<void>;
  stopClient: () => void;
  getRooms: () => any[];
  sendTextMessage: (roomId: string, text: string) => Promise<any>;
  createRoom: (options: any) => Promise<{ room_id: string }>;
  scrollback: (room: any, limit: number) => Promise<any>;
  logout: () => Promise<void>;
  on: (event: string, callback: Function) => void;
  removeAllListeners: (event?: string) => void;
  getUserId: () => string;
  leave: (roomId: string) => Promise<void>;
}

export type PropertyStatus = "IN_REVIEW" | "APPROVED" | "REJECTED"; // extend as needed
export type MediaType = "PHOTO" | "VIDEO" | "FLOORPLAN"; // extend as needed
export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "FARMHOUSE"
  | "LAND"
  | "COMMERCIAL"; // extend as needed
export type Currency = "HUF" | "EUR" | "USD"; // extend as needed

export interface Property {
  id: string;
  sellerId: string;
  status: PropertyStatus;
  reasonRejection: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  basic: PropertyBasic;
  location: PropertyLocation;
  media: PropertyMedia[];
  seller: SellerDatails[];
}

export interface PropertyBasic {
  exposeId: string;
  propertyType: PropertyType;
  title: string;
  description: string;
  address: string;
  postalCode: string;
  city: string;
  county: string;
  price: number;
  currency: Currency;
  lotSize: number;
  livingArea: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  buildYear: number;
  lastRenovation: string | null; // year or ISO string
}

export interface PropertyLocation {
  exposeId: string;
  latitude: number;
  longitude: number;
}

export interface PropertyMedia {
  id: string;
  exposeId: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl: string;
  uploadedAt: string; // ISO date string
}

export interface SellerDatails{
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

// For your array:
export type PropertyList = Property[];

// filter state
export interface FiltersState {
    location: string;
    beds: string;
    baths: string;
    propertyType: string;
    amenities: string[];
    availableFrom: string;
    priceRange: [number, number] | [null, null];
    squareFeet: [number, number] | [null, null];
    coordinates: [number, number] | [null, null];
  }


  // Types for admin endpoints
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SELLER" | "BUYER" | "ADMIN" | "MODERATOR";
  phone?: string;
  createdAt: string;
  updatedAt: string;
  matrixUserId?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isSellerVerified: boolean;
  avatarUrl?: string;
  exposesCount: number;
}

export interface Seller {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isSellerVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  matrixUserId?: string;
  propertyStats: {
    total: number;
    inReview: number;
    published: number;
    sold: number;
    rejected: number;
  };
  recentProperties: any[];
}

export interface Buyer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  matrixUserId?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SellersResponse {
  sellers: Seller[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BuyersResponse {
  buyers: Buyer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStatsResponse {
  overview: {
    totalUsers: number;
    totalSellers: number;
    totalBuyers: number;
    totalModerators: number;
    totalAdmins: number;
    recentUserCount: number;
  };
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    exposesCount: number;
  }>;
  topSellers: Array<{
    id: string;
    name: string;
    email: string;
    propertiesCount: number;
    isVerified: boolean;
  }>;
  verificationStats: any[];
}

export interface Village {
  id: string;
  name: string;
  county: string;
  population: number;
  description: string;
  latitude: number;
  longitude: number;
  status: "IN_REVIEW" | "PUBLISHED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  infrastructure?: VillageInfrastructure;
  internet?: VillageInternet;
  transport?: VillageTransport;
  community?: VillageCommunity;
  leisure?: VillageLeisure;
  links?: VillageLink[];
  _count?: {
    exposes: number;
  };
}

export interface VillageInfrastructure {
  villageId: string;
  hasGroceryStore: boolean;
  hasSupermarket: boolean;
  supermarketName?: string;
  storeDistanceKm?: number;
  hasWeeklyMarket: boolean;
  hasBaker: boolean;
  hasButcher: boolean;
  hasHouseDoctor: boolean;
  doctorHours?: string;
  doctorGerman: boolean;
  nextSpecialistKm?: number;
  nextHospitalKm?: number;
  hasPharmacy: boolean;
  pharmacyHours?: string;
  hasDentist: boolean;
  dentistGerman: boolean;
  hasPost: boolean;
  hasAtm: boolean;
  hasBank: boolean;
  bankName?: string;
  hasKindergarten: boolean;
  kindergartenInfo?: string;
  hasPrimarySchool: boolean;
  primarySchoolInfo?: string;
  hasSecondarySchool: boolean;
  secondarySchoolInfo?: string;
  restaurantsCount: number;
  restaurantInfo?: string;
}

export interface VillageInternet {
  villageId: string;
  typicalSpeed: number;
  internetTypes: string[];
  mobileCoverage?: string;
}

export interface VillageTransport {
  villageId: string;
  busRoutes: string;
  busFrequency: string;
  trainStation?: string;
  trainDistanceKm?: number;
  motorwayDistanceKm?: number;
}

export interface VillageCommunity {
  villageId: string;
  germanCommunityCount: number;
  associations: string;
  festivals: string;
  atmosphere: string;
}

export interface VillageLeisure {
  villageId: string;
  nearLakes: boolean;
  hikingTrails: boolean;
  bicyclePaths: boolean;
  spaDistanceKm?: number;
  culturalSites: string;
  nearestTownDistanceKm?: number;
}

export interface VillageLink {
  id: string;
  villageId: string;
  linkType: "WEBSITE" | "WIKIPEDIA" | "YOUTUBE" | "OTHER";
  url: string;
}

export interface VillagesResponse {
  villages: Village[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VillageStatsResponse {
  overview: {
    totalVillages: number;
    publishedVillages: number;
    inReviewVillages: number;
    rejectedVillages: number;
    recentVillageCount: number;
    totalPopulation: number;
    averagePopulation: number;
  };
  villagesByCounty: Array<{
    county: string;
    count: number;
  }>;
  topVillages: Array<{
    id: string;
    name: string;
    county: string;
    propertiesCount: number;
    population: number;
  }>;
  recentVillages: Array<{
    id: string;
    name: string;
    county: string;
    status: string;
    propertiesCount: number;
    createdAt: string;
  }>;
}

// ============================================
// CMS CONTENT TYPES
// ============================================

export interface PageSection {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext";
}

export interface PageConfig {
  id: string;
  pageKey: string;
  pageName: string;
  description?: string;
  sections: PageSection[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageContent {
  id: string;
  pageKey: string;
  sectionKey: string;
  language: string;
  content: string;
  updatedBy?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageConfigsResponse {
  pages: PageConfig[];
}

export interface PageContentResponse {
  pageKey: string;
  content: Record<string, Record<string, string>>; // { en: { Hero_h1: "text" }, de: {...} }
  rawContent: PageContent[];
}

export interface ContentStatsResponse {
  overview: {
    totalContent: number;
    totalPages: number;
    languages: string[];
  };
  contentByPage: Array<{
    pageKey: string;
    count: number;
  }>;
  contentByLanguage: Array<{
    language: string;
    count: number;
  }>;
  recentUpdates: Array<{
    pageKey: string;
    sectionKey: string;
    language: string;
    updatedAt: string;
    updatedBy?: string;
  }>;
}
