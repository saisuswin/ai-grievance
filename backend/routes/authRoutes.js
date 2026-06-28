const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Simple Mock Authentication
  if (email.toLowerCase() === 'admin@gov.com') {
    return res.json({
      token: 'mock-jwt-admin',
      user: { email, role: 'admin', name: 'System Admin' }
    });
  } else {
    return res.json({
      token: 'mock-jwt-user',
      user: { email, role: 'user', name: email.split('@')[0] }
    });
  }
});

module.exports = router;
