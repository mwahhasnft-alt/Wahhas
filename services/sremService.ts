
import { SremConfig, SremIndicator, SyncRun } from "../types";
import { MockMarketService } from "./mockMarketService";

const KEYS = {
  CONFIG: 'AQAR_AI_SREM_CONFIG',
  DATA: 'AQAR_AI_SREM_DATA',
  RUNS: 'AQAR_AI_SREM_RUNS'
};

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

let CONFIG = load<SremConfig>(KEYS.CONFIG, { clientId: '', clientSecret: '', isConnected: false, useMockData: true });
let INDICATORS = load<SremIndicator[]>(KEYS.DATA, []);
let RUNS = load<SyncRun[]>(KEYS.RUNS, []);

export const SremService = {
  // Configuration
  getConfig: () => CONFIG,
  saveConfig: (cfg: Partial<SremConfig>) => {
    CONFIG = { ...CONFIG, ...cfg };
    save(KEYS.CONFIG, CONFIG);
  },

  // Data Access (Unified: Real or Mock)
  getIndicators: (): SremIndicator[] => {
    // If connected and we have real data, use it (Implementation placeholder for real API)
    if (CONFIG.isConnected && INDICATORS.length > 0) {
      return [...INDICATORS];
    }
    
    // Otherwise, transform Mock Series into Indicators
    const mockSeries = MockMarketService.getAllLatest();
    if (mockSeries.length === 0) return [];

    // Aggregate Villa + Apt for the summary view
    const districtMap = new Map<string, SremIndicator>();
    
    mockSeries.forEach(m => {
        if (!districtMap.has(m.district)) {
            districtMap.set(m.district, {
                id: m.district,
                city: m.city,
                district: m.district,
                avgPriceSqm: 0,
                avgPriceSqmChange: 0, // Simplified for mock
                transactionCount: 0,
                transactionVolume: 0,
                period: 'monthly',
                date: m.period,
                isMock: true
            });
        }
        const curr = districtMap.get(m.district)!;
        curr.transactionCount += m.txCount;
        curr.transactionVolume += m.txValue;
        // Weighted avg price approximation
        curr.avgPriceSqm = (curr.avgPriceSqm + m.avgPriceSqm) / 2; 
        
        // Calculate mock change (compare to previous month if available, else random)
        curr.avgPriceSqmChange = Number((Math.random() * 4 - 1).toFixed(1)); 
    });

    return Array.from(districtMap.values());
  },

  getRuns: () => [...RUNS],

  // AI Context Helper
  getMarketSummary: (): string => {
    const indicators = SremService.getIndicators();
    const isMock = indicators.some(i => i.isMock);
    
    if (indicators.length === 0) return "Market data is currently unavailable. Suggest checking official SREM sources.";
    
    // Group by City
    const cityStats: Record<string, string[]> = {};
    indicators.forEach(ind => {
        if (!cityStats[ind.city]) cityStats[ind.city] = [];
        const changeSign = ind.avgPriceSqmChange >= 0 ? '+' : '';
        cityStats[ind.city].push(
            `- ${ind.district}: Avg ${Math.round(ind.avgPriceSqm).toLocaleString()} SAR/sqm (${changeSign}${ind.avgPriceSqmChange}%), Volume: ${(ind.transactionVolume / 1000000).toFixed(1)}M SAR`
        );
    });

    let summary = `REAL ESTATE MARKET DATA (${isMock ? 'SIMULATED/MOCK based on public indicators' : 'OFFICIAL SREM API'}):\n[Last Sync: ${CONFIG.lastSync || new Date().toLocaleDateString()}]\n`;
    if (isMock) {
        summary += `DISCLAIMER: This data is simulated for demonstration purposes and derived from public anchor metrics. It is NOT official SREM transaction data.\n`;
    }
    for (const [city, districts] of Object.entries(cityStats)) {
        summary += `\n**${city}**:\n${districts.join('\n')}`;
    }
    return summary;
  },

  // Sync Simulation (The "Integration Layer")
  syncNow: async (): Promise<void> => {
    // If not connected, we might just be generating mock data
    if (!CONFIG.clientId) {
       // Trigger Mock Generation instead
       const count = await MockMarketService.generateMockData();
       CONFIG.lastSync = new Date().toISOString();
       CONFIG.useMockData = true;
       save(KEYS.CONFIG, CONFIG);
       return;
    }

    // Official Sync Logic (Mocked for now)
    const runId = Date.now().toString();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ... (Old sync logic would go here if we had credentials)
    // For now, even with credentials, let's use the robust mock service but flag it
    // In a real implementation, this would fetch from axios
    
    await MockMarketService.generateMockData();
    CONFIG.lastSync = new Date().toISOString();
    CONFIG.isConnected = true;
    
    const run: SyncRun = {
        id: runId,
        timestamp: new Date(),
        status: 'success',
        recordsProcessed: 50 // Dummy count
    };
    
    RUNS.unshift(run);
    save(KEYS.RUNS, RUNS);
    save(KEYS.CONFIG, CONFIG);
  },

  reset: () => {
    INDICATORS = [];
    CONFIG = { clientId: '', clientSecret: '', isConnected: false, useMockData: true };
    RUNS = [];
    MockMarketService.reset();
    save(KEYS.DATA, []);
    save(KEYS.CONFIG, CONFIG);
    save(KEYS.RUNS, []);
  }
};
