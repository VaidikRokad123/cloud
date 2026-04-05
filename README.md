# ☁️ CloudCost - Cloud Infrastructure Cost Monitoring System

A full-stack web application for monitoring and optimizing cloud infrastructure costs across AWS, Azure, and GCP.

![CloudCost Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-20.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)

## 🎯 Features

### Core Features
- 📊 **Real-time Cost Tracking** - Monitor costs across multiple cloud providers
- 💰 **Budget Management** - Set budgets and receive alerts
- 📈 **Cost Analytics** - Visualize spending trends with interactive charts
- 🔔 **Smart Alerts** - Get notified when spending exceeds thresholds
- 💡 **Cost Optimization** - AI-powered recommendations to reduce costs
- 📄 **Export Reports** - Download cost data as CSV files

### Multi-User Support
- 🔐 **Secure Authentication** - JWT-based user authentication
- 👥 **User Isolation** - Each user has their own data
- 🔑 **Role-based Access** - Secure access control
- 📱 **User Profiles** - Customizable user settings

### AWS Integration
- 📦 **S3 Export** - Export reports to Amazon S3
- 📊 **CloudWatch Monitoring** - Track resource utilization
- 🔍 **Resource Analysis** - Identify idle/underutilized resources

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### AWS Services
- **S3** - File storage
- **CloudWatch** - Monitoring
- **EC2** - Hosting (optional)

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- AWS Account (optional, for S3/CloudWatch features)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/cloudcost.git
cd cloudcost
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
PORT=5000
MONGO_URI=mongodb://localhost:27017/cloudcost
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d

# Optional: AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=your-bucket
```

### 3. Setup Frontend

```bash
cd ../client
npm install

# Copy environment template (optional)
cp .env.example .env.local
```

### 4. Seed Database (Optional)

```bash
cd ../server
node seed.js
```

This creates 5 test users with sample data:
- vaidik@cloudcost.com / 123456
- ruksh@cloudcost.com / 123456
- rudra@cloudcost.com / 123456
- rishi@cloudcost.com / 123456
- ridham@cloudcost.com / 123456

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
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
npm start
```

## 📁 Project Structure

```
cloudcost/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 Environment Variables

### Server (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | Yes |
| `AWS_REGION` | AWS region | No |
| `AWS_ACCESS_KEY_ID` | AWS access key | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | No |
| `S3_BUCKET_NAME` | S3 bucket name | No |

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Costs
- `GET /api/costs/summary` - Get cost summary
- `GET /api/costs/services` - Get services breakdown
- `GET /api/costs/daily` - Get daily costs
- `GET /api/costs/monthly` - Get monthly costs

### Export
- `POST /api/export/costs` - Export cost data to S3
- `POST /api/export/billing` - Export billing data
- `GET /api/export/date-range` - Get available date range

### Monitoring (AWS CloudWatch)
- `GET /api/monitoring/ec2/:instanceId` - Get EC2 metrics
- `GET /api/monitoring/rds/:dbInstanceId` - Get RDS metrics
- `POST /api/monitoring/utilization` - Get resource utilization

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Cost Analytics
![Analytics](https://via.placeholder.com/800x400?text=Analytics+Screenshot)

### Recommendations
![Recommendations](https://via.placeholder.com/800x400?text=Recommendations+Screenshot)

## 🧪 Testing

### Test User Accounts

After running the seed script, use these accounts:

| Email | Password | Company | Budget |
|-------|----------|---------|--------|
| vaidik@cloudcost.com | 123456 | TechCorp Inc | $15,000 |
| ruksh@cloudcost.com | 123456 | DataFlow Systems | $12,000 |
| rudra@cloudcost.com | 123456 | CloudScale Ltd | $18,000 |
| rishi@cloudcost.com | 123456 | DevOps Solutions | $10,000 |
| ridham@cloudcost.com | 123456 | InfraHub Co | $20,000 |

## 🚀 Deployment

### Deploy to AWS EC2

See [AWS_SETUP_FOR_BEGINNERS.md](./AWS_SETUP_FOR_BEGINNERS.md) for detailed instructions.

### Deploy to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure environment variables
6. Deploy!

### Deploy to Vercel (Frontend only)

```bash
cd client
npm install -g vercel
vercel
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Vaidik Rokad** - Initial work

## 🙏 Acknowledgments

- AWS SDK for JavaScript
- MongoDB team
- React community
- All contributors

## 📞 Support

For support, email vaidik@example.com or open an issue on GitHub.

## 🔗 Links

- [Documentation](./docs)
- [AWS Integration Guide](./AWS_INTEGRATION_GUIDE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

Made with ❤️ by Vaidik Rokad
