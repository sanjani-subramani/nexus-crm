from database import Base, engine
from models import Agent, Campaign, Lead, Disposition  # registers all models with Base

Base.metadata.create_all(bind=engine)

tables = list(Base.metadata.tables.keys())
print("Database initialised. Tables created:")
for table in tables:
    print(f"  - {table}")
