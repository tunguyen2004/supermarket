const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database
const db = require('./config/database');

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============ ROUTES ============

// Route 1: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running ✅',
  });
});

// Route 2: Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dim_users');
    
    res.json({
      status: 'OK',
      message: 'Users retrieved successfully',
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// Route 3: Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM dim_users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }
    
    res.json({
      status: 'OK',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
});

// Route 4: Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Mini Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health - Server health check',
      'GET /api/users - Get all users',
      'GET /api/users/:id - Get user by ID',
    ],
  });
});

// ============ ERROR HANDLING ============

app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Route not found',
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║  🚀 Server running on port ${PORT}    ║
    ║  📍 http://localhost:${PORT}           ║
    ║  Environment: ${process.env.NODE_ENV} ║
    ╚═══════════════════════════════════════╝
  `);
});
