import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

export const getDashboardStats = () =>
  api.get('/api/dashboard/stats').then(r => r.data)

export const getCampaigns = () =>
  api.get('/api/campaigns').then(r => r.data)

// filters: { campaign_id, agent_id, status, temperature }
export const getLeads = (filters = {}) =>
  api.get('/api/leads', { params: filters }).then(r => r.data)

export const getAgents = () =>
  api.get('/api/agents').then(r => r.data)

export const getLead = (id) =>
  api.get(`/api/leads/${id}`).then(r => r.data)

export const getDispositions = (leadId) =>
  api.get('/api/dispositions', { params: { lead_id: leadId } }).then(r => r.data)

// ── Write endpoints ───────────────────────────────────────────────────────────

export const createDisposition = (data) =>
  api.post('/api/dispositions', data).then(r => r.data)

export const allocateLead = (leadId, agentId) =>
  api.patch(`/api/leads/${leadId}/allocate`, { agent_id: agentId }).then(r => r.data)

export const moveLead = (leadId, agentId, target) =>
  api.patch(`/api/leads/${leadId}/move`, { agent_id: agentId, target }).then(r => r.data)

export const createCampaign = (data) =>
  api.post('/api/campaigns', data).then(r => r.data)

export const updateLead = (leadId, data) =>
  api.patch(`/api/leads/${leadId}`, data).then(r => r.data)

export default api
