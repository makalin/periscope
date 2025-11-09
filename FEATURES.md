# Periscope Features

## Overview

This document describes all the features and tools available in the Periscope application.

## Core Features

### 1. Dashboard
- **Interactive Analytics Dashboard** with real-time metrics
- **Key Performance Indicators (KPIs)**:
  - Total Claims
  - Resolved Claims
  - Average Perimeter Score
  - Pending Claims
  - Recent Activity (7-day window)
- **Visual Charts**:
  - Claims Trend (Line Chart)
  - Claims by Domain (Bar Chart)
  - Perimeter Distribution (Pie Chart)
  - Claims by Type (Bar Chart)
  - Top Forecasters (Horizontal Bar Chart)
- **Period Filtering**: View data for last 30 days, 90 days, 1 year, or all time

### 2. Claims Management
- **View All Claims** with filtering by:
  - Domain (Economy, Politics, Technology, Earthquakes)
  - Status (Pending, Resolved, Expired, Invalid)
- **Create New Claims** with support for:
  - Numeric predictions
  - Categorical predictions
  - Probabilistic predictions
- **Resolve Claims** by submitting actual outcomes
- **Export Options**:
  - Export to PDF
  - Export to CSV

### 3. Leaderboard
- **Forecaster Rankings** based on Perimeter scores
- **Filtering Options**:
  - By Domain
  - By Time Period (1y, 6m, 3m, 1m)
- **Metrics Displayed**:
  - Total Claims
  - Resolved Claims
  - Average Perimeter
  - Weighted Perimeter
- **Export Options**:
  - Export to PDF
  - Export to CSV

### 4. Reports & Export

#### PDF Export
- **Full Report**: Complete analysis with statistics, leaderboard, and claims
- **Claims Report**: Detailed claims listing with all metadata
- **Leaderboard Report**: Forecaster rankings and metrics
- **Features**:
  - Professional formatting
  - Statistics summary
  - Tables with auto-layout
  - Page numbers and footers
  - Customizable title and date

#### CSV Export
- **Claims Export**: All claim data in CSV format
- **Leaderboard Export**: Forecaster rankings in CSV format
- **Features**:
  - Proper CSV escaping
  - All relevant fields included
  - Timestamped filenames

### 5. Analytics & Statistics

#### Analytics API Endpoints
- `GET /v1/analytics` - Get comprehensive analytics
- `GET /v1/analytics/trends` - Get trend data over time

#### Statistics Calculated
- Total, resolved, and pending claim counts
- Average Perimeter score
- Domain breakdown
- Type breakdown (numeric, categorical, probabilistic)
- Status breakdown
- Perimeter distribution (Excellent, Good, Fair, Poor)
- Recent activity metrics

### 6. Dark Theme
- **Theme Toggle**: Switch between light and dark modes
- **System Preference Detection**: Automatically detects user's system preference
- **Persistent Storage**: Theme preference saved in localStorage
- **Smooth Transitions**: Animated theme switching

## Utility Functions

### PDF Generation (`lib/pdfExport.ts`)
- `generatePDFReport()` - Generate comprehensive PDF reports
- `generateClaimsPDF()` - Generate claims-only PDF
- `generateLeaderboardPDF()` - Generate leaderboard-only PDF

### CSV Export (`lib/csvExport.ts`)
- `exportClaimsToCSV()` - Export claims to CSV
- `exportLeaderboardToCSV()` - Export leaderboard to CSV

### Analytics (`lib/analytics.ts`)
- `calculateAnalytics()` - Calculate comprehensive analytics
- `filterByPeriod()` - Filter claims by time period
- `getTrendData()` - Get trend data for charts

### Helper Functions (`src/utils/helpers.ts`)
- `formatDate()` - Format dates
- `formatDateTime()` - Format date and time
- `calculatePercentage()` - Calculate percentages
- `roundToDecimal()` - Round to decimal places
- `truncateText()` - Truncate long text
- `isValidUUID()` - Validate UUIDs
- `sanitizeInput()` - Sanitize user input
- `groupBy()` - Group arrays by key
- `sortBy()` - Sort arrays by key
- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls

## API Endpoints

### Claims
- `POST /v1/claims` - Create new claim
- `GET /v1/claims` - List claims (with filters)
- `GET /v1/claims/:id` - Get specific claim
- `POST /v1/claims/:id/resolve` - Resolve claim with outcome

### Leaderboard
- `GET /v1/leaderboard` - Get forecaster rankings

### Analytics
- `GET /v1/analytics` - Get analytics and statistics
- `GET /v1/analytics/trends` - Get trend data

### Health
- `GET /health` - Health check endpoint

## Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Charting library
- **jsPDF** - PDF generation
- **jspdf-autotable** - PDF table generation
- **date-fns** - Date manipulation
- **Axios** - HTTP client

### Backend
- **Fastify** - Fast web framework
- **PostgreSQL** - Database
- **Redis** - Caching and job queues
- **BullMQ** - Job queue management
- **Zod** - Schema validation

## Usage Examples

### Generate PDF Report
```typescript
import { generatePDFReport } from '@/lib/pdfExport'

generatePDFReport({
  title: 'Monthly Report',
  generatedAt: new Date(),
  claims: claimsData,
  leaderboard: leaderboardData,
  statistics: analyticsData
})
```

### Export to CSV
```typescript
import { exportClaimsToCSV } from '@/lib/csvExport'

exportClaimsToCSV(claims, 'my-claims-export.csv')
```

### Calculate Analytics
```typescript
import { calculateAnalytics } from '@/lib/analytics'

const analytics = calculateAnalytics(claims, leaderboard)
console.log(analytics.averagePerimeter)
```

## Future Enhancements

- [ ] Scheduled report generation
- [ ] Email report delivery
- [ ] Advanced filtering and search
- [ ] Claim comparison tools
- [ ] Forecaster profiles
- [ ] Prediction accuracy trends
- [ ] API rate limiting dashboard
- [ ] Real-time notifications
- [ ] Data visualization enhancements
- [ ] Export to Excel format

