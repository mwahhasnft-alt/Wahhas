
import { IngestedListing, Property, ScrapeJob, ScrapeLog, ScrapeSource } from "../types";
import { PropertyService } from "./propertyService";

// --- Persistence Keys ---
const KEYS = {
  SOURCES: 'AQAR_AI_SOURCES',
  JOBS: 'AQAR_AI_JOBS',
  INGESTED: 'AQAR_AI_INGESTED',
  LOGS: 'AQAR_AI_LOGS'
};

// --- Initial Mock Data ---
const MOCK_SOURCES: ScrapeSource[] = [
  {
    id: 'src_1',
    name: 'KSA Real Estate Hub',
    baseUrl: 'https://example-realestate.sa',
    allowedDomains: ['example-realestate.sa'],
    robotsRespect: true,
    renderJs: true,
    rateLimitPerMin: 60,
    status: 'active',
    lastCrawl: new Date(Date.now() - 86400000),
    selectors: {
        container: '.listing-card',
        title: 'h2.title',
        price: '.price-tag',
        location: '.location-badge',
        type: '.property-type',
        specs: '.specs-list',
        images: 'img.gallery-item',
        link: 'a.details-link',
        nextPage: '.pagination-next'
    },
    notes: 'Major source for Riyadh villas'
  },
  {
    id: 'src_2',
    name: 'Jeddah Listings Direct',
    baseUrl: 'https://jeddah-homes.com',
    allowedDomains: ['jeddah-homes.com'],
    robotsRespect: true,
    renderJs: false,
    rateLimitPerMin: 30,
    status: 'error',
    lastCrawl: new Date(Date.now() - 172800000),
    selectors: {
        container: 'article.property',
        title: '.prop-header',
        price: '.amount',
        location: '.city-name',
        type: '.category',
        specs: '.features',
        images: '.slider img',
        link: 'a.read-more'
    },
    notes: 'Frequent 403 errors recently'
  }
];

const MOCK_JOBS: ScrapeJob[] = [
  {
    id: 'job_1',
    sourceId: 'src_1',
    name: 'Daily Riyadh Villas',
    mode: 'list',
    schedule: 'daily',
    status: 'idle',
    lastRun: new Date(Date.now() - 3600000),
    metrics: { pagesFetched: 150, successRate: 98, listingsExtracted: 12 }
  }
];

const MOCK_INGESTED: IngestedListing[] = [
  {
    id: 'ing_1',
    sourceId: 'src_1',
    status: 'draft',
    fetchedAt: new Date(),
    extractedData: {
      title: "Spacious Villa in Al Malqa",
      price: 3500000,
      type: "Villa",
      listingType: "Buy",
      city: "Riyadh",
      district: "Al Malqa",
      beds: 5,
      baths: 4,
      area: 400,
      highlights: ["New", "Corner"],
      images: ["https://images.unsplash.com/photo-1600596542815-22b5d7200ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    }
  }
];

// --- Helpers ---
const load = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return fallback;
  }
};

const save = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mutable State ---
let SOURCES = load<ScrapeSource[]>(KEYS.SOURCES, MOCK_SOURCES);
let JOBS = load<ScrapeJob[]>(KEYS.JOBS, MOCK_JOBS);
let INGESTED_LISTINGS = load<IngestedListing[]>(KEYS.INGESTED, MOCK_INGESTED);
let LOGS = load<ScrapeLog[]>(KEYS.LOGS, []);

// --- Service Methods ---

export const AdminService = {
  // Sources
  getSources: () => Promise.resolve([...SOURCES]),
  addSource: (source: ScrapeSource) => {
    SOURCES.push(source);
    save(KEYS.SOURCES, SOURCES);
    return Promise.resolve(source);
  },
  deleteSource: (id: string) => {
    SOURCES = SOURCES.filter(s => s.id !== id);
    save(KEYS.SOURCES, SOURCES);
    return Promise.resolve();
  },

  // Jobs
  getJobs: () => Promise.resolve([...JOBS]),
  addJob: (job: ScrapeJob) => {
    JOBS.push(job);
    save(KEYS.JOBS, JOBS);
    return Promise.resolve(job);
  },
  
  // Real-time Simulation Engine
  runJob: async (jobId: string, isDryRun: boolean = false) => {
    const jobIndex = JOBS.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return [];
    
    const job = JOBS[jobIndex];
    const source = SOURCES.find(s => s.id === job.sourceId);
    if (!source) return [];

    // Helper to log
    const log = (msg: string, level: 'info' | 'warning' | 'error' = 'info') => {
        const l: ScrapeLog = { id: Date.now().toString() + Math.random(), jobId, timestamp: new Date(), level, message: msg };
        LOGS.unshift(l);
        save(KEYS.LOGS, LOGS);
    };

    try {
        // 1. Start
        if (!isDryRun) {
            job.status = 'running';
            save(KEYS.JOBS, JOBS);
            log(`Starting job: ${job.name} (Mode: ${job.mode})`);
        }

        await delay(800);

        // 2. Browser Init
        log(`Initializing headless browser engine... RenderJS: ${source.renderJs}`);
        await delay(1200);

        // 3. Connect to Source
        log(`Connecting to ${source.baseUrl}...`);
        await delay(1000);
        log(`Connection successful. Status 200 OK.`, 'info');
        
        // 4. Extraction Simulation
        const generatedListings: IngestedListing[] = [];
        const count = isDryRun ? 2 : Math.floor(Math.random() * 4) + 1;

        for (let i = 0; i < count; i++) {
            await delay(500);
            log(`Parsing page ${i+1}... Found candidate container: ${source.selectors.container}`);
            
            // Generate Realistic Data
            const isVilla = Math.random() > 0.4;
            const price = isVilla ? 2500000 + (Math.floor(Math.random() * 2000000)) : 45000 + (Math.floor(Math.random() * 50000));
            const districts = ['Al Malqa', 'Al Narjis', 'Hittin', 'Al Yasmin', 'Al Olaya'];
            const district = districts[Math.floor(Math.random() * districts.length)];
            
            const listingData: Partial<Property> = {
                title: `${isVilla ? 'Modern Villa' : 'Luxury Apartment'} in ${district} - Ref ${Math.floor(Math.random() * 999)}`,
                price: price,
                type: isVilla ? "Villa" : "Apartment",
                listingType: isVilla ? "Buy" : "Rent",
                city: "Riyadh",
                district: district,
                beds: isVilla ? 5 : 2,
                baths: isVilla ? 6 : 2,
                area: isVilla ? 450 : 130,
                highlights: ["Scraped", source.renderJs ? "JS-Rendered" : "Static HTML", "Fresh Listing"],
                images: [isVilla 
                    ? "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
                    : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
                ]
            };

            // Duplication Check against Main DB
            const isDup = PropertyService.getAll().some(p => p.price === price && p.district === district);
            const status = isDup ? 'duplicate' : 'draft';
            const validationErrors = isDup ? ['Potential duplicate found in active database'] : [];

            if (isDup) log(`Duplicate detected: ${listingData.title}`, 'warning');
            else log(`Extracted: ${listingData.title} | ${price} SAR`, 'info');

            generatedListings.push({
                id: `ing_${Date.now()}_${i}`,
                sourceId: source.id,
                status: status,
                fetchedAt: new Date(),
                extractedData: listingData,
                validationErrors
            });
        }

        // 5. Save Results
        if (!isDryRun) {
            INGESTED_LISTINGS.unshift(...generatedListings);
            save(KEYS.INGESTED, INGESTED_LISTINGS);
            
            job.status = 'completed';
            job.lastRun = new Date();
            job.metrics.listingsExtracted += count;
            job.metrics.pagesFetched += (count * 2); 
            job.metrics.successRate = 99;
            save(KEYS.JOBS, JOBS);
            
            log(`Job finished successfully. ${count} listings added to review queue.`);
        } else {
            log(`Dry run finished. ${count} listings generated (not saved).`);
        }

        return generatedListings;

    } catch (e: any) {
        log(`Job failed: ${e.message}`, 'error');
        job.status = 'failed';
        save(KEYS.JOBS, JOBS);
        return [];
    }
  },

  testScrape: (sourceId: string, url: string) => {
      return new Promise<{success: boolean, preview: any}>((resolve) => {
          setTimeout(() => {
              resolve({
                  success: true,
                  preview: {
                      title: "Sample Property Title (Extracted)",
                      price: "4,500,000",
                      location: "Riyadh, Saudi Arabia",
                      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"]
                  }
              });
          }, 1500);
      });
  },

  importListings: (rawListings: any[]) => {
    const newListings: IngestedListing[] = rawListings.map(data => ({
        id: `ing_imp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sourceId: 'manual_upload',
        status: 'draft',
        fetchedAt: new Date(),
        extractedData: {
            title: data.title || "Untitled Import",
            price: Number(data.price) || 0,
            type: data.type || 'Apartment',
            listingType: data.listingType || 'Rent',
            city: data.city || 'Riyadh',
            district: data.district || '',
            beds: Number(data.beds),
            baths: Number(data.baths),
            area: Number(data.area),
            highlights: Array.isArray(data.highlights) ? data.highlights : (data.highlights ? String(data.highlights).split(',') : []),
            images: Array.isArray(data.images) ? data.images : (data.images ? [String(data.images)] : [])
        }
    }));
    
    INGESTED_LISTINGS.unshift(...newListings);
    save(KEYS.INGESTED, INGESTED_LISTINGS);
    return Promise.resolve(newListings.length);
  },

  getIngestedListings: () => Promise.resolve([...INGESTED_LISTINGS]),

  // Approve Logic: Promotes to Production DB
  approveListing: (id: string) => {
    const idx = INGESTED_LISTINGS.findIndex(i => i.id === id);
    if (idx !== -1) {
      const item = INGESTED_LISTINGS[idx];
      item.status = 'approved';
      save(KEYS.INGESTED, INGESTED_LISTINGS);
      
      const newProperty: Property = {
        id: `PROP-${item.id.split('_')[1]}-${Math.floor(Math.random()*1000)}`,
        title: item.extractedData.title || "Untitled",
        price: item.extractedData.price || 0,
        type: (item.extractedData.type as any) || 'Apartment',
        listingType: (item.extractedData.listingType as any) || 'Rent',
        city: item.extractedData.city || 'Riyadh',
        district: item.extractedData.district || 'Unknown',
        beds: item.extractedData.beds,
        baths: item.extractedData.baths,
        area: item.extractedData.area || 100,
        highlights: item.extractedData.highlights || [],
        images: item.extractedData.images || []
      };

      PropertyService.add(newProperty);
      
      const log: ScrapeLog = { id: Date.now().toString(), jobId: 'manual_review', timestamp: new Date(), level: 'info', message: `Listing ${id} approved and published.` };
      LOGS.unshift(log);
      save(KEYS.LOGS, LOGS);
    }
    return Promise.resolve();
  },
  
  approveAllListings: async () => {
    let count = 0;
    // We iterate a copy to avoid index issues
    const pendings = INGESTED_LISTINGS.filter(i => i.status === 'draft');
    
    for (const item of pendings) {
        await AdminService.approveListing(item.id);
        count++;
    }
    return count;
  },

  rejectListing: (id: string) => {
    const idx = INGESTED_LISTINGS.findIndex(i => i.id === id);
    if (idx !== -1) {
      INGESTED_LISTINGS[idx].status = 'rejected';
      save(KEYS.INGESTED, INGESTED_LISTINGS);
    }
    return Promise.resolve();
  },

  getLogs: () => Promise.resolve([...LOGS])
};
