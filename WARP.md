# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Sim-Flow Dashboard: A role-based engineering simulation request management system. Built with React 19, TypeScript, and Vite.

## Development Commands

### Setup
```bash
npm install
```

### Development
```bash
npm run dev        # Start development server on port 3000
npm run build      # Build production bundle
npm run preview    # Preview production build
```

No test framework is currently configured in this project.

## Architecture

### Application Structure
This is a single-page application (SPA) using HashRouter for client-side routing. The app simulates a multi-role workflow system for managing simulation requests.

### State Management
- **Global State**: Context API via `SimFlowContext` (`context/SimFlowContext.tsx`)
- **Persistence**: localStorage for requests (`sim-flow-requests` key)
- **Authentication**: Mock user system with role switching (no real auth)

### User Roles & Workflow
The application models a 4-role system defined in `types.ts`:
1. **End-User** (`USER`): Submits simulation requests
2. **Manager** (`MANAGER`): Reviews feasibility, allocates resources, assigns engineers
3. **Engineer** (`ENGINEER`): Accepts/rejects assignments, performs work
4. **Admin** (`ADMIN`): Full system access

Request lifecycle flows through these statuses (see `RequestStatus` enum in `types.ts`):
```
SUBMITTED → FEASIBILITY_REVIEW → RESOURCE_ALLOCATION →
ENGINEERING_REVIEW → IN_PROGRESS → COMPLETED → ACCEPTED
                                           ↓
                              REVISION_REQUESTED / DENIED
```

### Core Components
- `App.tsx`: Root component with routing and layout
- `components/Dashboard.tsx`: Statistics and charts (uses Recharts)
- `components/NewRequest.tsx`: Request submission form
- `components/RequestList.tsx`: List view of all requests
- `components/RequestDetail.tsx`: Individual request management (status changes, comments)
- `components/RoleSwitcher.tsx`: Mock authentication role switching
- `components/Sidebar.tsx`: Navigation menu

### Data Model
Primary entity: `SimRequest` (defined in `types.ts`)
- Core fields: id, title, description, vendor, status, priority
- User tracking: createdBy, assignedTo (with name caching)
- Workflow data: estimatedHours
- Communication: comments array with author metadata

Mock users are defined in `MOCK_USERS` constant in `types.ts`.

### Styling
- Utility-first CSS with Tailwind-style classes (no config file present)
- Dark theme with slate color palette
- Lucide React for icons

### Path Aliases
`@/` resolves to project root (configured in `tsconfig.json` and `vite.config.ts`)

## Key Technical Decisions
- **No backend**: Fully client-side with localStorage persistence
- **Hash routing**: Uses HashRouter instead of BrowserRouter (likely for static hosting)
- **TypeScript config**: `experimentalDecorators` enabled, `useDefineForClassFields: false`
