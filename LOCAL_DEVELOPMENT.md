# LocalBoxs Local Development

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp env.example .env
# Edit .env with your local settings

# 3. Set up database
npx prisma migrate deploy

# 4. Start development server
npm run dev
```

## Local Development URLs

- **App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

## Database

- **Local PostgreSQL**: Use your existing PostgreSQL on port 5432
- **Or Docker**: `docker run -d -p 5432:5432 -e POSTGRES_DB=localboxs -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:15-alpine`

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/localboxs"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Other services (optional for local dev)
OPENAI_API_KEY="your-openai-key"
# ... etc
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev  # Create new migration
```

## Troubleshooting

- **Port 3000 in use**: Change port in `package.json` scripts
- **Database connection**: Check `DATABASE_URL` in `.env`
- **Build errors**: Run `npm run type-check` to see TypeScript errors
