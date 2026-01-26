"""
Security utilities for authentication and authorization.
Includes password hashing, JWT token generation, and validation.
"""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from core.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using Argon2.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, UUID],
    expires_delta: Optional[timedelta] = None,
    additional_claims: Optional[Dict[str, Any]] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: User ID or email to encode in token
        expires_delta: Optional custom expiration time
        additional_claims: Optional additional claims to include in token
        
    Returns:
        Encoded JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    
    if additional_claims:
        to_encode.update(additional_claims)
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, UUID],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        subject: User ID to encode in token
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT refresh token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise JWTError(f"Could not validate token: {str(e)}")


def verify_token_type(token: str, expected_type: str) -> Dict[str, Any]:
    """
    Verify that a token is of the expected type.
    
    Args:
        token: JWT token string
        expected_type: Expected token type ('access' or 'refresh')
        
    Returns:
        Decoded token payload
        
    Raises:
        JWTError: If token type doesn't match
    """
    payload = decode_token(token)
    token_type = payload.get("type")
    
    if token_type != expected_type:
        raise JWTError(f"Invalid token type. Expected {expected_type}, got {token_type}")
    
    return payload


def create_email_verification_token(email: str) -> str:
    """
    Create a token for email verification.
    
    Args:
        email: User email address
        
    Returns:
        Encoded JWT token for email verification
    """
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {
        "exp": expire,
        "sub": email,
        "type": "email_verification"
    }
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def verify_email_verification_token(token: str) -> str:
    """
    Verify an email verification token.
    
    Args:
        token: Email verification token
        
    Returns:
        Email address from token
        
    Raises:
        JWTError: If token is invalid
    """
    payload = verify_token_type(token, "email_verification")
    email: str = payload.get("sub")
    if email is None:
        raise JWTError("Invalid email verification token")
    return email


def create_password_reset_token(email: str) -> str:
    """
    Create a token for password reset.
    
    Args:
        email: User email address
        
    Returns:
        Encoded JWT token for password reset
    """
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = {
        "exp": expire,
        "sub": email,
        "type": "password_reset"
    }
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def verify_password_reset_token(token: str) -> str:
    """
    Verify a password reset token.
    
    Args:
        token: Password reset token
        
    Returns:
        Email address from token
        
    Raises:
        JWTError: If token is invalid
    """
    payload = verify_token_type(token, "password_reset")
    email: str = payload.get("sub")
    if email is None:
        raise JWTError("Invalid password reset token")
    return email
