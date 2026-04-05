const { CloudWatchClient, GetMetricStatisticsCommand, PutMetricDataCommand, DescribeAlarmsCommand } = require('@aws-sdk/client-cloudwatch');

// Initialize CloudWatch Client
const cloudwatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Get EC2 CPU Utilization
 * @param {string} instanceId - EC2 instance ID
 * @param {number} hours - Number of hours to look back (default: 24)
 */
async function getEC2CPUUtilization(instanceId, hours = 24) {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    const command = new GetMetricStatisticsCommand({
      Namespace: 'AWS/EC2',
      MetricName: 'CPUUtilization',
      Dimensions: [
        {
          Name: 'InstanceId',
          Value: instanceId
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600, // 1 hour intervals
      Statistics: ['Average', 'Maximum', 'Minimum']
    });

    const response = await cloudwatchClient.send(command);
    
    const datapoints = response.Datapoints.sort((a, b) => 
      new Date(a.Timestamp) - new Date(b.Timestamp)
    );

    return {
      instanceId,
      datapoints: datapoints.map(dp => ({
        timestamp: dp.Timestamp,
        average: Math.round(dp.Average * 100) / 100,
        maximum: Math.round(dp.Maximum * 100) / 100,
        minimum: Math.round(dp.Minimum * 100) / 100
      })),
      averageCPU: datapoints.length > 0 
        ? Math.round(datapoints.reduce((sum, dp) => sum + dp.Average, 0) / datapoints.length * 100) / 100
        : 0
    };
  } catch (error) {
    console.error('❌ CloudWatch CPU Error:', error);
    throw new Error(`Failed to get CPU metrics: ${error.message}`);
  }
}

/**
 * Get RDS Database Connections
 * @param {string} dbInstanceId - RDS instance identifier
 * @param {number} hours - Number of hours to look back
 */
async function getRDSConnections(dbInstanceId, hours = 24) {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    const command = new GetMetricStatisticsCommand({
      Namespace: 'AWS/RDS',
      MetricName: 'DatabaseConnections',
      Dimensions: [
        {
          Name: 'DBInstanceIdentifier',
          Value: dbInstanceId
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600,
      Statistics: ['Average', 'Maximum']
    });

    const response = await cloudwatchClient.send(command);
    
    return {
      dbInstanceId,
      datapoints: response.Datapoints.sort((a, b) => 
        new Date(a.Timestamp) - new Date(b.Timestamp)
      ).map(dp => ({
        timestamp: dp.Timestamp,
        average: Math.round(dp.Average),
        maximum: Math.round(dp.Maximum)
      }))
    };
  } catch (error) {
    console.error('❌ CloudWatch RDS Error:', error);
    throw new Error(`Failed to get RDS metrics: ${error.message}`);
  }
}

/**
 * Get S3 Bucket Size
 * @param {string} bucketName - S3 bucket name
 */
async function getS3BucketSize(bucketName) {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    const command = new GetMetricStatisticsCommand({
      Namespace: 'AWS/S3',
      MetricName: 'BucketSizeBytes',
      Dimensions: [
        {
          Name: 'BucketName',
          Value: bucketName
        },
        {
          Name: 'StorageType',
          Value: 'StandardStorage'
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 86400, // 1 day
      Statistics: ['Average']
    });

    const response = await cloudwatchClient.send(command);
    
    const sizeInBytes = response.Datapoints[0]?.Average || 0;
    const sizeInGB = Math.round(sizeInBytes / (1024 * 1024 * 1024) * 100) / 100;

    return {
      bucketName,
      sizeInBytes,
      sizeInGB,
      sizeInMB: Math.round(sizeInBytes / (1024 * 1024) * 100) / 100
    };
  } catch (error) {
    console.error('❌ CloudWatch S3 Error:', error);
    throw new Error(`Failed to get S3 metrics: ${error.message}`);
  }
}

/**
 * Get Lambda Function Invocations
 * @param {string} functionName - Lambda function name
 * @param {number} hours - Number of hours to look back
 */
async function getLambdaInvocations(functionName, hours = 24) {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    const command = new GetMetricStatisticsCommand({
      Namespace: 'AWS/Lambda',
      MetricName: 'Invocations',
      Dimensions: [
        {
          Name: 'FunctionName',
          Value: functionName
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600,
      Statistics: ['Sum']
    });

    const response = await cloudwatchClient.send(command);
    
    return {
      functionName,
      datapoints: response.Datapoints.sort((a, b) => 
        new Date(a.Timestamp) - new Date(b.Timestamp)
      ).map(dp => ({
        timestamp: dp.Timestamp,
        invocations: dp.Sum
      })),
      totalInvocations: response.Datapoints.reduce((sum, dp) => sum + dp.Sum, 0)
    };
  } catch (error) {
    console.error('❌ CloudWatch Lambda Error:', error);
    throw new Error(`Failed to get Lambda metrics: ${error.message}`);
  }
}

/**
 * Send custom metric to CloudWatch
 * @param {string} metricName - Name of the metric
 * @param {number} value - Metric value
 * @param {string} unit - Unit (e.g., 'Count', 'Percent', 'Bytes')
 */
async function sendCustomMetric(metricName, value, unit = 'Count') {
  try {
    const command = new PutMetricDataCommand({
      Namespace: 'CloudCost/Application',
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date()
        }
      ]
    });

    await cloudwatchClient.send(command);
    console.log(`✅ Custom metric sent: ${metricName} = ${value}`);
    
    return { success: true, metricName, value };
  } catch (error) {
    console.error('❌ CloudWatch Custom Metric Error:', error);
    throw new Error(`Failed to send custom metric: ${error.message}`);
  }
}

/**
 * Get resource utilization summary for cost optimization
 * @param {Object} resources - Object with resource IDs
 */
async function getResourceUtilization(resources) {
  try {
    const utilization = {};

    // Get EC2 CPU utilization
    if (resources.ec2Instances && resources.ec2Instances.length > 0) {
      utilization.ec2 = [];
      for (const instanceId of resources.ec2Instances) {
        const cpu = await getEC2CPUUtilization(instanceId, 168); // 7 days
        utilization.ec2.push({
          instanceId,
          averageCPU: cpu.averageCPU,
          isIdle: cpu.averageCPU < 10, // Less than 10% CPU = idle
          recommendation: cpu.averageCPU < 10 
            ? 'Consider stopping or downsizing this instance'
            : cpu.averageCPU > 80 
            ? 'Consider upgrading to a larger instance'
            : 'Instance is properly sized'
        });
      }
    }

    // Get RDS connections
    if (resources.rdsInstances && resources.rdsInstances.length > 0) {
      utilization.rds = [];
      for (const dbId of resources.rdsInstances) {
        const connections = await getRDSConnections(dbId, 168);
        const avgConnections = connections.datapoints.length > 0
          ? connections.datapoints.reduce((sum, dp) => sum + dp.average, 0) / connections.datapoints.length
          : 0;
        
        utilization.rds.push({
          dbInstanceId: dbId,
          averageConnections: Math.round(avgConnections),
          isUnderutilized: avgConnections < 5,
          recommendation: avgConnections < 5
            ? 'Database has very few connections - consider downsizing'
            : 'Database utilization is normal'
        });
      }
    }

    return utilization;
  } catch (error) {
    console.error('❌ Resource Utilization Error:', error);
    throw new Error(`Failed to get resource utilization: ${error.message}`);
  }
}

/**
 * Track application metrics (for your CloudCost app)
 */
async function trackAppMetrics(userId, action, value = 1) {
  try {
    await sendCustomMetric(`UserAction_${action}`, value, 'Count');
    console.log(`📊 Tracked: User ${userId} - ${action}`);
  } catch (error) {
    // Don't throw error for tracking failures
    console.error('⚠️ Failed to track metric:', error.message);
  }
}

module.exports = {
  getEC2CPUUtilization,
  getRDSConnections,
  getS3BucketSize,
  getLambdaInvocations,
  sendCustomMetric,
  getResourceUtilization,
  trackAppMetrics
};
