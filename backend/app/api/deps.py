import jwt
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.db.models import RevokedToken, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = access_token or token
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int | None = payload.get("sub")
        token_id = payload.get("jti")
        if user_id is None or not token_id:
            raise credentials_exception
    except (jwt.PyJWTError, TypeError, ValueError):
        raise credentials_exception

    if db.query(RevokedToken).filter(RevokedToken.jti == token_id).first():
        raise credentials_exception

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user
