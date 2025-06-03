# SaaS Cash Flow & P&L Analyzer

A comprehensive Next.js web application for analyzing and projecting SaaS business financials over a 12-month period. Features real-time calculations, interactive charts, dark mode support, and CSV export capabilities.

## ✨ Features

### 📊 Financial Analysis
- **12-month projections** with detailed monthly breakdowns
- **Client growth modeling** with seasonal patterns and churn rates
- **Revenue and expense tracking** with fixed and variable costs
- **Cash flow projections** with runway calculations
- **Break-even analysis** and profitability insights
- **$1M Revenue Goal Tracker** with timeline predictions
- **Interactive break-even calculations** with required vs actual clients

### 🎨 User Experience
- **Dark/Light mode** toggle with system preference detection
- **Real-time updates** - see projections change as you adjust inputs
- **Interactive sliders** for price, churn rate, and growth adjustments
- **Quick scenario buttons** (Conservative, Realistic, Optimistic, Aggressive)
- **Responsive design** - works on desktop, tablet, and mobile
- **Tabbed interface** for organized data presentation

### 📈 Visualizations
- Revenue vs Expenses line chart
- Monthly profit bar chart
- Cash flow area chart
- Client growth tracking
- **Break-even point charts** showing required vs actual metrics
- **$1M goal trajectory** with cumulative revenue tracking
- **Interactive progress bars** for break-even and revenue goals
- Key metrics dashboard

### 🎯 Predictive Analytics
- **"When will I break even?"** timeline predictions
- **"When will I reach $1M?"** goal tracking
- **Break-even point analysis** with visual indicators
- **Revenue trajectory modeling** with growth projections
- **Scenario impact analysis** with real-time calculations

### 💾 Data Management
- **PostgreSQL integration** for persistent configuration storage
- **Real-time database sync** - changes saved instantly
- **Multi-configuration support** with save/load/delete operations
- **Enhanced CSV export** with break-even and goal data
- **Preset scenarios** for quick analysis
- **Session management** for user-specific configurations
- **Interactive controls** for immediate parameter adjustments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (see [Database Setup](#database-setup))

### Installation

1. **Clone or download** the project files
2. **Navigate** to the project directory:
   ```bash
   cd pnlanalysis
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your PostgreSQL connection string.

5. **Set up database**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser** and go to `http://localhost:3000`

### Production Deployment

#### Quick Setup (Recommended)
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Manual Setup
```bash
npm run build
npm start
```

#### Using PM2 (Recommended for Production)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Docker Deployment
```bash
docker build -t pnl-analyzer .
docker run -p 3000:3000 --env-file .env pnl-analyzer
```

## 📋 Usage Guide

### 1. Basic Configuration
- Set your starting cash balance and date
- Configure initial client count
- Set monthly price per client
- Adjust churn rate (percentage of clients lost monthly)
- Define AI/variable costs per client

### 2. Fixed Costs Setup
- Infrastructure costs (hosting, tools, etc.)
- Salaries and wages
- Support team expenses
- Other monthly fixed expenses

### 3. Growth Pattern Editor
- **Monthly new clients**: Set expected client acquisition for each month
- **Capital purchases**: Add one-time expenses (equipment, marketing campaigns, etc.)
- **Quick presets**: Linear, Seasonal, or Aggressive growth patterns

### 4. Interactive Controls
- **Price slider**: Adjust monthly price per client ($10-$200)
- **Churn slider**: Set monthly churn rate (0-20%)
- **Growth slider**: Configure average monthly client acquisition (0-50)
- **Quick scenarios**: One-click presets for different business models

### 5. Prediction Sections
- **Break-even timeline**: Visual prediction of when you'll be profitable
- **$1M goal tracker**: Progress tracking and timeline to reach $1M revenue
- **Interactive charts**: Break-even point analysis and revenue trajectory
- **Improvement suggestions**: Actionable insights for faster growth

### 6. Analysis Tabs
- **Setup**: Basic configuration and fixed costs
- **Controls**: Interactive sliders and scenario planning
- **Predictions**: Break-even and $1M timeline analysis
- **Projections**: Detailed monthly financial table
- **Analysis**: Comprehensive break-even and goal tracking
- **Summary**: Key metrics and business health indicators
- **Charts**: Visual representations of your data
- **Export**: Download comprehensive CSV reports

### 7. Key Features Usage

#### Interactive Controls
- **Price Slider**: Drag to adjust monthly pricing ($10-$200)
- **Churn Slider**: Set customer retention rate (0-20% monthly churn)
- **Growth Slider**: Configure client acquisition rate (0-50 clients/month)
- **Quick Scenarios**: Try Conservative, Realistic, Optimistic, or Aggressive presets

#### Break-Even Analysis
- **Visual charts**: See required vs actual clients for profitability
- **Timeline prediction**: Know exactly when you'll break even
- **Progress tracking**: Monitor month-by-month break-even status
- **Improvement tips**: Get actionable suggestions to reach break-even faster

#### $1M Revenue Goal
- **Progress tracking**: Visual progress bar showing percentage to goal
- **Timeline prediction**: Estimated months to reach $1M revenue
- **Trajectory charts**: Compare actual vs projected revenue growth
- **Gap analysis**: See how many additional clients needed per month

#### Dark Mode
- Click the 🌙/☀️ button in the header
- Automatically saves your preference
- Respects system dark mode setting

#### Real-time Updates
- All projections update immediately when you change inputs
- Interactive sliders provide instant feedback
- No need to manually refresh or recalculate
- Visual loading indicators during updates

#### Save/Load Configurations
- **Save**: Stores current settings in PostgreSQL database
- **Save As**: Create new named configurations
- **Load**: Choose from saved configurations with descriptions
- **Auto-save**: Changes saved instantly to current configuration
- **Multi-user**: Each session maintains separate configurations
- **Reset**: Returns to default sample data

## 📊 Sample Data

The app comes pre-loaded with realistic SaaS business data:

- **Starting cash**: $0
- **Initial clients**: 5
- **Monthly price**: $49/client
- **Churn rate**: 3%
- **Fixed costs**: ~$7,700/month
- **AI costs**: $5/client/month
- **Seasonal growth**: Varying 3-20 new clients/month

## 🎯 Use Cases

### Business Planning
- **Fundraising**: Show investors realistic financial projections
- **Budget planning**: Understand cash flow needs and timing
- **Scenario analysis**: Test different pricing and growth strategies

### Financial Analysis
- **Break-even planning**: Visual timeline showing when you'll become profitable
- **Cash runway**: Understand how long your money will last
- **Growth impact**: See how client acquisition affects profitability
- **$1M goal tracking**: Monitor progress toward major revenue milestone
- **Scenario comparison**: Test different business model assumptions

### Strategic Decisions
- **Pricing optimization**: Use sliders to test different price points instantly
- **Cost management**: Analyze impact of expense changes in real-time
- **Growth strategies**: Compare conservative vs aggressive expansion scenarios
- **Churn optimization**: See immediate impact of retention improvements
- **Timeline planning**: Know exactly when to expect profitability and major milestones

## 🔧 Technical Details

### Built With
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first styling with dark mode
- **Recharts** - Interactive chart components
- **date-fns** - Date manipulation utilities
- **PostgreSQL** - Production-ready database
- **Drizzle ORM** - Type-safe database operations
- **Neon/Supabase** - Recommended database providers

### Architecture
- **Full-stack application** - Frontend + API + Database
- **PostgreSQL storage** - Persistent configuration management
- **RESTful API** - Clean separation of concerns
- **Session management** - User-specific data isolation
- **Real-time sync** - Instant database updates
- **Responsive design** - Mobile-first approach
- **Component-based** - Modular and maintainable code

### Production Features
- **Standalone build** - Single executable for deployment
- **Docker support** - Containerized deployment
- **PM2 integration** - Process management and monitoring
- **Database migrations** - Automated schema updates
- **Environment configuration** - Secure credential management

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)
- JavaScript required
- Database connection required

## 📁 Project Structure

```
pnlanalysis/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with dark mode
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── Header.tsx         # App header with dark mode toggle
│   ├── ClientInputForm.tsx # Basic configuration form
│   ├── GrowthPatternEditor.tsx # Growth and capital inputs
│   ├── InteractiveControls.tsx # Sliders and scenario buttons
│   ├── PredictionSections.tsx # Break-even and $1M predictions
│   ├── BreakEvenAnalysis.tsx # Detailed break-even analysis
│   ├── RevenueGoalTracker.tsx # $1M revenue goal tracking
│   ├── CashFlowTable.tsx  # Monthly projections table
│   ├── PnLReport.tsx      # Summary and insights
│   ├── ChartsDashboard.tsx # Interactive charts
│   └── DownloadButton.tsx # Enhanced CSV export
├── lib/                   # Utility functions
│   ├── calculations.ts    # Financial calculation logic
│   ├── config.ts          # Default configuration and storage
│   └── darkMode.tsx       # Dark mode context and hook
├── types/                 # TypeScript type definitions
│   └── index.ts           # Application interfaces
└── public/                # Static assets
```

## 🗄️ Database Setup

### Option 1: Neon (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb
   ```

### Option 2: Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get the connection string from Settings > Database
4. Add to `.env` file:
   ```
   DATABASE_URL=postgresql://postgres.project-ref:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Option 3: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb pnlanalysis`
3. Add to `.env` file:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/pnlanalysis
   ```

### Option 4: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a PostgreSQL service
3. Copy the connection string to your `.env` file

## 🚀 Production Deployment

### VPS/Server Deployment
1. **Prepare your server** (Ubuntu 20.04+ recommended)
2. **Install Node.js 18+** and npm
3. **Clone your repository**
4. **Run setup script**:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```
5. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Docker Deployment
```bash
# Build the image
docker build -t pnl-analyzer .

# Run the container
docker run -d \
  --name pnl-analyzer \
  -p 3000:3000 \
  --env-file .env \
  pnl-analyzer
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```bash
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PORT=3000
```

## 🤝 Contributing

This is a production-ready application for financial analysis. Feel free to:

- **Customize** the calculations for your specific business model
- **Add new metrics** or visualizations
- **Modify styling** to match your brand
- **Extend functionality** with additional features
- **Deploy** to your own infrastructure

## 📄 License

This project is provided as-is for educational and business analysis purposes.

## 🐛 Troubleshooting

### Common Issues

**Charts not displaying**: Ensure your browser supports modern JavaScript features.

**Data not saving**: Check your database connection and `.env` configuration.

**Database connection errors**: Verify your `DATABASE_URL` is correct and the database is accessible.

**Calculations seem wrong**: Verify your input values and check the console for any errors.

**Dark mode not working**: Clear your browser cache and reload the page.

**Sliders not responsive**: Try refreshing the page or check if JavaScript is enabled.

**Break-even predictions incorrect**: Ensure all cost inputs are accurate and positive values.

**Real-time updates delayed**: This is normal - calculations are debounced for performance.

**Configuration not loading**: Check database connectivity and migration status.

**PM2 process failing**: Check logs with `pm2 logs pnl-analyzer` and verify environment variables.

### Getting Help

1. Check the browser console for error messages
2. Verify database connection with `npm run db:studio`
3. Check server logs: `pm2 logs pnl-analyzer` (if using PM2)
4. Verify all input fields have valid numbers
5. Try resetting to default configuration
6. Ensure you're using a modern browser
7. Test database connectivity: `psql $DATABASE_URL`

---

## 🆕 Latest Features

### Interactive Controls (New!)
- **Real-time sliders** for price, churn, and growth adjustments
- **Instant scenario testing** with visual feedback
- **Quick preset buttons** for different business models

### Predictive Analytics (New!)
- **Break-even timeline** with month-by-month analysis
- **$1M revenue goal tracker** with progress visualization
- **Interactive charts** showing required vs actual metrics
- **Timeline predictions** for major business milestones

### Enhanced Visualizations (New!)
- **Break-even point charts** with profitability indicators
- **Revenue trajectory analysis** against $1M goal
- **Progress bars** with real-time updates
- **Dual-axis charts** for comprehensive analysis

**Happy analyzing!** 📈💰🎯