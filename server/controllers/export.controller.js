const CostRecord = require('../models/CostRecord');
const BillingRecord = require('../models/BillingRecord');
const { uploadCostReport, getDownloadUrl } = require('../services/s3Service');

/**
 * Export cost data as CSV and upload to S3
 * POST /api/export/costs
 */
exports.exportCosts = async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.body;

    // Fetch cost records
    const costs = await CostRecord.find({
      user: req.userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });

    // Check if data exists
    if (costs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No cost data found for the specified date range',
        startDate,
        endDate,
        recordCount: 0,
        suggestion: 'Try using GET /api/export/date-range to see available dates'
      });
    }

    // Format data for export
    const exportData = costs.map(c => ({
      Date: c.date.toISOString().split('T')[0],
      Provider: c.provider,
      Service: c.service,
      Cost: c.cost,
      Region: c.region,
      ResourceType: c.resourceType,
      UsageHours: c.usageHours
    }));

    // Upload to S3
    const result = await uploadCostReport(
      req.userId.toString(),
      exportData,
      'cost-export'
    );

    // Generate download URL
    const downloadUrl = await getDownloadUrl(result.key, 3600); // 1 hour expiry

    res.json({
      success: true,
      message: 'Cost data exported successfully',
      downloadUrl,
      recordCount: exportData.length,
      expiresIn: 3600,
      dateRange: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export cost data', error: error.message });
  }
};

/**
 * Export billing history
 * POST /api/export/billing
 */
exports.exportBilling = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const billing = await BillingRecord.find({
      user: req.userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });

    const exportData = billing.map(b => ({
      Date: b.date.toISOString().split('T')[0],
      Provider: b.provider,
      Service: b.service,
      Cost: b.cost,
      InvoiceId: b.invoiceId,
      Status: b.status,
      Description: b.description
    }));

    const result = await uploadCostReport(
      req.userId.toString(),
      exportData,
      'billing-export'
    );

    const downloadUrl = await getDownloadUrl(result.key, 3600);

    res.json({
      success: true,
      message: 'Billing data exported successfully',
      downloadUrl,
      recordCount: exportData.length,
      expiresIn: 3600
    });
  } catch (error) {
    console.error('Export billing error:', error);
    res.status(500).json({ message: 'Failed to export billing data' });
  }
};


/**
 * Get available date range for exports
 * GET /api/export/date-range
 */
exports.getDateRange = async (req, res) => {
  try {
    const oldestRecord = await CostRecord.findOne({ user: req.userId })
      .sort({ date: 1 })
      .select('date');
    
    const newestRecord = await CostRecord.findOne({ user: req.userId })
      .sort({ date: -1 })
      .select('date');

    if (!oldestRecord || !newestRecord) {
      return res.json({
        success: true,
        hasData: false,
        message: 'No cost data available'
      });
    }

    res.json({
      success: true,
      hasData: true,
      startDate: oldestRecord.date.toISOString().split('T')[0],
      endDate: newestRecord.date.toISOString().split('T')[0],
      totalRecords: await CostRecord.countDocuments({ user: req.userId })
    });
  } catch (error) {
    console.error('Date range error:', error);
    res.status(500).json({ message: 'Failed to get date range' });
  }
};
