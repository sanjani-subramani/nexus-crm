from datetime import datetime, timedelta
from database import SessionLocal
from models import Agent, Campaign, Lead, Disposition

db = SessionLocal()

# ── Clear existing data (order matters due to foreign keys) ──────────────────
db.query(Disposition).delete()
db.query(Lead).delete()
db.query(Campaign).delete()
db.query(Agent).delete()
db.commit()

# ── Agents ───────────────────────────────────────────────────────────────────
agents = [
    Agent(name="Karthik R",   email="karthik.r@nexuscrm.in",   role="agent",      employee_code="EMP001", zone="KA-Zone 1", subzone="North", branch="YPR", route="Route A", is_online=True),
    Agent(name="Shriram M",   email="shriram.m@nexuscrm.in",   role="agent",      employee_code="EMP002", zone="KA-Zone 1", subzone="South", branch="YPR", route="Route B", is_online=True),
    Agent(name="Sandesh K",   email="sandesh.k@nexuscrm.in",   role="agent",      employee_code="EMP003", zone="KA-Zone 2", subzone="East",  branch="RMN", route="Route C", is_online=True,  on_break=True),
    Agent(name="Ganesh P",    email="ganesh.p@nexuscrm.in",    role="agent",      employee_code="EMP004", zone="KA-Zone 2", subzone="West",  branch="SMG", route="Route D", is_online=False),
    Agent(name="Visves N",    email="visves.n@nexuscrm.in",    role="supervisor", employee_code="SUP001", zone="KA-Zone 1", subzone=None,    branch="YPR", route=None,      is_online=True),
]
db.add_all(agents)
db.commit()

karthik, shriram, sandesh, ganesh, visves = agents

# ── Campaigns ────────────────────────────────────────────────────────────────
campaigns = [
    Campaign(name="Facebook",   category="Social Media",  priority="High",   created_date=datetime(2026, 5, 1)),
    Campaign(name="Instagram",  category="Social Media",  priority="High",   created_date=datetime(2026, 5, 10)),
    Campaign(name="DSR",        category="Direct Sales",  priority="Medium", created_date=datetime(2026, 4, 15)),
    Campaign(name="WhatsApp",   category="Messaging",     priority="Medium", created_date=datetime(2026, 5, 20)),
    Campaign(name="Online",     category="Digital",       priority="Low",    created_date=datetime(2026, 4, 1)),
    Campaign(name="Snapchat",   category="Social Media",  priority="Low",    created_date=datetime(2026, 6, 1)),
]
db.add_all(campaigns)
db.commit()

fb, ig, dsr, wa, online, snap = campaigns

# ── Leads ────────────────────────────────────────────────────────────────────
leads = [
    # Facebook — mix of statuses
    Lead(customer_name="Rajesh Kumar",      contact_number="9845012345", address="Rajajinagar, Bengaluru",  email="rajesh.k@gmail.com",   campaign_id=fb.id,     agent_id=karthik.id, status="active",      temperature="hot",  product="3x30", branch="YPR", zone="KA-Zone 1", leads_generated_by="Facebook Ad", attempt_count=3, next_followup_date=datetime.utcnow() + timedelta(days=1)),
    Lead(customer_name="Meena Devi",         contact_number="9741023456", address="Koramangala, Bengaluru",  email=None,                   campaign_id=fb.id,     agent_id=shriram.id, status="converted",   temperature="hot",  product="4x40", branch="YPR", zone="KA-Zone 1", leads_generated_by="Facebook Ad", attempt_count=5),
    Lead(customer_name="Suresh Patil",       contact_number="8880134567", address="Mysuru Road, Bengaluru",  email="suresh.p@yahoo.com",   campaign_id=fb.id,     agent_id=None,       status="unallocated", temperature=None,   product=None,   branch=None,  zone="KA-Zone 2", leads_generated_by="Facebook Ad", attempt_count=0),
    Lead(customer_name="Lakshmi Narayanan",  contact_number="7760245678", address="Malleshwaram, Bengaluru", email=None,                   campaign_id=fb.id,     agent_id=sandesh.id, status="active",      temperature="warm", product="3x30", branch="RMN", zone="KA-Zone 2", leads_generated_by="Facebook Ad", attempt_count=2, next_followup_date=datetime.utcnow() + timedelta(days=2)),
    Lead(customer_name="Prakash Hegde",      contact_number="9900356789", address="Tumkur Road, Bengaluru",  email="prakash.h@gmail.com",  campaign_id=fb.id,     agent_id=ganesh.id,  status="void",        temperature=None,   product="5x25", branch="SMG", zone="KA-Zone 2", leads_generated_by="Facebook Ad", attempt_count=4),

    # Instagram
    Lead(customer_name="Ananya Sharma",      contact_number="9123467890", address="HSR Layout, Bengaluru",   email="ananya.s@gmail.com",   campaign_id=ig.id,     agent_id=karthik.id, status="active",      temperature="hot",  product="4x40", branch="YPR", zone="KA-Zone 1", leads_generated_by="Instagram Ad", attempt_count=2, next_followup_date=datetime.utcnow() + timedelta(days=1)),
    Lead(customer_name="Vijay Menon",        contact_number="8976578901", address="Indiranagar, Bengaluru",  email=None,                   campaign_id=ig.id,     agent_id=None,       status="unallocated", temperature=None,   product=None,   branch=None,  zone="KA-Zone 1", leads_generated_by="Instagram Ad", attempt_count=0),
    Lead(customer_name="Deepa Rao",          contact_number="7654689012", address="Whitefield, Bengaluru",   email="deepa.rao@gmail.com",  campaign_id=ig.id,     agent_id=shriram.id, status="converted",   temperature="hot",  product="3x30", branch="YPR", zone="KA-Zone 1", leads_generated_by="Instagram Ad", attempt_count=6),
    Lead(customer_name="Mohan Das",          contact_number="9988790123", address="Electronic City",         email=None,                   campaign_id=ig.id,     agent_id=None,       status="unallocated", temperature=None,   product=None,   branch=None,  zone="KA-Zone 2", leads_generated_by="Instagram Ad", attempt_count=0),

    # DSR
    Lead(customer_name="Ravi Shankar",       contact_number="9870801234", address="Jayanagar, Bengaluru",    email="ravi.s@gmail.com",     campaign_id=dsr.id,    agent_id=sandesh.id, status="active",      temperature="warm", product="5x25", branch="RMN", zone="KA-Zone 2", leads_generated_by="DSR Field",   attempt_count=1, next_followup_date=datetime.utcnow() + timedelta(days=3)),
    Lead(customer_name="Savitha Gowda",      contact_number="8765912345", address="Banashankari, Bengaluru", email=None,                   campaign_id=dsr.id,    agent_id=ganesh.id,  status="inactive",    temperature="cold", product="3x30", branch="SMG", zone="KA-Zone 2", leads_generated_by="DSR Field",   attempt_count=7),
    Lead(customer_name="Nagaraj B",          contact_number="7654023456", address="Yeshwanthpur, Bengaluru", email="nagaraj.b@gmail.com",  campaign_id=dsr.id,    agent_id=karthik.id, status="active",      temperature="warm", product="4x40", branch="YPR", zone="KA-Zone 1", leads_generated_by="DSR Field",   attempt_count=3, next_followup_date=datetime.utcnow() + timedelta(days=1)),
    Lead(customer_name="Priya Chandran",     contact_number="9543134567", address="Sadashivanagar, Bengaluru",email="priya.c@gmail.com",   campaign_id=dsr.id,    agent_id=None,       status="unallocated", temperature=None,   product=None,   branch=None,  zone="KA-Zone 1", leads_generated_by="DSR Field",   attempt_count=0),

    # WhatsApp
    Lead(customer_name="Arun Kumar",         contact_number="9432245678", address="RT Nagar, Bengaluru",     email=None,                   campaign_id=wa.id,     agent_id=shriram.id, status="active",      temperature="hot",  product="3x30", branch="YPR", zone="KA-Zone 1", leads_generated_by="WhatsApp",    attempt_count=2, next_followup_date=datetime.utcnow() + timedelta(hours=6)),
    Lead(customer_name="Sumathi Reddy",      contact_number="8321356789", address="Hebbal, Bengaluru",       email="sumathi.r@gmail.com",  campaign_id=wa.id,     agent_id=sandesh.id, status="converted",   temperature="hot",  product="5x25", branch="RMN", zone="KA-Zone 2", leads_generated_by="WhatsApp",    attempt_count=4),
    Lead(customer_name="Dinesh Babu",        contact_number="7210467890", address="Yelahanka, Bengaluru",    email=None,                   campaign_id=wa.id,     agent_id=None,       status="unallocated", temperature=None,   product=None,   branch=None,  zone="KA-Zone 2", leads_generated_by="WhatsApp",    attempt_count=0),
    Lead(customer_name="Kavitha Murthy",     contact_number="9109578901", address="Nagarbhavi, Bengaluru",   email="kavitha.m@gmail.com",  campaign_id=wa.id,     agent_id=ganesh.id,  status="active",      temperature="cold", product="4x40", branch="SMG", zone="KA-Zone 2", leads_generated_by="WhatsApp",    attempt_count=1),

    # Online
    Lead(customer_name="Harish Nair",        contact_number="9998689012", address="JP Nagar, Bengaluru",     email="harish.n@gmail.com",   campaign_id=online.id, agent_id=karthik.id, status="active",      temperature="warm", product="3x30", branch="YPR", zone="KA-Zone 1", leads_generated_by="Google Ad",   attempt_count=2, next_followup_date=datetime.utcnow() + timedelta(days=2)),
    Lead(customer_name="Rekha Subramaniam",  contact_number="8887790123", address="Basavanagudi, Bengaluru", email=None,                   campaign_id=online.id, agent_id=None,       status="unallocated", temperature=None,   product=None,   branch=None,  zone="KA-Zone 1", leads_generated_by="Google Ad",   attempt_count=0),
    Lead(customer_name="Santosh Verma",      contact_number="7776801234", address="Kengeri, Bengaluru",      email="santosh.v@gmail.com",  campaign_id=online.id, agent_id=shriram.id, status="void",        temperature=None,   product="5x25", branch="YPR", zone="KA-Zone 1", leads_generated_by="Google Ad",   attempt_count=5),

    # Snapchat
    Lead(customer_name="Pooja Iyer",         contact_number="9665912345", address="Domlur, Bengaluru",       email="pooja.i@gmail.com",    campaign_id=snap.id,   agent_id=sandesh.id, status="active",      temperature="hot",  product="4x40", branch="RMN", zone="KA-Zone 2", leads_generated_by="Snapchat Ad", attempt_count=1, next_followup_date=datetime.utcnow() + timedelta(days=1)),
    Lead(customer_name="Manoj Shetty",       contact_number="8554023456", address="Marathahalli, Bengaluru", email=None,                   campaign_id=snap.id,   agent_id=None,       status="unallocated", temperature=None,   product=None,   branch=None,  zone="KA-Zone 2", leads_generated_by="Snapchat Ad", attempt_count=0),
    Lead(customer_name="Nisha Patel",        contact_number="7443134567", address="Sarjapur Road, Bengaluru",email="nisha.p@gmail.com",    campaign_id=snap.id,   agent_id=ganesh.id,  status="active",      temperature="warm", product="3x30", branch="SMG", zone="KA-Zone 2", leads_generated_by="Snapchat Ad", attempt_count=2, next_followup_date=datetime.utcnow() + timedelta(days=3)),
    Lead(customer_name="Vinod Kulkarni",     contact_number="9332245678", address="Bannerghatta Rd, Bengaluru",email=None,                 campaign_id=snap.id,   agent_id=karthik.id, status="inactive",    temperature="cold", product="5x25", branch="YPR", zone="KA-Zone 1", leads_generated_by="Snapchat Ad", attempt_count=6),
]
db.add_all(leads)
db.commit()

# Resolve lead objects by name for dispositions
def lead(name):
    return next(l for l in leads if l.customer_name == name)

# ── Dispositions ─────────────────────────────────────────────────────────────
dispositions = [
    Disposition(lead_id=lead("Rajesh Kumar").id,     agent_id=karthik.id, call_connected=True,  outcome="in_progress",   temperature="hot",  product="3x30", notes="Interested, wants a callback tomorrow morning.",                  call_duration=185, created_at=datetime.utcnow() - timedelta(days=1)),
    Disposition(lead_id=lead("Rajesh Kumar").id,     agent_id=karthik.id, call_connected=False, outcome="not_connected", temperature=None,   product=None,   reason="phone switched off",                                              call_duration=0,   created_at=datetime.utcnow() - timedelta(days=2)),
    Disposition(lead_id=lead("Meena Devi").id,        agent_id=shriram.id, call_connected=True,  outcome="converted",     temperature="hot",  product="4x40", notes="Deal closed. Submitted documents.",                                call_duration=420, created_at=datetime.utcnow() - timedelta(days=3)),
    Disposition(lead_id=lead("Ananya Sharma").id,    agent_id=karthik.id, call_connected=True,  outcome="in_progress",   temperature="hot",  product="4x40", notes="Very keen, send product brochure on WhatsApp.",                   call_duration=310, created_at=datetime.utcnow() - timedelta(days=1)),
    Disposition(lead_id=lead("Deepa Rao").id,         agent_id=shriram.id, call_connected=True,  outcome="converted",     temperature="hot",  product="3x30", notes="Paid first instalment. File opened.",                              call_duration=560, created_at=datetime.utcnow() - timedelta(days=5)),
    Disposition(lead_id=lead("Ravi Shankar").id,     agent_id=sandesh.id, call_connected=True,  outcome="in_progress",   temperature="warm", product="5x25", notes="Said he'll discuss with wife and revert by weekend.",             call_duration=240, created_at=datetime.utcnow() - timedelta(days=1)),
    Disposition(lead_id=lead("Arun Kumar").id,       agent_id=shriram.id, call_connected=True,  outcome="in_progress",   temperature="hot",  product="3x30", notes="Needs one more follow-up to confirm slot.",                       call_duration=195, created_at=datetime.utcnow() - timedelta(hours=5)),
    Disposition(lead_id=lead("Arun Kumar").id,       agent_id=shriram.id, call_connected=False, outcome="not_connected", temperature=None,   product=None,   reason="phone switched off",                                              call_duration=0,   created_at=datetime.utcnow() - timedelta(days=1)),
    Disposition(lead_id=lead("Sumathi Reddy").id,    agent_id=sandesh.id, call_connected=True,  outcome="converted",     temperature="hot",  product="5x25", notes="Conversion complete. Happy customer.",                             call_duration=390, created_at=datetime.utcnow() - timedelta(days=4)),
    Disposition(lead_id=lead("Pooja Iyer").id,       agent_id=sandesh.id, call_connected=True,  outcome="in_progress",   temperature="hot",  product="4x40", notes="Callback scheduled for tomorrow at 11 AM.",                       call_duration=150, created_at=datetime.utcnow() - timedelta(hours=3)),
    Disposition(lead_id=lead("Nagaraj B").id,        agent_id=karthik.id, call_connected=False, outcome="not_connected", temperature=None,   product=None,   reason="not reachable",                                                   call_duration=0,   created_at=datetime.utcnow() - timedelta(days=2)),
]
db.add_all(dispositions)
db.commit()

db.close()

# ── Summary ───────────────────────────────────────────────────────────────────
print("Seed data loaded successfully!")
print(f"  Agents       : {len(agents)}")
print(f"  Campaigns    : {len(campaigns)}")
print(f"  Leads        : {len(leads)}")
print(f"  Dispositions : {len(dispositions)}")
