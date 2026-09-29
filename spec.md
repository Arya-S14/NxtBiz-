====================================================================
PROJECT NAME
====================================================================

NxtBiz

====================================================================
PROJECT TYPE
====================================================================

Spec-Driven AI Business Operations Automation Platform

====================================================================
PRIMARY OBJECTIVE
====================================================================

Build a full-stack business operations ecosystem where:

1. Operators authenticate securely
2. Admins and managers control users and roles
3. Teams manage customers and customer 360 records
4. Emails are processed into sentiment, intent, urgency, and recommendations
5. AI-style agents orchestrate operational follow-up
6. CRM activity and memory preserve business context
7. Meetings, invoices, tickets, reports, and workflows are managed from one console
8. PDFs are generated for invoices and reports
9. Socket.IO publishes live notifications
10. Dashboards show revenue, health, activity, and execution history

IMPORTANT:
This is NOT a chatbot project.

This IS:
- business operations automation
- CRM workspace
- AI-style agent orchestration
- workflow execution platform
- reporting and PDF generation system
- memory-backed operations console
- role-aware internal dashboard

====================================================================
IMPORTANT PROJECT STRUCTURE UPDATE
====================================================================

THE PROJECT ROOT ALREADY CONTAINS:

- client/
- server/

DO NOT CREATE:
- frontend/
- backend/

USE THE EXISTING STRUCTURE ONLY.

The current codebase contains legacy/internal OpsPilot labels. The final branded product should use NxtBiz consistently in visible UI, documentation, package metadata, generated PDFs, console messages, seed data, and service names.

====================================================================
CORE ARCHITECTURAL PRINCIPLE
====================================================================

ALL BUSINESS LOGIC MUST BE SPEC-DRIVEN OR DOCUMENTED IN THIS SPEC FILE.

NEVER hardcode future behavior without documenting it:
- agent routing rules
- workflow steps
- health score weights
- retry policies
- notification event names
- role permissions
- PDF content rules
- email intent categories

====================================================================
FINAL TECH STACK
====================================================================

FRONTEND
---------
Framework:
- Vite 6
- React 18

Language:
- JavaScript

Routing:
- React Router DOM 7

Styling:
- Tailwind CSS 3

State Management:
- Zustand
- TanStack React Query

Networking:
- Axios
- Socket.IO client

UI and Visualization:
- lucide-react
- Recharts
- Framer Motion
- react-hot-toast

--------------------------------------------------

BACKEND
--------
Runtime:
- Node.js with ES modules

Framework:
- Express 4

Database:
- MongoDB
- Mongoose 8

Validation:
- Zod

Authentication:
- JSON Web Tokens
- bcryptjs
- HTTP-only cookies
- refresh token rotation

Automation:
- BullMQ
- ioredis
- synchronous fallback when Redis is unavailable

Realtime:
- Socket.IO

PDF Generation:
- PDFKit

Security and Middleware:
- helmet
- cors
- compression
- cookie-parser
- morgan

Architecture:
- Modular Express architecture

====================================================================
ENVIRONMENT VARIABLES
====================================================================

Server variables:

- NODE_ENV
- PORT
- CLIENT_ORIGIN
- MONGODB_URI
- REDIS_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- ACCESS_TOKEN_EXPIRES_IN
- REFRESH_TOKEN_EXPIRES_IN
- PDF_BASE_URL
- EMAIL_FROM

Client variables:

- VITE_API_URL
- VITE_SOCKET_URL

Production must provide:

- MONGODB_URI
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET

====================================================================
AUTHENTICATION AND AUTHORIZATION
====================================================================

The system must support:

- register
- login
- refresh token rotation
- logout
- access token verification
- bearer token API calls
- HTTP-only cookie auth
- persistent client session
- protected frontend routes
- protected backend routes
- role-based access

Roles:

- Admin
- Manager
- Employee
- Viewer

Access rules:

- All business API routes require authentication.
- Admin and Manager can list users.
- Admin can create and delete users.
- Admin and Manager can update users.
- Admin and Manager can run agents manually.
- Admin and Manager can delete customers.
- Employee can create and update normal business records where allowed.
- Viewer can access read-oriented pages after authentication.

====================================================================
CORE MODULES
====================================================================

1. Executive Dashboard
2. User Management
3. Customer Management
4. Customer 360 View
5. Email Dashboard
6. CRM Timeline
7. Meetings
8. Invoices
9. Tickets
10. Reports
11. Workflows
12. AI Control Center
13. Memory Search
14. Notifications
15. Runtime Settings

====================================================================
EMAIL INTELLIGENCE
====================================================================

Incoming emails must be analyzed by subject and body.

The system must return:

- sentiment
- intent
- urgency
- confidence
- autoResponse
- recommendations

Sentiment values:

- positive
- neutral
- negative

Urgency values:

- low
- medium
- high
- critical

Intent values:

- general_inquiry
- schedule_meeting
- invoice_request
- support_request
- sales_opportunity

Negative signal words include:

- angry
- cancel
- broken
- refund
- late
- complaint
- urgent
- bad
- issue
- failed

Positive signal words include:

- thanks
- great
- love
- happy
- excellent
- appreciate
- renew

Critical urgency must be assigned when the email includes words like urgent, asap, or immediately.

====================================================================
AGENT ORCHESTRATION
====================================================================

The system must define these agents:

1. intent-agent
2. task-planner-agent
3. email-agent
4. crm-agent
5. meeting-agent
6. invoice-agent
7. customer-support-agent
8. chief-of-staff-agent

Every orchestration must:

1. Create an agent context
2. Execute intent-agent
3. Execute task-planner-agent
4. Execute planned domain agents
5. Execute crm-agent when planned
6. Execute chief-of-staff-agent
7. Mark the email as processed when an email id exists
8. Emit agent_completed through Socket.IO
9. Create a notification

Task planner rules:

- schedule_meeting -> meeting-agent
- invoice_request -> invoice-agent
- support_request -> customer-support-agent
- sales_opportunity -> email-agent
- every plan includes crm-agent
- every plan ends with chief-of-staff-agent

Agent execution records must store:

- agentId
- eventId
- status
- input
- output
- logs
- startedAt
- finishedAt
- error

Agent status must update on start, completion, and failure.

====================================================================
QUEUE AND FALLBACK BEHAVIOR
====================================================================

If REDIS_URL is configured:

- create BullMQ queue named agent-orchestration
- enqueue orchestration jobs
- use 3 attempts
- use exponential backoff
- remove completed and failed jobs after retention limits
- run worker with concurrency 4

If REDIS_URL is not configured:

- run orchestration synchronously
- warn that Redis is unavailable
- keep the application functional

====================================================================
WORKFLOW BUILDER
====================================================================

Workflow records must include:

- name
- trigger
- condition
- action
- steps
- enabled
- logs

Workflow step types:

- trigger
- condition
- action

Workflow execution must:

1. Load workflow by id
2. Throw an error if not found
3. Compare condition against serialized payload
4. Skip execution if the condition does not match
5. Create a ticket when the action contains ticket behavior and the payload has customerId
6. Create a notification when the action contains notify behavior
7. Append a completed or skipped workflow log
8. Save and return the workflow

====================================================================
PDF GENERATION
====================================================================

PDF generation must use PDFKit.

Generated PDFs must be stored in:

- server/storage/pdfs

Generated PDFs must be served through:

- /pdfs

Invoice PDFs must include:

- invoice id
- customer
- due date
- amount due
- generated-by text

Report PDFs must include:

- report title
- summary
- metric table
- recommendations

PDF filenames must be sanitized before writing to disk.

====================================================================
BUSINESS HEALTH SCORE
====================================================================

The business health score must combine:

- customer satisfaction
- response time
- invoice collection
- ticket resolution
- lead conversion

Current weights:

- customer satisfaction: 0.28
- response time: 0.16
- invoice collection: 0.20
- ticket resolution: 0.20
- lead conversion: 0.16

The function must return:

- score
- factors.customerSatisfaction
- factors.responseTime
- factors.invoiceCollection
- factors.leadConversion
- factors.ticketResolution
- factors.meetingMomentum

====================================================================
FRONTEND ROUTES
====================================================================

Public routes:

- /login
- /register

Protected routes:

- /
- /users
- /customers
- /customers/:id
- /emails
- /meetings
- /invoices
- /tickets
- /reports
- /crm
- /workflows
- /ai-control
- /settings

The protected layout must include:

- sidebar navigation
- user name and role
- unread alert count
- dark mode toggle
- logout action
- live Socket.IO connection

====================================================================
BACKEND API ROUTES
====================================================================

Health:

- GET /health

Auth:

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

Users:

- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

Dashboard:

- GET /api/dashboard

Customers:

- GET /api/customers
- GET /api/customers/:id
- POST /api/customers
- PUT /api/customers/:id
- DELETE /api/customers/:id

Emails:

- POST /api/emails/process
- GET /api/emails
- GET /api/emails/:id

CRM:

- GET /api/crm
- POST /api/crm/note
- POST /api/crm/activity

Meetings:

- GET /api/meetings
- POST /api/meetings
- PUT /api/meetings/:id
- DELETE /api/meetings/:id

Invoices:

- GET /api/invoices
- POST /api/invoices
- GET /api/invoices/:id
- GET /api/invoices/:id/download
- PUT /api/invoices/:id
- DELETE /api/invoices/:id

Tickets:

- GET /api/tickets
- POST /api/tickets
- PUT /api/tickets/:id
- DELETE /api/tickets/:id

Reports:

- POST /api/reports/generate
- GET /api/reports
- GET /api/reports/:id

Agents:

- GET /api/agents
- GET /api/agents/executions
- POST /api/agents/run

Workflows:

- GET /api/workflows
- POST /api/workflows
- GET /api/workflows/:id
- PUT /api/workflows/:id
- DELETE /api/workflows/:id
- POST /api/workflows/:id/execute

Memory:

- GET /api/memory/search

Notifications:

- GET /api/notifications
- PUT /api/notifications/:id

====================================================================
DATABASE MODELS
====================================================================

User:
- name
- email
- passwordHash
- role
- refreshTokenHash
- active
- lastLoginAt

Customer:
- name
- email
- phone
- company
- tags
- notes
- preferences
- healthScore

Email:
- subject
- body
- sender
- customerId
- sentiment
- intent
- urgency
- autoResponse
- recommendations
- processed

Meeting:
- title
- attendees
- startTime
- endTime
- notes
- status
- customerId

Invoice:
- customerId
- amount
- dueDate
- status
- pdfUrl
- lineItems

Report:
- type
- title
- metrics
- recommendations
- summary
- pdfUrl
- generatedBy

Ticket:
- customerId
- priority
- issue
- status
- assignedTo
- resolution

Agent:
- agentId
- name
- status
- lastExecution
- logs
- capabilities

AgentExecution:
- agentId
- eventId
- status
- input
- output
- logs
- startedAt
- finishedAt
- error

Workflow:
- name
- trigger
- condition
- action
- steps
- enabled
- logs

Notification:
- userId
- type
- title
- message
- read
- metadata

Memory:
- scope
- customerId
- agentId
- key
- value
- tags
- source

CRMActivity:
- customerId
- type
- title
- body
- metadata
- createdBy

====================================================================
SOCKET.IO EVENTS
====================================================================

The client listens for:

- new_email
- new_ticket
- invoice_created
- meeting_created
- agent_completed
- workflow_executed

When an event is received:

- show a toast
- invalidate React Query caches
- refresh visible data

====================================================================
SEED DATA
====================================================================

The seed script must create:

- Admin user
- Sample customer
- Negative Email Escalation workflow
- Agent definitions

Current local admin:

- email: admin@opspilot.local
- password: Admin12345

For final branding, this seed account should be renamed to a NxtBiz domain or documented as local-only demo data.

====================================================================
SECURITY REQUIREMENTS
====================================================================

The system must:

- hash passwords with bcryptjs
- never store raw passwords
- sign access tokens
- sign refresh tokens
- hash refresh tokens before saving
- clear auth cookies on logout
- support bearer token auth
- support cookie auth
- enforce role checks
- restrict CORS origins
- use helmet
- hide stack traces in production
- validate custom request bodies with Zod
- avoid logging secrets
- require strong secrets in production

====================================================================
UI REQUIREMENTS
====================================================================

The UI must:

- use a business operations console layout
- keep navigation visible and predictable
- support dark mode
- show loading states
- show error states
- show empty states
- use tables for repeated data
- use badges for statuses
- use charts for dashboard metrics
- use icons in navigation and actions
- show toast feedback
- avoid marketing-style landing pages
- prioritize repeated operational workflows

====================================================================
FINAL EXPECTED OUTCOME
====================================================================

At the end of the build, a user must be able to:

1. Start the server
2. Start the client
3. Seed sample data
4. Log in as an Admin
5. View the executive dashboard
6. Create customers
7. Process incoming emails
8. See agent orchestration complete
9. Review CRM activity
10. Create meetings
11. Generate invoices and PDFs
12. Manage support tickets
13. Generate weekly and executive reports
14. Create and execute workflows
15. Inspect agent execution history
16. Search memory
17. Receive live notifications
18. Log out safely

====================================================================
VERIFICATION REQUIREMENTS
====================================================================

Before calling the project complete:

- server package must pass `npm run build`
- client package must pass `npm run build`
- backend must start with MongoDB configured
- `/health` must return ok
- auth register/login must work
- protected route access must reject unauthenticated requests
- dashboard must load
- email processing must create an email
- orchestration must create agent execution records
- reports must generate PDF URLs
- invoices must generate PDF URLs
- workflows must execute and write logs
- Socket.IO events must invalidate frontend data
- final visible branding should say NxtBiz consistently