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

export default api
