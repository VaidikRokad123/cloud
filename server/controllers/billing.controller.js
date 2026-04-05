const BillingRecord = require('../models/BillingRecord');
const { generateBillingRecords } = require('../utils/mockDataGenerator');

/**
 * Get billing history
 * GET /api/billing/history?page=1&limit=20&provider=&status=
 */
exports.getHistory = async (req, res) => {
  try {
    await generateBillingRecords(req.userId);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.userId };
    if (req.query.provider) filter.provider = req.query.provider;
    if (req.query.status) filter.status = req.query.status;

    const [records, total] = await Promise.all([
      BillingRecord.find(filter).sort('-date').skip(skip).limit(limit),
      BillingRecord.countDocuments(filter)
    ]);

    res.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching billing history' });
  }
};

/**
 * Export billing data as CSV
 * GET /api/billing/export
 */
exports.exportCSV = async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.provider) filter.provider = req.query.provider;

    const records = await BillingRecord.find(filter).sort('-date');

    // Build CSV
    const header = 'Date,Invoice ID,Provider,Service,Cost,Status,Description\n';
    const rows = records.map(r =>
      `${r.date.toISOString().split('T')[0]},${r.invoiceId},${r.provider},${r.service},${r.cost},${r.status},"${r.description}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=billing-report.csv');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting billing data' });
  }
};
