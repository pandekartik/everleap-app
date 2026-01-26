"""
Database connection module with async context manager support.
Handles database sessions, connection pooling, and transaction management.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool, QueuePool

from core.config import settings


# Create Base class for SQLAlchemy models
Base = declarative_base()


class DatabaseManager:
    """
    Database manager for handling connections and sessions.
    Implements singleton pattern to ensure single engine instance.
    """
    
    _instance = None
    _engine: AsyncEngine = None
    _session_factory: async_sessionmaker = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize database engine and session factory."""
        if self._engine is None:
            self._initialize_engine()
    
    def _initialize_engine(self) -> None:
        """Create async engine with connection pooling."""
        # pool_class = QueuePool if not settings.DEBUG else NullPool
        
        self._engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            future=True,
            pool_pre_ping=True,  # Verify connections before using
            pool_size=settings.DATABASE_POOL_SIZE,
            max_overflow=settings.DATABASE_MAX_OVERFLOW,
            # poolclass=pool_class,
        )
        
        self._session_factory = async_sessionmaker(
            bind=self._engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    
    @property
    def engine(self) -> AsyncEngine:
        """Get database engine."""
        return self._engine
    
    @property
    def session_factory(self) -> async_sessionmaker:
        """Get session factory."""
        return self._session_factory
    
    async def close(self) -> None:
        """Close database engine and cleanup connections."""
        if self._engine:
            await self._engine.dispose()
    
    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Async context manager for database sessions.
        Automatically handles commits and rollbacks.
        
        Usage:
            async with db_manager.session() as session:
                # perform database operations
                pass
        """
        async with self._session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    @asynccontextmanager
    async def transaction(self, session: AsyncSession) -> AsyncGenerator[None, None]:
        """
        Async context manager for explicit transactions.
        
        Usage:
            async with db_manager.session() as session:
                async with db_manager.transaction(session):
                    # perform transactional operations
                    pass
        """
        async with session.begin():
            try:
                yield
            except Exception:
                await session.rollback()
                raise


# Global database manager instance
db_manager = DatabaseManager()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function for FastAPI endpoints.
    Provides database session to route handlers.
    
    Usage:
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            # use db session
            pass
    """
    async with db_manager.session() as session:
        yield session


async def init_db() -> None:
    """
    Initialize database by creating all tables.
    Should only be used in development or testing.
    In production, use Alembic migrations.
    """
    async with db_manager.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    Close database connections.
    Should be called on application shutdown.
    """
    await db_manager.close()


# Context manager for manual session management
@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for manual session management outside of FastAPI.
    
    Usage:
        async with get_db_context() as session:
            # perform database operations
            pass
    """
    async with db_manager.session() as session:
        yield session
