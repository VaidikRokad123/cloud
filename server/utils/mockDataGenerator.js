const CostRecord = require('../models/CostRecord');
const BillingRecord = require('../models/BillingRecord');

/**
 * Generates realistic mock cloud cost data for a user.
 * Called when a user first accesses their dashboard or adds a cloud account.
 */

const SERVICES = {
  AWS: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront', 'DynamoDB', 'EKS', 'ElastiCache'],
  Azure: ['Virtual Machines', 'Blob Storage', 'SQL Database', 'Functions', 'CDN', 'Cosmos DB', 'AKS', 'Redis Cache'],
  GCP: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions', 'Cloud CDN', 'Firestore', 'GKE', 'Memorystore']
};

const RESOURCE_TYPES = ['compute', 'storage', 'network', 'database', 'other'];

const REGIONS = {
  AWS: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
  Azure: ['eastus', 'westus2', 'westeurope', 'southeastasia'],
  GCP: ['us-central1', 'us-east1', 'europe-west1', 'asia-southeast1']
};

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getResourceType(service) {
  const s = service.toLowerCase();
  if (s.includes('ec2') || s.includes('virtual') || s.includes('compute') || s.includes('eks') || s.includes('aks') || s.includes('gke')) return 'compute';
  if (s.includes('s3') || s.includes('blob') || s.includes('storage')) return 'storage';
  if (s.includes('cloudfront') || s.includes('cdn')) return 'network';
  if (s.includes('rds') || s.includes('sql') || s.includes('dynamo') || s.includes('cosmos') || s.includes('firestore')) return 'database';
  return 'other';
}

/**
 * Generate cost records for the past N days
 */
async function generateCostRecords(userId, providers = ['AWS', 'Azure', 'GCP'], days = 90) {
  // Check if data already exists
  const existing = await CostRecord.countDocuments({ user: userId });
  if (existing > 0) return;

  const records = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);

    for (const provider of providers) {
      const services = SERVICES[provider];
      const regions = REGIONS[provider];

      // Pick 4-6 random services for each day
      const numServices = Math.floor(Math.random() * 3) + 4;
      const shuffled = [...services].sort(() => 0.5 - Math.random());
      const selectedServices = shuffled.slice(0, numServices);

      for (const service of selectedServices) {
        // Create a slight upward trend over time with some variance
        const baseCost = randomBetween(5, 150);
        const trendFactor = 1 + (d / days) * 0.15; // costs slightly lower in the past
        const variance = randomBetween(0.8, 1.2);
        const cost = Math.round(baseCost * variance / trendFactor * 100) / 100;

        records.push({
          user: userId,
          provider,
          service,
          cost,
          date,
          region: regions[Math.floor(Math.random() * regions.length)],
          resourceType: getResourceType(service),
          usageHours: Math.round(randomBetween(1, 24)),
          usageAmount: randomBetween(0.5, 100)
        });
      }
    }
  }

  await CostRecord.insertMany(records);
  return records.length;
}

/**
 * Generate billing records for the past N months
 */
async function generateBillingRecords(userId, months = 6) {
  const existing = await BillingRecord.countDocuments({ user: userId });
  if (existing > 0) return;

  const records = [];
  const now = new Date();
  const providers = ['AWS', 'Azure', 'GCP'];
  const statuses = ['paid', 'paid', 'paid', 'pending']; // mostly paid

  for (let m = 0; m < months; m++) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 1);

    for (const provider of providers) {
      const services = SERVICES[provider];

      for (const service of services) {
        const cost = randomBetween(50, 2000);
        const invoiceId = `INV-${provider.substring(0, 2)}-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        records.push({
          user: userId,
          provider,
          service,
          cost,
          date,
          invoiceId,
          status: m === 0 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)],
          description: `Monthly ${service} usage - ${provider}`
        });
      }
    }
  }

  await BillingRecord.insertMany(records);
  return records.length;
}

module.exports = { generateCostRecords, generateBillingRecords };
