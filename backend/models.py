from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


# Represents a call-centre agent or supervisor who handles leads
class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="agent")  # "agent" or "supervisor"
    employee_code: Mapped[str] = mapped_column(String)
    zone: Mapped[str | None] = mapped_column(String, nullable=True)
    subzone: Mapped[str | None] = mapped_column(String, nullable=True)
    branch: Mapped[str | None] = mapped_column(String, nullable=True)
    route: Mapped[str | None] = mapped_column(String, nullable=True)
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    on_break: Mapped[bool] = mapped_column(Boolean, default=False)

    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="agent")


# A marketing campaign that groups a batch of leads together
class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    priority: Mapped[str] = mapped_column(String, default="Medium")
    logo: Mapped[str | None] = mapped_column(String, nullable=True)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="campaign")


# A single prospect/customer record belonging to a campaign and optionally an agent
class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_name: Mapped[str] = mapped_column(String)
    contact_number: Mapped[str] = mapped_column(String)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    campaign_id: Mapped[int] = mapped_column(Integer, ForeignKey("campaigns.id"))
    agent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("agents.id"), nullable=True)
    status: Mapped[str] = mapped_column(String, default="unallocated")  # unallocated/active/converted/void/inactive
    temperature: Mapped[str | None] = mapped_column(String, nullable=True)  # hot/warm/cold
    product: Mapped[str | None] = mapped_column(String, nullable=True)  # e.g. 3x30, 4x40
    branch: Mapped[str | None] = mapped_column(String, nullable=True)
    zone: Mapped[str | None] = mapped_column(String, nullable=True)
    leads_generated_by: Mapped[str | None] = mapped_column(String, nullable=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    next_followup_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="leads")
    agent: Mapped["Agent | None"] = relationship("Agent", back_populates="leads")
    dispositions: Mapped[list["Disposition"]] = relationship("Disposition", back_populates="lead")


# Records the outcome of a single call attempt on a lead
class Disposition(Base):
    __tablename__ = "dispositions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"))
    agent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("agents.id"), nullable=True)
    call_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    outcome: Mapped[str | None] = mapped_column(String, nullable=True)  # converted/in_progress/lost/not_connected
    temperature: Mapped[str | None] = mapped_column(String, nullable=True)  # hot/warm/cold
    product: Mapped[str | None] = mapped_column(String, nullable=True)
    reason: Mapped[str | None] = mapped_column(String, nullable=True)  # e.g. "phone switched off"
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    call_duration: Mapped[int] = mapped_column(Integer, default=0)  # seconds
    recording_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="dispositions")
    agent: Mapped["Agent | None"] = relationship("Agent")
