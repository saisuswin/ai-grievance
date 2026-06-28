const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const { processComplaint, analyzeImage } = require('../utils/aiUtils');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { text, location, language, userEmail } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    let aiData = await processComplaint(text || "Unknown issue");

    const newComplaint = new Complaint({
      originalText: text || "Image based issue",
      summary: aiData.summary,
      category: aiData.category,
      department: aiData.department,
      priority: aiData.priority,
      userEmail: userEmail || 'anonymous',
      imageUrl,
      location,
      language: language || 'English'
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};
    if (email) {
      query.userEmail = email;
    }
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    
    const categoryStats = {};
    const departmentStats = {};
    const priorityStats = {};
    let resolved = 0;

    complaints.forEach(c => {
      categoryStats[c.category] = (categoryStats[c.category] || 0) + 1;
      departmentStats[c.department] = (departmentStats[c.department] || 0) + 1;
      priorityStats[c.priority] = (priorityStats[c.priority] || 0) + 1;
      if (c.status === 'Resolved') resolved++;
    });

    const resolutionRate = complaints.length > 0 ? ((resolved / complaints.length) * 100).toFixed(1) : 0;

    const formatData = (obj) => Object.keys(obj).map(key => ({ name: key, value: obj[key] }));

    res.json({
      total: complaints.length,
      resolutionRate,
      categories: formatData(categoryStats),
      departments: formatData(departmentStats),
      priorities: formatData(priorityStats)
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
