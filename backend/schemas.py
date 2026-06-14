from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AgentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    employee_code: str
    zone: Optional[str] = None
    subzone: Optional[str] = None
    branch: Optional[str] = None
    route: Optional[str] = None
    is_online: bool
    on_break: bool


class CampaignSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: Optional[str] = None
    priority: str
    logo: Optional[str] = None
    created_date: datetime


class CampaignWithCountsSchema(CampaignSchema):
    """CampaignSchema extended with per-status lead counts."""
    total_leads: int = 0
    unallocated: int = 0
    active: int = 0
    converted: int = 0
    void: int = 0
    inactive: int = 0


class DispositionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lead_id: int
    agent_id: Optional[int] = None
    call_connected: bool
    outcome: Optional[str] = None
    temperature: Optional[str] = None
    product: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    call_duration: int
    recording_url: Optional[str] = None
    created_at: datetime


class LeadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    contact_number: str
    address: Optional[str] = None
    email: Optional[str] = None
    campaign_id: int
    agent_id: Optional[int] = None
    status: str
    temperature: Optional[str] = None
    product: Optional[str] = None
    branch: Optional[str] = None
    zone: Optional[str] = None
    leads_generated_by: Optional[str] = None
    attempt_count: int
    next_followup_date: Optional[datetime] = None
    created_at: datetime
    # Flattened from relationships — populated in the router, not by the ORM directly
    campaign_name: Optional[str] = None
    agent_name: Optional[str] = None


class LeadWithDispositionsSchema(LeadSchema):
    """LeadSchema extended with the lead's full disposition history."""
    dispositions: list[DispositionSchema] = []


class DashboardStatsSchema(BaseModel):
    """Aggregated counts for the main dashboard cards."""
    total_leads: int
    unallocated: int
    active: int
    converted: int
    void: int
    inactive: int
    total_agents: int
    online_agents: int
    total_campaigns: int
