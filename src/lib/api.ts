const API_BASE = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  leads: {
    list: (params?: Record<string, string>) =>
      request<{ leads: any[]; total: number }>(`/leads?${new URLSearchParams(params || {})}`),
    get: (id: string) => request<any>(`/leads/${id}`),
    create: (data: any) => request<any>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/leads/${id}`, { method: 'DELETE' }),
  },
  policies: {
    list: (params?: Record<string, string>) =>
      request<{ policies: any[]; total: number }>(`/policies?${new URLSearchParams(params || {})}`),
    get: (id: string) => request<any>(`/policies/${id}`),
  },
  assessment: {
    submit: (data: any) => request<{ lead: any; recommendations: any[] }>('/assessment', { method: 'POST', body: JSON.stringify(data) }),
  },
  calculator: {
    calculate: (data: any) => request<any>('/calculator', { method: 'POST', body: JSON.stringify(data) }),
  },
  ai: {
    recommend: (data: any) => request<any>('/ai/recommend', { method: 'POST', body: JSON.stringify(data) }),
  },
  analytics: {
    dashboard: () => request<any>('/analytics/dashboard'),
    conversionFunnel: () => request<any>('/analytics/funnel'),
    revenue: (params?: Record<string, string>) =>
      request<any>(`/analytics/revenue?${new URLSearchParams(params || {})}`),
    leadsBySource: () => request<any>('/analytics/leads-by-source'),
    leadsBySector: () => request<any>('/analytics/leads-by-sector'),
  },
  followUps: {
    list: (params?: Record<string, string>) =>
      request<{ followUps: any[] }>(`/follow-ups?${new URLSearchParams(params || {})}`),
    create: (data: any) => request<any>('/follow-ups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/follow-ups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  communications: {
    list: (leadId: string) => request<{ communications: any[] }>(`/communications?leadId=${leadId}`),
    send: (data: any) => request<any>('/communications', { method: 'POST', body: JSON.stringify(data) }),
  },
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request<any>('/auth/me'),
  },
}
