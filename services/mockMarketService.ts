
import { MarketAnchorMetric, MarketMockSeries } from "../types";

const KEYS = {
  ANCHORS: 'AQAR_AI_MARKET_ANCHORS',
  SERIES: 'AQAR_AI_MARKET_SERIES',
  CONFIG: 'AQAR_AI_MARKET_MOCK_CONFIG'
};

// Default public anchors (Calibrated via web search simulation)
const DEFAULT_ANCHORS: MarketAnchorMetric[] = [
  { id: 'anc_1', metricName: 'Riyadh Avg Villa Price', value: 4200, unit: 'SAR/sqm', sourceName: 'SREM Public Dashboard', sourceUrl: 'https://srem.moj.gov.sa', extractedAt: new Date().toISOString() },
  { id: 'anc_2', metricName: 'Riyadh Avg Apt Price', value: 6500, unit: 'SAR/sqm', sourceName: 'CBRE Market Report', sourceUrl: 'https://cbre.sa', extractedAt: new Date().toISOString() },
  { id: 'anc_3', metricName: 'North Riyadh Premium', value: 1.35, unit: 'Multiplier', sourceName: 'Market Analysis', sourceUrl: '', extractedAt: new Date().toISOString() },
  { id: 'anc_4', metricName: 'YoY Growth 2024', value: 8.5, unit: 'Percentage', sourceName: 'GASTAT RPI', sourceUrl: 'https://stats.gov.sa', extractedAt: new Date().toISOString() }
];

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

// Initialize State
let ANCHORS = load<MarketAnchorMetric[]>(KEYS.ANCHORS, DEFAULT_ANCHORS);
let SERIES = load<MarketMockSeries[]>(KEYS.SERIES, []);

// Constants for Generation
const DISTRICTS = [
  { name: 'Al Nakheel', weight: 1.4, type: 'North' },
  { name: 'Al Malqa', weight: 1.3, type: 'North' },
  { name: 'Al Narjis', weight: 1.1, type: 'North' },
  { name: 'Al Yasmin', weight: 1.15, type: 'North' },
  { name: 'Al Hamra', weight: 0.95, type: 'East' },
  { name: 'Al Olaya', weight: 1.25, type: 'Central' },
  { name: 'Labn', weight: 0.7, type: 'West' }
];

export const MockMarketService = {
  getAnchors: () => ANCHORS,
  
  getSeries: () => SERIES,

  // Generate 12 months of synthetic data based on anchors
  generateMockData: async () => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newSeries: MarketMockSeries[] = [];
    const now = new Date();
    
    // Base Values from Anchors
    const villaBase = ANCHORS.find(a => a.metricName.includes('Villa'))?.value || 4000;
    const aptBase = ANCHORS.find(a => a.metricName.includes('Apt'))?.value || 6000;
    const growthRate = (ANCHORS.find(a => a.metricName.includes('Growth'))?.value || 5) / 100;

    DISTRICTS.forEach(dist => {
      // Generate for last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Time factor (linear growth + seasonality noise)
        const timeFactor = 1 + (growthRate * ((12 - i) / 12)); 
        const seasonality = 1 + (Math.sin(i) * 0.02); // +/- 2% seasonal wobble
        const noise = 1 + ((Math.random() * 0.06) - 0.03); // +/- 3% random noise

        // Villa Data
        newSeries.push({
          id: `mock_v_${dist.name}_${period}`,
          city: 'Riyadh',
          district: dist.name,
          propertyType: 'Villa',
          period,
          avgPriceSqm: Math.floor(villaBase * dist.weight * timeFactor * seasonality * noise),
          txCount: Math.floor(15 + (Math.random() * 20 * dist.weight)),
          txValue: 0, // Calculated below
          isMock: true
        });

        // Apt Data
        newSeries.push({
          id: `mock_a_${dist.name}_${period}`,
          city: 'Riyadh',
          district: dist.name,
          propertyType: 'Apartment',
          period,
          avgPriceSqm: Math.floor(aptBase * dist.weight * timeFactor * seasonality * noise),
          txCount: Math.floor(30 + (Math.random() * 40 * dist.weight)),
          txValue: 0,
          isMock: true
        });
      }
    });

    // Calculate derived volumes
    newSeries.forEach(s => {
      const avgArea = s.propertyType === 'Villa' ? 350 : 150;
      s.txValue = s.txCount * avgArea * s.avgPriceSqm;
    });

    SERIES = newSeries;
    save(KEYS.SERIES, SERIES);
    return SERIES.length;
  },

  recalibrate: () => {
    // Reset anchors to default (simulating a fresh scrape)
    ANCHORS = DEFAULT_ANCHORS.map(a => ({...a, extractedAt: new Date().toISOString()}));
    save(KEYS.ANCHORS, ANCHORS);
    return MockMarketService.generateMockData();
  },

  reset: () => {
    SERIES = [];
    save(KEYS.SERIES, []);
  },

  // Helpers for Consumption
  getDistrictLatest: (district: string) => {
    const distSeries = SERIES.filter(s => s.district === district);
    if (distSeries.length === 0) return null;
    
    // Sort by period desc
    distSeries.sort((a, b) => b.period.localeCompare(a.period));
    return distSeries[0]; // Latest
  },

  getAllLatest: () => {
    const latestMap = new Map<string, MarketMockSeries>();
    SERIES.forEach(s => {
      // Key by district+type to ensure we get latest for each
      const key = `${s.district}_${s.propertyType}`;
      if (!latestMap.has(key) || s.period > latestMap.get(key)!.period) {
        latestMap.set(key, s);
      }
    });
    return Array.from(latestMap.values());
  }
};
