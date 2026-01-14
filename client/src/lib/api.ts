import type {
  Vehicle,
  Filters,
  DealInput,
  RehashResult,
  AnalyzeDealRequest,
  AnalyzeDealResponse,
  TriageRequest,
  TriageResponse,
} from '@salesapexai/shared';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

// Vehicles API
export async function getVehicles(filters: Filters = {}): Promise<Vehicle[]> {
  const params = new URLSearchParams();

  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.minYear) params.set('minYear', String(filters.minYear));
  if (filters.maxYear) params.set('maxYear', String(filters.maxYear));
  if (filters.maxMiles) params.set('maxMiles', String(filters.maxMiles));
  if (filters.minMiles) params.set('minMiles', String(filters.minMiles));
  if (filters.seats) params.set('seats', String(filters.seats));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.search) params.set('search', filters.search);

  filters.make?.forEach(m => params.append('make', m));
  filters.model?.forEach(m => params.append('model', m));
  filters.bodyStyle?.forEach(b => params.append('bodyStyle', b));
  filters.drivetrain?.forEach(d => params.append('drivetrain', d));
  filters.fuel?.forEach(f => params.append('fuel', f));
  filters.transmission?.forEach(t => params.append('transmission', t));
  filters.color?.forEach(c => params.append('color', c));
  filters.features?.forEach(f => params.append('features', f));

  const queryString = params.toString();
  const url = `${API_BASE}/cars${queryString ? `?${queryString}` : ''}`;

  return fetchJson<Vehicle[]>(url);
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return fetchJson<Vehicle>(`${API_BASE}/cars/${id}`);
}

// Rehash API
export async function runRehash(input: DealInput): Promise<RehashResult> {
  return fetchJson<RehashResult>(`${API_BASE}/rehash`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// Analyze Deal API
export async function analyzeDeal(request: AnalyzeDealRequest): Promise<AnalyzeDealResponse> {
  return fetchJson<AnalyzeDealResponse>(`${API_BASE}/analyze-deal`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Triage API
export async function triageDeals(request: TriageRequest): Promise<TriageResponse> {
  return fetchJson<TriageResponse>(`${API_BASE}/triage`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
