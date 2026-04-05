/**
 * Seed script — generates realistic cloud cost, billing, and alert data
 * for multiple dummy users. Run once: node seed.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const CostRecord = require('./models/CostRecord');
const BillingRecord = require('./models/BillingRecord');
const Alert = require('./models/Alert');
const CloudAccount = require('./models/CloudAccount');

// ─── Dummy Users ──────────────────────────────────────────
const DUMMY_USERS = [
  { name: 'Vaidik', email: 'vaidik@cloudcost.com', password: '123456', company: 'TechCorp Inc', monthlyBudget: 15000 },
  { name: 'Ruksh', email: 'ruksh@cloudcost.com', password: '123456', company: 'DataFlow Systems', monthlyBudget: 12000 },
  { name: 'Rudra', email: 'rudra@cloudcost.com', password: '123456', company: 'CloudScale Ltd', monthlyBudget: 18000 },
  { name: 'Rishi', email: 'rishi@cloudcost.com', password: '123456', company: 'DevOps Solutions', monthlyBudget: 10000 },
  { name: 'Ridham', email: 'ridham@cloudcost.com', password: '123456', company: 'InfraHub Co', monthlyBudget: 20000 },
];

// ─── Realistic service catalog ────────────────────────────
const SERVICES = {
  AWS: [
    { name: 'EC2',          type: 'compute',  baseCost: [45, 320] },
    { name: 'S3',            type: 'storage',  baseCost: [12, 85]  },
    { name: 'RDS',           type: 'database', baseCost: [60, 280] },
    { name: 'Lambda',        type: 'other',    baseCost: [5, 45]   },
    { name: 'CloudFront',    type: 'network',  baseCost: [18, 95]  },
    { name: 'DynamoDB',      type: 'database', baseCost: [25, 150] },
    { name: 'EKS',           type: 'compute',  baseCost: [80, 400] },
    { name: 'ElastiCache',   type: 'database', baseCost: [30, 120] },
  ],
  Azure: [
    { name: 'Virtual Machines', type: 'compute',  baseCost: [50, 350] },
    { name: 'Blob Storage',     type: 'storage',  baseCost: [10, 70]  },
    { name: 'SQL Database',     type: 'database', baseCost: [55, 260] },
    { name: 'Functions',        type: 'other',    baseCost: [4, 35]   },
    { name: 'CDN',              type: 'network',  baseCost: [15, 80]  },
    { name: 'Cosmos DB',        type: 'database', baseCost: [40, 200] },
    { name: 'AKS',              type: 'compute',  baseCost: [70, 380] },
    { name: 'Redis Cache',      type: 'database', baseCost: [28, 110] },
  ],
  GCP: [
    { name: 'Compute Engine',   type: 'compute',  baseCost: [48, 330] },
    { name: 'Cloud Storage',    type: 'storage',  baseCost: [8, 65]   },
    { name: 'Cloud SQL',        type: 'database', baseCost: [50, 240] },
    { name: 'Cloud Functions',  type: 'other',    baseCost: [3, 30]   },
    { name: 'Cloud CDN',        type: 'network',  baseCost: [12, 70]  },
    { name: 'Firestore',        type: 'database', baseCost: [20, 130] },
    { name: 'GKE',              type: 'compute',  baseCost: [75, 360] },
    { name: 'Memorystore',      type: 'database', baseCost: [22, 100] },
  ],
};

const REGIONS = {
  AWS:   ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'],
  Azure: ['eastus', 'westus2', 'westeurope', 'centralindia'],
  GCP:   ['us-central1', 'us-east1', 'europe-west1', 'asia-south1'],
};

// ─── Helpers ──────────────────────────────────────────────
function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Seed functions ───────────────────────────────────────
async function seedUsers() {
  console.log('📝 Creating users...');
  const users = [];

  for (const userData of DUMMY_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`  ⏭  User ${userData.name} already exists`);
      users.push(existing);
    } else {
      const user = await User.create(userData);
      console.log(`  ✅ Created user: ${user.name} (${user.email})`);
      users.push(user);
    }
  }

  return users;
}

async function seedCloudAccounts(userId, userName) {
  const existing = await CloudAccount.countDocuments({ user: userId });
  if (existing > 0) {
    return;
  }

  const accounts = [
    { user: userId, provider: 'AWS',   accountName: `${userName} Production AWS`,    accountId: `${Math.floor(Math.random() * 900000000000) + 100000000000}`, apiKey: 'AKIA****EXAMPLE', region: 'us-east-1', isActive: true },
    { user: userId, provider: 'Azure', accountName: `${userName} Enterprise Azure`,  accountId: `sub-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`, apiKey: 'azure-key-****', region: 'eastus', isActive: true },
    { user: userId, provider: 'GCP',   accountName: `${userName} Analytics GCP`,     accountId: `prj-${Math.random().toString(36).substring(2, 8)}`, apiKey: 'gcp-sa-****',    region: 'us-central1', isActive: true },
  ];

  await CloudAccount.insertMany(accounts);
}

async function seedCostRecords(userId, userIndex) {
  const existing = await CostRecord.countDocuments({ user: userId });
  if (existing > 0) {
    return;
  }

  const records = [];
  const now = new Date();
  const DAYS = 90;

  // Each user has slightly different spending patterns
  const userMultiplier = 0.7 + (userIndex * 0.15); // 0.7, 0.85, 1.0, 1.15, 1.3

  for (let d = 0; d < DAYS; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);

    // Simulate a gradual upward trend + weekly seasonality
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.65 : 1.0;
    const trendFactor = 1 + ((DAYS - d) / DAYS) * 0.2; // newer = higher

    for (const [provider, services] of Object.entries(SERVICES)) {
      // Each day, 5–7 services report costs (not always all 8)
      const count = Math.floor(Math.random() * 3) + 5;
      const shuffled = [...services].sort(() => 0.5 - Math.random()).slice(0, count);

      for (const svc of shuffled) {
        const base = rand(svc.baseCost[0], svc.baseCost[1]);
        const cost = Math.round(base * weekendFactor * trendFactor * userMultiplier * rand(0.85, 1.15) * 100) / 100;

        records.push({
          user: userId,
          provider,
          service: svc.name,
          cost,
          date,
          region: pick(REGIONS[provider]),
          resourceType: svc.type,
          usageHours: Math.round(rand(1, 24)),
          usageAmount: rand(1, 500),
        });
      }
    }
  }

  await CostRecord.insertMany(records);
}

async function seedBillingRecords(userId, userIndex) {
  const existing = await BillingRecord.countDocuments({ user: userId });
  if (existing > 0) {
    return;
  }

  const records = [];
  const now = new Date();
  const MONTHS = 6;
  const userMultiplier = 0.7 + (userIndex * 0.15);

  for (let m = 0; m < MONTHS; m++) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const isPast = m > 0;

    for (const [provider, services] of Object.entries(SERVICES)) {
      for (const svc of services) {
        const cost = rand(svc.baseCost[0] * 20, svc.baseCost[1] * 25) * userMultiplier; // monthly total
        const prefix = provider.substring(0, 2).toUpperCase();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();

        records.push({
          user: userId,
          provider,
          service: svc.name,
          cost,
          date,
          invoiceId: `INV-${prefix}-${date.getFullYear()}${month}-${suffix}`,
          status: m === 0 ? 'pending' : isPast && Math.random() > 0.08 ? 'paid' : 'overdue',
          description: `Monthly ${svc.name} usage — ${provider} (${REGIONS[provider][0]})`,
        });
      }
    }
  }

  await BillingRecord.insertMany(records);
}

async function seedAlerts(userId, userBudget) {
  const existing = await Alert.countDocuments({ user: userId });
  if (existing > 0) {
    return;
  }

  const budgetThreshold = userBudget * 0.8;
  const alerts = [
    { user: userId, name: 'Overall Monthly Budget',   type: 'budget',    provider: 'All',   threshold: budgetThreshold, currentSpend: budgetThreshold * 0.85,  isTriggered: false },
    { user: userId, name: 'AWS Compute Alert',        type: 'threshold', provider: 'AWS',   threshold: 3000,  currentSpend: 3250,  isTriggered: true, lastTriggered: new Date() },
    { user: userId, name: 'Azure Spending Cap',       type: 'budget',    provider: 'Azure', threshold: 4000,  currentSpend: 2980,  isTriggered: false },
    { user: userId, name: 'GCP Anomaly Watch',        type: 'anomaly',   provider: 'GCP',   threshold: 2500,  currentSpend: 1870,  isTriggered: false },
    { user: userId, name: 'Database Cost Limit',      type: 'threshold', provider: 'All',   threshold: 5000,  currentSpend: Math.random() > 0.5 ? 5120 : 4200,  isTriggered: Math.random() > 0.5, lastTriggered: Math.random() > 0.5 ? new Date() : null },
  ];

  await Alert.insertMany(alerts);
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB\n');

    // Create users
    const users = await seedUsers();
    console.log('');

    // Seed data for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`📊 Seeding data for ${user.name}...`);
      
      await seedCloudAccounts(user._id, user.name);
      console.log(`  ✅ Cloud accounts created`);
      
      await seedCostRecords(user._id, i);
      console.log(`  ✅ Cost records created (90 days)`);
      
      await seedBillingRecords(user._id, i);
      console.log(`  ✅ Billing records created (6 months)`);
      
      await seedAlerts(user._id, user.monthlyBudget);
      console.log(`  ✅ Alerts created\n`);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Seed complete! Here are your test accounts:\n');
    
    for (const user of users) {
      console.log(`👤 ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: 123456`);
      console.log(`   Company: ${user.company}`);
      console.log(`   Budget: $${user.monthlyBudget.toLocaleString()}/month\n`);
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 You can now login with any of these accounts!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
