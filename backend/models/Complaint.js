const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  originalText: { type: String, required: true },
  userEmail: { type: String, default: 'anonymous' },
  summary: { type: String },
  category: { type: String, default: 'General' },
  department: { type: String, default: 'General Support' },
  priority: { type: String, default: 'Low', enum: ['Low', 'Medium', 'High', 'Critical'] },
  status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Resolved'] },
  imageUrl: { type: String },
  location: { type: String },
  language: { type: String, default: 'English' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
