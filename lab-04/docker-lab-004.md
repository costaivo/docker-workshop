# Docker Lab 004: Databases and Docker Compose

This lab introduces **PostgreSQL** and **Docker Compose**. You will run a multi-container setup: the Quotes API (Node.js) connects to a PostgreSQL database instead of using hardcoded data. Migrations and seed scripts run via Docker.

## Prerequisites

- Completed Labs 01–03 (or equivalent Docker basics)
- Docker and Docker Compose installed

---

## What You Will Learn

- Run PostgreSQL in a container
- Connect a Node.js app to a database
- Use Docker Compose to orchestrate multiple services
- Run database migrations and seed scripts via Docker
- Use pgAdmin to browse database contents

---

## Project Structure

```
lab-04/
├── app.js              # Express app fetching quotes from PostgreSQL
├── package.json        # Dependencies: express, pg
├── Dockerfile          # Node.js app image
├── docker-compose.yml  # postgres + app + pgadmin services
├── scripts/
│   └── init-db.js      # Schema creation + default quotes seed
└── docker-lab-004.md   # This file
```

---

## Step 1: Understand the Setup

### Database Schema

The `quotes` table:

| Column  | Type         | Description      |
|---------|--------------|------------------|
| id      | VARCHAR(20)  | Primary key      |
| text    | TEXT         | Quote content    |
| author  | VARCHAR(255) | Author name      |

### Seed Script

`scripts/init-db.js`:

1. Creates the `quotes` table if it does not exist
2. Inserts 8 default quotes (same as previous labs)
3. Can be run with flags: `--schema-only` or `--seed-only`

### NPM Scripts

| Script     | Purpose                              |
|------------|--------------------------------------|
| `npm start`| Start the app                        |
| `npm run db:schema` | Create table only              |
| `npm run db:seed`   | Insert default quotes only     |
| `npm run db:init`   | Schema + seed (full init)      |

---

## Step 2: Run with Docker Compose

From the `lab-04` directory:

```bash
cd lab-04
docker-compose up --build
```

**What happens:**

1. **postgres** — Starts PostgreSQL 16 (Alpine)
2. **postgres** — Health check waits until DB is ready
3. **app** — Builds the image, then runs `npm run db:init` (schema + seed)
4. **app** — Starts the Express server
5. **pgadmin** — Starts pgAdmin web UI for viewing the database

**Expected output:**

```
quotes-postgres  | database system is ready to accept connections
quotes-api       | Schema: quotes table ready
quotes-api       | Seed: Default quotes inserted
quotes-api       | Server is running on http://localhost:3000
```

### Test the API

```bash
# In another terminal
curl http://localhost:3000/quotes
curl http://localhost:3000/health
```

`/health` includes `"database": "connected"` when PostgreSQL is reachable.

### View the Database with pgAdmin

pgAdmin lets you browse tables and run SQL queries in a web UI.

1. Open **http://localhost:5050** in your browser
2. Log in with:
   - **Email:** `admin@quotes.local`
   - **Password:** `admin`
3. Add the PostgreSQL server:
   - Right-click **Servers** → **Register** → **Server**
   - **General** tab: Name = `quotes-db` (or any label)
   - **Connection** tab:
     - Host: `postgres`
     - Port: `5432`
     - Database: `quotes_db`
     - Username: `quotes_user`
     - Password: `quotes_password`
   - Click **Save**
4. Navigate: Servers → quotes-db → Databases → quotes_db → Schemas → public → Tables → quotes
5. Right-click **quotes** → **View/Edit Data** → **All Rows** to see the seeded data

> **Note:** Use hostname `postgres` (not `localhost`) because pgAdmin runs inside Docker and reaches the database via the internal network.

---

## Step 3: Run Migrations/Scripts via Docker

You can run schema and seed scripts without starting the app.

### Run full init (schema + seed)

```bash
docker-compose run --rm app npm run db:init
```

Creates a one-off container, runs the init script, then removes the container. Use this to reset or initialize the database.

### Run schema only

```bash
docker-compose run --rm app npm run db:schema
```

Creates the `quotes` table without inserting data.

### Run seed only

```bash
docker-compose run --rm app npm run db:seed
```

Inserts default quotes. The table must already exist (run schema first or use `db:init`).

### Run migrations when app is already running

```bash
docker-compose exec app npm run db:seed
```

Runs the seed script inside the running `app` container.

---

## Step 4: Docker Compose Concepts

### `docker-compose.yml` structure

```yaml
services:
  postgres:   # Database service
    image: postgres:16-alpine
    environment: ...

  app:       # Application service
    build: .
    depends_on:
      postgres:
        condition: service_healthy  # Wait for DB to be ready
```

### Key points

- **depends_on** — App starts only after postgres is healthy
- **healthcheck** — `pg_isready` verifies PostgreSQL is accepting connections
- **volumes** — `postgres_data` persists data between restarts
- **networks** — Services share a default network; `app` reaches postgres at hostname `postgres`

### Stop and clean up

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

---

## Step 5: Run Locally (Without Docker)

For development, you can run the app and database separately:

1. **PostgreSQL** — Install locally or run `docker-compose up postgres -d` to start only the database
2. **Environment** — Use default values or set:
   - `DB_HOST=localhost`
   - `DB_PORT=5432`
   - `DB_NAME=quotes_db`
   - `DB_USER=quotes_user`
   - `DB_PASSWORD=quotes_password`
3. **Init DB** — `npm install` then `npm run db:init`
4. **Start app** — `npm start`

---

## Troubleshooting

### "Connection refused" or "database does not exist"

- Ensure postgres is running: `docker-compose ps`
- Check postgres logs: `docker-compose logs postgres`
- App waits for postgres; if it starts too early, increase retries in `app.js` or `scripts/init-db.js`

### Port 5432 or 3000 already in use

Change ports in `docker-compose.yml`:

```yaml
postgres:
  ports: ["5433:5432"]  # Use 5433 on host

app:
  ports: ["3001:3000"]  # Use 3001 on host

pgadmin:
  ports: ["5051:80"]    # Use 5051 on host if 5050 is taken
```

### Reset the database

```bash
docker-compose down -v
docker-compose up --build
```

---

## Lab Flow Summary

| Lab    | Focus                                  |
|--------|----------------------------------------|
| Lab 01 | Run Node.js app → observe errors       |
| Lab 02 | Dockerfile for Node.js                 |
| Lab 03 | Build, tag, push to Docker Hub         |
| Lab 04 | PostgreSQL + Docker Compose, migrations via Docker |
