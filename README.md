# Budget Manager Web Application

A comprehensive budget management web application with AI features for personal and family finance tracking.

## Features

### Core Features
- **Multi-user Family Accounts**: Single account shared among family members
- **Income & Expense Tracking**: Track all financial transactions with categorization
- **Smart Categorization**: Automatic expense categorization with AI suggestions
- **Recurring Transactions**: Set up automated recurring income/expenses
- **Receipt Scanning**: OCR technology to extract transaction data from receipts
- **Budget Limits & Alerts**: Set budget thresholds with real-time alerts
- **Data Visualization**: Interactive charts and graphs for financial insights
- **Reporting**: Generate PDF reports for any time period
- **Offline Support**: View cached data when offline (AI features disabled)

### Technical Features
- **Zero-cost hosting**: Completely free deployment using Vercel and Render
- **Mobile-responsive design**: Works seamlessly on all devices
- **Modern React frontend**: Built with Vite for optimal performance
- **Secure authentication**: JWT-based authentication system
- **Real-time synchronization**: WebSocket connections for family member sync

## Technology Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API communication
- Chart.js for data visualization
- Styled Components for styling
- React Icons for UI icons

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- bcryptjs for password hashing
- Tesseract.js for OCR
- PDFKit for report generation

### Hosting & Deployment
- **Frontend**: Vercel (free tier)
- **Backend**: Render.com (free tier)
- **Database**: PostgreSQL on Render
- **File Storage**: Cloudinary (free tier for images)

## Project Structure

```
Budget/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Global styles
│   └── package.json
├── config/                # Configuration files
├── controllers/           # API controllers
├── database/              # Database schema and migrations
├── middleware/            # Express middleware
├── routes/                # API routes
├── .env.example          # Environment variables template
├── package.json          # Backend dependencies
└── server.js             # Main server file
```

## Database Schema

### Key Tables
1. **users**: User authentication and profile information
2. **family_accounts**: Shared family account information
3. **transactions**: All income/expense transactions
4. **categories**: Transaction categories (default + custom)
5. **budget_limits**: Budget threshold settings
6. **monthly_summaries**: Pre-calculated monthly reports
7. **annual_summaries**: Pre-calculated annual reports

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Budget
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up database**
```bash
# Create PostgreSQL database
# Run the schema.sql file
psql -U username -d budget_manager -f database/schema.sql
```

6. **Run development servers**

Backend:
```bash
npm run dev
```

Frontend (in separate terminal):
```bash
cd client
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Deployment

### Free Hosting Setup

1. **Frontend Deployment (Vercel)**
```bash
cd client
npm run build
# Deploy build folder to Vercel
```

2. **Backend Deployment (Render)**
- Create account on Render.com
- Deploy as Web Service
- Add PostgreSQL database addon
- Set environment variables

3. **Database Migration**
- Run schema.sql on Render PostgreSQL instance
- Configure connection strings in backend

### Environment Variables for Production

```
# Backend (.env)
PORT=5000
NODE_ENV=production
DB_HOST=your-render-db-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category

### Budgets
- `GET /api/budgets` - Get budget limits
- `POST /api/budgets` - Set budget limit
- `PUT /api/budgets/:id` - Update budget limit

### Reports
- `GET /api/reports/monthly/:year/:month` - Monthly report
- `GET /api/reports/annual/:year` - Annual report
- `POST /api/reports/generate-pdf` - Generate PDF report

## Development Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Project setup and structure
- [x] Database schema design
- [x] Authentication system
- [x] Basic API endpoints

### Phase 2: Core Features (In Progress)
- [ ] Transaction management
- [ ] Category system
- [ ] Dashboard implementation
- [ ] Family account sharing

### Phase 3: Advanced Features
- [ ] Receipt scanning OCR
- [ ] Budget limit system
- [ ] Reporting engine
- [ ] PDF generation

### Phase 4: AI Integration
- [ ] Automatic categorization
- [ ] Spending pattern analysis
- [ ] Predictive features
- [ ] Data visualization

### Phase 5: Polish & Deployment
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Production deployment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@budgetmanager.com or open an issue in the repository.