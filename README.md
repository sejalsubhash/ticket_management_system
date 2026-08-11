# IT Helpdesk - Ticket Management System

A three-tier containerized IT Helpdesk / Ticket Management System built with React, Node.js/Express, and Couchbase.

## Architecture

- **Frontend**: React + Vite (Port 5173 / 80)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: Couchbase Cloud

## Features

- User authentication (JWT)
- Role-based access control (Admin, Agent, User)
- Ticket CRUD with status workflow (Open → In Progress → Resolved → Closed)
- Priority and category management
- Comments/notes on tickets
- Dashboard with analytics charts
- Admin user management

## Quick Start

### Docker (Recommended)

```bash
docker-compose up --build
```

### Local Development

**Server:**
```bash
cd server
npm install
cp .env.example .env  # configure your env vars
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Server (.env)

| Variable | Description |
|----------|-------------|
| COUCHBASE_CONN_STRING | Couchbase connection string |
| COUCHBASE_USERNAME | Couchbase username |
| COUCHBASE_PASSWORD | Couchbase password |
| COUCHBASE_BUCKET | Couchbase bucket name |
| JWT_SECRET | Secret for JWT signing |
| PORT | Server port (default: 5000) |
| FRONTEND_URL | Frontend URL for CORS |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/tickets | Yes | List tickets |
| POST | /api/tickets | Yes | Create ticket |
| GET | /api/tickets/:id | Yes | Get ticket |
| PUT | /api/tickets/:id | Yes | Update ticket |
| DELETE | /api/tickets/:id | Admin | Delete ticket |
| POST | /api/tickets/:id/comments | Yes | Add comment |
| GET | /api/tickets/:id/comments | Yes | List comments |
| GET | /api/tickets/dashboard | Yes | Dashboard stats |
| GET | /api/users | Admin | List users |
| PUT | /api/users/:id/role | Admin | Update role |

## Deployment

Deploy to Render.com using the included `render.yaml` blueprint.
