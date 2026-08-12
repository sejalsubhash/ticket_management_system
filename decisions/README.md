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
