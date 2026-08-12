# Decisions Log

Track all architectural, design, and implementation decisions for context management.

## Format

Each decision entry:
- **Date**: YYYY-MM-DD
- **Decision**: What was decided
- **Context**: Why it was needed
- **Alternatives**: What was considered
- **Impact**: Affected files/components

---

## Decisions

### Decision 1: Dark/Light Mode Implementation

- **Date**: 2026-08-12
- **Decision**: Implement dark/light mode using CSS custom properties + React Context
- **Context**: User requested theme toggle for better UX and accessibility
- **Alternatives**:
  1. CSS-only approach (no persistence) - Rejected: no user preference memory
  2. Third-party library (e.g., styled-components) - Rejected: adds bundle size
  3. CSS variables + React Context - Selected: lightweight, persistent, maintainable
- **Impact**:
  - Created: `client/src/context/ThemeContext.jsx`
  - Modified: `client/src/index.css` (dark theme variables)
  - Modified: `client/src/App.jsx` (ThemeProvider wrapper)
  - Modified: `client/src/components/Layout/Navbar.jsx` (toggle button)
- **Technical Details**:
  - Theme stored in localStorage
  - Applied via `data-theme` attribute on `<html>`
  - CSS variables remapped for dark mode
  - Toggle button uses FiSun/FiMoon icons

### Decision 2: Ticket Filtering by Date Range

- **Date**: 2026-08-12
- **Decision**: Add date range filtering to ticket list
- **Context**: Users need to filter tickets by creation date for reporting
- **Alternatives**:
  1. Predefined date ranges (today, this week, etc.) - Rejected: less flexible
  2. Custom date range inputs - Selected: full flexibility
- **Impact**:
  - Modified: `server/src/controllers/ticketController.js` (startDate, endDate params)
  - Modified: `server/src/models/ticket.js` (date range N1QL query)
  - Modified: `client/src/pages/TicketsPage.jsx` (date inputs)
- **Technical Details**:
  - ISO date string comparison in Couchbase N1QL
  - Two date inputs: start and end

### Decision 3: File Attachment Support

- **Date**: 2026-08-12
- **Decision**: Add file attachment support using multer
- **Context**: Users need to attach files to tickets and comments
- **Alternatives**:
  1. Base64 encoding in document - Rejected: size limits, performance
  2. External storage (S3) - Rejected: adds complexity
  3. Multer + local storage - Selected: simple, already configured
- **Impact**:
  - Created: `server/src/middleware/upload.js` (multer config)
  - Modified: `server/src/routes/tickets.js` (upload middleware)
  - Modified: `server/src/controllers/ticketController.js` (file handling)
  - Modified: `server/src/models/ticket.js` (attachments field)
  - Modified: `server/src/models/comment.js` (attachments field)
  - Modified: `client/src/components/Tickets/CreateTicketModal.jsx` (file input)
  - Modified: `client/src/components/Tickets/CommentSection.jsx` (file input)
  - Modified: `client/src/pages/TicketDetailPage.jsx` (attachment display)
- **Technical Details**:
  - Max 5 files per ticket, 3 per comment
  - 10MB limit per file
  - Allowed: images, PDFs, documents
  - Files stored in `server/uploads/`

### Decision 4: Bulk Ticket Import

- **Date**: 2026-08-12
- **Decision**: Add bulk import via JSON/CSV files
- **Context**: Admins need to import multiple tickets at once
- **Alternatives**:
  1. CSV only - Rejected: JSON more flexible
  2. JSON only - Rejected: CSV easier from spreadsheets
  3. Both JSON and CSV - Selected: maximum compatibility
- **Impact**:
  - Modified: `server/src/controllers/ticketController.js` (bulkCreate)
  - Modified: `server/src/routes/tickets.js` (POST /bulk)
  - Created: `client/src/components/Tickets/BulkImportModal.jsx`
  - Modified: `client/src/pages/TicketsPage.jsx` (import button)
- **Technical Details**:
  - Max 100 tickets per import
  - Preview before import
  - Error reporting per row
  - Validation on each ticket

### Decision 5: Loading Spinners on Async Operations

- **Date**: 2026-08-12
- **Decision**: Add loading indicators to all async operations
- **Context**: Users need feedback during async operations
- **Alternatives**:
  1. Full-page loading only - Rejected: poor UX for filter changes
  2. Inline spinners + full-page - Selected: better UX
- **Impact**:
  - Modified: `client/src/pages/TicketsPage.jsx` (filter spinner)
  - Modified: `client/src/pages/TicketDetailPage.jsx` (status update spinner)
  - Modified: `client/src/pages/AdminUsersPage.jsx` (role update spinner)
  - Modified: `client/src/components/Tickets/CommentSection.jsx` (submit spinner)
  - Modified: `client/src/components/Tickets/CreateTicketModal.jsx` (create spinner)
- **Technical Details**:
  - Small inline spinners for quick operations
  - Full-page spinner for initial loads
  - Disabled state during operations

### Decision 6: Mobile Responsiveness

- **Date**: 2026-08-12
- **Decision**: Add responsive CSS for mobile devices
- **Context**: Users need to access the app on mobile devices
- **Alternatives**:
  1. Separate mobile app - Rejected: too complex
  2. Responsive CSS with media queries - Selected: simplest solution
- **Impact**:
  - Modified: `client/src/index.css` (media queries)
  - Modified: `client/src/pages/DashboardPage.jsx` (responsive grids)
  - Modified: `client/src/pages/TicketDetailPage.jsx` (responsive meta)
  - Modified: `client/src/components/Tickets/CreateTicketModal.jsx` (responsive form)
- **Technical Details**:
  - Breakpoints: 768px, 480px
  - Single column layouts on mobile
  - Horizontal scroll for tables
  - Reduced padding on mobile

### Decision 7: Ticket Search

- **Date**: 2026-08-12
- **Decision**: Add full-text search on ticket title and description
- **Context**: Users need to find tickets quickly by keyword
- **Alternatives**:
  1. Title-only search - Rejected: too limited
  2. Full-text search with title + description - Selected: comprehensive
- **Impact**:
  - Modified: `server/src/models/ticket.js` (LIKE query with LOWER)
  - Modified: `server/src/controllers/ticketController.js` (search param)
  - Modified: `client/src/pages/TicketsPage.jsx` (search input)
- **Technical Details**:
  - Case-insensitive search using LOWER()
  - LIKE query with wildcards for partial matches
  - Debounced input for performance

### Decision 8: Ticket Export

- **Date**: 2026-08-12
- **Decision**: Add CSV export with filter support
- **Context**: Users need to export tickets for reporting and sharing
- **Alternatives**:
  1. PDF export - Rejected: more complex, less useful for data
  2. CSV export - Selected: simple, spreadsheet-compatible
- **Impact**:
  - Modified: `server/src/controllers/ticketController.js` (exportTickets)
  - Modified: `server/src/routes/tickets.js` (GET /export)
  - Modified: `client/src/pages/TicketsPage.jsx` (export button)
- **Technical Details**:
  - Exports filtered tickets (respects current filters)
  - Downloads as .csv file
  - Includes all ticket fields

### Decision 9: Password Change

- **Date**: 2026-08-12
- **Decision**: Add password change functionality
- **Context**: Users need to change their password for security
- **Alternatives**:
  1. Email-based reset - Rejected: requires email service
  2. In-app password change - Selected: simpler, immediate
- **Impact**:
  - Modified: `server/src/controllers/authController.js` (changePassword)
  - Modified: `server/src/routes/auth.js` (PUT /password)
  - Created: `client/src/components/Auth/ChangePasswordModal.jsx`
  - Modified: `client/src/components/Layout/Navbar.jsx` (lock icon)
- **Technical Details**:
  - Requires current password verification
  - New password min 6 characters
  - Modal with form validation

### Decision 10: SLA Tracking

- **Date**: 2026-08-12
- **Decision**: Add SLA deadline tracking based on priority
- **Context**: Need to track response time compliance
- **Alternatives**:
  1. External SLA tool - Rejected: adds complexity
  2. Built-in SLA calculation - Selected: integrated solution
- **Impact**:
  - Modified: `client/src/pages/DashboardPage.jsx` (SLA stats)
- **Technical Details**:
  - SLA targets: Critical: 4h, High: 8h, Medium: 24h, Low: 72h
  - Shows remaining time or overdue status
  - Dashboard shows SLA met/warning/breached counts

### Decision 11: Dashboard Date Range

- **Date**: 2026-08-12
- **Decision**: Add date range filtering to dashboard
- **Context**: Users need to view stats for specific time periods
- **Alternatives**:
  1. Preset ranges (last 7 days, 30 days) - Rejected: less flexible
  2. Custom date range - Selected: full control
- **Impact**:
  - Modified: `client/src/pages/DashboardPage.jsx` (date inputs)
- **Technical Details**:
  - Two date inputs: start and end
  - Clear button to reset
  - Filters all dashboard stats
