import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text
from app.api.auth import router as auth_router
from app.core.config import settings
from app.db.database import Base, engine, ACTIVE_DATABASE_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"[DATABASE CONNECTION ERROR]: {e}")
        print("\n" + "=" * 70)
        print("[DATABASE CONNECTION ERROR]")
        print("=" * 70 + "\n")
        os._exit(1)
    yield


app = FastAPI(
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Custom Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = str(error.get("loc", [])[-1]) if error.get("loc") else "field"
        msg = error.get("msg", "Invalid value")
        errors.append(f"{field.capitalize()}: {msg}")
    error_msg = "; ".join(errors) if errors else "Validation error"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": error_msg},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal server error occurred. Please try again later."},
    )


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, tags=["Authentication"])
app.include_router(auth_router, prefix=settings.API_V1_STR, tags=["Authentication (v1)"])


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "OK",
        "message": "Server is running",
        
    }
