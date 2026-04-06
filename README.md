# ☁️ CloudCost - Multi-Cloud Infrastructure Cost Monitoring System

A modern, full-stack web application for monitoring and optimizing cloud infrastructure costs across **AWS, Azure, and Google Cloud Platform (GCP)** with a premium dark-themed UI and unified multi-cloud management.

![CloudCost Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-20.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![Multi--Cloud](https://img.shields.io/badge/Multi--Cloud-AWS%20%7C%20Azure%20%7C%20GCP-orange)

## 🎯 Features

### Multi-Cloud Management 🌐
- ☁️ **Unified Dashboard** - Monitor AWS, Azure, and GCP costs in one place
- 🔄 **Cloud Account Management** - Connect and manage multiple cloud provider accounts
- 📊 **Cross-Cloud Comparison** - Compare costs and usage across providers
- 📈 **Multi-Cloud Analytics** - Unified reporting and cost analysis
- 🎯 **Provider-Specific Budgets** - Set individual budgets for each cloud provider
- 🔔 **Consolidated Alerts** - Get alerts from all cloud providers in one dashboard
- 📄 **Multi-Cloud Reports** - Comprehensive reports with provider breakdowns

### Core Features
- 📊 **Real-time Cost Tracking** - Monitor costs across multiple cloud providers (AWS, Azure, GCP)
- 💰 **Budget Management** - Set monthly budgets and track spending per provider
- 📈 **Advanced Analytics** - Interactive charts with daily, monthly, and cumulative cost trends
- 🔔 **Service-Specific Alerts** - Get notified when specific services exceed thresholds
- 💡 **Smart Recommendations** - AI-powered cost optimization suggestions based on actual usage
- 📄 **CSV Export to S3** - Download and store cost reports in Amazon S3
- 🎨 **Premium Dark UI** - Modern glassmorphism design with orange accents

### Multi-Cloud Features
- **Cloud Accounts** - Add and manage AWS, Azure, and GCP accounts
- **Multi-Cloud Compare** - Side-by-side cost comparison with visual charts
- **Usage Metrics** - Track compute hours, storage, network, and API calls across providers
- **Budget & Alerts** - Provider-specific budgets with threshold alerts
- **Reports** - Comprehensive multi-cloud cost reports with export functionality

### Multi-User Support
- 🔐 **Secure Authentication** - JWT-based user authentication with bcrypt password hashing
- 👥 **User Isolation** - Complete data separation between users
- 🔑 **Protected Routes** - Secure access control for all pages
- 📱 **User Profiles** - Individual user settings and preferences

### Service Management
- ➕ **Add Services** - Track custom cloud services from any provider
- ✏️ **Edit Services** - Update service details and costs
- 🗑️ **Remove Services** - Delete services from tracking
- 🔄 **Toggle Status** - Enable/disable service tracking
- 📊 **Cost Analysis** - View percentage of total budget per service

### Cloud Provider Integration
- **AWS** - S3 Export, CloudWatch Monitoring, EC2, RDS, Lambda metrics
- **Azure** - Virtual Machines, Blob Storage, SQL Database, App Service
- **GCP** - Compute Engine, Cloud Storage, Cloud SQL, Cloud Functions

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Beautiful data visualization
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Minimal web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Elegant MongoDB ODM
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **AWS SDK** - S3 and CloudWatch integration

### Design
- **Dark Mode Only** - Premium dark theme
- **Glassmorphism** - Modern UI effects
- **Smooth Animations** - Page transitions and interactions (300ms)
- **Responsive Design** - Mobile and desktop optimized
- **Provider Color Coding** - AWS (Orange), Azure (Blue), GCP (Red)

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- AWS Account (optional, for S3/CloudWatch features)
- Azure Account (optional, for Azure Cost Management)
- GCP Account (optional, for GCP Billing API)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/VaidikRokad123/cloud.git
cd cloud
```

### 2. Setup Backend

```bash
cd server
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Configure `.env`:**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/cloudcost
JWT_SECRET=your_secure_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your-cloudcost-bucket

# Azure Configuration (Optional)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# GCP Configuration (Optional)
GCP_PROJECT_ID=your-project-id
GCP_SERVICE_ACCOUNT_KEY=path-to-service-account-key.json
```

### 3. Setup Frontend

```bash
cd ../client
npm install
```

### 4. Seed Database with Test Data

```bash
cd ../server
node seed.js
```

This creates 5 test users with 90 days of cost data, billing history, and alerts:
- **vaidik@cloudcost.com** / 123456 (TechCorp Inc - $15,000 budget)
- **ruksh@cloudcost.com** / 123456 (DataFlow Systems - $12,000 budget)
- **rudra@cloudcost.com** / 123456 (CloudScale Ltd - $18,000 budget)
- **rishi@cloudcost.com** / 123456 (DevOps Solutions - $10,000 budget)
- **ridham@cloudcost.com** / 123456 (InfraHub Co - $20,000 budget)

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**Terminal 2 - Backend:**
```bash
cd server
npm start
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Mode

**Build Frontend:**
```bash
cd client
npm run build
```

**Start Backend:**
```bash
cd server
NODE_ENV=production npm start
```

## 📁 Project Structure

```
cloudcost/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout.jsx    # Main layout wrapper
│   │   │   ├── Navbar.jsx    # Top navigation bar
│   │   │   ├── Sidebar.jsx   # Left navigation panel
│   │   │   ├── PageTransition.jsx  # Page animations
│   │   │   └── ProtectedRoute.jsx  # Auth guard
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx # Main dashboard
│   │   │   ├── Services.jsx  # Service management
│   │   │   ├── Budget.jsx    # Budget & alerts
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── CloudAccounts.jsx  # Multi-cloud accounts
│   │   │   ├── MultiCloudComparison.jsx
│   │   │   ├── MultiCloudUsage.jsx
│   │   │   ├── MultiCloudBudget.jsx
│   │   │   ├── MultiCloudReports.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/          # React context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── AppContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/         # API services
│   │   │   └── api.js
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── controllers/          # Route controllers
│   │   ├── auth.controller.js
│   │   ├── cost.controller.js
│   │   ├── cloud.controller.js  # Multi-cloud
│   │   ├── alert.controller.js
│   │   ├── export.controller.js
│   │   └── monitoring.controller.js
│   ├── models/              # MongoDB models
│   │   ├── User.js
│   │   ├── CostRecord.js
│   │   ├── CloudAccount.js  # Multi-cloud accounts
│   │   ├── Alert.js
│   │   └── BillingRecord.js
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   │   └── auth.js
│   ├── services/            # Cloud services
│   │   ├── s3Service.js     # AWS S3
│   │   ├── cloudwatchService.js  # AWS CloudWatch
│   │   ├── azureService.js  # Azure Cost Management
│   │   └── gcpService.js    # GCP Billing API
│   ├── utils/               # Utility functions
│   ├── seed.js              # Database seeder
│   ├── server.js            # Entry point
│   └── package.json
│
├── MULTI_CLOUD_INTEGRATION.md  # Multi-cloud setup guide
└── README.md
```

## 🎨 UI Features

### Premium Dark Theme
- **Glassmorphism Effects** - Translucent cards with backdrop blur
- **Orange Gradient Accents** - Modern color scheme (#f59e0b to #d97706)
- **Smooth Animations** - 300ms transitions throughout
- **Page Transitions** - Fade and slide effects between pages
- **Responsive Design** - Works on mobile, tablet, and desktop

### Dashboard Charts
- **Daily Cost Trend** - 30-day area chart with gradient fill
- **Cost by Service** - Horizontal progress bars with provider colors
- **Service Distribution** - Interactive donut chart
- **Cost by Type** - Bar chart (Compute, Storage, Database, Network)
- **Cumulative Spend** - Running total area chart
- **Monthly Trend** - 6-month line chart
- **Top 3 Cost Drivers** - Service ranking cards

### Multi-Cloud Pages
- **Cloud Accounts** - Manage AWS, Azure, GCP accounts with sync functionality
- **Multi-Cloud Compare** - Side-by-side cost comparison with charts
- **Usage Metrics** - Compute hours, storage, network, API calls tracking
- **Budget & Alerts** - Provider-specific budgets with visual progress bars
- **Reports** - Comprehensive reports with 6-month trends and CSV export

## 🔐 Environment Variables

### Server (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | Yes | 5001 |
| `MONGO_URI` | MongoDB connection string | Yes | mongodb://localhost:27017/cloudcost |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes | your_super_secret_key_here_32chars |
| `JWT_EXPIRE` | JWT expiration time | Yes | 7d |
| `AWS_REGION` | AWS region | No | us-east-1 |
| `AWS_ACCESS_KEY_ID` | AWS access key | No | AKIAIOSFODNN7EXAMPLE |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | No | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |
| `S3_BUCKET_NAME` | S3 bucket name | No | my-cloudcost-bucket |
| `AZURE_TENANT_ID` | Azure tenant ID | No | your-tenant-id |
| `AZURE_CLIENT_ID` | Azure client ID | No | your-client-id |
| `AZURE_CLIENT_SECRET` | Azure client secret | No | your-client-secret |
| `GCP_PROJECT_ID` | GCP project ID | No | your-project-id |
| `GCP_SERVICE_ACCOUNT_KEY` | GCP service account key path | No | /path/to/key.json |

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Costs
- `GET /api/costs/summary` - Get cost summary (total, budget, % used)
- `GET /api/costs/services` - Get services breakdown with percentages
- `GET /api/costs/daily` - Get daily costs (last 30 days)
- `GET /api/costs/monthly` - Get monthly costs (last 6 months)
- `POST /api/costs/services` - Add new service
- `PUT /api/costs/services/:id` - Update service
- `DELETE /api/costs/services/:id` - Remove service

### Multi-Cloud
- `POST /api/cloud/add` - Add cloud account (AWS/Azure/GCP)
- `GET /api/cloud/list` - List all connected cloud accounts
- `DELETE /api/cloud/:id` - Delete cloud account
- `GET /api/cloud/comparison` - Get multi-cloud cost comparison
- `POST /api/cloud/sync` - Sync costs from all providers

### Budget
- `GET /api/budget` - Get budget settings
- `PUT /api/budget` - Update budget settings

### Recommendations
- `GET /api/recommendations` - Get cost optimization recommendations

### Export
- `POST /api/export/costs` - Export cost data to CSV/S3
- `POST /api/export/billing` - Export billing data
- `GET /api/export/date-range` - Get available date range

### Monitoring (AWS CloudWatch)
- `GET /api/monitoring/ec2/:instanceId` - Get EC2 CPU metrics
- `GET /api/monitoring/rds/:dbInstanceId` - Get RDS connections
- `POST /api/monitoring/utilization` - Get resource utilization

## 🧪 Testing

### Test User Accounts

| Email | Password | Company | Budget | Services |
|-------|----------|---------|--------|----------|
| vaidik@cloudcost.com | 123456 | TechCorp Inc | $15,000 | EC2, S3, RDS |
| ruksh@cloudcost.com | 123456 | DataFlow Systems | $12,000 | Lambda, DynamoDB |
| rudra@cloudcost.com | 123456 | CloudScale Ltd | $18,000 | ECS, CloudFront |
| rishi@cloudcost.com | 123456 | DevOps Solutions | $10,000 | EKS, ElastiCache |
| ridham@cloudcost.com | 123456 | InfraHub Co | $20,000 | Redshift, Kinesis |

## 🚀 Deployment

### Multi-Cloud Setup

**For production use with real cloud providers:**

1. **AWS Integration:**
   - Create IAM user with Cost Explorer and CloudWatch permissions
   - Generate access keys
   - Create S3 bucket for report storage
   - Add credentials to `.env`

2. **Azure Integration:**
   ```bash
   npm install @azure/arm-costmanagement @azure/identity
   ```
   - Create Azure App Registration
   - Grant Cost Management Reader role
   - Add tenant ID, client ID, and secret to `.env`

3. **GCP Integration:**
   ```bash
   npm install @google-cloud/billing
   ```
   - Enable Cloud Billing API
   - Create service account with Billing Account Viewer role
   - Download JSON key file
   - Add project ID and key path to `.env`

See `MULTI_CLOUD_INTEGRATION.md` for detailed setup instructions.

### Deploy to AWS EC2

1. Launch EC2 instance (t3.micro or larger)
2. Install Node.js and MongoDB
3. Clone repository
4. Configure environment variables
5. Build frontend: `cd client && npm run build`
6. Start backend: `cd server && npm start`
7. Configure Nginx as reverse proxy
8. Setup SSL with Let's Encrypt

### Deploy to Render

**Backend:**
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set build command: `cd server && npm install`
6. Set start command: `cd server && npm start`
7. Add environment variables
8. Deploy!

**Frontend:**
1. Create new Static Site
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/dist`
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Vaidik Rokad** - [GitHub](https://github.com/VaidikRokad123)

## 🙏 Acknowledgments

- AWS SDK for JavaScript
- Azure SDK for JavaScript
- Google Cloud SDK
- MongoDB team
- React community
- TailwindCSS team
- Recharts library
- All contributors

## 📞 Support

For support, open an issue on GitHub or check `MULTI_CLOUD_INTEGRATION.md` for setup help.

## 🔗 Links

- [GitHub Repository](https://github.com/VaidikRokad123/cloud)
- [Multi-Cloud Setup Guide](./MULTI_CLOUD_INTEGRATION.md)
- [Live Demo](#) (Coming soon)

---

Made with ❤️ by Vaidik Rokad | Multi-Cloud Cost Optimization Platform
