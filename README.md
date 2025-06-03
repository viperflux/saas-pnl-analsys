# SaaS P&L Analyzer

A comprehensive Next.js application for SaaS financial modeling, cash flow analysis, and revenue projections with real-time calculations, interactive dashboards, and multi-user authentication.

## ✨ Features

### 🔐 Authentication & User Management
- **User authentication** with JWT tokens and secure sessions
- **Role-based access** (Admin/User) with protected routes
- **Multi-user support** with isolated configurations
- **Admin dashboard** for user management

### 📊 Financial Analysis
- **Multi-year projections** with customizable timeframes (12-60 months)
- **Revenue modeling** with pricing tiers and subscription plans
- **Cash flow analysis** with runway calculations
- **Break-even analysis** and profitability insights
- **Growth scenario planning** with seasonal patterns
- **Feature add-ons management** with flexible pricing models

### 🎯 Advanced Analytics
- **Growth scenarios** (Conservative, Aggressive, Market Entry)
- **Custom pricing tiers** with feature limitations
- **Hybrid pricing models** (subscription + usage-based)
- **Revenue goal tracking** with milestone predictions
- **What-if analysis** with real-time parameter adjustments

### 📈 Interactive Dashboards
- **Real-time charts** with Recharts visualization
- **Dark/Light mode** with system preference detection
- **Responsive design** for all device sizes
- **Interactive controls** with immediate feedback
- **Export capabilities** (CSV, PDF reports)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm/yarn package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd pnlanalysis
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**:
   ```bash
   npm run db:migrate
   ```

5. **Start development**:
   ```bash
   npm run dev
   ```

6. **Access application**:
   - Open http://localhost:3000
   - Default admin: `admin@gmail.com` / `admin123`

## 📁 Project Structure

```
pnlanalysis/
├── app/                           # Next.js App Router
│   ├── (auth)/
│   │   └── login/                 # Authentication pages
│   ├── admin/                     # Admin dashboard
│   ├── api/                       # API routes
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── configurations/        # Configuration management
│   │   └── admin/                 # Admin operations
│   ├── debug/                     # Debug utilities
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main dashboard
│
├── components/                    # React components
│   ├── ui/                        # Base UI components
│   │   ├── Header.tsx             # Navigation header
│   │   └── DownloadButton.tsx     # Export functionality
│   ├── forms/                     # Input forms
│   │   ├── ClientInputForm.tsx    # Basic configuration
│   │   ├── EnhancedInputForm.tsx  # Advanced inputs
│   │   └── InteractiveControls.tsx # Real-time controls
│   ├── charts/                    # Data visualizations
│   │   ├── ChartsDashboard.tsx    # Main dashboard
│   │   ├── CashFlowTable.tsx      # Financial tables
│   │   ├── PnLReport.tsx          # P&L summaries
│   │   ├── BreakEvenAnalysis.tsx  # Break-even charts
│   │   └── RevenueGoalTracker.tsx # Goal tracking
│   ├── dashboard/                 # Dashboard components
│   │   ├── HybridDashboard.tsx    # Hybrid pricing dashboard
│   │   ├── HybridPricingTable.tsx # Pricing tables
│   │   └── PredictionSections.tsx # Prediction widgets
│   └── management/                # Management interfaces
│       ├── ConfigurationManager.tsx      # Config management
│       ├── GrowthScenarioManager.tsx     # Scenario planning
│       ├── FeatureAddonsManager.tsx      # Add-on management
│       ├── HybridPricingConfigurator.tsx # Pricing setup
│       ├── GrowthPatternEditor.tsx       # Growth modeling
│       └── ProjectionTimeframeSelector.tsx # Time controls
│
├── lib/                           # Core libraries
│   ├── auth/                      # Authentication
│   │   ├── auth.ts                # Server-side auth
│   │   └── auth-edge.ts           # Edge runtime auth
│   ├── database/                  # Database layer
│   │   ├── db.ts                  # Database operations
│   │   ├── schema.ts              # Drizzle schema
│   │   └── migrate.ts             # Migration utilities
│   ├── calculations/              # Business logic
│   │   ├── calculations.ts        # Core calculations
│   │   └── hybridCalculations.ts  # Hybrid pricing
│   └── utils/                     # Utilities
│       ├── config.ts              # App configuration
│       ├── hybridConfig.ts        # Hybrid config
│       ├── apiClient.ts           # API client
│       └── darkMode.tsx           # Theme management
│
├── database/                      # Database files
│   ├── schema.sql                 # Complete database schema
│   ├── migrations/                # SQL migrations
│   │   ├── 001_add_authentication.sql
│   │   └── 002_extended_features.sql
│   └── scripts/                   # Database scripts
│       ├── migrate.ts             # Migration runner
│       ├── deploy-migrate.js      # Deployment migration
│       └── upload-schema.js       # Schema deployment
│
├── scripts/                       # Utility scripts
│   ├── admin/                     # Admin utilities
│   │   ├── setup-admin.js         # Admin setup
│   │   ├── update-admin.js        # Admin updates
│   │   ├── fix-admin-password.ts  # Password reset
│   │   └── test-auth.ts           # Auth testing
│   └── setup.sh                   # Production setup
│
├── docs/                          # Documentation
│   ├── AUTHENTICATION.md          # Auth documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── Prompt.md                  # Development notes
│
├── types/                         # TypeScript definitions
├── middleware.ts                  # Next.js middleware
├── drizzle.config.ts             # Drizzle configuration
└── package.json                   # Dependencies & scripts
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with roles and authentication
- **configurations** - Financial configurations per user
- **user_sessions** - Session management
- **custom_pricing_tiers** - Flexible pricing structures
- **growth_scenarios** - Growth modeling templates
- **feature_addons** - Add-on services and features
- **configuration_addons** - Configuration-addon relationships

### Key Features
- **Multi-tenant** - User-isolated data
- **Flexible pricing** - Support for multiple models
- **Audit trails** - Created/updated timestamps
- **Relationships** - Proper foreign key constraints

## ⚙️ Configuration

### Environment Variables
```bash
# Database (Required)
DATABASE_URL=postgresql://user:pass@host:port/db
POSTGRES_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Database Providers
- **Neon** (Recommended) - Serverless PostgreSQL
- **Supabase** - Open-source Firebase alternative
- **Railway** - Simple database hosting
- **Local PostgreSQL** - Self-hosted option

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Drizzle Studio
npm run db:generate     # Generate migrations

# Admin
npm run admin:setup     # Setup admin user
npm run admin:update    # Update admin credentials
```

### Key Development Files
- `middleware.ts` - Route protection and authentication
- `drizzle.config.ts` - Database configuration
- `lib/database/schema.ts` - Type-safe database schema
- `lib/auth/auth.ts` - Authentication logic

## 🚀 Deployment

### Quick Deploy
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Deploy
```bash
npm run build
npm run db:migrate
npm start
```

### Production with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Docker
```bash
docker build -t pnl-analyzer .
docker run -p 3000:3000 --env-file .env pnl-analyzer
```

## 👥 User Management

### Default Admin User
- **Email**: `admin@gmail.com`
- **Password**: `admin123` (change after first login)
- **Role**: Admin

### User Roles
- **Admin** - Full system access, user management
- **User** - Personal configurations and analysis

### Admin Features
- User account management
- System-wide configuration templates
- Usage analytics and monitoring

## 📊 Financial Modeling

### Core Metrics
- **Monthly Recurring Revenue (MRR)**
- **Customer Acquisition Cost (CAC)**
- **Customer Lifetime Value (CLV)**
- **Churn rate and retention**
- **Cash runway and burn rate**

### Growth Scenarios
- **Conservative** - Steady 5-8% growth
- **Aggressive** - 10-15% monthly growth
- **Market Entry** - High initial growth, then stabilization

### Pricing Models
- **Subscription** - Fixed monthly/annual pricing
- **Usage-based** - Pay-per-use or tiered usage
- **Hybrid** - Combination of subscription + usage
- **Feature add-ons** - Optional premium features

## 🔧 Technical Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless functions
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe database operations
- **JWT** - Stateless authentication

### DevOps
- **Docker** - Containerization
- **PM2** - Process management
- **Nginx** - Reverse proxy (optional)

## 🔐 Security Features

- **JWT authentication** with secure httpOnly cookies
- **Role-based access control** (RBAC)
- **SQL injection protection** via parameterized queries
- **XSS protection** with Content Security Policy
- **CSRF protection** with SameSite cookies
- **Password hashing** with bcrypt

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Android Chrome)

## 🐛 Troubleshooting

### Database Issues
```bash
# Check database connection
npm run db:studio

# Reset database
npm run db:migrate

# Check migration status
npm run db:generate
```

### Authentication Issues
```bash
# Test authentication
npm run admin:setup

# Reset admin password
npm run admin:update
```

### Build Issues
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## 📈 Performance

### Optimization Features
- **Server-side rendering** for fast initial loads
- **Static generation** for marketing pages
- **Image optimization** with Next.js Image
- **Bundle analysis** and code splitting
- **Database connection pooling**

### Monitoring
- **Error tracking** with built-in logging
- **Performance metrics** via Next.js analytics
- **Database query optimization** with Drizzle

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Set up local database
5. Run tests: `npm test`
6. Submit pull request

### Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Component-based** architecture

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [Authentication Guide](docs/AUTHENTICATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)

### Getting Help
1. Check the [troubleshooting section](#-troubleshooting)
2. Review browser console for errors
3. Verify environment variables
4. Check database connectivity
5. Review application logs

---

**Built with ❤️ for SaaS financial analysis**
