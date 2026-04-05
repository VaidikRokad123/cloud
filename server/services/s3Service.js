const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cloudcost-reports';

/**
 * Upload a file to S3
 * @param {string} key - File path in S3 (e.g., 'reports/user123/2024-01-report.csv')
 * @param {Buffer|string} body - File content
 * @param {string} contentType - MIME type (e.g., 'text/csv', 'application/pdf')
 */
async function uploadFile(key, body, contentType = 'application/octet-stream') {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: 'AES256' // Encrypt at rest
    });

    const response = await s3Client.send(command);
    console.log(`✅ File uploaded to S3: ${key}`);
    
    return {
      success: true,
      key,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      etag: response.ETag
    };
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Generate a pre-signed URL for secure file download
 * @param {string} key - File path in S3
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 */
async function getDownloadUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`✅ Generated download URL for: ${key}`);
    
    return url;
  } catch (error) {
    console.error('❌ S3 Get URL Error:', error);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} key - File path in S3
 */
async function deleteFile(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    console.log(`✅ File deleted from S3: ${key}`);
    
    return { success: true, key };
  } catch (error) {
    console.error('❌ S3 Delete Error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List files in a specific folder
 * @param {string} prefix - Folder path (e.g., 'reports/user123/')
 */
async function listFiles(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 100
    });

    const response = await s3Client.send(command);
    
    const files = (response.Contents || []).map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    }));

    return files;
  } catch (error) {
    console.error('❌ S3 List Error:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * Upload cost report as CSV
 * @param {string} userId - User ID
 * @param {Array} data - Cost data array
 * @param {string} reportType - Type of report (e.g., 'monthly', 'daily')
 */
async function uploadCostReport(userId, data, reportType = 'monthly') {
  try {
    // Convert data to CSV
    const csv = convertToCSV(data);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const key = `reports/${userId}/${reportType}-${timestamp}.csv`;
    
    // Upload to S3
    const result = await uploadFile(key, csv, 'text/csv');
    
    return result;
  } catch (error) {
    throw new Error(`Failed to upload cost report: ${error.message}`);
  }
}

/**
 * Helper: Convert array of objects to CSV
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

module.exports = {
  uploadFile,
  getDownloadUrl,
  deleteFile,
  listFiles,
  uploadCostReport
};
