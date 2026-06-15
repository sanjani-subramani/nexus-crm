from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Agent, Campaign, Disposition, Lead
from schemas import (
    AllocateLeadRequest,
    CampaignSchema,
    CreateCampaignRequest,
    CreateDispositionRequest,
    LeadSchema,
    MoveLeadRequest,
    UpdateLeadRequest,
)

router = APIRouter(prefix="/api")


# ── Internal helpers ──────────────────────────────────────────────────────────

def _lead_to_dict(lead: Lead) -> dict:
    """Flatten Lead columns to a plain dict and append relationship names."""
    data = {col.key: getattr(lead, col.key) for col in lead.__mapper__.column_attrs}
    data["campaign_name"] = lead.campaign.name if lead.campaign else None
    data["agent_name"]    = lead.agent.name    if lead.agent    else None
    return data


def _fetch_lead(lead_id: int, db: Session) -> Lead:
    """Load a Lead with campaign and agent eager-loaded, or raise 404."""
    lead = (
        db.query(Lead)
        .options(joinedload(Lead.campaign), joinedload(Lead.agent))
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


# ── POST /api/dispositions ────────────────────────────────────────────────────

@router.post("/dispositions", response_model=LeadSchema, status_code=201)
def create_disposition(body: CreateDispositionRequest, db: Session = Depends(get_db)):
    """
    Log the outcome of a call and apply lead lifecycle transitions.

    Not connected  → increment attempt_count; void lead if count reaches 3.
    Converted      → status='converted'; copy temperature and product to the lead.
    In progress    → status='active'; update temperature and next_followup_date.
    Lost           → status='void'.

    Returns the updated lead (not the disposition record).
    """
    lead = _fetch_lead(body.lead_id, db)

    # Persist the disposition row first
    disp = Disposition(
        lead_id=body.lead_id,
        agent_id=body.agent_id,
        call_connected=body.call_connected,
        outcome=body.outcome,
        temperature=body.temperature,
        product=body.product,
        reason=body.reason,
        notes=body.notes,
        call_duration=body.call_duration or 0,
    )
    db.add(disp)

    # Apply lifecycle rules based on call outcome
    if not body.call_connected:
        lead.attempt_count += 1
        # Three failed attempts → move the lead to void
        if lead.attempt_count >= 3:
            lead.status = "void"
    else:
        if body.outcome == "converted":
            lead.status = "converted"
            if body.temperature:
                lead.temperature = body.temperature
            if body.product:
                lead.product = body.product

        elif body.outcome == "in_progress":
            # Status stays 'active'; refresh temperature and next follow-up
            lead.status = "active"
            if body.temperature:
                lead.temperature = body.temperature
            if body.next_followup_date:
                lead.next_followup_date = body.next_followup_date

        elif body.outcome == "lost":
            lead.status = "void"

    db.commit()

    # Re-fetch so relationships are fresh after the commit
    lead = _fetch_lead(body.lead_id, db)
    return LeadSchema.model_validate(_lead_to_dict(lead))


# ── PATCH /api/leads/{lead_id}/allocate ──────────────────────────────────────

@router.patch("/leads/{lead_id}/allocate", response_model=LeadSchema)
def allocate_lead(lead_id: int, body: AllocateLeadRequest, db: Session = Depends(get_db)):
    """Assign the lead to an agent and mark it 'active'."""
    lead = _fetch_lead(lead_id, db)

    agent = db.query(Agent).filter(Agent.id == body.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    lead.agent_id = body.agent_id
    lead.status   = "active"

    db.commit()
    lead = _fetch_lead(lead_id, db)
    return LeadSchema.model_validate(_lead_to_dict(lead))


# ── PATCH /api/leads/{lead_id}/move ──────────────────────────────────────────

@router.patch("/leads/{lead_id}/move", response_model=LeadSchema)
def move_lead(lead_id: int, body: MoveLeadRequest, db: Session = Depends(get_db)):
    """
    Reassign or unallocate a lead.

    target='unallocated'  → clear agent, set status='unallocated'.
    target='another_user' → assign new agent_id, keep status='active'.
    """
    lead = _fetch_lead(lead_id, db)

    if body.target == "unallocated":
        lead.agent_id = None
        lead.status   = "unallocated"

    elif body.target == "another_user":
        if body.agent_id is None:
            raise HTTPException(
                status_code=422,
                detail="agent_id is required when target is 'another_user'",
            )
        agent = db.query(Agent).filter(Agent.id == body.agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        lead.agent_id = body.agent_id
        lead.status   = "active"

    else:
        raise HTTPException(
            status_code=422,
            detail="target must be 'unallocated' or 'another_user'",
        )

    db.commit()
    lead = _fetch_lead(lead_id, db)
    return LeadSchema.model_validate(_lead_to_dict(lead))


# ── POST /api/campaigns ───────────────────────────────────────────────────────

@router.post("/campaigns", response_model=CampaignSchema, status_code=201)
def create_campaign(body: CreateCampaignRequest, db: Session = Depends(get_db)):
    """Create a new campaign. Returns the created campaign (without lead counts)."""
    campaign = Campaign(
        name=body.name,
        category=body.category,
        priority=body.priority,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return CampaignSchema.model_validate(campaign)


# ── PATCH /api/leads/{lead_id} ────────────────────────────────────────────────

@router.patch("/leads/{lead_id}", response_model=LeadSchema)
def update_lead(lead_id: int, body: UpdateLeadRequest, db: Session = Depends(get_db)):
    """
    Partial update — only fields present in the request body are written.
    Supports: customer_name, contact_number, email, address, temperature, product.
    """
    lead = _fetch_lead(lead_id, db)

    # model_dump(exclude_unset=True) only yields keys the caller actually sent,
    # so omitted fields are not overwritten (true partial-update semantics).
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=422, detail="No updatable fields provided")

    for field, value in updates.items():
        setattr(lead, field, value)

    db.commit()
    lead = _fetch_lead(lead_id, db)
    return LeadSchema.model_validate(_lead_to_dict(lead))
