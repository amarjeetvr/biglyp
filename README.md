# BigLyp Task Manager

A full-stack edge-native task management application built with Cloudflare Workers and Next.js.

## Tech Stack

**Backend:**
- Cloudflare Workers (serverless runtime)
- Hono (lightweight web framework)
- Cloudflare D1 (SQLite database)
- Drizzle ORM
- jose (JWT authentication)
- bcryptjs (password hashing)
- Zod (validation)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript (strict mode)
- Tailwind CSS (styling)

## Features

- User authentication (register/login)
- Task CRUD operations
- Task filtering by status (Todo, In Progress, Done)
- JWT-based authorization
- Responsive UI with Tailwind CSS
- Loading and error states

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Wrangler CLI (`npm install -g wrangler`)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Cloudflare D1 database:
   ```bash
   wrangler d1 create biglyp_db
   ```

4. Update `wrangler.toml` with your database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "biglyp_db"
   database_id = "YOUR_DATABASE_ID"
   ```

5. Generate and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. Set the JWT secret:
   ```bash
   wrangler secret put JWT_SECRET
   ```

7. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8787
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - List user tasks (optional `?status=` filter)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a single task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Database Schema

### Users Table
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL, UNIQUE)
- `password` (TEXT, NOT NULL)
- `created_at` (INTEGER, DEFAULT NOW)

### Tasks Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL, FOREIGN KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT, nullable)
- `status` (TEXT, NOT NULL, DEFAULT 'todo') - one of: 'todo', 'in-progress', 'done'
- `due_date` (INTEGER, nullable)
- `created_at` (INTEGER, DEFAULT NOW)
- `updated_at` (INTEGER, DEFAULT NOW)

## Deployment

### Deploy Backend to Cloudflare Workers
```bash
cd backend
wrangler deploy
```

### Deploy Frontend to Cloudflare Pages
```bash
cd frontend
wrangler pages deploy
```

## Environment Variables

### Backend (.env)
- `JWT_SECRET` - Secret key for JWT signing (use wrangler secrets)
- `DB` - D1 database binding (configured in wrangler.toml)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - URL of the deployed backend Worker

## Project Structure

```
biglyp/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── tasks.ts
│   │   ├── utils/
│   │   │   ├── auth.ts
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── id.ts
│   │   │   └── validation.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml
│   └── drizzle.config.ts
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── components/
│   │   │   ├── TaskList.tsx
│   │   │   └── CreateTaskModal.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── globals.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Security Notes

- Passwords are hashed with bcryptjs before storage
- JWT tokens expire after 24 hours
- All task endpoints require valid JWT authentication
- Users can only access their own tasks (ownership validation)
- Secrets are stored with `wrangler secret` and never committed to Git
- TypeScript strict mode enforces type safety

## Development Tips

1. **Test authentication**: Use the register page to create a test account
2. **Test task filtering**: Click the status tabs to filter tasks
3. **Test ownership**: Log in with a different account and verify you can't see other users' tasks
4. **Check D1 database**: Use `wrangler d1 execute` to query the database
5. **View logs**: Use `wrangler tail` to stream Worker logs

## Troubleshooting

**D1 Database not found**: Make sure you've set the correct database_id in wrangler.toml

**JWT errors**: Ensure JWT_SECRET is set with `wrangler secret put JWT_SECRET`

**CORS errors**: The backend includes CORS middleware - check browser console for details

**Connection refused**: Make sure the backend is running and the NEXT_PUBLIC_API_URL is correct

## License

MIT
