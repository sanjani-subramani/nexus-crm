from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload

from database import get_db
from models import Agent, Campaign, Disposition, Lead
from schemas import (
    AgentSchema,
    CampaignWithCountsSchema,
    DashboardStatsSchema,
    DispositionSchema,
    LeadSchema,
    LeadWithDispositionsSchema,
)

router = APIRouter(prefix="/api")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _lead_to_dict(lead: Lead) -> dict:
    """Flatten a Lead ORM object's columns into a plain dict and add
    campaign_name / agent_name from the already-loaded relationships."""
    data = {col.key: getattr(lead, col.key) for col in lead.__mapper__.column_attrs}
    data["campaign_name"] = lead.campaign.name if lead.campaign else None
    data["agent_name"] = lead.agent.name if lead.agent else None
    return data


# ── Agents ────────────────────────────────────────────────────────────────────

@router.get("/agents", response_model=list[AgentSchema])
def list_agents(db: Session = Depends(get_db)):
    """Return all agents."""
    return db.query(Agent).all()


@router.get("/agents/{agent_id}", response_model=AgentSchema)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """Return a single agent by ID."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


# ── Campaigns ─────────────────────────────────────────────────────────────────

@router.get("/campaigns", response_model=list[CampaignWithCountsSchema])
def list_campaigns(db: Session = Depends(get_db)):
    """Return all campaigns with per-status lead counts."""
    campaigns = db.query(Campaign).all()

    # Single query: (campaign_id, status, count) for every status bucket
    raw_counts = (
        db.query(Lead.campaign_id, Lead.status, func.count(Lead.id))
        .group_by(Lead.campaign_id, Lead.status)
        .all()
    )

    # Reshape into {campaign_id: {status: count}}
    count_map: dict[int, dict[str, int]] = {}
    for campaign_id, status, n in raw_counts:
        count_map.setdefault(campaign_id, {})[status] = n

    result = []
    for c in campaigns:
        sc = count_map.get(c.id, {})
        result.append(CampaignWithCountsSchema(
            id=c.id,
            name=c.name,
            category=c.category,
            priority=c.priority,
            logo=c.logo,
            created_date=c.created_date,
            total_leads=sum(sc.values()),
            unallocated=sc.get("unallocated", 0),
            active=sc.get("active", 0),
            converted=sc.get("converted", 0),
            void=sc.get("void", 0),
            inactive=sc.get("inactive", 0),
        ))
    return result


# ── Leads ─────────────────────────────────────────────────────────────────────

@router.get("/leads", response_model=list[LeadSchema])
def list_leads(
    campaign_id: Optional[int] = None,
    agent_id: Optional[int] = None,
    status: Optional[str] = None,
    temperature: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return leads with optional query filters: campaign_id, agent_id, status, temperature."""
    q = db.query(Lead).options(
        joinedload(Lead.campaign),
        joinedload(Lead.agent),
    )
    if campaign_id is not None:
        q = q.filter(Lead.campaign_id == campaign_id)
    if agent_id is not None:
        q = q.filter(Lead.agent_id == agent_id)
    if status:
        q = q.filter(Lead.status == status)
    if temperature:
        q = q.filter(Lead.temperature == temperature)

    return [LeadSchema.model_validate(_lead_to_dict(lead)) for lead in q.all()]


@router.get("/leads/{lead_id}", response_model=LeadWithDispositionsSchema)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """Return a single lead with its full disposition history."""
    lead = (
        db.query(Lead)
        .options(
            joinedload(Lead.campaign),
            joinedload(Lead.agent),
            selectinload(Lead.dispositions),
        )
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    data = _lead_to_dict(lead)
    data["dispositions"] = lead.dispositions
    return LeadWithDispositionsSchema.model_validate(data)


# ── Dispositions ──────────────────────────────────────────────────────────────

@router.get("/dispositions", response_model=list[DispositionSchema])
def list_dispositions(
    lead_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Return dispositions ordered newest-first, optionally filtered by lead_id."""
    q = db.query(Disposition)
    if lead_id is not None:
        q = q.filter(Disposition.lead_id == lead_id)
    return q.order_by(Disposition.created_at.desc()).all()


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard/stats", response_model=DashboardStatsSchema)
def dashboard_stats(db: Session = Depends(get_db)):
    """Aggregated counts for dashboard summary cards."""
    # Lead counts grouped by status in one query
    raw = db.query(Lead.status, func.count(Lead.id)).group_by(Lead.status).all()
    counts = {status: n for status, n in raw}

    return DashboardStatsSchema(
        total_leads=sum(counts.values()),
        unallocated=counts.get("unallocated", 0),
        active=counts.get("active", 0),
        converted=counts.get("converted", 0),
        void=counts.get("void", 0),
        inactive=counts.get("inactive", 0),
        total_agents=db.query(func.count(Agent.id)).scalar(),
        online_agents=db.query(func.count(Agent.id)).filter(Agent.is_online.is_(True)).scalar(),
        total_campaigns=db.query(func.count(Campaign.id)).scalar(),
    )
