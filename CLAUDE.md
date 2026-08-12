# Project Context

## Overview
IT Helpdesk Ticket Management System - React + Node.js/Express + Couchbase

## Architecture
- **Frontend**: React 18 + Vite, react-router-dom 6, plain CSS with variables
- **Backend**: Node.js + Express, Couchbase N1QL queries
- **Auth**: JWT tokens stored in localStorage
- **File uploads**: Multer to local `uploads/` directory

## Key Files
- `client/src/App.jsx` - Routes + auth guards
- `client/src/context/AuthContext.jsx` - Auth state
- `client/src/context/ThemeContext.jsx` - Dark/light mode
- `client/src/services/api.js` - Axios instance with interceptors
- `server/src/models/ticket.js` - Ticket CRUD + queries
- `server/src/controllers/ticketController.js` - API handlers

## Commands
- `cd client && npm run dev` - Start frontend
- `cd server && npm run dev` - Start backend
- `cd client && npm run build` - Build frontend

## Code Review Tools
- `npm run review` - Review uncommitted changes
- `npm run review:staged` - Review staged changes only
- `npm run watch` - Auto-review on file changes (client/src)
- `npm run watch:all` - Auto-review all directories
- Pre-commit hook runs automatically on `git commit`

## Conventions
- Use CSS variables for colors (dark mode compatible)
- All components use `export default function ComponentName()`
- API calls use `api` instance from `services/api.js`
- Toast notifications via `react-hot-toast`
- Icons from `react-icons/fi` (Feather icons)

## Database
- Couchbase bucket: `travel-sample`
- Document types: `ticket`, `user`, `comment`
- Key pattern: `type::uuid`
- N1QL queries with positional parameters ($1, $2, etc.)

## Environment
- Frontend: `VITE_API_URL` (default: `/api`)
- Backend: See `server/.env.example`
