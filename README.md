# Krisper Authorization Backend (`krisper-authz-backend`)

Authorization and Role-Based Access Control (RBAC) service for the Krisper platform.

- **Docker Profile:** `authz`
- **Docker Service:** `authz-api`
- **Host Port:** `3004`

---

## 📋 Prerequisites

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18+)

---

## 🛠️ Setup

### Step 1: Environment File

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

> Refer to `.env.example` for all required fields.

---

### Step 2: Build the Docker Image

From the **root** folder (`krisper-backend/`):

```bash
docker compose --profile authz build --no-cache authz-api
```

---

### Step 3: Start the Services

From the **root** folder (`krisper-backend/`):

```bash
docker compose up
```

> Make sure the root `.env` file has `authz` listed in `COMPOSE_PROFILES`:
>
> ```
> COMPOSE_PROFILES=oauth,authz,shop,operation
> ```

---

### Step 4: Run Database Migration

Enter the running container:

```bash
docker compose exec authz-api /bin/bash
```

Then inside the container, run:

```bash
npx prisma migrate dev
```

---

### Step 5: Seed the Database

Inside the container, run:

```bash
npx ts-node prisma/seed/seed-all.ts
```

> `seed-all.ts` runs all seed files for this module.

---

## 📖 Swagger Docs

Once running, API docs are available at:

```
http://localhost:3004/api
```
