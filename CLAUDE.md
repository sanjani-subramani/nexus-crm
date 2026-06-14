# Nexus CRM — Project Context

AI-powered contact-centre CRM. An evolved, fully-functional version of a chit-fund lead-management CRM.

## Stack
- Backend: FastAPI + SQLAlchemy 2.0 + SQLite (in /backend), runs on port 8000
- Frontend: React + Vite + Tailwind CSS v4 (in /frontend), runs on port 5173
- DB file: backend/nexus.db

## Data Models (backend/models.py)
- Agent: id, name, email, role (agent/supervisor), employee_code, zone, subzone, branch, route, is_online, on_break
- Campaign: id, name, category, priority, logo, created_date
- Lead: id, customer_name, contact_number, address, email, campaign_id, agent_id, status (unallocated/active/converted/void/inactive), temperature (hot/warm/cold), product, branch, zone, leads_generated_by, attempt_count, next_followup_date, created_at
- Disposition: id, lead_id, agent_id, call_connected, outcome, temperature, product, reason, notes, call_duration, recording_url, created_at

## Conventions
- All API routes prefixed with /api
- Use Pydantic schemas for request/response
- Keep code clean and commented for a learning developer
- Backend run command: uvicorn main:app --reload (from /backend with venv active)

## Lead Lifecycle
unallocated -> active (assigned) -> converted OR void (3 failed attempts) -> inactive (3 months in void)
