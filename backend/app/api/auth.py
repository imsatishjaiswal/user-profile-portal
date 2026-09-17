from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, oauth2_scheme
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.database import get_db
from app.db.models import RevokedToken, User
from app.schemas.user import LoginResponse, MessageResponse, UserLogin, UserRegister, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    try:
        # Check duplicate email
        existing_email = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered",
            )

        # Check duplicate mobile
        existing_mobile = db.query(User).filter(User.mobile == user_in.mobile).first()
        if existing_mobile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number is already registered",
            )

        db_user = User(
            name=user_in.name.strip(),
            email=user_in.email.lower(),
            mobile=user_in.mobile,
            password_hash=get_password_hash(user_in.password),
            is_active=True,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User details (email or mobile number) already exist.",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database transaction error occurred during registration.",
        )



@router.post("/login", response_model=LoginResponse)
def login_user(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return LoginResponse(user=UserResponse.model_validate(user))


@router.get("/user/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout_user(
    response: Response,
    token: str | None = Depends(oauth2_scheme),
    access_token: str | None = Cookie(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = access_token or token
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    db.add(
        RevokedToken(
            jti=payload["jti"],
            expires_at=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
        )
    )
    db.commit()
    response.delete_cookie(key="access_token")
    return MessageResponse(message="Successfully logged out")
