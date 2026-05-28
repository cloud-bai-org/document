## ADDED Requirements

### Requirement: Frontend framework
The system SHALL use Next.js (React) as the frontend framework.

#### Scenario: Project bootstrap uses Next.js
- **WHEN** the project is initialized
- **THEN** the frontend SHALL be a Next.js application using React

#### Scenario: A new page is added
- **WHEN** a developer creates a new user-facing page
- **THEN** the page SHALL be implemented as a Next.js React component

### Requirement: Client-side routing
The system SHALL use React Router for client-side routing within the Next.js application.

#### Scenario: A new client route is registered
- **WHEN** a developer registers a new client-side route
- **THEN** the route SHALL be defined through React Router

### Requirement: Backend framework
The system SHALL use Hono as the backend framework for HTTP API endpoints.

#### Scenario: A new API endpoint is added
- **WHEN** a developer implements a new HTTP API endpoint
- **THEN** the endpoint SHALL be implemented using Hono

### Requirement: BFF responsibility boundary
The system SHALL use Next.js API Route handlers as a thin Backend-For-Frontend (BFF) layer between the frontend and the Hono backend service. The BFF layer SHALL forward, aggregate, or reshape responses, and MUST NOT contain business logic, data access, or domain rules.

#### Scenario: Frontend calls the backend
- **WHEN** a frontend page or component calls the backend
- **THEN** the call SHALL be issued to a same-origin Next.js API Route handler
- **AND** the API Route handler SHALL delegate to the Hono service via a server-side request

#### Scenario: A business rule is implemented
- **WHEN** a developer implements a new business rule, validation, authorization check, or domain-level computation
- **THEN** the implementation SHALL live in the Hono service
- **AND** the implementation SHALL NOT live in the Next.js BFF layer

#### Scenario: BFF fails to reach Hono
- **WHEN** the BFF layer cannot reach the Hono service
- **THEN** the BFF SHALL respond with HTTP 502 and a structured error payload
- **AND** the failure SHALL NOT be silently swallowed

### Requirement: Programming language
The system SHALL use TypeScript or JavaScript across frontend and backend code.

#### Scenario: A new source file is added
- **WHEN** a developer adds a new source file
- **THEN** the file SHALL use TypeScript or JavaScript

### Requirement: Package manager and runtime version
The system SHALL pin the package manager version and require a Node.js runtime of version 20 or newer.

#### Scenario: Package manager version is locked
- **WHEN** any contributor installs dependencies
- **THEN** the package manager and its exact version SHALL be enforced by the `packageManager` field in the root `package.json`
- **AND** running `corepack enable` SHALL be sufficient to obtain the pinned package manager version

#### Scenario: Node.js minimum version is enforced
- **WHEN** the project is installed, built, or run
- **THEN** the runtime SHALL be Node.js 20 or newer
- **AND** the minimum version SHALL be declared via the `engines.node` field in the root `package.json`
- **AND** an `.nvmrc` (or equivalent version manager file) at the project root SHALL pin a concrete LTS version

#### Scenario: A contributor uses a Node.js version below 20
- **WHEN** a contributor attempts to install or build the project on Node.js older than 20
- **THEN** the package manager SHALL emit an `engines` warning or refuse to proceed

### Requirement: Relational database
The system SHALL use PostgreSQL as the primary relational database.

#### Scenario: Persistent data is stored
- **WHEN** the system persists relational data
- **THEN** the data SHALL be stored in PostgreSQL

### Requirement: ORM layer
The system SHALL use Drizzle as the ORM for database access from application code.

#### Scenario: A new database query is implemented
- **WHEN** a developer implements a database query in application code
- **THEN** the query SHALL be expressed through Drizzle

#### Scenario: Database schema is defined
- **WHEN** a developer defines or evolves database schema
- **THEN** the schema SHALL be expressed in Drizzle schema definitions (TypeScript)

### Requirement: Automated testing framework
The system SHALL use Vitest as the automated testing framework for unit and integration tests.

#### Scenario: A new automated test is added
- **WHEN** a developer adds a new automated test
- **THEN** the test SHALL be written for execution by Vitest

### Requirement: Container baseline
The system SHALL provide a baseline Docker configuration sufficient to build and run the application image. Advanced container optimization (multi-stage build refinements, image slimming, distroless bases) is out of scope for this baseline.

#### Scenario: Application is built as a container image
- **WHEN** a developer builds the application image
- **THEN** a Dockerfile at the project root SHALL produce a runnable image

#### Scenario: Application runs from container image
- **WHEN** the built container image is executed
- **THEN** the application SHALL start and serve requests on its configured port

### Requirement: Performance-first delivery for 2C
The system SHALL prioritize end-user performance for its 2C user experience. SEO is delivered at a baseline level only.

#### Scenario: A new user-facing page is shipped
- **WHEN** a developer ships a new user-facing page
- **THEN** the page SHALL provide baseline SEO metadata (title, description, Open Graph tags)
- **AND** the page SHALL be implemented with attention to perceived load time and interactivity (use of SSR, static rendering, code splitting, or caching as appropriate to the page)
