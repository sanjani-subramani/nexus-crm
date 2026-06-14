import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import Leads from './pages/Leads'
import Dialer from './pages/Dialer'
import Supervisor from './pages/Supervisor'
import AIFeatures from './pages/AIFeatures'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="leads" element={<Leads />} />
        <Route path="dialer" element={<Dialer />} />
        <Route path="supervisor" element={<Supervisor />} />
        <Route path="ai" element={<AIFeatures />} />
      </Route>
    </Routes>
  )
}
