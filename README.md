# Task Management API

A REST API for a lightweight team task board: authenticated users create projects, manage members, and create/assign/track tasks through **To Do → In Progress → Done**.

Built with **Node.js, Express, MongoDB (Mongoose), JWT auth, and bcrypt** password hashing.

## What was already built vs. what was added

The auth layer (`controllers/authController.js`, `middleware/authMiddleware.js`, `middleware/roleMiddleware.js`, `models/userModel.js`, `routes/authRoutes.js`, `utils/*`, `validators/authValidator.js`, `config/db.js`) was provided and is untouched.

Added on top of it, following the exact same conventions (asyncHandler wrapper, AppError, express-validator + validationResult):

- `models/projectModel.js`, `models/taskModel.js`
- `controllers/projectController.js`, `controllers/taskController.js`
- `middleware/checkProjectAccess.js` — loads a project and checks the requester is the owner, a member, or an Admin
- `routes/projectRoutes.js`, `routes/taskRoutes.js` (nested under projects)
- `validators/projectValidator.js`, `validators/taskValidator.js`
- `app.js` / `server.js` — the Express app and entry point (didn't exist yet)
- `scripts/seed.js` — creates Admin/Member test accounts + a sample project
- `tests/` — Jest + Supertest integration tests

## Architecture overview

```
controllers/   → request handlers (business logic)
middleware/    → auth, role checks, project access checks, error handler
models/        → Mongoose schemas (User, Project, Task)
routes/        → Express routers
validators/    → express-validator rule sets
utils/         → AppError, asyncHandler, generateToken
config/        → MongoDB connection
scripts/       → seed script
tests/         → Jest + Supertest integration tests
app.js         → Express app (middleware + route wiring)
server.js      → connects to MongoDB, then starts the HTTP server
```

**Data model**

- `User`: name, email, password (hashed), role (`Admin` | `Member`, defaults to `Member`).
- `Project`: name, description, `owner` (the creator), `members` (array of Users, owner included by default).
- `Task`: title, description, `status` (`To Do` | `In Progress` | `Done`), `priority` (`Low` | `Medium` | `High`), dueDate, `project`, `creator`, `assignee`.

**Authorization rules (design decisions — not all spelled out in the brief, so documenting the calls made)**

- Any authenticated user can create a project; they become its `owner` and are added to `members`.
- **Visibility**: Admins see every project; everyone else only sees projects where they are the owner or a member. Same rule cascades to that project's tasks.
- **Update/delete a project**: the project's owner or an Admin.
- **Add/remove a project member**: Admin only (per the spec: *"Allow an Admin to add or remove project members"*), and only for projects they can already access.
- **Create a task**: anyone with access to the project (owner, member, or Admin).
- **Update/delete a task**: the task's creator, its assignee, the project owner, or an Admin.
- **Assignee** must be a member of the project (enforced on create and update).
- The public `/register` endpoint always creates a `Member` — there's no way to self-assign `Admin`. Admin accounts are provisioned via the seed script (see below) or created directly in the database — a deliberate security choice given the existing register logic wasn't meant to be touched.

## Setup

**Requirements:** Node.js 18+, a MongoDB instance (local or Atlas).

```bash
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a real JWT_SECRET
npm run dev        # nodemon, http://localhost:5000
# or
npm start
```

### Environment variables (`.env.example`)

| Variable    | Description                                  |
|-------------|-----------------------------------------------|
| `PORT`      | Port the API listens on (default 5000)        |
| `NODE_ENV`  | `development` / `production` / `test`         |
| `MONGO_URI` | MongoDB connection string                     |
| `JWT_SECRET`| Secret used to sign JWTs                      |

### Seed data (Admin + Member test accounts)

```bash
npm run seed
```

Creates:

| Role   | Email               | Password    |
|--------|---------------------|-------------|
| Admin  | admin@example.com   | Password123 |
| Member | member@example.com  | Password123 |

...plus a "Sample Project" both accounts belong to.

### Tests

```bash
npm test
```

Runs the Jest + Supertest suite (`tests/auth.test.js`, `tests/project.test.js`, `tests/task.test.js` — 13 tests covering registration, login, protected routes, project access control, admin-only membership management, task creation/validation/filtering, and cross-project authorization). Tests spin up an ephemeral in-memory MongoDB via `mongodb-memory-server`, so no local MongoDB install is required — just a normal internet connection the first time it runs (it downloads a small MongoDB binary and caches it).

## API Reference

All routes except register/login require `Authorization: Bearer <token>`.

### Auth
| Method | Route                | Body                          | Notes                  |
|--------|-----------------------|-------------------------------|------------------------|
| POST   | `/api/auth/register`  | `name, email, password`       | Always creates a Member |
| POST   | `/api/auth/login`     | `email, password`              | Returns a JWT           |
| GET    | `/api/auth/profile`   | –                              | Auth required           |

### Projects
| Method | Route                                | Body                      | Access                          |
|--------|----------------------------------------|---------------------------|----------------------------------|
| POST   | `/api/projects`                       | `name, description?`      | Any authenticated user           |
| GET    | `/api/projects`                       | –                          | Owner/member projects, or all for Admin |
| GET    | `/api/projects/:id`                   | –                          | Owner, member, or Admin          |
| PUT    | `/api/projects/:id`                   | `name?, description?`     | Owner or Admin                   |
| DELETE | `/api/projects/:id`                   | –                          | Owner or Admin                   |
| POST   | `/api/projects/:id/members`           | `userId` or `email`       | Admin only                       |
| DELETE | `/api/projects/:id/members/:userId`   | –                          | Admin only                       |

### Tasks (nested under a project)
| Method | Route                                             | Body / Query                                            | Access                     |
|--------|-----------------------------------------------------|-----------------------------------------------------------|-----------------------------|
| POST   | `/api/projects/:projectId/tasks`                   | `title, description?, status?, priority?, dueDate?, assignee?` | Project owner/member/Admin |
| GET    | `/api/projects/:projectId/tasks`                   | `?status=&priority=&assignee=`                             | Project owner/member/Admin |
| GET    | `/api/projects/:projectId/tasks/:taskId`           | –                                                           | Project owner/member/Admin |
| PUT    | `/api/projects/:projectId/tasks/:taskId`           | any of the create fields                                   | Creator, assignee, owner, or Admin |
| DELETE | `/api/projects/:projectId/tasks/:taskId`           | –                                                           | Creator, assignee, owner, or Admin |

A Postman collection covering every route above is included at `docs/postman_collection.json` — import it and set the `baseUrl` and `token` collection variables.

## Scope note

This delivers the **backend** requirements (Auth, Projects, Tasks, validation, centralized error handling, role-based access, seed data, automated tests). Frontend, Docker Compose, Swagger, and WebSockets from the bonus list aren't included here — happy to build any of those next if useful.
