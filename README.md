# DevPulse — Enterprise Agile Project & Sprint Collaboration Suite
> **MERN Stack Capstone Project**  
> Developed in accordance with the **ICT Academy of Kerala (ICTAK) Student Reference Guide**.

---

## Table of Contents
1. [Project Overview & Problem Statement](#1-project-overview--problem-statement)
2. [Target Users & Role-Based Access Control (RBAC)](#2-target-users--role-based-access-control-rbac)
3. [MVP Scope & User Stories](#3-mvp-scope--user-stories)
4. [MERN Architecture & Separation of Concerns](#4-mern-architecture--separation-of-concerns)
5. [Data Model & Schema Design](#5-data-model--schema-design)
6. [API Contract & HTTP Status Codes](#6-api-contract--http-status-codes)
7. [Frontend Architecture & UI States](#7-frontend-architecture--ui-states)
8. [Security & Privacy Implementations](#8-security--privacy-implementations)
9. [Automated Testing & Evidence of Completion](#9-automated-testing--evidence-of-completion)
10. [Local Quick Start Guide](#10-local-quick-start-guide)
11. [Hosting & Deployment Guide](#11-hosting--deployment-guide)
12. [Final Submission Checklist (ICTAK Section 13)](#12-final-submission-checklist-ictak-section-13)
13. [Self-Review Questions (ICTAK Section 14)](#13-self-review-questions-ictak-section-14)

---

## 1. Project Overview & Problem Statement

### Problem Statement
Modern software engineering teams frequently suffer from fragmented project communication, lack of transparent sprint velocity metrics, and disjointed task tracking between engineers and engineering leadership. Existing enterprise tools are often excessively complex, slow, or lack intuitive role-tailored workflows.

### Solution
**DevPulse** is a lightweight, responsive, full-stack MERN application that provides engineering teams with:
- Visual interactive 5-column **Kanban Boards** with optimistic drag-and-drop status transitions.
- Project milestone management with automatic sprint progress tracking.
- Embedded acceptance criteria checklists and collaborative discussion threads.
- Real-time **Workspace Audit Trails** and telemetry analytics.
- Strict **Role-Based Access Control (RBAC)** across Administrators, Engineering Managers, and Team Members.

---

## 2. Target Users & Role-Based Access Control (RBAC)

DevPulse defines three distinct organizational roles:

| Role | Permissions & Scope |
| :--- | :--- |
| **Administrator (`admin`)** | Full workspace governance. Can manage projects, view system telemetry, update team member roles (`admin`, `manager`, `member`), activate/deactivate accounts, and access system audit logs. |
| **Engineering Manager (`manager`)** | Can create, configure, update, and manage projects. Can assign tasks, establish deadlines and estimates, transition ticket workflows, and review sprint velocity analytics. |
| **Team Member (`member`)** | Can view assigned workspaces and projects, update task statuses on the Kanban board, complete checklist acceptance criteria, log task hours, and participate in ticket discussions. |

### Pre-Configured Evaluation Personas (1-Click Login)
For evaluator convenience, DevPulse comes pre-seeded with three demo personas (password: `Password123!`):
- **Admin**: `admin@devpulse.io` (Alex Morgan — Principal Architect)
- **Manager**: `sarah.lead@devpulse.io` (Sarah Chen — Engineering Lead & Scrum Master)
- **Member**: `alex.dev@devpulse.io` (Alex Rivera — Senior Full Stack Engineer)

---

## 3. MVP Scope & User Stories

### MVP Scope ("Must Have")
- [x] Secure user authentication using JWT and salted password hashing (`bcryptjs`).
- [x] Full CRUD operations for Projects with ownership checks and member assignment.
- [x] Full CRUD operations for Tasks with auto-generated ticket numbers (e.g., `PRJ-101`).
- [x] Interactive Kanban Board with 5 workflow states (`backlog`, `todo`, `in_progress`, `in_review`, `done`).
- [x] Embedded acceptance criteria subdocuments and task comments.
- [x] Search, multi-criteria filtering, sorting, and pagination across tasks and projects.
- [x] Real-time activity audit trail.
- [x] Dashboard telemetry cards and analytics breakdown.
- [x] 4 distinct screen states on all views: Loading, Success, Empty, and Error.

### Future Scope ("Later")
- [ ] Real-time WebSocket bidirectional task notifications via Socket.io.
- [ ] File attachment uploads to AWS S3 / Cloudinary.
- [ ] GitHub pull request and commit webhook integration.

### Example User Stories & Acceptance Criteria

#### Story 1: Task Creation & Assignment
- **As a** Project Manager,
- **I want to** create a task with a title, project, assignee, priority, and estimate,
- **So that** my engineering team knows what deliverable to build next.
- **Acceptance Criteria**:
  - Task title must be at least 2 characters long.
  - An empty title displays an inline validation message and blocks submission.
  - Submitting successfully creates the task with status 201 Created and updates the board without manual page refresh.
  - A user cannot assign tasks to a non-existent project.

#### Story 2: Kanban Status Transition
- **As a** Developer,
- **I want to** move a task from "To Do" to "In Progress" or "Done",
- **So that** the entire team has visibility into my current active work.
- **Acceptance Criteria**:
  - Dragging a card to a new column or clicking directional buttons instantly updates the UI optimistically.
  - Calls `PATCH /api/tasks/:id/status` with HTTP 200 OK.
  - If the server request fails, the card reverts to its previous column and displays a toast error notification.
  - Status change is recorded in the Workspace Activity Audit Log.

---

## 4. MERN Architecture & Separation of Concerns

```
+-------------------------------------------------------------------------+
|                              REACT CLIENT                               |
| (Browser SPA: Vite + React 18 + Vanilla CSS Design System + Context API) |
+-------------------------------------------------------------------------+
                                   |   ^
                    HTTP Requests  |   |  JSON Responses
                 (Bearer JWT Auth) |   |
                                   v   |
+-------------------------------------------------------------------------+
|                           EXPRESS / NODE API                            |
|             (Routes -> Auth / RBAC Middleware -> Controllers)           |
+-------------------------------------------------------------------------+
                                   |   ^
                     Mongoose ORM  |   |  Documents & Aggregations
                 (Schemas, Hooks)  |   |
                                   v   |
+-------------------------------------------------------------------------+
|                            MONGODB DATABASE                             |
|          (Atlas Cluster OR Zero-Config Embedded In-Memory Engine)        |
+-------------------------------------------------------------------------+
```

### Folder Structure (ICTAK Section 4)
```
capstone/
├── .gitignore               # Ignores node_modules, .env files, dist/, logs
├── package.json             # Root helper scripts for dev, test, and seed
├── README.md                # Full capstone documentation & verification
├── client/                  # Frontend React (Vite)
│   ├── .env                 # Local frontend environment variables
│   ├── .env.example         # Template frontend variables (no secrets)
│   ├── index.html           # HTML5 shell with Google Fonts & metadata
│   ├── package.json         # Client dependencies (React, Router, Lucide)
│   ├── vite.config.js       # Vite configuration
│   └── src/
│       ├── main.jsx         # React DOM mount point
│       ├── App.jsx          # Protected route layout & route declarations
│       ├── index.css        # Vanilla CSS Design System (HSL tokens, glassmorphism)
│       ├── components/      # Reusable UI pieces
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── PriorityBadge.jsx
│       │   ├── TaskModal.jsx
│       │   ├── ProjectModal.jsx
│       │   ├── ConfirmationModal.jsx
│       │   ├── LoadingSkeleton.jsx  # State 1: Loading
│       │   ├── EmptyState.jsx        # State 3: Empty
│       │   └── ErrorState.jsx        # State 4: Error
│       ├── pages/           # Route screens
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── ProjectsPage.jsx
│       │   ├── ProjectDetailPage.jsx # Deep link screen
│       │   ├── KanbanBoardPage.jsx   # 5-column Kanban board
│       │   ├── TasksListPage.jsx     # Paginated table with multi-filters
│       │   ├── AnalyticsPage.jsx     # Telemetry & JSON export
│       │   ├── UsersAdminPage.jsx    # Admin RBAC management
│       │   └── NotFoundPage.jsx      # 404 fallback
│       ├── services/        # Single API client and domain services
│       │   ├── api.js       # Universal fetch wrapper with token injection
│       │   ├── authService.js
│       │   ├── projectService.js
│       │   ├── taskService.js
│       │   └── statsService.js
│       ├── context/         # Global shared state
│       │   ├── AuthContext.jsx
│       │   └── ToastContext.jsx
│       └── hooks/
│           └── useAuth.js
└── server/                  # Backend Node.js / Express API
    ├── .env                 # Local backend secrets (git-ignored)
    ├── .env.example         # Template backend variables (no secrets)
    ├── package.json         # Server dependencies & scripts
    ├── test/
    │   └── api.test.js      # Automated 11-step integration test suite
    └── src/
        ├── server.js        # Server entry point & graceful shutdown
        ├── app.js           # Express app, middleware mounting, 404 fallback
        ├── config/
        │   └── db.js        # Resilient MongoDB connector (Atlas + Embedded fallback)
        ├── models/          # Mongoose schemas with validation & indexes
        │   ├── User.js
        │   ├── Project.js
        │   ├── Task.js
        │   └── ActivityLog.js
        ├── controllers/     # Request processing & business logic
        │   ├── authController.js
        │   ├── projectController.js
        │   ├── taskController.js
        │   ├── statsController.js
        │   └── userController.js
        ├── routes/          # Clean URL-to-controller routing
        │   ├── authRoutes.js
        │   ├── projectRoutes.js
        │   ├── taskRoutes.js
        │   ├── statsRoutes.js
        │   └── userRoutes.js
        ├── middleware/      # Cross-cutting concerns
        │   ├── authMiddleware.js  # JWT protect & authorize RBAC
        │   └── errorHandler.js   # Central JSON error formatter
        └── utils/
            ├── seedData.js   # Realistic initial dataset generator
            └── seedRunner.js # Standalone seed command runner
```

---

## 5. Data Model & Schema Design

### Entities & Relationships
- **User**: Authentication credentials, roles (`admin`, `manager`, `member`), job details.
- **Project**: Root container for sprints, owned by a User, referencing assigned team members.
- **Task**: Work deliverable referencing `Project` and `User` (assignee and reporter).
  - **Embedded Subdocuments**: `checklist` items (`[{ title: String, completed: Boolean }]`) and `comments` (`[{ user: ObjectId, authorName: String, text: String, createdAt: Date }]`).
- **ActivityLog**: Workspace audit events for system telemetry.

### Indexing Strategy
- `User`: Unique index on `email`.
- `Project`: Compound index on `{ owner: 1, status: 1 }` and `{ members: 1 }`.
- `Task`: Compound index on `{ project: 1, status: 1 }`, `{ assignee: 1, status: 1 }`, and index on `createdAt: -1`.
- `ActivityLog`: Compound index on `{ project: 1, createdAt: -1 }`.

---

## 6. API Contract & HTTP Status Codes

All API endpoints return consistent JSON structures:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "message": "...", "errors": [...] }`

| Method | Endpoint | Description | Auth | Success Code | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | Public | `200 OK` | `500` |
| `POST` | `/api/auth/register` | Register new user | Public | `201 Created` | `400, 409` |
| `POST` | `/api/auth/login` | Authenticate & get token | Public | `200 OK` | `400, 401, 403` |
| `GET` | `/api/auth/me` | Fetch active user profile | User | `200 OK` | `401` |
| `PUT` | `/api/auth/profile` | Update user profile | User | `200 OK` | `400, 401` |
| `GET` | `/api/projects` | List projects (search, filter, page) | User | `200 OK` | `401` |
| `GET` | `/api/projects/:id` | Get project details & task counts | User | `200 OK` | `401, 403, 404` |
| `POST` | `/api/projects` | Create new project | Manager/Admin | `201 Created` | `400, 401` |
| `PUT` | `/api/projects/:id` | Update project details | Owner/Admin | `200 OK` | `400, 401, 403, 404` |
| `DELETE` | `/api/projects/:id` | Delete project & cascade tasks | Owner/Admin | `200 OK` | `401, 403, 404` |
| `GET` | `/api/tasks` | List tasks (multi-filter, sorting, page) | User | `200 OK` | `401` |
| `GET` | `/api/tasks/:id` | Get task details & comments | User | `200 OK` | `401, 404` |
| `POST` | `/api/tasks` | Create task with auto-ticket number | User | `201 Created` | `400, 401, 404` |
| `PUT` | `/api/tasks/:id` | Update task details | User | `200 OK` | `400, 401, 404` |
| `PATCH` | `/api/tasks/:id/status` | Quick Kanban status transition | User | `200 OK` | `400, 401, 404` |
| `DELETE` | `/api/tasks/:id` | Delete task | Reporter/Admin | `200 OK` | `401, 403, 404` |
| `POST` | `/api/tasks/:id/comments` | Add embedded comment | User | `201 Created` | `400, 401, 404` |
| `GET` | `/api/stats/dashboard` | Dashboard metrics & telemetry | User | `200 OK` | `401` |
| `GET` | `/api/users` | List searchable team members | User | `200 OK` | `401` |
| `PATCH` | `/api/users/:id/role` | Update user role (RBAC) | Admin | `200 OK` | `400, 401, 403, 404` |
| `PATCH` | `/api/users/:id/status` | Toggle user active status | Admin | `200 OK` | `400, 401, 403, 404` |

---

## 7. Frontend Architecture & UI States

### Four Mandatory Screen States (ICTAK Section 7.3)
Every functional view implements all four states:
1. **Loading State**: Animated skeleton placeholders (`LoadingSkeleton.jsx`) matching card, table, and kanban column layouts while data is fetched.
2. **Success State**: Rich data presentation with glassmorphism, responsive cards, and color-coded badges.
3. **Empty State**: Friendly illustration and explanatory text (`EmptyState.jsx`) with a call-to-action button when a filter yields no results or a project has zero tasks.
4. **Error State**: Informative, non-technical error notification (`ErrorState.jsx`) featuring a "Retry Request" trigger.

---

## 8. Security & Privacy Implementations

DevPulse follows the security principles outlined in ICTAK Section 10:
- **Zero Secrets in Source**: All secrets (`JWT_SECRET`, database URIs, origins) are loaded strictly via `process.env`.
- **Password Salting & Hashing**: Passwords are encrypted using `bcryptjs` with salt rounds set to 10. `select: false` guarantees password hashes are never leaked in API queries.
- **Token Security**: Tokens are transmitted via `Authorization: Bearer <token>` headers, cryptographically verified on every protected request.
- **Ownership Verification**: Database record ownership is strictly enforced on the server. Non-admin users cannot modify or delete projects owned by other users.
- **Input Validation**: Server controllers validate request payloads before interacting with Mongoose models.
- **Safe Error Shielding**: Production errors never leak database stack traces to the browser client.

---

## 9. Automated Testing & Evidence of Completion

DevPulse includes an automated API test suite (`server/test/api.test.js`) verifying all critical server flows:

```bash
cd server
npm run test
```

### Verified Test Run Results:
```
🧪 Starting DevPulse Automated API Test Suite...

[DB] No MONGODB_URI specified. Initializing embedded MongoDB engine...
[DB] Embedded in-memory MongoDB initialized at: mongodb://127.0.0.1:59866/
[Test Server] Listening on port 5099

  ✅ PASS: GET /api/health returns 200 healthy
  ✅ PASS: POST /api/auth/register returns 201 with JWT token
  ✅ PASS: POST /api/auth/register returns 409 Conflict on existing email
  ✅ PASS: POST /api/auth/login returns 200 with JWT token
  ✅ PASS: POST /api/auth/login returns 401 Unauthorized on bad credentials
  ✅ PASS: GET /api/projects without token returns 401 Unauthorized
  ✅ PASS: POST /api/projects returns 201 with project object
  ✅ PASS: POST /api/tasks returns 201 with task number
  ✅ PASS: PATCH /api/tasks/:id/status updates state
  ✅ PASS: GET /api/stats/dashboard returns live telemetry metrics
  ✅ PASS: GET /api/unknown_endpoint returns 404 Not Found

========================================
Test Results: 11 Passed, 0 Failed
========================================
```

---

## 10. Local Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Step 1: Clone & Configure
```bash
# Clone the repository
git clone https://github.com/abhinav225403-pixel/capstone-project.git
cd capstone-project

# Client configuration
cp client/.env.example client/.env

# Server configuration
cp server/.env.example server/.env
```

> **Note on Database**: You can provide your MongoDB Atlas URI in `server/.env` under `MONGODB_URI`. If left blank, DevPulse automatically boots an in-memory MongoDB engine and seeds demo data with zero configuration!

### Step 2: Install Dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 3: Run the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Navigate to `http://localhost:5173` and click any **1-Click Evaluator Persona** (Admin, Manager, or Developer) to sign in instantly!

---

## 11. Hosting & Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variables: `VITE_API_URL=https://your-api-domain.com/api`
4. **SPA Route Fallback**: A `vercel.json` or Netlify `_redirects` file with `/* /index.html 200` ensures that deep-linking directly to `/projects/:id` or `/kanban` serves `index.html` without 404 errors.

### Backend Deployment (Render / Railway)
1. Build command: `npm install`
2. Start command: `node src/server.js`
3. Environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET=<strong-random-secret-key>`
   - `CLIENT_ORIGIN=https://your-frontend-domain.com`

---

## 12. Final Submission Checklist (ICTAK Section 13)

- [x] **GitHub repository URL**: [https://github.com/abhinav225403-pixel/capstone-project](https://github.com/abhinav225403-pixel/capstone-project) (accessible to reviewers).
- [x] **README explains the project, features, tech stack, setup steps, environment variable names, and live links.**
- [x] **Core flows tested and working end-to-end (registration, login, project creation, task management, kanban board, analytics).**
- [x] **`.env` files are excluded from Git repository (`.gitignore`), and `.env.example` templates are provided.**
- [x] **No secrets, hardcoded passwords, or personal data appear in the repository or commit history.**
- [x] **Commit history reflects steady progress with clear, descriptive commit messages.**
- [x] **All 4 screen states (Loading, Success, Empty, Error) are implemented across all major screens.**
- [x] **Known limitations and future improvements are transparently documented.**

---

## 13. Self-Review Questions (ICTAK Section 14)

### 1. Can I explain the problem my project solves and who it is for in two sentences?
DevPulse solves the problem of fragmented task coordination and opaque velocity metrics in software engineering teams. It provides engineering leads and developers with an intuitive, unified agile workspace featuring Kanban workflows, milestone tracking, and live audit telemetry.

### 2. Does the MVP work from start to finish without manual workarounds?
Yes. A user can register a new account or log in with a pre-seeded persona, create projects, assign team members, create tasks with automated ticket numbering, transition tasks on the Kanban board with instant UI feedback, and view real-time sprint analytics without refreshing or workarounds.

### 3. Can I trace one request from the React component to the database and back?
Yes: When a user clicks to move a task to "In Progress" on `KanbanBoardPage.jsx`, the component triggers `taskService.updateTaskStatus(taskId, 'in_progress')`. This issues a `PATCH` request with the Bearer JWT token to `http://localhost:5000/api/tasks/:id/status`. Express passes the request through `authMiddleware.protect` (verifying token validity and extracting user identity), routes it to `taskController.updateTaskStatus`, which updates the task status in MongoDB via Mongoose, creates an entry in `ActivityLog`, and returns HTTP 200 with the updated task object. React receives the JSON response and shows a toast confirmation.

### 4. What happens if the user enters bad input, loses internet, or the API fails?
- **Bad Input**: Frontend form validation catches empty or invalid fields before submission and displays inline errors. Server middleware validates payloads and returns HTTP 400 Bad Request with descriptive JSON error arrays.
- **Network Loss / API Failure**: The universal `api.js` client catches network errors and presents a non-technical notification (`Unable to connect to the backend server`). The `ErrorState.jsx` component displays a friendly message with a "Retry Request" action.

### 5. Which data is protected, and how do I stop one user from reaching another user's data?
User passwords are protected with salted bcrypt hashes and hidden by default (`select: false`). Project data is protected on the server: non-admin users can only view and query projects where they are either the owner or an assigned team member (`query.$or = [{ owner: req.user._id }, { members: req.user._id }]`). Mutation and deletion endpoints verify that `project.owner.toString() === req.user._id.toString()` before allowing modifications.

### 6. Where are my secrets stored, and could anyone find them in the browser or on GitHub?
Secrets (`JWT_SECRET`, database credentials) are stored exclusively in `server/.env`, which is strictly ignored by `.gitignore` and never committed to Git. Only variables prefixed with `VITE_` (such as the public API base URL) are included in the frontend build, ensuring no sensitive credentials or keys are exposed to the browser.

### 7. Does it work well on a phone and with a keyboard only?
Yes. The CSS design system is built mobile-first with flexible flexbox/grid containers and collapsible navigation drawers. Interactive elements (buttons, inputs, modal dialogs) have distinct `:focus` rings, standard ARIA labels, and keyboard listeners (`Enter`, `Escape`) for accessible navigation.

### 8. Can someone else clone my repository and run the project by following my README?
Yes. The README provides step-by-step setup instructions. Furthermore, DevPulse includes an embedded MongoDB fallback engine, meaning any evaluator can run `npm install` and `npm run dev` to evaluate the complete application immediately without needing to configure or install an external database daemon.

### 9. What would break first if the number of users grew tenfold?
The in-memory embedded MongoDB engine and in-process activity logging would hit memory and throughput limits. To scale tenfold, the application would transition to a multi-node MongoDB Atlas replica set, implement Redis caching for session tokens and frequent dashboard telemetry aggregations, and introduce message queues (e.g., BullMQ or Kafka) for background audit logging.

### 10. What would I improve next, and why?
Next improvements include integrating WebSockets for real-time multi-user cursor visibility on the Kanban board, adding automated CSV/PDF report generation for sprint retrospectives, and implementing OAuth2 single sign-on (SSO) with GitHub and Google.
