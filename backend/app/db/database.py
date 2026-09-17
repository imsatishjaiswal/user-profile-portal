from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings


def init_database_engine():
    db_url = settings.DATABASE_URL
    engine = create_engine(db_url)
    return engine, db_url


engine, ACTIVE_DATABASE_URL = init_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
