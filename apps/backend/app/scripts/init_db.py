#!/usr/bin/env python3
"""
Database initialization script.
Creates database, runs migrations, and optionally seeds initial data.
"""
import asyncio
import logging
import sys
from datetime import datetime
from pathlib import Path

# Setup logging before anything else
SCRIPT_DIR = Path(__file__).parent
LOG_FILE = SCRIPT_DIR / "init_db.log"

# Clear log file on each run by using 'w' mode
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, mode='w'),  # 'w' mode overwrites file
        logging.StreamHandler(sys.stdout)  # Also log to console
    ]
)
logger = logging.getLogger(__name__)

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
logger.info(f"Added to system path: {Path(__file__).parent.parent}")

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from core.config import settings
from core.security import get_password_hash
from db.session import db_manager
from models import Company, User, UserRole, UserRoleAssignment


async def check_database_exists():
    """Check if database exists."""
    logger.info("Checking if database exists...")
    
    # Connect to postgres database to check if our database exists
    base_url = settings.DATABASE_URL.rsplit("/", 1)[0]
    logger.info(f"Database base URL: {base_url}")
    
    db_name = settings.DATABASE_NAME
    logger.info(f"Database name: {db_name}")
    
    engine = create_async_engine(f"{base_url}/postgres")
    
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
            )
            exists = result.scalar() is not None
        
        logger.info(f"Database exists: {exists}")
        return exists
    except Exception as e:
        logger.error(f"Error checking database existence: {e}")
        raise
    finally:
        await engine.dispose()


async def create_database():
    """Create database if it doesn't exist."""
    logger.info("=== CREATE DATABASE STEP ===")
    
    if await check_database_exists():
        logger.info("Database already exists. Skipping creation.")
        return
    
    logger.info("Creating new database...")
    base_url = settings.DATABASE_URL.rsplit("/", 1)[0]
    db_name = settings.DATABASE_URL.rsplit("/", 1)[1].split("?")[0]
    
    engine = create_async_engine(f"{base_url}/postgres", isolation_level="AUTOCOMMIT")
    
    try:
        async with engine.connect() as conn:
            logger.info(f"Executing: CREATE DATABASE {db_name}")
            await conn.execute(text(f"CREATE DATABASE {db_name}"))
        logger.info(f"✓ Database '{db_name}' created successfully.")
    except Exception as e:
        logger.error(f"✗ Failed to create database: {e}")
        raise
    finally:
        await engine.dispose()


async def run_sql_schema():
    """Run the SQL schema file."""
    logger.info("=== RUN SCHEMA STEP ===")
    
    schema_file = Path(__file__).parent / "schema.sql"
    logger.info(f"Looking for schema file at: {schema_file}")
    
    if not schema_file.exists():
        logger.warning("Warning: schema.sql not found. Skipping schema creation.")
        return
    
    with open(schema_file, "r") as f:
        schema_sql = f.read()
    
    logger.info(f"Read schema file: {len(schema_sql)} characters")
    
    # Execute using raw connection to avoid prepared statement limitations
    try:
        logger.info("Executing schema.sql (bypassing prepared statements)...")
        
        # Get the raw asyncpg connection
        async with db_manager.engine.connect() as conn:
            # Access the raw driver connection
            raw_conn = await conn.get_raw_connection()
            driver_conn = raw_conn.driver_connection
            
            # Execute directly on the asyncpg connection
            await driver_conn.execute(schema_sql)
            
            # Commit the transaction
            await conn.commit()
            
        logger.info("✓ Schema created successfully.")
    except Exception as e:
        logger.error(f"✗ Error executing schema: {e}")
        logger.exception("Full traceback:")
        raise


async def create_super_admin(email: str, password: str, full_name: str):
    """Create initial super admin user."""
    logger.info("=== CREATE SUPER ADMIN STEP ===")
    logger.info(f"Creating super admin user: {email}")
    
    try:
        async with db_manager.session() as db:
            # Check if super admin already exists
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.email == email))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                logger.info(f"Super admin with email {email} already exists.")
                return
            
            logger.info("Creating new user record...")
            # Create user
            user = User(
                email=email,
                password_hash=get_password_hash(password),
                full_name=full_name,
                is_email_verified=True,
                is_password_set=True,
                is_active=True
            )
            db.add(user)
            await db.flush()
            logger.info(f"User created with ID: {user.id}")
            
            # Assign SUPER_ADMIN role
            logger.info("Assigning SUPER_ADMIN role...")
            role = UserRoleAssignment(
                user_id=user.id,
                role=UserRole.SUPER_ADMIN
            )
            db.add(role)
            await db.commit()
            
            logger.info(f"✓ Super admin created successfully: {email}")
    except Exception as e:
        logger.error(f"✗ Failed to create super admin: {e}")
        logger.exception("Full traceback:")
        raise


async def seed_demo_data():
    """Seed demo data for development."""
    logger.info("=== SEED DEMO DATA STEP ===")
    
    try:
        async with db_manager.session() as db:
            # Create demo company
            from sqlalchemy import select
            result = await db.execute(
                select(Company).where(Company.domain == "demo.company")
            )
            company = result.scalar_one_or_none()
            
            if not company:
                logger.info("Creating demo company...")
                company = Company(
                    name="Demo Company",
                    domain="demo.company",
                    website="https://demo.company",
                    diversity_policy="We are committed to diversity and inclusion."
                )
                db.add(company)
                await db.flush()
                logger.info(f"✓ Created demo company: {company.name} (ID: {company.id})")
            else:
                logger.info(f"Demo company already exists: {company.name}")
            
            # Create admin user for demo company
            result = await db.execute(
                select(User).where(User.email == "admin@demo.company")
            )
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                logger.info("Creating demo admin user...")
                admin_user = User(
                    company_id=company.id,
                    email="admin@demo.company",
                    password_hash=get_password_hash("Admin123!"),
                    full_name="Demo Admin",
                    is_email_verified=True,
                    is_password_set=True,
                    is_active=True
                )
                db.add(admin_user)
                await db.flush()
                logger.info(f"✓ Created admin user: {admin_user.email} (ID: {admin_user.id})")
                
                # Assign ADMIN role
                logger.info("Assigning ADMIN role...")
                role = UserRoleAssignment(
                    user_id=admin_user.id,
                    role=UserRole.ADMIN
                )
                db.add(role)
            else:
                logger.info(f"Demo admin user already exists: {admin_user.email}")
            
            await db.commit()
            logger.info("✓ Demo data seeded successfully.")
    except Exception as e:
        logger.error(f"✗ Failed to seed demo data: {e}")
        logger.exception("Full traceback:")
        raise


async def main():
    """Main initialization function."""
    start_time = datetime.now()
    
    logger.info("=" * 70)
    logger.info("EVERLEAP DATABASE INITIALIZATION")
    logger.info("=" * 70)
    logger.info(f"Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Log file: {LOG_FILE}")
    logger.info("=" * 70)
    
    try:
        # Create database
        await create_database()
        
        # Run schema
        await run_sql_schema()
        
        # Create super admin
        logger.info("")
        logger.info("=" * 70)
        logger.info("SUPER ADMIN SETUP")
        logger.info("=" * 70)
        
        if len(sys.argv) >= 4:
            email = sys.argv[1]
            password = sys.argv[2]
            full_name = sys.argv[3]
            logger.info("Using command-line arguments for super admin")
        else:
            email = input("Super Admin Email: ").strip()
            password = input("Super Admin Password: ").strip()
            full_name = input("Super Admin Full Name: ").strip()
        
        logger.info(f"Email: {email}")
        logger.info(f"Full Name: {full_name}")
        
        await create_super_admin(email, password, full_name)
        
        # Ask about demo data
        if len(sys.argv) < 4:  # Interactive mode
            seed_demo = input("\nSeed demo data? (y/n): ").strip().lower()
            if seed_demo == "y":
                await seed_demo_data()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info("")
        logger.info("=" * 70)
        logger.info("✓ DATABASE INITIALIZATION COMPLETE!")
        logger.info("=" * 70)
        logger.info(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Log file saved to: {LOG_FILE}")
        logger.info("")
        logger.info("You can now start the application with:")
        logger.info("  uvicorn app.main:app --reload")
        logger.info("=" * 70)
        
    except Exception as e:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.error("")
        logger.error("=" * 70)
        logger.error("✗ DATABASE INITIALIZATION FAILED")
        logger.error("=" * 70)
        logger.error(f"Error: {e}")
        logger.error(f"Duration: {duration:.2f} seconds")
        logger.error(f"Check log file for details: {LOG_FILE}")
        logger.error("=" * 70)
        logger.exception("Full error traceback:")
        sys.exit(1)
    
    finally:
        logger.info("Closing database connection...")
        await db_manager.close()
        logger.info("Database connection closed.")


if __name__ == "__main__":
    asyncio.run(main())