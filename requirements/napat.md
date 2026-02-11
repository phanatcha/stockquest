# StockQuest: Database & Infrastructure Initialization

**To:** Napat

**From:** Phanatcha

**Project:** StockQuest

Your objective is to initialize the cloud infrastructure and local container environments. You are responsible for provisioning the services and ensuring the backends can establish a handshake with the data layers. Do not worry about table schemas or seed data; your focus is connectivity and environment stability.

### Step 1: Supabase Project Provisioning

- [ ] **Project Creation**: Provision a new project in Supabase named `stockquest`.
- [ ] **Regional Config**: Select the region closest to our primary user base to minimize latency.
- [ ] **Extensions**: Enable `uuid-ossp` for primary key generation and `pg_stat_statements` for performance monitoring.
- [ ] **Access Control**: Secure the database password and document it for the team’s internal use.

### Step 2: Environment Integration

- [ ] **Connection Strings**: Extract the URI mode connection strings from Supabase.
- [ ] **NestedJS Sync**: Update the NestJS `.env` file with the verified `DATABASE_URL`.
- [ ] **FastAPI Sync**: Update the FastAPI `.env` file with the verified `DATABASE_URL`.
- [ ] **Template Management**: Ensure all `.env.example` files reflect the correct variable keys (without secrets).

### Step 3: Cache Layer Initialization

- [ ] **Provision Redis**: Set up a Redis instance (Upstash or Redis Cloud).
- [ ] **Integration**: Add the Redis connection URL to all relevant backend `.env` files.
- [ ] **Validation**: Run a basic connection test from the backend services to ensure Redis is reachable.

### Step 4: Local Orchestration (Docker)

- [ ] **Service Definition**: Configure a `docker-compose.yml` that mirrors our cloud stack (PostgreSQL 15 and Redis 7).
- [ ] **Volumes**: Define persistent volumes for local database data to prevent loss during container restarts.
- [ ] **Verification**: Confirm the stack initializes correctly using `docker-compose up -d`.

Good Luck My Love!

---
