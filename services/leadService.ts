
import { Lead } from '../types';

// Mock Leads for Agent Mode
const MOCK_LEADS: Lead[] = [
  {
    id: 'lead_1',
    name: 'Ahmed Al-Fahad',
    phone: '+966 55 123 4567',
    status: 'New',
    interest: 'Buying Villa in Al Malqa',
    budget: 4500000,
    lastContact: new Date(Date.now() - 86400000 * 1), // 1 day ago
    notes: 'Interested in modern finish, needs corner plot.'
  },
  {
    id: 'lead_2',
    name: 'Sarah Johnson',
    phone: '+966 50 987 6543',
    status: 'Viewing',
    interest: 'Renting Apartment in KAFD',
    budget: 120000,
    lastContact: new Date(Date.now() - 86400000 * 2),
    notes: 'Viewing scheduled for Thursday. Likes high floors.'
  },
  {
    id: 'lead_3',
    name: 'Mohammed Al-Otaibi',
    phone: '+966 54 555 1212',
    status: 'Negotiation',
    interest: 'Buying Land in Hittin',
    budget: 8000000,
    lastContact: new Date(Date.now() - 86400000 * 5),
    notes: 'Offer pending. Discussing payment terms.'
  }
];

const STORAGE_KEY = 'AQAR_AI_LEADS_DB';

const loadFromStorage = (): Lead[] => {
  if (typeof window === 'undefined') return [...MOCK_LEADS];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [...MOCK_LEADS];
  } catch (error) {
    return [...MOCK_LEADS];
  }
};

const saveToStorage = (data: Lead[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

let leads: Lead[] = loadFromStorage();

export const LeadService = {
  getAll: () => [...leads],
  
  add: (lead: Omit<Lead, 'id' | 'lastContact'>) => {
    const newLead: Lead = {
        ...lead,
        id: `lead_${Date.now()}`,
        lastContact: new Date()
    };
    leads.unshift(newLead);
    saveToStorage(leads);
    return newLead;
  },

  updateStatus: (id: string, status: Lead['status']) => {
    const idx = leads.findIndex(l => l.id === id);
    if (idx !== -1) {
        leads[idx].status = status;
        leads[idx].lastContact = new Date();
        saveToStorage(leads);
    }
  },

  reset: () => {
      leads = [...MOCK_LEADS];
      saveToStorage(leads);
  }
};
