from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file will be created at backend/nexus.db
DATABASE_URL = "sqlite:///./nexus.db"

# The engine is the entry point to the database.
# check_same_thread=False is required for SQLite when used with FastAPI,
# because FastAPI may access the same connection from different threads.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# SessionLocal is a factory that creates new database sessions.
# Each request gets its own session, which is opened and closed per request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the class that all SQLAlchemy models will inherit from.
# It keeps track of all model classes mapped to database tables.
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per request.
    Yields the session, then closes it when the request is done —
    even if an error occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
