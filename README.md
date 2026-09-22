# LeadFlow Server API ⚙️

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey.svg?logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-5.20-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg?logo=postgresql)](https://www.postgresql.org/)

**LeadFlow Server** is the RESTful API backend for the **LeadFlow CRM** application. Built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL, it provides secure user authentication, transactional follow-up sequence processing, audit activity tracking, and analytics aggregation endpoints.

---

## Tech Stack & Dependencies

- **Runtime Environment**: Node.js (v18+)
- **Web Framework**: Express.js (`v4.21.0`)
- **Language**: TypeScript (`v5.6.2`)
- **Database & ORM**: PostgreSQL & Prisma ORM (`v5.20.0`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken v9.0.2`) & Password Hashing (`bcryptjs v2.4.3`)
- **Validation**: Zod (`v3.23.8`) for runtime schema parsing
- **Development Tooling**: Nodemon & `ts-node` for live reload

---

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma       # Prisma data models, enums & PostgreSQL relationships
│   └── seed.ts             # Database seeding script
├── src/
│   ├── config/
│   │   └── env.ts          # Zod environment variable parser
│   ├── lib/
│   │   └── prisma.ts       # Global singleton Prisma Client instance
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT extraction & authentication guard
│   │   ├── error.middleware.ts    # Central AppError handler & error response formatter
│   │   └── validate.middleware.ts # Zod request validation wrapper (body/query/params)
│   ├── modules/            # Feature modules (Controller-Service-Route-Schema)
│   │   ├── auth/           # User registration, login, profile endpoints
│   │   ├── dashboard/      # Lead stage aggregations & metrics endpoints
│   │   └── leads/          # Lead CRUD, sequence follow-ups & activity timeline
│   ├── utils/              # Utility helpers (JWT sign/verify, Async Handler)
│   ├── app.ts              # Express application setup, CORS, route mounting
│   └── server.ts           # Server bootstrap & HTTP port listener
├── package.json
└── tsconfig.json
```

---

## Environment Variables Setup

Create a `.env` file in the root of the `server/` directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadflow_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_leadflow_2026"
JWT_EXPIRES_IN="7d"
```

---

## Getting Started

### 1. Installation

Navigate to the `server` folder and install dependencies:

```bash
cd server
npm install
```

### 2. Database Migrations & Prisma Setup

Run Prisma migrations to create the database schema in PostgreSQL:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

*(Optional)* Seed initial test data:

```bash
npm run prisma:seed
```

### 3. Run Development Server

Start the Express API server with automatic reload via Nodemon:

```bash
npm run dev
```

The server will start listening at `http://localhost:5000`.

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ |
| `GET` | `/api/leads` | List leads with pagination, search & filters | ✅ |
| `POST` | `/api/leads` | Create a new lead profile | ✅ |
| `GET` | `/api/leads/:id` | Fetch detailed lead profile by ID | ✅ |
| `PATCH` | `/api/leads/:id` | Update lead fields or pipeline stage | ✅ |
| `DELETE` | `/api/leads/:id` | Delete a lead & cascade delete history | ✅ |
| `POST` | `/api/leads/:id/follow-ups/:followUpId/complete` | Log completed follow-up & schedule next sequence | ✅ |
| `PATCH` | `/api/leads/:id/follow-ups/:followUpId/reschedule` | Reschedule follow-up date | ✅ |
| `GET` | `/api/leads/:id/activities` | Fetch audit timeline activities for a lead | ✅ |
| `GET` | `/api/dashboard/stats` | Fetch pipeline metrics & follow-up counters | ✅ |

---


