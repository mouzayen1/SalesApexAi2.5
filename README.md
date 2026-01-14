# SalesApex AI

Professional automotive inventory and deal structuring platform with AI-powered analysis.

## Tech Stack

- **Client**: React + TypeScript + Vite, React Router, TanStack Query, Tailwind CSS
- **Server**: Node + TypeScript + Express, Zod validation
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Groq API for deal analysis

## Features

- Vehicle inventory with advanced filtering and search
- Voice-powered search using Web Speech API
- Payment calculator with live estimates
- Rehash Deal Optimizer with multi-lender support
- AI-powered deal analysis and recommendations

## Project Structure

```
/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── ...
├── server/          # Express API server
│   ├── src/
│   │   ├── routes/
│   │   └── db/
│   └── drizzle/
├── shared/          # Shared types, lenders, and Rehash engine
│   └── src/
└── ...
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

## Setup

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd SalesApexAi2.5
npm install
```

2. **Configure environment**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see Environment Variables section below).

3. **Set up database**

```bash
# Create database
createdb salesapexai

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

4. **Start development**

```bash
npm run dev
```

This starts both the API server (port 3001) and client (port 5173).

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build all packages for production
- `npm run test` - Run unit tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed sample vehicle data

## API Endpoints

### GET /api/cars
Returns filtered vehicle inventory.

Query parameters:
- `maxPrice`, `minPrice` - Price range
- `minYear`, `maxYear` - Year range
- `maxMiles` - Maximum mileage
- `make`, `model`, `bodyStyle`, `drivetrain`, `fuel`, `color` - Array filters
- `sort` - `price_asc`, `price_desc`, `year_desc`, `miles_asc`
- `search` - Full-text search

### GET /api/cars/:id
Returns single vehicle details.

### POST /api/rehash
Runs the Rehash deal optimizer.

Request body: `DealInput` object
Response: `RehashResult` with deals from all lenders

### POST /api/analyze-deal
AI-powered deal analysis using Groq.

Request body: `{ dealInput, dealCandidates[], selectedCandidateId? }`
Response: `{ status, analysis, strategy }`

### POST /api/triage
Bank-first triage ranking.

Request body: `{ validDeals[], targetPayment, mandatoryProducts[] }`
Response: `{ mode, bestDealId, reason, badge }`

## Rehash Engine

The Rehash engine evaluates deals across three lenders:

1. **Westlake Financial** - Cost-based evaluation
   - Programs: Platinum (680+ FICO), Gold (620+), Standard
   - 72-month terms, 18% PTI cap

2. **Western Funding** - Payment-based program ladder
   - Programs: NearPrime, SubprimeB, SubprimeA, DeepSubprime
   - 72-84 month terms, 25% PTI cap

3. **United Auto Credit (UAC)** - Risk-adjusted
   - Tier-based LTV caps (1-5)
   - 72-month terms, 20% PTI cap

### Key Calculations

- **Book Value**: Advanced depreciation model with age factors, mileage, make multipliers, and seasonal adjustments
- **Amount Financed**: Itemized by state (tax, doc fees, registration) plus products (GAP, VSC)
- **Dynamic APR**: FICO-based with LTV, down payment, and lender adjustments
- **Dealer Profit**: Front gross + backend (68% retention) + reserve (2% × 65%)

## Testing

Run the test suite:

```bash
npm run test
```

Tests include:
- Unit tests for all financial calculations
- 10-deal validation harness verifying:
  - Book value within ±2%
  - Amount financed within ±$100
  - Payment within ±$5
  - APR within ±0.5%
  - Approval/decline accuracy
  - Net check within ±2%

## Environment Variables

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GROQ_API_KEY` | Groq API key for AI deal analysis | No (mock response if missing) |
| `GROQ_MODEL` | Groq model ID (default: `llama-3.1-70b-versatile`) | No |

### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/salesapexai
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **IMPORTANT**: Never commit `.env.local` or any file with real credentials. The `.gitignore` is configured to exclude these files.

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:
   - `DATABASE_URL` - Your production PostgreSQL connection string
   - `GROQ_API_KEY` - Your Groq API key (get one at https://console.groq.com/keys)
4. Select which environments need each variable (Production, Preview, Development)

### GitHub Actions (CI/CD)

If you need secrets in GitHub Actions:

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add `DATABASE_URL` and `GROQ_API_KEY`

### Security Best Practices

- **Never** commit secrets to version control
- Use `GROQ_API_KEY` (not `NEXT_PUBLIC_GROQ_API_KEY`) to keep it server-side only
- The API key is only accessed in Vercel Serverless Functions, never exposed to the browser
- Rotate your API keys periodically

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Configure environment variables (see above)
3. Vercel will automatically detect the configuration from `vercel.json`
4. The app uses Vercel Serverless Functions in the `/api` directory

### Manual

```bash
npm run build
npm start
```

## License

MIT

---

*Deployed on Vercel*
