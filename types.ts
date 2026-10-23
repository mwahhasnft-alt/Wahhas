
export interface Property {
  id: string;
  title: string;
  titleAr?: string; // Arabic Title
  price: number;
  type: 'Villa' | 'Apartment' | 'Land' | 'Townhouse' | 'Office';
  listingType: 'Buy' | 'Rent';
  city: string;
  cityAr?: string; // Arabic City
  district: string;
  districtAr?: string; // Arabic District
  beds?: number;
  baths?: number;
  area: number;
  highlights: string[];
  highlightsAr?: string[]; // Arabic Highlights
  images?: string[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Viewing' | 'Negotiation' | 'Closed' | 'Lost';
  interest: string; // e.g. "Buying Villa in Al Malqa"
  budget: number;
  lastContact: Date;
  notes: string;
}

export interface GroundingSource {
  title: string;
  url: string;
  type?: 'web' | 'maps' | 'science';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string; // Base64 Data URI
  timestamp: Date;
  isStreaming?: boolean;
  groundingSources?: GroundingSource[];
  scienceData?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export type Lang = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export type ModalType = 'settings' | 'profile' | 'properties' | 'property_details' | 'data_control' | 'market_insights' | 'compare' | 'science' | null;

// Expanded Roles
export type UserRole = 'buyer' | 'seller' | 'investor' | 'agent' | 'guest' | 'admin';

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  isFirebaseUser?: boolean;
}

export type ChatMode = 'smart' | 'fast' | 'thinking' | 'search' | 'maps' | 'science';

// --- Cloud & Sync Types ---
export interface CloudConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    isConnected: boolean;
}

// --- Scraping & Ingestion Types ---

export interface ScrapeSelectors {
  container: string;
  title: string;
  price: string;
  location: string;
  type: string;
  specs: string; // Combined beds/baths/area if generic, or specific fields
  images: string;
  link: string;
  nextPage?: string;
}

export interface ScrapeSource {
  id: string;
  name: string;
  baseUrl: string;
  allowedDomains: string[];
  robotsRespect: boolean;
  renderJs: boolean; // Enterprise: Support SPA/React sites
  rateLimitPerMin: number;
  selectors: ScrapeSelectors;
  lastCrawl?: Date;
  status: 'active' | 'error' | 'blocked';
  notes?: string;
}

export interface ScrapeJob {
  id: string;
  sourceId: string;
  name: string;
  mode: 'single' | 'list' | 'sitemap';
  schedule: 'manual' | 'daily' | 'weekly';
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  lastRun?: Date;
  metrics: {
    pagesFetched: number;
    successRate: number;
    listingsExtracted: number;
  };
}

export interface IngestedListing {
  id: string; // temp id
  sourceId: string;
  rawHtml?: string;
  extractedData: Partial<Property>;
  status: 'draft' | 'approved' | 'rejected' | 'duplicate';
  fetchedAt: Date;
  validationErrors?: string[];
}

export interface ScrapeLog {
  id: string;
  jobId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
}

// --- SREM / Market Data Types ---

export interface SremIndicator {
  id: string;
  city: string;
  district: string;
  avgPriceSqm: number;
  avgPriceSqmChange: number; // Percentage change
  transactionCount: number;
  transactionVolume: number;
  period: 'daily' | 'weekly' | 'monthly';
  date: string; // ISO Date
  isMock?: boolean;
}

export interface SremConfig {
  clientId: string;
  clientSecret: string; // In real app, never store secret in client
  isConnected: boolean;
  lastSync?: string;
  useMockData: boolean;
}

export interface SyncRun {
  id: string;
  timestamp: Date;
  status: 'success' | 'failed';
  recordsProcessed: number;
  error?: string;
}

// Mock Analytics Specifics
export interface MarketAnchorMetric {
  id: string;
  metricName: string; // e.g. "Riyadh Villa Avg Price"
  value: number;
  unit: string;
  sourceName: string;
  sourceUrl: string;
  extractedAt: string;
}

export interface MarketMockSeries {
  id: string;
  city: string;
  district: string;
  propertyType: string;
  period: string; // YYYY-MM
  avgPriceSqm: number;
  txCount: number;
  txValue: number;
  isMock: boolean;
}
